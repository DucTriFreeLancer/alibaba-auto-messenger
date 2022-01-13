import {Keys, Storage} from "@/shared/storage";

chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.create({url: 'index.html'});
});

chrome.runtime.onMessage.addListener(function (msg, sender) {
	if (msg.text === 'close')
		Storage.reset(Keys.Current).finally(() => {
			const NOOP = () => {
			};
			return chrome.tabs.remove(sender.tab.id, NOOP);
		});
});
