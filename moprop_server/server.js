// https://nodejs.org/en/docs/es6/
// nodemon --harmony server.js 

var imagemagickOn = true;
if (process.platform == "win32") {  imagemagickOn = false; }

if (imagemagickOn == true) {
  var im = require('imagemagick');
}




var enableEmail = true;
var mailbot = require('./email')
mailbot.debug = true; 




var express = require('express');
var app = express();
var path    = require("path");
var bodyParser = require('body-parser');
var fs = require('fs');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var mongojs = require('mongojs')
var db = mongojs('moprop',["properties"])

var cookieParser = require('cookie-parser')
var session = require('cookie-session')

app.use(bodyParser.json());

app.use(session({
  name: 'session',
  keys: ['gdfsgtyjrjts', 'gfdsgrtuyjytiy5w'],
  secureProxy: false // if you do SSL outside of node
}))


app.get('/view/:pid', (req, res) => {
  console.log(req.params)
  res.sendFile(path.join(__dirname+'/public/viewprop.html'));
})


app.get('/', (req,res) => {
  if (req.session.hash) {
    console.log("LOGGED IN")
    console.log(req.session.hash);
    res.sendFile(path.join(__dirname+'/public/index.html'));
  } else {
    console.log("anon")
    res.sendFile(path.join(__dirname+'/public/index.html'));
  }
  
})


app.use('/', express.static('public')); //index.html default

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname+'/public/contact.html'));  
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname+'/public/login.html'));  
})

app.get('/logout', (req, res) => {
  delete req.session.hash;
  res.redirect('/');
})

app.get('/submit', (req, res) => {
  if (req.session.hash == lastlogin) {
    res.sendFile(path.join(__dirname+'/public/submit.html'));  
  } else {
    res.redirect("/login")
  }  
  
})

// API

// ENCRYPTION
var scrypt = require("./scrypt.js"); // modified https://github.com/tonyg/js-scrypt

var lasthash = ""; //last generated (could be malicious)
var lastlogin = ""; //last successful (retain!)


app.post('/api/mainimg', (req,res) => {
  console.log("main image")
  console.log(req.body)
  if (req.session.hash == lastlogin) {

    var url = req.get('Referrer')
    var pid = parseInt(url.split('/').pop())
    
    db.properties.findOne({"pid":req.body.pid}, (err, page) => {
      res.json(page)

      //TRY TO DELETE
      try {
        page.mainimg = page.gallery[req.body.activeimg]
        //page.gallery.splice(req.body.activeimg,1)

        db.properties.update({"pid":req.body.pid}, page, (err, result) => {
          console.log(result)
          res.end("success")
        })
        
      }
      catch(err) {
          console.log(err.message);
      }

 

    })

  } else {
    console.log("ERROR DELETE")
  }
})



app.post('/api/deleteimg', (req,res) => {
  console.log("delete image")
  console.log(req.body)
  if (req.session.hash == lastlogin) {

    var url = req.get('Referrer')
    var pid = parseInt(url.split('/').pop())
    
    db.properties.findOne({"pid":req.body.pid}, (err, page) => {
      res.json(page)

      //TRY TO DELETE
      try {
      
        page.gallery.splice(req.body.activeimg,1)
        db.properties.update({"pid":req.body.pid}, page, (err, result) => {
          console.log(result)
          res.end("success")
        })
        
      }
      catch(err) {
          console.log(err.message);
      }

 

    })

  } else {
    console.log("ERROR DELETE")
  }
})


app.get('/api/delete', (req,res) => {
  if (req.session.hash == lastlogin) {
    var url = req.get('Referrer')
    var pid = parseInt(url.split('/').pop())
    db.properties.remove({"pid":pid}, (err, result) => {
      res.json(result)
    })
  } else {
    console.log("ERROR DELETE")
  }
})

app.get('/api/taken', (req,res) => {
  if (req.session.hash == lastlogin) {
    var url = req.get('Referrer')
    var pid = parseInt(url.split('/').pop())
    db.properties.findOne({"pid":pid}, (err, result) => {
      if (result.taken == true) {
        result.taken = false;
        db.properties.update({"pid":pid}, result, (err, updated) => {
          console.log(updated)
          res.json(updated)
        });
      } else {
        result.taken = true;
        db.properties.update({"pid":pid}, result, (err, updated) => {
          console.log(updated)
          res.json(updated)
        });        
      }

    })
  } else {
    console.log("ERROR TAKEN/TOGGLE")
  }
})

