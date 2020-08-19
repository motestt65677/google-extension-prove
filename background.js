chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.windows.create({
        url: chrome.runtime.getURL("/view/issueList.html"),
        type: "popup",
        // width: window.innerWidth,
        // height: window.innerHeight,
        focused: true,

    });

});