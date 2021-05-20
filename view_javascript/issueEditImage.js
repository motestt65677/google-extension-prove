
var contextNow;
var drawMode = "off";
var mouseDown = false;
var projectInfo;
var canvasNum = 0;
var canvasArray = [];
var img = document.querySelector('#editingImage');
var canvasCrop = document.getElementById('canvasCrop');
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

window.addEventListener("load", function(){
    img.width = window.innerWidth * .90;
    img.setAttribute("object-fit", "cover");

    const urlParams = new URLSearchParams(window.location.search);
    const dataURI = urlParams.get('dataURI');
    img.src = dataURI;

    //load convas after image is loaded
    if (img.complete) {
        setUpDraw();
    } else {
        img.addEventListener('load', setUpDraw);
    }

    chrome.storage.local.get('projectInfo', function (items) {
        var info = items["projectInfo"];
        projectInfo = info;
    });
});

document.querySelector('#doneEditImage').addEventListener('click', function(e) {
    $("#loader").addClass("active");
    startCrop();
});
$("#prev").click(function(){
    if(canvasArray.length <= 1)
        return;

    const index = canvasArray.length - 2;
    canvasArray[index].remove();
    canvasArray.splice(index, 1);
})

$('#penBtn').click(function(e) {
    e.preventDefault();
    resetToolBars();
    $("#title").html("Draw");
    $(this).addClass('active');
    drawMode = "pen";
    contextNow.globalCompositeOperation="source-over";
    $("#thickness-container-draw").show();
});
$("#rectangleBtn").click(function(){
    resetToolBars();
    $("#title").html("Rectangle");
    $(this).addClass('active');
    drawMode = "rectangle";
    contextNow.globalCompositeOperation="source-over";
    $("#thickness-container-rectangle").show();
})

$('#eraserBtn').click(function(e) {
    e.preventDefault();
    resetToolBars();
    $("#title").html("Erase");
    $(this).addClass('active');
    drawMode = "eraser";
    contextNow.globalCompositeOperation="destination-out";
    $("#thickness-container-erase").show();
});

$("#color-container").click(function(){
    document.querySelector('#color1').click();
})

$('canvas').mouseleave(function(e){
    paint = false;
});



