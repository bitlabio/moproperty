
$(document).ready(function() 
{
    getprop();
    
})

var uploads = []

function enableUploadLargeImage() {
  //$("#mopropViewImageLargeUpl").dropzone({ url: "/fileupload", clickable: "#mopropViewImageLargeUpl" });
  var myDropzone = new Dropzone("#mopropViewImageLargeUpl", { url: "/fileupload"} );
  myDropzone.on("success", function(file) {
    location.reload();
  });

  myDropzone.on("uploadprogress", function(progress) {
    
    //if (uploads.length == 0) { uploads.push(progress) }

    var found = 0;
    for (var up in uploads) { 
      if (uploads[up].name == progress.name) 
      {
        uploads[up] = progress;
        found = 1;
      } 
    }

    if (found == 0) { uploads.push(progress) }
      
    //console.log(uploads)
      
      //render
      var uploadhtml = ''
      for (var up in uploads) {
        uploadhtml += uploads[up].name + " progress:" + Math.round(uploads[up].upload.progress) + "%<br>"
        
      }
      $("#uploadprogress").html(uploadhtml)

  })

  $("#mopropViewImageLargeUpl").hover( function () {
    $("#mopropViewImageLargeUpl").css("opacity", "0.5")
    $("#mopropViewImageLargeUpl").css("cursor", "pointer")
  }, function () {
    $("#mopropViewImageLargeUpl").css("opacity", "1")
  })
}


var activeimg = -1;

var pagedata = {}

function getprop() {
  $.ajax({
      url: '/api/findone', 
      type: 'GET', 
      contentType: 'application/json', 
      data: JSON.stringify({})}
  ).done(function(property) {
    pagedata.property = property;
    //console.log(property) 
    var prophtml = ``

    prophtml += `<div  class="mopropViewImageLarge" class="row" ><img class="mainimg" id="mopropViewImageLargeUpl" src="/`
    if (property.mainimg) { prophtml += "content/"+property.mainimg } else { prophtml += `blank.jpg` }

    prophtml +=`"></div>`

    //THUMBNAILS

    console.log(property.gallery)
    prophtml +=`<div class="galleryThumbnails row graybg">`



    for (var img in property.gallery) {
        prophtml +=`<div class="thumbholders" ><img class="thumbs" data-imgnum="`+img+`" src="/content/`+property.gallery[img]+`"></div>`
        activeimg = img
    }

    prophtml +=`</div>`
    //INFO

    prophtml +=`
    <div class="mopropViewInfo moprop" class="row">
      <div class="mopropBoxDesc">
      <div style="float: left; text-transform:capitalize;">
      <i class="fa fa-map-marker gray"></i>&nbsp;&nbsp;`+property.location+`<br>`

      if (property.bed) { prophtml+=`<i class="fa fa-bed gray"></i> &nbsp;`+property.bed+`&nbsp;&nbsp;&nbsp;`}

      if (property.bath) {prophtml+=`<img src="/bathIcon.png" height="12">&nbsp;&nbsp;`+property.bath+`&nbsp;&nbsp;`}

      if (property.car) {prophtml+=`&nbsp;<i class="fa fa-car gray"></i>&nbsp;&nbsp;`+property.car+`&nbsp;&nbsp;`}

      prophtml+=`</div><div style="float: right; text-align: right;">`
      
      if (property.sqm) { prophtml +=`<i class="fa fa-expand gray"></i>&nbsp;&nbsp;`+property.sqm+` m²<br>`} else {
        prophtml += `<br>`
      }
      
      prophtml +=`<span style="font-weight: 800;font-size: 25px; color: #363636; ">R `+numberWithCommas(property.price)

      if (property.propType == 1) { prophtml+= `&nbsp;pm`}

      prophtml+=`</span>
      </div>
      <div style="clear: both;"></div></div>
    </div>

    <div class="mopropViewInfo" class="row">
      
      <div class="two-thirds column" style="background: #fff;">
<p style="padding: 20px">`+property.long+`</p>


      </div>
      <div class="one-third column">
        <div id="propertymenu" style="padding: 20px;">
          <a href="/contact"><button class="bluebutton" style="width: 100%;">CONTACT AGENT</button></a>



          <form action="/fileupload" class="dropzone" id="my-awesome-dropzone"></form>


        </div>
        
      </div>
      
    </div>` 

    $("#mopropLargePropData").html(prophtml);
    checklogin(enableUploadLargeImage);
    activateThumbs();
    
  });
}
    


function activateThumbs() {

  $( ".thumbs" ).click(function() {

  console.log( $(this).attr("data-imgnum") );
  console.log( $(this).attr("src") );
  activeimg = $(this).attr("data-imgnum")
  

  $("#mopropViewImageLargeUpl").attr("src", $(this).attr("src"))

  

  //mopropViewImageLargeUpl

  });

}

function checklogin(cb) {
  $.ajax({
      url: '/api/checklogin', 
      type: 'GET', 
      contentType: 'application/json', 
      data: JSON.stringify({})}
    ).done(function(result) {
      console.log(result);
      if (result.login == "success") {
        var adminmenu = `<button id="taken" class="redbutton" style="width: 100%;">TAKEN/AVAILABLE</button><br>`
        adminmenu += `<button id="mainimg" class="redbutton" style="width: 100%;">SELECT MAIN IMAGE</button>`
        adminmenu += `<button id="deleteimg" class="redbutton" style="width: 100%;">DELETE IMAGE</button>`
        adminmenu += `<button id="delete" class="redbutton" style="width: 100%;">DELETE PROPERTY</button>`
        
        $("#propertymenu").html(adminmenu)

        $("#taken").click(takenProp);
        $("#mainimg").click(mainImage);
        $("#deleteimg").click(deleteImage);        
        $("#delete").click(deleteProp);


        
        cb()
      } else {  
        console.log("not loggedin")  
      }
      
    });
  }

function takenProp() {
  //toggle
  $.ajax({
      url: '/api/taken', 
      type: 'GET', 
      contentType: 'application/json', 
      data: JSON.stringify({})}
    ).done(function(result) {
      window.location.replace("/");
    });
}  
  
function deleteProp() {
  $.ajax({
      url: '/api/delete', 
      type: 'GET', 
      contentType: 'application/json', 
      data: JSON.stringify({})}
    ).done(function(result) {
      window.location.replace("/");
    });
}  


function mainImage() {
  console.log(pagedata)
  $.ajax({
      url: '/api/mainimg', 
      type: 'POST', 
      contentType: 'application/json', 
      data: JSON.stringify({"pid": pagedata.property.pid, "activeimg": activeimg})}
    ).done(function(result) {
       location.reload();
    });
}  


function deleteImage() {
  console.log(pagedata)
  $.ajax({
      url: '/api/deleteimg', 
      type: 'POST', 
      contentType: 'application/json', 
      data: JSON.stringify({"pid": pagedata.property.pid, "activeimg": activeimg})}
    ).done(function(result) {
       location.reload();
    });
}  




    function numberWithCommas(x) {
      x = parseInt(x)
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
