var mouse = {
  x : 0,
  y : 0
}

var allproperties = [];
var filterprops = [];
var filters = {
  location : "all",
  propType : 1          //1 = unselected, 2 = buy, 3 = rent
}

$(document).ready(function() 
{

  checklogin();


  /* FRONT PAGE */
  var propType = 2    //1 = unselected, 2 = buy, 3 = rent
    
    $("#propTypeSwitch").click( function() {
        switch (propType) {
          case 1: 
            propType = 3
            break
          case 2:
            propType = 3
            break
          case 3:
            propType = 1
            break }
        update();
      })

    $("#propSwitchRent").click( function () {
      propType = 1;
      update();
    })

    $("#propSwitchBuy").click( function () {
      propType = 3;
      update();
    })

function getprops() {

  $.ajax({
    url: '/api/search', 
    type: 'GET', 
    contentType: 'application/json', 
    data: JSON.stringify({})}
).done( function (allpropdata) {
  allproperties = allpropdata;
  locationlist(allpropdata);
  renderprops(allpropdata);
  });
}
    
getprops();

    function update() {
      //FULL RENDER
      if (propType == 1) { 
        $("#propType").css("margin-left", 1 ) 
        $("#propType").css("background", "#3670b2")
        $("#propSwitchRent").css("color", "#3670b2")
        $("#propSwitchBuy").css("color", "#8a8a8a")
      }
      if (propType == 2) { //MID
        $("#propType").css("margin-left", 8 ) 
        $("#propType").css("background", "#878b8c")
        $("#propSwitchRent").css("color", "#8a8a8a")
        $("#propSwitchBuy").css("color", "#8a8a8a")
      }
      if (propType == 3) { 
        $("#propType").css("margin-left", 15 ) 
        $("#propType").css("background", "#be0121")
        $("#propSwitchRent").css("color", "#8a8a8a")
        $("#propSwitchBuy").css("color", "#be0121")
      } 

      $(".mopropBoxImage").css("width", "100%");
      filters.propType = propType;
      updatePriceBar();
      renderprops(allproperties);
    }








    /* PRICE BAR SLIDER */
    
    var dragleft = 0;
    var dragleftstart = 0;
    var dragleftpos = 0; //LEFT VALUE
    var dragleftperc = 0.1;

    var dragright = 0;
    var dragrightstart = 0;
    var dragrightpos = 9999; //RIGHT VALUE
    var dragrightperc = 1;

    function updatePriceBar() {
      var maxw = $("#mopropSearchBox").width() - 40;

      $("#propInName").css("width", maxw);

      $("#mopropPriceBar").css("width", maxw );
      $("#mopropPriceBarValue").css("width",  100 );

      if (dragleftpos < 20) {dragleftpos = 20}
      if (dragrightpos > 5000) { dragrightpos = maxw}
      if (dragrightpos > maxw) { dragrightpos = maxw }

        dragleftperc = (dragleftpos-20)/maxw;
        dragrightperc = dragrightpos/maxw;


      $("#mopropPriceBarValue").css("margin-left", dragleftpos );
      $("#mopropPriceBarValue").css("width", dragrightpos - dragleftpos );      
      $("#mopropPriceBarSliderButtonLeft").css("left", dragleftpos);
      $("#mopropPriceBarSliderButtonRight").css("left", dragrightpos);     

      var scale = 20;
      
      if (propType == 1) { scale = 6}
      if (propType == 3) { scale = 20}
      var lowprice = Math.round(Math.round( Math.exp(7+dragleftperc*scale, 2))/100)*100 - 1000; 
      var highprice = Math.round(Math.round( Math.exp(7+dragrightperc*scale, 2))/100)*100 - 1000; 

      filters.lowprice = lowprice
      filters.highprice = highprice
      $("#propPriceRange").html("R "+numberWithCommas(lowprice)+" - "+numberWithCommas(highprice))

      renderprops(allproperties);
    }

    $("#mopropPriceBarSliderButtonLeft").mousedown( function() {
      dragleft = 1;
      dragleftstart = mouse.x;
      dragleftpos = parseInt($("#mopropPriceBarSliderButtonLeft").css("left"));
    })



    $("#mopropPriceBarSliderButtonRight").mousedown( function() {
      dragright = 1;
      dragrightstart = mouse.x;
      dragrightpos = parseInt($("#mopropPriceBarSliderButtonRight").css("left"));
    })



    var el = document.getElementById('mopropPriceBarSliderButtonLeft'); 

    el.addEventListener("touchstart", handleStart, false);
    /*el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    el.addEventListener("touchleave", handleEnd, false);
    el.addEventListener("touchmove", handleMove, false);*/

    function handleStart(event) {
      // Handle the start of the touch
    }

  $(document).mousemove(function(event){
    mouse.x = event.clientX
    mouse.y = event.clientY

    if (dragleft == 1) {
      var dragdelta = mouse.x - dragleftstart;
      dragleftpos += dragdelta;
      if (dragleftpos > (dragrightpos - 20)) {
        dragleftpos = (dragrightpos - 20);
        dragrightpos += dragdelta;
      }
      dragleftstart = mouse.x
      updatePriceBar();
    }

    if (dragright == 1) {
      var dragdelta = mouse.x - dragrightstart;
      dragrightpos += dragdelta;
      if (dragrightpos < (dragleftpos+20)) { 
        dragrightpos = (dragleftpos+20);
        dragleftpos +=dragdelta;
      }
      
      dragrightstart = mouse.x
      updatePriceBar();
    }

   });

  $(document).mouseup(function(event){
    dragleft = 0;
    dragright = 0;
    //renderprops(allproperties);
  });

  $( window ).resize(function() { update(); });
  update();
})


