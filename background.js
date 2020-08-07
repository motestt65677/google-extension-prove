chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.windows.create({
        url: chrome.runtime.getURL("mypage.html"),
        type: "popup",
        width: 1400,
        height: 900,
        focused: true,

    });

});