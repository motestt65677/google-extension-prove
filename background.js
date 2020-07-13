chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.windows.create({
        url: chrome.runtime.getURL("mypage.html"),
        type: "popup",
        width: 500,
        height: 500,
        focused: true,

    });

});