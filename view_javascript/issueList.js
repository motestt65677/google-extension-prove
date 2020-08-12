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
    chrome.storage.local.get(null, function (items) {
        // the input argument is ALWAYS an object containing the queried keys
        // so we select the key we need
        var allKeys = Object.keys(items);

        for(var i = 0; i< allKeys.length; i++){
            var thisIssue = items[allKeys[i]];
            console.log(items);
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
    
function toInfoPage(){
    window.location.href = "/view/issueInfo.html?id=" + this.id;
}