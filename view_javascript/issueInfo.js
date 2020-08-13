var closeIssueBtn = document.getElementById('closeIssue');
var reopenIssueBtn = document.getElementById('reopenIssue');

var urlParams = new URLSearchParams(window.location.search);
var id = urlParams.get('id');
window.addEventListener("load", function(){

    // console.log(id)
    chrome.storage.local.get([id], function (item) {
        var thisItem= item[id];
        // console.log(thisItem);
        document.getElementById('title').innerHTML = thisItem.title;
        document.getElementById('priority').innerHTML = thisItem.priority;
        document.getElementById('browser').innerHTML = thisItem.browser;
        document.getElementById('url').innerHTML = thisItem.url;
        document.getElementById('expected_result').innerHTML = thisItem.expected_result;
        document.getElementById('actual_result').innerHTML = thisItem.actual_result;
        document.getElementById('steps').innerHTML = thisItem.steps;
        document.getElementById('description').innerHTML = thisItem.description;

        var images = thisItem.images;
        var imageList = document.getElementById('imageList');
        for(var i = 0; i < images.length; i++){
            var thisImage = getOriginImage(images[i]);
            imageList.appendChild(thisImage);
        }
        // console.log(thisItem.status);
        if(thisItem.status == "closed"){
            $("#reopenIssue").show();
            $("#closeIssue").hide();
        } else{
            $("#closeIssue").show();
            $("#reopenIssue").hide();
        }

    });
});

closeIssueBtn.addEventListener('click', function(){
    chrome.storage.local.get([id], function (item) {
        var thisItem = item[id];
        thisItem.status = "closed";
        chrome.storage.local.set({[id]: thisItem}, function(){
            //window.location.href = "/view/issueList.html";
            
            $("#reopenIssue").show();
            $("#closeIssue").hide();
        }); 
    });

});

reopenIssueBtn.addEventListener('click', function(){
    chrome.storage.local.get([id], function (item) {
        var thisItem = item[id];
        thisItem.status = "open";
        chrome.storage.local.set({[id]: thisItem}, function(){
            //window.location.href = "/view/issueList.html";
            $("#closeIssue").show();
            $("#reopenIssue").hide();
            
        }); 
    });
});

function closeIssue(id){
    chrome.storage.local.get([id], function (item) {
        var thisItem= item[id];
        // console.log(thisItem);
        document.getElementById('title').innerHTML = thisItem.title;
        document.getElementById('priority').innerHTML = thisItem.priority;
        document.getElementById('browser').innerHTML = thisItem.browser;
        document.getElementById('url').innerHTML = thisItem.url;
        document.getElementById('expected_result').innerHTML = thisItem.expected_result;
        document.getElementById('actual_result').innerHTML = thisItem.actual_result;
        document.getElementById('steps').innerHTML = thisItem.steps;
        document.getElementById('description').innerHTML = thisItem.description;

        var images = thisItem.images;
        var imageList = document.getElementById('imageList');
        for(var i = 0; i < images.length; i++){
            var thisImage = getOriginImage(images[i]);
            imageList.appendChild(thisImage);
        }

    });
}

function getOriginImage(url){
    var img = document.createElement('img');
    img.width = 1000;
    img.setAttribute("object-fit", "cover");
    img.src = url;
    img.classList.add('screen-shot');
    return img
}