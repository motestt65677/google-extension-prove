chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.windows.create({
        url: chrome.runtime.getURL("/view/issueList.html"),
        type: "popup",
        width: 1400,
        height: 900,
        focused: true,

    });

});