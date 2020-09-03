var closeIssueBtn = document.getElementById('closeIssue');
var reopenIssueBtn = document.getElementById('reopenIssue');
var editIssueBtn = document.getElementById('editIssue');
var saveIssueBtn = document.getElementById('saveIssue');

var urlParams = new URLSearchParams(window.location.search);
var id = urlParams.get('id');
var mode = "info";

var desktop_sharing = false;
var local_stream = null;
var status = "home"; //home, screen shot, edit image, edit issue
var editingImages = [];

$('.ui.radio.checkbox')
  .checkbox()
;

window.addEventListener("load", function(){

    // console.log(id)
    
    
    loadInfo();
    $('.ui.radio.checkbox').checkbox();

    //load editing images from storage
    chrome.storage.local.get([id], function (item) {
        var thisItem = item[id];
        editingImages = thisItem["images"];
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

editIssueBtn.addEventListener('click', function(){
    // window.location.href = "/view/issueEdit.html?id=" + id;
    mode = "edit";
    $("#infoContainer").hide();
    $("#editContainer").show();
    $("#saveIssue").show();
    $("#editIssue").hide();
    loadEdit();
});
saveIssueBtn.addEventListener('click', function(){
    // window.location.href = "/view/issueEdit.html?id=" + id;
    mode = "info";
    $("#editContainer").hide();
    $("#infoContainer").show();
    $("#saveIssue").hide();
    $("#editIssue").show();
    loadInfo();

        //chrome storage clear all
   
       // chrome.storage.local.clear(function() {
       //     var error = chrome.runtime.lastError;
       //     if (error) {
       //         console.error(error);
       //     }
       // });
      
       var priority = $("input[name='priority']:checked").val();
       var browser = $("input[name='browser']:checked").val();
       var url = document.getElementById('url_edit').value;
       var expected_result = document.getElementById('expected_result_edit').value;
       var actual_result = document.getElementById('actual_result_edit').value;
       var steps = document.getElementById('steps_edit').value;
       var description = document.getElementById('description_edit').value;
   
       var obj = {
           id: id,
           images: editingImages, 
           title: title,
           priority: priority,
           browser: browser,
           url: url,
           expected_result: expected_result,
           actual_result: actual_result,
           steps: steps,
           description: description,
        //    status: 'open'
       };

        chrome.storage.local.get([id], function (item) {
            var thisItem= item[id];
            thisItem.images = editingImages;
            thisItem.priority = priority;
            thisItem.browser = browser;
            thisItem.url = url;
            thisItem.expected_result = expected_result;
            thisItem.actual_result = actual_result;
            thisItem.steps = steps;
            thisItem.description = description;
            thisItem.modified = true;

            chrome.storage.local.set({[id]: thisItem}, function(){
                //    window.location.href = "/view/issueList.html";
                loadInfo();
            }); 
        });

       // issues.push(obj);
       // set the new array value to the same key

   

});

document.querySelector('#addImage').addEventListener('click', function(e) {
    toggle();
});

function loadInfo(){
    chrome.storage.local.get([id], function (item) {
        var thisItem= item[id];
        document.getElementById('title').innerHTML = thisItem.title;
        document.getElementById('priority').innerHTML = thisItem.priority;
        document.getElementById('browser').innerHTML = thisItem.browser;
        document.getElementById('url').innerHTML = thisItem.url;
        document.getElementById('expected_result').innerHTML = thisItem.expected_result;
        document.getElementById('actual_result').innerHTML = thisItem.actual_result;
        document.getElementById('steps').innerHTML = thisItem.steps;
        document.getElementById('description').innerHTML = thisItem.description;

        var images = thisItem.images;
        var imageListInfo = document.getElementById('imageListInfo');
        imageListInfo.innerHTML = "";
        for(var i = 0; i < images.length; i++){
            var thisImage = getOriginImage(images[i]);
            imageListInfo.appendChild(thisImage);
        }

        
        // console.log(thisItem.status);
        

    });
}

function loadEdit(){
    chrome.storage.local.get([id], function (item) {

        var thisItem= item[id];
        // document.getElementById('priority_edit').value = thisItem.priority;
        // document.getElementById('browser_edit').value = thisItem.browser;
        $("input[name=priority][value='"+thisItem.priority+"']").prop("checked",true);
        $("input[name=browser][value='"+thisItem.browser+"']").prop("checked",true);

        document.getElementById('url_edit').value = thisItem.url;
        document.getElementById('expected_result_edit').value = thisItem.expected_result;
        document.getElementById('actual_result_edit').value = thisItem.actual_result;
        document.getElementById('steps_edit').value = thisItem.steps;
        document.getElementById('description_edit').value = thisItem.description;

        var images = thisItem.images;
        var imageList = document.getElementById('imageList');
        imageList.innerHTML = "";
        for(var i = 0; i < images.length; i++){
            var editImage = getPreviewImageItem(images[i]);
            imageList.appendChild(editImage);
        }

        
        // console.log(thisItem.status);
        
    });
    
}



function toggle() {
    if (!desktop_sharing) {
        chrome.desktopCapture.chooseDesktopMedia(["window"], onAccessApproved);
    } 
}
function showEditIssue(){
    document.getElementById('issueImageContainer').style.display = 'none';
    document.getElementById('editIssueContainer').style.display = 'block';
}




function onAccessApproved(desktop_id) {
    if (!desktop_id) {
        console.log('Desktop Capture access rejected.');
        return;
    }
    desktop_sharing = true;

    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                minWidth: window.innerWidth,
                maxWidth: window.innerWidth,
                minHeight: window.innerHeight,
                maxHeight: window.innerHeight
            }
        }
    }, gotStream, getUserMediaError);

    function gotStream(stream) {
        var video = document.querySelector('video');
        local_stream = stream;
        video.srcObject = local_stream;

        video.onloadedmetadata = function() {

            var canvas = document.createElement('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            var ctx = canvas.getContext('2d');
            //draw image to canvas. scale to target dimensions
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            //convert to desired file format
            var dataURI = canvas.toDataURL('image/jpeg'); // can also use 'image/png'

            if (local_stream){
                local_stream.getVideoTracks()[0].stop();
                desktop_sharing = false;
            }

            var childWindow = popupCenter({url: "/view/issueEditImage.html", title: "aaa", w: window.innerWidth, h: window.innerHeight,});    
            childWindow.dataURI = dataURI;  

        };

        stream.onended = function() {
            if (desktop_sharing) {
                toggle();
            }
        };
    }
    function getUserMediaError(e) {
      console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
    }
}







// document.querySelector('#doneEditImage').addEventListener('click', function(e) {
//     html2canvas(document.querySelector("#convasCrop")).then(canvas => {
//         var imageExist = document.getElementById('editedImage');
//         if(imageExist != undefined)
//             return;
        
//         var item = document.createElement('div');
//         item.classList.add("item");
//         var url = canvas.toDataURL("image/png");
//         var img = getPreviewImage(url);
//         item.appendChild(img);
//         document.querySelector('#imageList').appendChild(item);
//         editingImages.push(url);
       
//         // document.querySelector('#convasContainer').appendChild(canvas)
//     });
    

// });