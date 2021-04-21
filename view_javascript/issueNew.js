// var desktop_sharing = false;
// var local_stream = null;
// var status = "home"; //home, screen shot, edit image, edit issue
// var editingImages = [];

// $('.ui.radio.checkbox')
//   .checkbox()
// ;

// document.querySelector('#addImage').addEventListener('click', function(e) {
//     toggle();
// });

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

// document.querySelector('#saveIssue').addEventListener('click', function(e) {
//      //chrome storage clear all

//     // chrome.storage.local.clear(function() {
//     //     var error = chrome.runtime.lastError;
//     //     if (error) {
//     //         console.error(error);
//     //     }
//     // });

//     var title = document.getElementById('title').value;

//     var priority = $("input[name='priority']:checked").val();
//     var browser = $("input[name='browser']:checked").val();
//     var url = document.getElementById('url').value;
//     var expected_result = document.getElementById('expected_result').value;
//     var actual_result = document.getElementById('actual_result').value;
//     var steps = document.getElementById('steps').value;
//     var description = document.getElementById('description').value;

//     var id = ID();
//     var obj = {
//         id: id,
//         images: editingImages, 
//         title: title,
//         priority: priority,
//         browser: browser,
//         url: url,
//         expected_result: expected_result,
//         actual_result: actual_result,
//         steps: steps,
//         description: description,
//         status: 'open',
//         // modified: true
//     };
//     // issues.push(obj);
//     // set the new array value to the same key
//     chrome.storage.local.get('issues', function (item) {
//         var issues = item['issues'];
//         issues[id] = obj;
//         chrome.storage.local.set({'issues': issues}, function(){
//             window.location.href = "/view/issueList.html";
//             // chrome.storage.local.get('issues', function (item) {
//             //     console.log(item);
//             // }); 

//         }); 
//     }); 



// });


// function toggle() {
//     if (!desktop_sharing) {
//         chrome.desktopCapture.chooseDesktopMedia(["window"], onAccessApproved);
//     } 

//     // else {
//     //     desktop_sharing = false;

//     //     if (local_stream)
//     //         local_stream.getVideoTracks()[0].stop();
//     //     // local_stream = null;

//     //     document.querySelector('button').innerHTML = "Enable Capture";
//     //     console.log('Desktop sharing stopped...');
//     //     status = "edit image";
//     // }
// }
// function showEditIssue(){
//     document.getElementById('issueImageContainer').style.display = 'none';
//     document.getElementById('editIssueContainer').style.display = 'block';
// }

// function onAccessApproved(desktop_id) {
//     if (!desktop_id) {
//         console.log('Desktop Capture access rejected.');
//         return;
//     }
//     desktop_sharing = true;

//     navigator.webkitGetUserMedia({
//         audio: false,
//         video: {
//             mandatory: {
//                 chromeMediaSource: 'desktop',
//                 chromeMediaSourceId: desktop_id,
//                 minWidth: window.innerWidth,
//                 maxWidth: window.innerWidth,
//                 minHeight: window.innerHeight,
//                 maxHeight: window.innerHeight
//             }
//         }
//     }, gotStream, getUserMediaError);

//     function gotStream(stream) {
//         var video = document.querySelector('video');
//         local_stream = stream;
//         video.srcObject = local_stream;

//         video.onloadedmetadata = function() {

//             var canvas = document.createElement('canvas');
//             canvas.width = window.innerWidth;
//             canvas.height = window.innerHeight;
//             var ctx = canvas.getContext('2d');
//             //draw image to canvas. scale to target dimensions
//             ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//             //convert to desired file format
//             var dataURI = canvas.toDataURL('image/jpeg'); // can also use 'image/png'

//             if (local_stream){
//                 local_stream.getVideoTracks()[0].stop();
//                 desktop_sharing = false;
//             }

//             var childWindow = popupCenter({url: "/view/issueEditImage.html", title: "aaa", w: window.innerWidth, h: window.innerHeight,});    
//             childWindow.dataURI = dataURI;  

//         };

//         stream.onended = function() {
//             if (desktop_sharing) {
//                 toggle();
//             }
//         };
//     }
//     function getUserMediaError(e) {
//       console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
//     }
// }



