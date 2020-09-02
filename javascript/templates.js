
function getPreviewImage(url){
    var img = document.createElement('img');
    img.width = 300;
    img.setAttribute("object-fit", "cover");
    img.src = url;
    return img
}

function getOriginImage(url){
    var img = document.createElement('img');
    img.width = 1000;
    img.setAttribute("object-fit", "cover");
    img.src = url;
    img.classList.add('screen-shot');
    return img
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
