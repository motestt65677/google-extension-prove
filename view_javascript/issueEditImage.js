
var context;
var drawMode = "off";
var mouseDown = false;
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


$('#penBtn').click(function(e) {
    e.preventDefault();
    resetToolBars();
    $("#title").html("Draw");
    $(this).addClass('active');
    drawMode = "pen";
    context.globalCompositeOperation="source-over";
    $("#thickness-container-draw").show();
});

$('#eraserBtn').click(function(e) {
    e.preventDefault();
    resetToolBars();
    $("#title").html("Erase");
    $(this).addClass('active');
    drawMode = "eraser";
    context.globalCompositeOperation="destination-out";
    $("#thickness-container-erase").show();
});

$("#color-container").click(function(){
    document.querySelector('#color1').click();
})

var canvasCrop = document.getElementById('canvasCrop');

$('#canvas').mousedown(function(e){
    mouseDown = true;
    var mouseX = e.pageX - this.offsetLeft - canvasCrop.offsetLeft;
    var mouseY = e.pageY - this.offsetTop - canvasCrop.offsetTop;
    if(drawMode == "pen"){
        paint = true;
        addClick(mouseX, mouseY);
        redraw(document.querySelector('#thickness-draw').value);
    } 
});

$('#canvas').mousemove(function(e){
    var mouseX = e.pageX - this.offsetLeft - canvasCrop.offsetLeft;
    var mouseY = e.pageY - this.offsetTop - canvasCrop.offsetTop;
    if(drawMode == "pen" && paint){
        addClick(mouseX, mouseY, true);
        redraw(document.querySelector('#thickness-draw').value);
    } else if(drawMode == "eraser" && mouseDown){
        addClick(mouseX, mouseY, true);
        redraw(document.querySelector('#thickness-erase').value);
    }
});

$('#canvas').mouseup(function(e){
    mouseDown = false;
    paint = false;
    clickX = [];
    clickY = [];
    clickDrag = [];
});

$('#canvas').mouseleave(function(e){
    paint = false;
});

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;


function resetToolBars(){
    $(".ui.icon.circular.huge.button").removeClass('active');
    $("#thickness-container").hide();
    drawMode = "off";
    $("#title").html("");
    $("#thickness-container-draw").hide();
    $("#thickness-container-erase").hide();

}
function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(thickness){
    var color = document.querySelector("#color1").value;
    var thickness = thickness;

    // context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    
    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineWidth = thickness;
              
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
    $('#penBtn').click();
}