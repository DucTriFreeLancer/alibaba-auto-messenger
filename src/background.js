chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.create({url: 'index.html'});
});

chrome.runtime.onMessage.addListener(function (msg, sender) {
	if (msg.text === 'close') chrome.tabs.remove(sender.tab.id, () => {
	});
});
