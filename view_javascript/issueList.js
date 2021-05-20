

var projectInfo;
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
    $('.ui.dropdown').dropdown();
    chrome.storage.local.get('projectInfo', function (items) {
        var info = items["projectInfo"];
        projectInfo = info;
        $("#projectId").val(projectInfo.projectId);
        $("#personalAccessToken").val(projectInfo.privateToken);
        // $("#imgurClientId").val(projectInfo.imgurClientId);
    });

    if(projectInfo == undefined)
        $("#saveProjectInfo").trigger('click');
});

$('[data-tab]').click(function(){
    var status = $(this).data('tab');
    loadIssues(status);
    if(status == "open")
        $("#gitlab").show();
    else
        $("#gitlab").hide();
});

$("#projectInfoBtn").click(function(){
    $("#projectInfoModal").modal('show');
});
$("#caqBtn").click(function(){
    $("#caqModal").modal('show');
});


$("#saveProjectInfo").click(function(){
    var projectId = $("#projectId").val();
    var privateToken = $("#personalAccessToken").val();
    // var imgurClientId = $("#imgurClientId").val();

    projectInfo = {
        projectId: projectId,
        privateToken: privateToken
        // imgurClientId: imgurClientId
    };
    chrome.storage.local.set({'projectInfo': projectInfo}, function(){
        $("#projectInfoModal").modal('hide');
    }); 
    // chrome.storage.local.get('projectInfo', function (projectInfo) {
    //     console.log(projectInfo);
    // });
});

$('#gitlab').click(function(){
    if(projectInfo["projectId"] == "" || projectInfo["privateToken"] == ""){
        alert("Please enter Project ID and Private Token");
        return;
    }
    $('#gitlab').prop('disabled', true);
    $('#gitlab').addClass("loading");
    // var id = "_1598507751746";
    // var id = "_1597817455434";
    var url = "http://localhost:9990/addFileToGitLabProject";
    var projectId = projectInfo["projectId"];
    var privateToken = projectInfo["privateToken"];

    // var waitingAjax = [];
    chrome.storage.local.get(null, function (items) {
        for (var key in items) {
            if (items.hasOwnProperty(key)) {      
                if(key.startsWith("_")){
                    var thisIssue = items[key];
                    var thisStatus = thisIssue.status;
                    // var imageLinks = [];
        
                    if(thisStatus != "open")
                        continue;
        
                    if("gitlab" in thisIssue && !thisIssue.modified)
                        continue;
        
                   
        
                    var title = thisIssue["title"];
                    var description = thisIssue["content"];


        
                    if("gitlab" in thisIssue && thisIssue.modified){
                        //update issue
                        $.ajax({
                            type: "PUT",
                            async: false,
                            url: "https://gitlab.com/api/v4/projects/"+projectId+"/issues/" + thisIssue.gitlab.iid,
                            // The key needs to match your method's input parameter (case-sensitive).
                            headers: {"PRIVATE-TOKEN": privateToken},
                            data: {title: title, description: description},
                            // contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function(data){
                                //add gitlab info
                                thisIssue.gitlab = data;
                                thisIssue.modified = false;
                                // console.log(thisItem);
                                // issues[thisIssue.id] = thisIssue;
                                var obj = {};
                                obj[key] = thisIssue;
                                chrome.storage.local.set(obj); 
                            },
                            failure: function(errMsg) {
                                console.log(errMsg);
                                alert(errMsg);
                            }
                        });
                    } else if(!("gitlab" in thisIssue)) {
                        //create issue
                        // var thisIssue = item[id];
                        $.ajax({
                            type: "POST",
                            async: false,
                            url: "https://gitlab.com/api/v4/projects/"+projectId+"/issues",
                            // The key needs to match your method's input parameter (case-sensitive).
                            headers: {"PRIVATE-TOKEN": privateToken},
                            data: {title: title, description: thisIssue["content"]},
                            // contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function(data){
                                //add gitlab info
                                thisIssue.gitlab = data;
                                var obj = {};
                                obj[key] = thisIssue;
                                chrome.storage.local.set(obj); 
                            },
                            failure: function(errMsg) {
                                console.log(errMsg);
                                alert(errMsg);
                            }
                        });
                    }
                }     
            }
        }
    });

    chrome.storage.local.get('issues', function (items) {
        var issues = items["issues"];
        var allKeys = Object.keys(issues);

        for(var i = 0; i< allKeys.length; i++){
            var thisIssue = issues[allKeys[i]];
            

            
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

function ID() {
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
    chrome.storage.local.get('issues', function (items) {
        var issues = items['issues'];
        var allKeys = Object.keys(issues);
        for(var i = 0; i< allKeys.length; i++){
            var thisIssue = issues[allKeys[i]];
            // var thisIssueId = thisIssue.id;
            // item[thisIssueId] = thisIssueId
            delete thisIssue["gitlab"]; 
            chrome.storage.local.set({'issues': issues}); 
        }
    });
}

function loadIssues(status){
    // status types: open, closed, all
    document.getElementById('issues').innerHTML = "";
    chrome.storage.local.get(null, function (items) {
        for (var key in items) {
            if (items.hasOwnProperty(key)) {      
                if(key.startsWith("_")){
                    var thisIssue = items[key];
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

                    // console.log(thisIssue);
                    var gitlabSpan = document.createElement('span');
                    gitlabSpan.classList.add("gitlabSpan");

                    var sectionTwo = document.createElement('span');
                    sectionTwo.classList.add('sectionTwo');
                    var sectionOne = document.createElement('span');
                    sectionOne.classList.add('sectionOne');

                    if(thisIssue.modified){
                        var needSyncIcon = document.createElement('i');
                        needSyncIcon.classList.add("sync");
                        needSyncIcon.classList.add("icon");
                        needSyncIcon.classList.add("mr-1");
                        sectionTwo.appendChild(needSyncIcon);

                    }
                    //adding gitlab icon if issue is on gitlab
                    if("gitlab" in thisIssue){

                        var gitlabIcon = document.createElement('i');
                        gitlabIcon.classList.add("gitlab");
                        gitlabIcon.classList.add("icon");


                        var issueId = document.createElement('span');
                        issueId.innerHTML = "#" + thisIssue.gitlab.iid;


                        sectionOne.appendChild(gitlabIcon);
                        sectionOne.appendChild(issueId);
                    }
                    gitlabSpan.appendChild(sectionTwo);
                    gitlabSpan.appendChild(sectionOne);


                    header.appendChild(gitlabSpan);
                    content.appendChild(header);

                    item.appendChild(content);

                    document.getElementById("issues").appendChild(item);
                }     
            }
        }
    });
}