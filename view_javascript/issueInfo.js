var closeIssueBtn = document.getElementById('closeIssue');
var reopenIssueBtn = document.getElementById('reopenIssue');
var editIssueBtn = document.getElementById('editIssue');
var saveIssueBtn = document.getElementById('saveIssue');

var urlParams = new URLSearchParams(window.location.search);
var id = urlParams.get('id');
var obj = {};
var mode = "info";

var desktop_sharing = false;
var local_stream = null;
var status = "home"; //home, screen shot, edit image, edit issue
var editingImages = [];
var converter = new showdown.Converter();

$('.ui.radio.checkbox')
  .checkbox()
;

window.addEventListener("load", function(){
    loadInfo(function(){
        if(obj[id]["status"] == "open"){
            $("#reopenIssue").hide();
            $("#closeIssue").show();
        } else if(obj[id]["status"] == "closed"){
            $("#reopenIssue").show();
            $("#closeIssue").hide();
        }
    });
});

closeIssueBtn.addEventListener('click', function(){
    obj[id].status = "closed";
    chrome.storage.local.set(obj, function(){
        $("#reopenIssue").show();
        $("#closeIssue").hide();
    }); 
});

reopenIssueBtn.addEventListener('click', function(){
    obj[id].status = "open";
    chrome.storage.local.set(obj, function(){
        $("#closeIssue").show();
        $("#reopenIssue").hide();
    }); 
});

editIssueBtn.addEventListener('click', function(){
    mode = "edit";
    $("#infoContainer").hide();
    $("#editContainer").show();
    $("#saveIssue").show();
    $("#editIssue").hide();
    loadEdit();
});
saveIssueBtn.addEventListener('click', function(){
    mode = "info";
    $("#editContainer").hide();
    $("#infoContainer").show();
    $("#saveIssue").hide();
    $("#editIssue").show();
    var content = window.mainEditor.getData();
    obj[id]["content"] = content;

    if("gitlab" in obj[id])
        obj[id]["modified"] = true;

    chrome.storage.local.set(obj, function(){
        loadInfo();
    }); 
});

function loadInfo(callback = null){
    chrome.storage.local.get(id, function (item) {
        obj[id] = item[id];
        document.getElementById('title').innerHTML = obj[id].title;
        document.getElementById('content').innerHTML = converter.makeHtml(obj[id].content);
        console.log(obj[id].content);
        if(callback != null){
            callback();
        }
    });
}

function loadEdit(){
    if (typeof(window.mainEditor) == "undefined"){
        ClassicEditor
        .create( document.querySelector( '#editor' ), {
            language: 'zh'
        } )
        .then( editor => {
            window.mainEditor = editor;
            const content = obj[id]["content"];
            const viewFragment = editor.data.processor.toView( content );
            const modelFragment = editor.data.toModel( viewFragment );
            editor.model.insertContent( modelFragment );
        } )
        .catch( error => {
            console.error( error );
        } );
    }
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