function bindCanvasEvent(elementId){
    // calculate where the canvas is on the window
    // (used to help calculate mouseX/mouseY)
    // const thisCanvas = $(canvasArray[canvasArray.length - 1]);
    // const canvasOffset = thisCanvas.offset();
    // const offsetX = canvasOffset.left;
    // const offsetY = canvasOffset.top;

    // this flage is true when the user is dragging the mouse
    var isDown = false;

    // these vars will hold the starting mouse position
    var startX;
    var startY;

    $("#" + elementId).mousedown(function(e){
        
        mouseDown = true;
        var mouseX = e.pageX - this.offsetLeft - canvasCrop.offsetLeft;
        var mouseY = e.pageY - this.offsetTop - canvasCrop.offsetTop;
        if(drawMode == "pen"){
            paint = true;
            addClick(mouseX, mouseY);
            redraw(document.querySelector('#thickness-draw').value);
        } else if (drawMode == "rectangle"){
            e.preventDefault();
            e.stopPropagation();

            const thisCanvas = canvasArray[canvasArray.length - 1];
            const canvasOffset = $(thisCanvas).offset();
            const offsetX = canvasOffset.left;
            const offsetY = canvasOffset.top;

            contextNow.strokeStyle = document.querySelector("#color1").value;
            contextNow.lineWidth = document.querySelector('#thickness-rectangle').value;
            
            // save the starting x/y of the rectangle
            startX = parseInt(e.clientX - offsetX);
            startY = parseInt(e.clientY - offsetY);
        
            // set a flag indicating the drag has begun
            isDown = true;
        }
    });
    
    $("#" + elementId).mousemove(function(e){
        var mouseX = e.pageX - this.offsetLeft - canvasCrop.offsetLeft;
        var mouseY = e.pageY - this.offsetTop - canvasCrop.offsetTop;
        if(drawMode == "pen" && paint){
            addClick(mouseX, mouseY, true);
            redraw(document.querySelector('#thickness-draw').value);
        } else if(drawMode == "eraser" && mouseDown){
            addClick(mouseX, mouseY, true);
            redraw(document.querySelector('#thickness-erase').value);
        } else if (drawMode == "rectangle"){
            e.preventDefault();
            e.stopPropagation();
            const thisCanvas = canvasArray[canvasArray.length - 1];
            const canvasOffset = $(thisCanvas).offset();
            const offsetX = canvasOffset.left;
            const offsetY = canvasOffset.top;

        
            // if we're not dragging, just return
            if (!isDown) {
                return;
            }
        
            // get the current mouse position
            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);

            // Put your mousemove stuff here
        
            // clear the canvas
            contextNow.clearRect(0, 0, thisCanvas.width, thisCanvas.height);
            // console.log(thisCanvas.width);
            // console.log(thisCanvas.height);

            // calculate the rectangle width/height based
            // on starting vs current mouse position
            var width = mouseX - startX;
            var height = mouseY - startY;
        
            // draw a new rect from the start position 
            // to the current mouse position
            contextNow.strokeRect(startX, startY, width, height);
        }
    });
    
    $("#" + elementId).mouseup(function(e){
        mouseDown = false;
        
        if(drawMode == "pen"){
            paint = false;
            // crop canvas
            const stroke_width = parseInt(document.querySelector('#thickness-draw').value)
            const max_x = Math.max.apply(Math, clickX) + stroke_width;
            const min_x = Math.min.apply(Math, clickX) - stroke_width;
            const max_y = Math.max.apply(Math, clickY) + stroke_width;
            const min_y = Math.min.apply(Math, clickY) - stroke_width;

            const square_width = max_x - min_x;
            const square_height = max_y - min_y;
            const thisCanvas = canvasArray[canvasArray.length - 1];
            const thisCtx = thisCanvas.getContext("2d");
            trimmed = thisCtx.getImageData(min_x, min_y, square_width, square_height);
            thisCanvas.width = square_width;
            thisCanvas.height = square_height;
            thisCanvas.style.top = min_y;
            thisCanvas.style.left = min_x;
            thisCanvas.style.border = "0px";

            // thisCtx.clearRect(0, 0, thisCanvas.width, thisCanvas.height);
            thisCtx.putImageData(trimmed, 0, 0);
        } else if (drawMode == "rectangle"){
            // the drag is over, clear the dragging flag
            isDown = false;
        }

        // create new canvas for next round drawing
        canvasNum++;
        var newCanvas = document.createElement('canvas');
        newCanvas.id = "canvas" + canvasNum;
        newCanvas.className = "board";

        newCanvas.style.zIndex = canvasNum + 3;
        newCanvas.style.top = 0;
        newCanvas.style.left = 0;
        newCanvas.width = img.width-1;
        newCanvas.height = img.height-1;
        
        canvasArray.push(newCanvas);
        canvasCrop.appendChild(newCanvas);

        bindCanvasEvent("canvas" + canvasNum);
        contextNow = newCanvas.getContext("2d");
        clickX = [];
        clickY = [];
        clickDrag = [];
    });
    
    $("#" + elementId).mouseleave(function(e){
        paint = false;
    });

}
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
    
    contextNow.strokeStyle = color;
    contextNow.lineJoin = "round";
    contextNow.lineWidth = thickness;
              
    for(var i=0; i < clickX.length; i++) {		
      contextNow.beginPath();
      if(clickDrag[i] && i){
        contextNow.moveTo(clickX[i-1], clickY[i-1]);
      }else{
        contextNow.moveTo(clickX[i]-1, clickY[i]);
      }
      contextNow.lineTo(clickX[i], clickY[i]);
      contextNow.closePath();
      contextNow.stroke();
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
        var imageUrl = canvas.toDataURL("image/png");
        // var item = getPreviewImageItem(url);
        var data = imageUrl.split(',')[1];

        var form = new FormData();
        form.append("image", data);
        // console.log(projectInfo["imgurClientId"]);
        // console.log(projectInfo.imgurClientId);

        var settings = {
            "url": "https://api.imgur.com/3/image",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Authorization": "Client-ID d9551e950665448" //+ projectInfo["imgurClientId"]
            },
            "processData": false,
            "mimeType": "multipart/form-data",
            "contentType": false,
            "data": form
            // "async": false
        };
    
        $.ajax(settings).done(function (response) {
            console.log(typeof(response));
            responseJson = JSON.parse(response);
            if(responseJson["status"] != "200")
                return false;

            var editor = window.opener.mainEditor;
            editor.model.change( writer => {
                const imageElement = writer.createElement( 'image', {
                    src: responseJson["data"]["link"]
                } );

                // Insert the image in the current selection location.
                editor.model.insertContent( imageElement, editor.model.document.selection );
            } );
            window.close();
        });
    });
}

function ID() {
    var date = new Date();
    return '_' + date.getTime();
};

function setUpDraw(){
    var canvas = document.querySelector("#canvas" + canvasNum);
    canvas.width = img.width-1;
    canvas.height = img.height-1;
    canvasArray.push(canvas);
    var canvasCrop = document.querySelector('#canvasCrop');
    canvasCrop.style.width = img.width-1;
    canvasCrop.style.height = img.height-1;
    bindCanvasEvent("canvas" + canvasNum);

    contextNow = document.getElementById('canvas' + canvasNum).getContext("2d");
    $('#penBtn').click();
}