var editor = ClassicEditor
.create( document.querySelector( '#editor' ), {
	language: 'zh'
} )
.then( editor => {
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




	

//   ( function() {
// 	CKEDITOR.plugins.add( 'placeholder', {
// 		requires: 'widget,dialog',
// 		lang: 'en', // %REMOVE_LINE_CORE%
// 		icons: 'placeholder', // %REMOVE_LINE_CORE%
// 		hidpi: true, // %REMOVE_LINE_CORE%

// 		onLoad: function() {
// 			// Register styles for placeholder widget frame.
// 			CKEDITOR.addCss( '.cke_placeholder{background-color:#ff0}' );
// 		},

// 		init: function( editor ) {

// 			var lang = editor.lang.placeholder;

// 			// Register dialog.
// 			CKEDITOR.dialog.add( 'placeholder', this.path + 'dialogs/placeholder.js' );

// 			// Put ur init code here.
// 			editor.widgets.add( 'placeholder', {
// 				// Widget code.
// 				dialog: 'placeholder',
// 				pathName: lang.pathName,
// 				// We need to have wrapping element, otherwise there are issues in
// 				// add dialog.
// 				template: '<span class="cke_placeholder">[[]]</span>',

// 				downcast: function() {
// 					return new CKEDITOR.htmlParser.text( '[[' + this.data.name + ']]' );
// 				},

// 				init: function() {
// 					// Note that placeholder markup characters are stripped for the name.
// 					this.setData( 'name', this.element.getText().slice( 2, -2 ) );
// 				},

// 				data: function() {
// 					this.element.setText( '[[' + this.data.name + ']]' );
// 				}
// 			} );

// 			// editor.ui.addButton && editor.ui.addButton( 'CreatePlaceholder', {
// 			// 	label: lang.toolbar,
// 			// 	command: 'placeholder',
// 			// 	toolbar: 'insert,5',
// 			// 	icon: 'placeholder'
// 			// } );
// 			editor.ui.addButton && editor.ui.addButton( 'CreatePlaceholder', {
// 				label: lang.toolbar,
// 				command: 'placeholder',
// 			// 	toolbar: 'insert,5',
// 				toolbar: 'clipboard,0',
// 				icon: 'placeholder'
// 			} );
// 		},

// 		afterInit: function( editor ) {
// 			var placeholderReplaceRegex = /\[\[([^\[\]])+\]\]/g;

// 			editor.dataProcessor.dataFilter.addRules( {
// 				text: function( text, node ) {
// 					var dtd = node.parent && CKEDITOR.dtd[ node.parent.name ];

// 					// Skip the case when placeholder is in elements like <title> or <textarea>
// 					// but upcast placeholder in custom elements (no DTD).
// 					if ( dtd && !dtd.span )
// 						return;

// 					return text.replace( placeholderReplaceRegex, function( match ) {
// 						// Creating widget code.
// 						var widgetWrapper = null,
// 							innerElement = new CKEDITOR.htmlParser.element( 'span', {
// 								'class': 'cke_placeholder'
// 							} );

// 						// Adds placeholder identifier as innertext.
// 						innerElement.add( new CKEDITOR.htmlParser.text( match ) );
// 						widgetWrapper = editor.widgets.wrapElement( innerElement, 'placeholder' );

// 						// Return outerhtml of widget wrapper so it will be placed
// 						// as replacement.
// 						return widgetWrapper.getOuterHtml();
// 					} );
// 				}
// 			} );
// 		}
// 	} );

// } )();



// CKEDITOR.replace( 'editor1', {
//   extraPlugins: 'placeholder',
//   height: 20
// } );

/* CKEDITOR.replace( 'editor2', {
  height: 20,
  toolbar: 'custom'
} ); */

// CKEDITOR.replace( 'editor', {
//   extraPlugins: 'placeholder',
//   height: 20,
//   toolbar: [{ name: 'tools',group: 'tools', items: [ 'Bold','CreatePlaceholder', 'Redo' ], groups: [ 'tools'] }]
// } );
