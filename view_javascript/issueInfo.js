window.addEventListener("load", function(){
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('id');
    // console.log(id)
    chrome.storage.local.get([id], function (item) {
        var thisItem= item[id];

        document.getElementById('title').innerHTML = thisItem.title;
        document.getElementById('environment').innerHTML = thisItem.environment;
        document.getElementById('steps').innerHTML = thisItem.steps;

        var images = thisItem.images;
        var imageList = document.getElementById('imageList');
        for(var i = 0; i < images.length; i++){
            var thisImage = getOriginImage(images[i]);
            imageList.appendChild(thisImage);
        }

    });
});


function getOriginImage(url){
    var img = document.createElement('img');
    img.width = 1000;
    img.setAttribute("object-fit", "cover");
    img.src = url;
    return img
}