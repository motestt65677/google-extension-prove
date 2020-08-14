
var context;
window.addEventListener("load", function(){
    var img = document.querySelector('#editingImage');
    img.width = 1150;
    img.setAttribute("object-fit", "cover");
    img.src = window.dataURI;

    //load convas after image is loaded
    if (img.complete) {
        setUpDraw();
    } else {
        img.addEventListener('load', setUpDraw);
    }
});



document.querySelector('#doneEditImage').addEventListener('click', function(e) {

    var canvas = document.getElementById('canvas');
    var canvasURL = canvas.toDataURL();
    var canvasImage = document.getElementById('canvasImage');
    canvasImage.src = canvasURL;
    if (canvasImage.complete) {
        startCrop();
    } else {
        canvasImage.addEventListener('load', startCrop);
    }
});


var canvasCrop = document.getElementById('canvasCrop');

$('#canvas').mousedown(function(e){

    
    var mouseX = e.pageX - this.offsetLeft - canvasCrop.offsetLeft;
    var mouseY = e.pageY - this.offsetTop - canvasCrop.offsetTop;
    paint = true;
    addClick(mouseX, mouseY);
    redraw();
});

$('#canvas').mousemove(function(e){
    if(paint){
      addClick(e.pageX - this.offsetLeft - canvasCrop.offsetLeft, e.pageY - this.offsetTop - canvasCrop.offsetTop, true);
      redraw();
    }
});

$('#canvas').mouseup(function(e){
paint = false;
});

$('#canvas').mouseleave(function(e){
    paint = false;
  });

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    
    context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    context.lineWidth = 5;
              
    for(var i=0; i < clickX.length; i++) {		
      context.beginPath();
      if(clickDrag[i] && i){
        context.moveTo(clickX[i-1], clickY[i-1]);
       }else{
         context.moveTo(clickX[i]-1, clickY[i]);
       }
       context.lineTo(clickX[i], clickY[i]);
       context.closePath();
       context.stroke();
    }
}


function getPreviewImageItem(url){

    var img = document.createElement('img');
    img.width = 300;
    img.setAttribute("object-fit", "cover");
    img.src = url;

    var item = document.createElement('div');
    item.classList.add("item");
    item.appendChild(img);

    return item
}

function startCrop(){
    html2canvas(document.querySelector("#canvasCrop"), {scale:1}).then(canvas => {
        var imageExist = document.getElementById('editedImage');
        if(imageExist != undefined)
            return;
        
        var item = document.createElement('div');
        item.classList.add("item");
        var url = canvas.toDataURL("image/png");
        var item = getPreviewImageItem(url);
        var imageList = window.opener.document.querySelector('#imageList');
        imageList.appendChild(item);
        window.opener.editingImages.push(url);
        window.close();
    });
}

function setUpDraw(){



    var img = document.querySelector('#editingImage');
    var canvas = document.querySelector("#canvas");
    canvas.width = img.width-1;
    canvas.height = img.height-1;

    var canvasCrop = document.querySelector('#canvasCrop');
    canvasCrop.style.width = img.width-1;
    canvasCrop.style.height = img.height-1;

    context = document.getElementById('canvas').getContext("2d");

}