function checklogin() {
  $.ajax({
      url: '/api/checklogin', 
      type: 'GET', 
      contentType: 'application/json', 
      data: JSON.stringify({})}
    ).done(function(result) {
      console.log(result);
      if (result.login == "success") {
        $("#mopropFooterAdmin").html(`<a href="/submit"> <i class="fa fa-plus blue"> </a>`)
        $(".mopropBottom").show()
      } else {  
        $("#mopropFooterAdmin").html(`<a href="/login"> <i class="fa fa-plus gray"> </a>`)
        $(".mopropBottom").show()
      }
      return result;
    });
  }

function oldtonew(a,b) {
  if (a.pid < b.pid)
    return -1;
  else if (a.pid > b.pid)
    return 1;
  else 
    return 0;
}

function newest(a,b) {
  if (a.pid < b.pid)
    return 1;
  else if (a.pid > b.pid)
    return -1;
  else 
    return 0;
}

function byLocation(a,b) {
  if (a.location < b.location)
    return -1;
  else if (a.location > b.location)
    return 1;
  else 
    return 0;
}

function locationlist(properties) {
  properties.sort(byLocation);

  var locListArr = [];
  for (var p in properties) {
    if ( $.inArray(properties[p].location, locListArr) == -1) {
      locListArr.push(properties[p].location)  
    }
  }
  console.log(locListArr)

  var locationsHtml = `<option value="all" selected>All locations</option>`;
  for (var p in locListArr) {
    locationsHtml += `<option value="`+locListArr[p]+`">`+locListArr[p]+`</option>`;
  }
  $("#locationList").html(locationsHtml);

  $('select[name="locationSelect"]').change( function (){
    filters.location = $(this).val();

    renderprops(allproperties);

  })
}

 /* PROPERTY BOXES IMAGE HOVER */
function applyhover() {
    $(".mopropBoxResponsive").hover( function() {
      $(this).find('.mopropBoxImage').animate({
            width: "+=80",
            height: "+=80",
            top: "-=40",
            left: "-=40"
        }, 250);
    }, function() {
      $(this).find('.mopropBoxImage').animate({
            width: "-=80",
            height: "-=80",
            top: "+=40",
            left: "+=40"
        }, 200);
    });
}

