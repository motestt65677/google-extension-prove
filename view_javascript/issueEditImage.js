

window.addEventListener("load", function(){
    var img = document.querySelector('#editingImage');
    img.width = 1280;
    img.setAttribute("object-fit", "cover");
    img.src = window.dataURI;
    //console.log(window.dataURI);
});

document.querySelector('#doneEditImage').addEventListener('click', function(e) {
    html2canvas(document.querySelector("#convasCrop"), {scale:1}).then(canvas => {
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
    

});

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
