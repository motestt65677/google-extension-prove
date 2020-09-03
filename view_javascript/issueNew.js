var desktop_sharing = false;
var local_stream = null;
var status = "home"; //home, screen shot, edit image, edit issue
var editingImages = [];

$('.ui.radio.checkbox')
  .checkbox()
;

document.querySelector('#addImage').addEventListener('click', function(e) {
    toggle();
});

document.querySelector('#doneEditImage').addEventListener('click', function(e) {
    html2canvas(document.querySelector("#convasCrop")).then(canvas => {
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
     //chrome storage clear all

    // chrome.storage.local.clear(function() {
    //     var error = chrome.runtime.lastError;
    //     if (error) {
    //         console.error(error);
    //     }
    // });

    var title = document.getElementById('title').value;

    var priority = $("input[name='priority']:checked").val();
    var browser = $("input[name='browser']:checked").val();
    var url = document.getElementById('url').value;
    var expected_result = document.getElementById('expected_result').value;
    var actual_result = document.getElementById('actual_result').value;
    var steps = document.getElementById('steps').value;
    var description = document.getElementById('description').value;

    var id = ID();
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
        status: 'open',
        // modified: true
    };
    // issues.push(obj);
    // set the new array value to the same key
    chrome.storage.local.get('issues', function (item) {
        var issues = item['issues'];
        issues[id] = obj;
        chrome.storage.local.set({'issues': issues}, function(){
            window.location.href = "/view/issueList.html";
            // chrome.storage.local.get('issues', function (item) {
            //     console.log(item);
            // }); 

        }); 
    }); 



});


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