function numberWithCommas(x) {
return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function renderprops(properties) {
  
  var prophtml = "";
  properties.sort(newest);


  console.log("render")
  console.log(properties)

  var totalmatch = 0;

  for (var p in properties) {
    var show = 1;
    if (filters.propType != 2) {  if (filters.propType != properties[p].propType) { show = 0 } }
    if (filters.lowprice > properties[p].price) { show = 0 }
    if (filters.highprice < properties[p].price) { show = 0 }
    if (filters.location != "all") { if (filters.location != properties[p].location) {  show = 0; } }

    
      
    if (show == 1) {
        var newprop = `<!-- MOPROP START -->
        <a class="mopropSmall" href="/view/`+properties[p].pid+`">
        <div class="mopropBoxResponsive">
        <div class="mopropBox" style="overflow: hidden;">
        <div class="mopropBoxTitle">`+properties[p].short+`&nbsp;</div>

        <div class="mopropBoxImageBox" style="position: relative; overflow: hidden;">
        <img class="mopropBoxImage" style="z-index: 1000; position: absolute; margin: auto; top: 0; left: 0; right: 0; bottom: 0;" src="`


        if (properties[p].mainimg) {newprop += `/content/`+properties[p].mainimg+`">`} else {newprop += `/blank.jpg">`}

        if (properties[p].taken == true) {
          if (properties[p].propType == 1) { newprop += `<div class="mopropTagToLet" style="z-index: 1001;position: absolute; background:#fa6102;">LET</div>`; }
          if (properties[p].propType == 3) { newprop += `<div class="mopropTagForSale" style="z-index: 1001;position: absolute; background:#fa6102;">SOLD</div>`; }            
        } else {
          if (properties[p].propType == 1) { newprop += `<div class="mopropTagToLet" style="z-index: 1001;position: absolute;">RENT</div>`; }
          if (properties[p].propType == 3) { newprop += `<div class="mopropTagForSale" style="z-index: 1001;position: absolute;">BUY</div>`; }  
        }
        

        newprop += `</div>
        <div class="mopropBoxDesc">
        <div style="float: left; text-transform: capitalize;">
        <i class="fa fa-map-marker gray"></i>&nbsp;&nbsp;`+properties[p].location+`<br>`


        if (properties[p].bed) { newprop+= `<i class="fa fa-bed gray"></i> &nbsp;`+properties[p].bed+`&nbsp;&nbsp;` }
        if (properties[p].bath) { newprop += `&nbsp;<img src="/bathIcon.png" height="12">&nbsp;&nbsp;`+properties[p].bath+`&nbsp;&nbsp;` }
        if (properties[p].car) { newprop += `&nbsp;<i class="fa fa-car gray"></i>&nbsp;&nbsp;`+properties[p].car+`&nbsp;&nbsp;` }


        newprop += `</div>
        <div style="float: right; text-align: right;">`


        if (properties[p].sqm) { newprop += `<i class="fa fa-expand gray"></i>&nbsp;&nbsp;`+properties[p].sqm+` m²<br>` } else {
          newprop += `<br>`;
        }

        newprop += `<span style="font-weight: 800;color: #000;">R&nbsp;`+numberWithCommas(properties[p].price);

        if (properties[p].propType == 1) {newprop +=`&nbsp;pm`; }

        newprop +=`</span>
        </div>
        <div style="clear: both;"></div></div></div></div>
        </a>
        <!-- MOPROP END -->`;
        prophtml += newprop;
        totalmatch++;
      }// end draw

  } //end loop

      if (totalmatch == 0) { prophtml = "<center>No properties match filters.</center>"}
      $("#mopropertyholder").html(prophtml);
      applyhover();
}


   
