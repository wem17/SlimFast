//import { truncate } from "fs";
//radarCanvas.js
//global variables
window.onload = loadCanvas;
window.addEventListener("resize",loadCanvas);
var canvas= document.getElementById("Radar");
var ctx = canvas.getContext("2d");
//alert("here");
var rangeVal = 44;
offsetX=100
offsetY=-120
var screenSize,scaleFactor,radarX,radarY,offsetX,offsetY;
function loadCanvas() {
    
    
      screenSize= window.innerWidth-155;
   
    //alert(screenSize);
    if   (screenSize > window.innerHeight - 60 ) {
        screenSize = window.innerHeight - 60; //50 adds padding of 10 px for frame at bottom of screen
    }
    //alert(screenSize);
   radarX= screenSize/2 + offsetX;
   radarY=screenSize/2 + offsetY;
   //alert("rangeVal: "  + rangeVal);
   scaleFactor = radarX/rangeVal;
    //alert("scaleFactor: " + scaleFactor);
    var c =document.getElementById("Radar");
    c.width=screenSize;
    c.height=screenSize;
 
    //ctx.fillStyle="#111111";
    
    ctx.fillRect(0,0,screenSize,screenSize);
    ctx.font="14px Arial";
    ctx.fillStyle = "lightgreen";
    ctx.fillText("RNG:" + rangeVal,0,screenSize);
    ctx.strokeStyle = "white";
     drawLine(-20.5,-21.5,-22.4,-20.5);
     drawLine(20.5,20.5,24.5,24.5);
      drawLine(10.5,-10.5,10.5,-2.5);
      drawLine(30.5,30.5,64.5, 4.5);
    ctx.stroke();
    //turn this into an array with the range values, run it thru a function to draw.
    ctx.beginPath();
    ctx.arc(radarX, radarY, scaleFactor*60, 0, Math.PI*2,true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(radarX, radarY, scaleFactor*40, 0, Math.PI*2, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(radarX, radarY, scaleFactor*20, 0, Math.PI*2, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(radarX, radarY, scaleFactor*.25, 0, Math.PI*2, false);
    ctx.stroke();
}
function drawLine(x1, y1, x2, y2) {
    //alert(x1 +"," + y1)
    ctx.moveTo(x1 * scaleFactor + radarX,y1 * scaleFactor + radarY);
    ctx.lineTo(x2 * scaleFactor + radarX,y2 * scaleFactor + radarY);
}

window.addEventListener("wheel", function(e){
    var dir=Math.sign(e.deltaY);
    //alert(dir);
    rangeVal= rangeVal + dir;
    if(rangeVal > 64) {
        rangeVal=64;
    }
    if (rangeVal <4) {
        rangeVal =4;
    }
    loadCanvas();
})
window.onclick = function(e) {
    if (e && (e.which == 2 || e.button == 4)) {
        alert('middleclicked')
    }
}