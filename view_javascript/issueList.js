// changing menu tabs
$('.ui.secondary.menu').on('click', '.item', function() {
    if(!$(this).hasClass('dropdown')) {
    $(this)
        .addClass('active')
        .siblings('.item')
        .removeClass('active');
    }
});
window.addEventListener("load", function(){
    loadIssues('open');
    // $.ajax({
    //     type: "POST",
    //     url: "https://gitlab.com/api/v4/projects/20611880/issues",
    //     // The key needs to match your method's input parameter (case-sensitive).
    //     headers: {"PRIVATE-TOKEN": "jirUTEUKh9zj-U5HTwg7"},
    //     data: {title: "test5"},
    //     // contentType: "application/json; charset=utf-8",
    //     dataType: "json",
    //     success: function(data){alert(data);},
    //     failure: function(errMsg) {
    //         alert(errMsg);
    //     }
    // });
});

$('[data-tab]').click(function(){
    var status = $(this).data('tab');
    loadIssues(status);
    if(status == "open")
        $("#gitlab").show();
    else
        $("#gitlab").hide();

});
$('#gitlab').click(function(){
    $('#gitlab').prop('disabled', true);
    $('#gitlab').addClass("loading");
    // var id = "_1598507751746";
    // var id = "_1597817455434";
    var url = "http://localhost:9990/addFileToGitLabProject";
    var privateToken = "jirUTEUKh9zj-U5HTwg7"
    var projectId = "20611880";

    // var waitingAjax = [];
    chrome.storage.local.get(null, function (items) {
        // the input argument is ALWAYS an object containing the queried keys
        // so we select the key we need
        var allKeys = Object.keys(items);
        for(var i = 0; i< allKeys.length; i++){
            var thisIssue = items[allKeys[i]];
            var thisIssueId = allKeys[i];
            var thisStatus = thisIssue.status;
            var imageLinks = [];

            if(thisStatus != "open")
                continue;

            if("gitlab" in thisIssue)
                continue;

            // var thisIssue = item[id];
            var images = thisIssue["images"];
            for(var j = 0; j < images.length; j++){
                var imageBase64 = thisIssue["images"][j].replace("data:image/png;base64,","");
                var fileName = guidGenerator() + '.png';
        
                var blob = base64ToBlob(imageBase64, 'image/png');                
                var formData = new FormData();
                formData.append('image', blob);
                formData.append('privateToken', privateToken);
                formData.append('projectId', projectId);
                formData.append('fileName', fileName);
                formData.append('imageOrder', j);
                
                $.ajax({
                    url: url, 
                    type: "POST", 
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: formData,
                    async: false,
                    success: function(result) {
                        // var number = result["number"];
                        // var markdown = result["markdown"];
                        imageLinks.push(result["markdown"]);
    
                        // console.log(result);
                        // var data = JSON.parse(result);

                        // Run the code here that needs
                        //    to access the data returned
                        // return data;
                    },
                
                }).done(function(e){
                    // alert('done!');
                });

            }

            var title = thisIssue["title"];
            // description = "a\r\n\r\nb \r\n c \r\n\r d";
            var description = "Priority: " + thisIssue["priority"] + "\r\n\r\n"
            + "Browser: " + thisIssue["browser"] + "\r\n\r\n"
            + "Url: " + thisIssue["url"] + "\r\n\r\n"
            + "Expected Result: " + thisIssue["expected_result"] + "\r\n\r\n"
            + "Actual Result: " + thisIssue["actual_result"] + "\r\n\r\n"
            + "Steps to Reproduce: " + thisIssue["steps"] + "\r\n\r\n"
            + "Description: " + thisIssue["description"] + "\r\n\r\n"
            ;

            for(var k = 0; k < imageLinks.length; k++){
                description += imageLinks[k] + "\r\n\r\n";
            }

            $.ajax({
                type: "POST",
                async: false,
                url: "https://gitlab.com/api/v4/projects/"+projectId+"/issues",
                // The key needs to match your method's input parameter (case-sensitive).
                headers: {"PRIVATE-TOKEN": "jirUTEUKh9zj-U5HTwg7"},
                data: {title: title, description: description},
                // contentType: "application/json; charset=utf-8",
                dataType: "json",
                
                success: function(data){
                    //add gitlab info
                    // var thisItem = item[thisIssueId];
                    thisIssue.gitlab = data;
                    // console.log(thisItem);
                    chrome.storage.local.set({[thisIssueId]: thisIssue}); 
                    
                    
                    // waitingAjax.push(thisIssueId);
                    // var index = waitingAjax.indexOf(thisIssueId);
                    // if (index > -1) 
                    //     waitingAjax.splice(index, 1);
                    
                    // if(waitingAjax.length == 0)
                    //     $('#gitlab').prop('disabled', false);

                },
                failure: function(errMsg) {
                    alert(errMsg);
                }
            });
        }

        $('#gitlab').prop('disabled', false);
        $('#gitlab').removeClass("loading");
        var status = $('[data-tab]').data('tab');

        loadIssues(status);
    });

    // $('#gitlab').prop('disabled', false);

});

function base64ToBlob(base64, mime) 
{
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
        var slice = byteChars.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: mime});
}

var ID = function () {
    var date = new Date();
    return '_' + date.getTime();
};
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function toInfoPage(){
    window.location.href = "/view/issueInfo.html?id=" + this.id;
}
function removeGitlabTags(){
    chrome.storage.local.get(null, function (items) {
        var allKeys = Object.keys(items);
        for(var i = 0; i< allKeys.length; i++){
            var thisIssue = items[allKeys[i]];
            var thisIssueId = thisIssue.id;
            // console.log(thisIssue);
            delete thisIssue["gitlab"]; 
            chrome.storage.local.set({[thisIssueId]: thisIssue}); 
        }
    });
}
function loadIssues(status){

    // removeGitlabTags();



    // status types: open, closed, all
    document.getElementById('issues').innerHTML = "";
    chrome.storage.local.get(null, function (items) {
        // the input argument is ALWAYS an object containing the queried keys
        // so we select the key we need
        var allKeys = Object.keys(items);
        for(var i = 0; i< allKeys.length; i++){
            var thisIssue = items[allKeys[i]];
            var thisStatus = thisIssue.status;
            if(status != "all"){
                if(status != thisStatus)
                    continue;
            }
            var item = document.createElement('div');
            item.id = thisIssue.id;
            item.onclick=toInfoPage;
            var content = document.createElement('div');
            var header = document.createElement('span');
            item.classList.add('item');
            content.classList.add('content');
            header.classList.add('header');
            header.innerHTML = thisIssue.title;

            //adding gitlab icon if issue is on gitlab
            if("gitlab" in thisIssue){
                // console.log(thisIssue);
                var gitlabSpan = document.createElement('span');
                gitlabSpan.classList.add("gitlabSpan");
                var gitlabIcon = document.createElement('i');
                gitlabIcon.classList.add("gitlab");
                gitlabIcon.classList.add("icon");
                var issueId = document.createElement('span');
                issueId.innerHTML = "#" + thisIssue.gitlab.iid;
                gitlabSpan.appendChild(gitlabIcon);
                gitlabSpan.appendChild(issueId);

                header.appendChild(gitlabSpan);
            }
            content.appendChild(header);

            item.appendChild(content);

            document.getElementById("issues").appendChild(item);
        }
    });
}