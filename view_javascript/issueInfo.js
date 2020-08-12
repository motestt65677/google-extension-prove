window.addEventListener("load", function(){
    chrome.storage.local.get({issues: []}, function (result) {
        // the input argument is ALWAYS an object containing the queried keys
        // so we select the key we need
        var issues = result.issues;
        for(var i = 0; i < issues.length; i++){
            var thisIssue = issues[i];
            var item = document.createElement('div');
            item.id = thisIssue.id;
            item.onclick=toInfoPage;
            var content = document.createElement('div');
            var header = document.createElement('div');
            item.classList.add('item');
            content.classList.add('content');
            header.classList.add('header');

            header.innerHTML = thisIssue.title;
            content.appendChild(header);
            item.appendChild(content)
            document.getElementById("issues").appendChild(item);
        }
    });
});