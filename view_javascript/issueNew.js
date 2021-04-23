var desktop_sharing = false;
var local_stream = null;
var status = "home"; //home, screen shot, edit image, edit issue

ClassicEditor
.create( document.querySelector( '#editor' ), {
	language: 'zh'
} )
.then( editor => {
	window.mainEditor = editor;
	const docFrag = editor.model.change( writer => {
		const p1 = writer.createElement( 'paragraph' );
		const p2 = writer.createElement( 'paragraph' );
		const p3 = writer.createElement( 'paragraph' );
		const p4 = writer.createElement( 'paragraph' );
		const p5 = writer.createElement( 'paragraph' );
		const p6 = writer.createElement( 'paragraph' );
		const p7 = writer.createElement( 'paragraph' );
		const p8 = writer.createElement( 'paragraph' );
		const p9 = writer.createElement( 'paragraph' );
		const docFrag = writer.createDocumentFragment();
		writer.append( p1, docFrag );
		writer.append( p2, docFrag );
		writer.append( p3, docFrag );
		writer.append( p4, docFrag );
		writer.append( p5, docFrag );
		writer.append( p6, docFrag );
		writer.append( p7, docFrag );
		writer.append( p8, docFrag );
		writer.append( p9, docFrag );
		writer.insertText( 'Branch/Feature：ExampleFeature', p1 );
		writer.insertText( 'User：Super Admin: example@fox-tech.co / 123456', p2 );
		writer.insertText( 'Browser: Chrome, Firefox, Safari, Edge', p3 );
		writer.insertText( 'URL: temphawk.net/example', p4 );
		writer.insertText( 'TestData：', p5 );
		writer.insertText( 'Expected Behavior：', p6 );
		writer.insertText( 'Actual Behavior：', p7 );
		writer.insertText( 'Steps to Reproduce: ', p8 );
		writer.insertText( 'Other: ', p9 );
		return docFrag;
	} );
	editor.model.insertContent( docFrag );
} )
.catch( error => {
	console.error( error );
} );

document.querySelector('#saveIssue').addEventListener('click', function(e) {
    var title = document.getElementById('title').value;
    var id = ID();
	var content = window.mainEditor.getData();
    var issue = {
        id: id,
        content: content, 
        title: title,
        status: 'open',
        // modified: true
    };

	chrome.storage.local.get('issue_ids', function (item) {
        var ids = [];
		if(typeof(item['issue_ids']) !== "undefined"){
			ids = item['issue_ids'];
		}
		ids.push(id);
        // issues[id] = obj;
        chrome.storage.local.set({'issue_ids': ids}, function(){
            window.location.href = "/view/issueList.html";
        }); 
    }); 

    var obj = {};
    obj[id] = issue;
	chrome.storage.local.set(obj); 
});

function toggle() {
    if (!desktop_sharing) {
        chrome.desktopCapture.chooseDesktopMedia(["window"], onAccessApproved);
    } else {
        desktop_sharing = false;
        if (local_stream)
            local_stream.getVideoTracks()[0].stop();

        document.querySelector('button').innerHTML = "Enable Capture";
        console.log('Desktop sharing stopped...');
        status = "edit image";
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
