/*
Copyright 2014 Intel Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
Author: Dongseong Hwang (dongseong.hwang@intel.com)
*/

/**
 * Grabs the desktop capture feed from the browser, requesting
 * desktop capture. Requires the permissions
 * for desktop capture to be set in the manifest.
 *
 * @see https://developer.chrome.com/apps/desktopCapture
 */
var desktop_sharing = false;
var local_stream = null;
var status = "home"; //home, screen shot, edit image, edit issue
var editingImages = [];

$('.ui.radio.checkbox')
  .checkbox()
;

function toggle() {
    if (!desktop_sharing) {
        chrome.desktopCapture.chooseDesktopMedia(["window"], onAccessApproved);
    } 

    // else {
    //     desktop_sharing = false;

    //     if (local_stream)
    //         local_stream.getVideoTracks()[0].stop();
    //     // local_stream = null;

    //     document.querySelector('button').innerHTML = "Enable Capture";
    //     console.log('Desktop sharing stopped...');
    //     status = "edit image";
    // }
}
function showEditIssue(){
    document.getElementById('issueImageContainer').style.display = 'none';
    document.getElementById('editIssueContainer').style.display = 'block';
}

function getPreviewImage(url){
    var img = document.createElement('img');
    img.width = 300;
    img.setAttribute("object-fit", "cover");
    img.src = url;
    return img
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
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720
            }
        }
    }, gotStream, getUserMediaError);

    function gotStream(stream) {
        var video = document.querySelector('video');
        local_stream = stream;
        video.srcObject = local_stream;

        video.onloadedmetadata = function() {

            var canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            var ctx = canvas.getContext('2d');
            //draw image to canvas. scale to target dimensions
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            //convert to desired file format
            var dataURI = canvas.toDataURL('image/jpeg'); // can also use 'image/png'

            if (local_stream){
                local_stream.getVideoTracks()[0].stop();
                desktop_sharing = false;
            }

            var childWindow = popupCenter({url: "/view/issueEditImage.html", title: "aaa", w: 1300, h: 800,});    
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

var ID = function () {
    var date = new Date();
    return '_' + date.getTime();
};

var popupCenter = ({url, title, w, h}) => {
    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft
    const top = (height - h) / 2 / systemZoom + dualScreenTop
    const newWindow = window.open(url, title, 
      `
      scrollbars=yes,
      width=${w / systemZoom}, 
      height=${h / systemZoom}, 
      top=${top}, 
      left=${left}
      `
    )

    if (window.focus) newWindow.focus();

    return newWindow;
}

document.querySelector('#addImage').addEventListener('click', function(e) {
    toggle();
});

document.querySelector('#doneEditImage').addEventListener('click', function(e) {
    html2canvas(document.querySelector("#convasCrop"), {scale:1}).then(canvas => {
        var imageExist = document.getElementById('editedImage');
        if(imageExist != undefined)
            return;
        
        var item = document.createElement('div');
        item.classList.add("item");
        var url = canvas.toDataURL("image/png");
        var img = getPreviewImage(url);
        item.appendChild(img);
        document.querySelector('#imageList').appendChild(item);
        editingImages.push(url);
       
        // document.querySelector('#convasContainer').appendChild(canvas)
    });
    

});

document.querySelector('#saveIssue').addEventListener('click', function(e) {
     //chrome storage
    // by passing an object you can define default values e.g.: []
    chrome.storage.local.get({issues: []}, function (result) {
        // the input argument is ALWAYS an object containing the queried keys
        // so we select the key we need
        // var issues = result.issues;
        var title = document.getElementById('title').value;
        var environment = document.getElementById('environment').value;
        var steps = document.getElementById('steps').value;
        var id = ID();
        var obj = {
            id: id,
            images: editingImages, 
            title: title,
            environment: environment,
            steps: steps
        };
        // issues.push(obj);
        // set the new array value to the same key
        chrome.storage.local.set({[id]: obj}, function(){
            window.location.href = "/view/issueList.html";
        }); 
    });

});