app.post('/api/login', (req, res) => {
  console.log(req.body)
  if (req.body.request == "salt") { 
    var newsalt = Math.round(Math.random()*10000000000000000).toString(); console.log("salt:"+newsalt)
    var encryptedhex = scrypt.to_hex(scrypt.crypto_scrypt(scrypt.encode_utf8("password"), scrypt.encode_utf8(newsalt), 16384, 8, 1, 32)); 
    lasthash = encryptedhex; console.log("expected:"+encryptedhex);
    res.end( newsalt ); 
  }
  if (req.body.request == "login") { 
    if (req.body.hash == lasthash) {
      console.log("SUCCESSFUL")
      lastlogin = lasthash;

      req.session.hash = lastlogin;
      req.sessionOptions.maxAge = req.session.maxAge || req.sessionOptions.maxAge;

      res.end("success")

    } else {
      res.end("error")
    }
  }
  //res.end("hello")
})

app.get('/api/checklogin', (req, res) => {
  if (req.session.hash == lastlogin) {
    res.json({"login":"success"})
  } else {
    res.json({"login":"fail"})
  }
})

app.get('/api/search', (req, res) => { db.properties.find( (err, result) => {  res.json(result) }) })

app.get('/api/findone', (req, res) => {
  console.log("/api/findone")
  console.log(req.body)
  var url = req.get('Referrer')
  var pid = parseInt(url.split('/').pop())
  console.log("pid:"+pid)
  db.properties.findOne({"pid":pid}, (err, property) => {
    console.log(property);
    res.json(property);
  })
})


app.post('/api/contact', (req, res) => {
  console.log("New contact message:")
  req.body.timestamp = Date.now();
  console.log(req.body)



            //start email
            if (enableEmail) 
            {
              var email = {}
            email.from = "noreply@moproperty.com";
            email.fromname = "noreply@moproperty.com";
            email.rcpt = "markleootto@gmail.com";
            email.rcptname = "Mark Otto";
            /*email.rcpt = "rouan@8bo.org";
            email.rcptname = "Rouan van der Ende";*/            
            email.subject = "new moproperty contact form message";
            email.body = "New message from moproperty contact form:\n\n" + "email: " + req.body.email + "\nphone: "+ req.body.phone + "\nmessage: " + req.body.message + "\n";

            mailbot.sendemail(email, function (data) 
            {
              console.log("EMAIL SENT")
                //db.properties.save(req.body);
              res.json(req.body.timestamp);              
            })
          } 
          // end email

})

app.post('/api/submit', (req, res) => {
  req.body.pid = Date.now();
  db.properties.save(req.body);
  res.json(req.body.pid);
})

var cpUpload = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
  app.post('/fileupload', cpUpload,  (req, res) => {
  console.log(req.files)
  var url = req.get('Referrer')
  var pid = url.split('/').pop()

  var imagename = pid+"_"+Date.now();

  //UPLOAD/DB MAIN IMAGE
  fs.rename(req.files.file[0].path, "public/content/"+imagename+".jpg", function() {
    db.properties.findOne({"pid":parseInt(pid)}, (err, dbprop) => {

      dbprop.gallery = dbprop.gallery || [];

      console.log(dbprop)
      dbprop.mainimg = imagename+".jpg"

      dbprop.gallery.push(dbprop.mainimg)
      
      db.properties.update({"pid":parseInt(pid)}, dbprop, (err, result) => {


        //RESIZE
        if (imagemagickOn == true) {
          console.log("resizing using imagemagick")
          var imgfilepath = "public/content/"+dbprop.mainimg

          var command = [imgfilepath, '-strip', '-interlace', 'Plane', '-quality','80','-resize','1280x960', imgfilepath]

          im.convert(command, 
            function(err, stdout){
              if (err) throw err;
              console.log('stdout:', stdout);
              console.log("updated and resized!")
              res.end("test");              
            });
        } else {
          console.log("updated!")
          res.end("test");
        }
        //ENDRESIZE



      });
      

    })
  })










  
})

app.use('/newgame' ,(req, res) => {
  var newGame = {}
  newGame.id = Math.round(Math.random()*100000)
  newGame.status = "created"

  gameData[newGame.id] = newGame;

  res.redirect('/game/'+newGame.id+"/");
  //res.sendFile(path.join(__dirname+'/public/newgame.html'));
})

app.use('/game/:id/:options' ,(req, res) => {

  console.log(gameData);
  console.log(req.params)
  gameData[req.params.id].status = "started";

  res.redirect('/game/'+req.params.id+"/");

})

app.use('/p/:id/' ,(req, res) => {
  console.log(req.params.id);
  res.sendFile(path.join(__dirname+'/public/viewprop.html'));  
})



app.listen(80, function () {
  console.log('MO Server listening...');
});






