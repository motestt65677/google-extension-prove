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
function getOriginImage(url){
    var img = document.createElement('img');
    img.width = 1280;
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
    // document.querySelector('button').innerHTML = "Disable Capture";
    // console.log("Desktop sharing started.. desktop_id:" + desktop_id);

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
                     
            // var img = getOriginImage(dataURI);
            document.getElementById('issueImageContainer').style.display = 'block';
            document.getElementById('editIssueContainer').style.display = 'none';
            var img = document.querySelector('#editingImage');
            img.width = 1280;
            img.setAttribute("object-fit", "cover");
            img.src = dataURI;

            if (local_stream){
                local_stream.getVideoTracks()[0].stop();
                desktop_sharing = false;
            }

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
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Click handler to init the desktop capture grab
 */
document.querySelector('#new').addEventListener('click', function(e) {
    //toggle();
    showEditIssue();
    editingImages = [];
    document.querySelector('#imageList').innerHTML = "";
    document.getElementById('title').value = "";
    document.getElementById('environment').value = "";
    document.getElementById('steps').value = "";
});

document.querySelector('#next').addEventListener('click', function(e) {
    showEditIssue();
});

document.querySelector('#addImage').addEventListener('click', function(e) {
    toggle();
});

document.querySelector('#doneEditImage').addEventListener('click', function(e) {
    html2canvas(document.querySelector("#convasCrop"), {scale:5}).then(canvas => {
        var imageExist = document.getElementById('editedImage');
        if(imageExist != undefined)
            return;
        
        // canvas.id = "editedImage";
        // canvas.width  = 800;
        // canvas.height = 600;
        var item = document.createElement('div');
        item.classList.add("item");
        var url = canvas.toDataURL("image/png");
        var img = getPreviewImage(url);
        item.appendChild(img);
        document.querySelector('#imageList').appendChild(item);
        editingImages.push(url);
       
        // document.querySelector('#convasContainer').appendChild(canvas)
    });
    
    showEditIssue();

});

document.querySelector('#saveIssue').addEventListener('click', function(e) {
     //chrome storage
    // by passing an object you can define default values e.g.: []
    chrome.storage.local.get({issues: []}, function (result) {
        // the input argument is ALWAYS an object containing the queried keys
        // so we select the key we need
        var issues = result.issues;
        var title = document.getElementById('title').value;
        var environment = document.getElementById('environment').value;
        var steps = document.getElementById('steps').value;

        var obj = {
            id: ID(),
            images: editingImages, 
            title: title,
            environment: environment,
            steps: steps
        };
        issues.push(obj);
        // set the new array value to the same key
        chrome.storage.local.set({issues: issues}, function(){
            window.location.href = "/view/issueList.html";
        }); 
    });

});


