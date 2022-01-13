import {randomValue, wait} from "@/shared/wait";
import {Keys, Storage} from "@/shared/storage";
import {FIRST_MESSAGE, SECOND_MESSAGE, THIRD_MESSAGE} from "@/shared/settings";

const waitFor = (callback) => new Promise(resolve => {
	let interval = setInterval(() => {
		if (callback() === true) {
			resolve();
			clearInterval(interval);
		}
	}, 100);
});

const open = () => {
	// enable chat
	document.querySelector('.action-alitalk .atm-wrapper').click();
};


/**
 * @param options {{name: string, type: string, value: string}}
 * @return {Promise<File>}
 */
const createFile = async (options) => {
	const {name, type, value} = options;

	const decodedValue = value.split(';base64,')[1];
	const uInt8Array = new Uint8Array(decodedValue.length);

	for (let i = 0; i < decodedValue.length; ++i) {
		uInt8Array[i] = decodedValue.charCodeAt(i);
	}

	return new File([uInt8Array], name, {type});
};

const MESSAGE_TYPE_TEXT = 'TEXT';
const MESSAGE_TYPE_FILE = 'FILE';

const process = async () => {
	const prefix = "#icbu-weblite-chat .icbu-im-im-weblite-chat .message-box";

	await waitFor(() => document.querySelector(prefix) !== null);

	/**
	 * @param text {string}
	 * @return {Promise<void>}
	 */
	const sendMessage = async (text) => {
		await waitFor(() => document.querySelector(`${prefix} .send-textarea`) !== null);

		document.querySelector(`${prefix} .send-textarea`).value = text;
		document.querySelector(`${prefix} .im-next-btn`).click();
	}

	/**
	 * @param value {File}
	 */
	const sendFile = (value) => {
		/** @type {HTMLInputElement} */
		const input = document.querySelector('input[type=file][name=file]');

		let container = new DataTransfer();
		container.items.add(value);

		input.files = container.files;
		input.dispatchEvent(new Event('change', {bubbles: true}))
	}

	const settings = await Storage.get(Keys.Settings);

	const messages = [
		{type: MESSAGE_TYPE_TEXT, value: settings[FIRST_MESSAGE]},
		{type: MESSAGE_TYPE_FILE, value: await createFile(settings[SECOND_MESSAGE])},
		{type: MESSAGE_TYPE_TEXT, value: settings[THIRD_MESSAGE]}
	];

	for (let message of messages) {
		switch (message.type) {
			case MESSAGE_TYPE_TEXT:
				if (typeof message.value === 'string' && message.value.trim().length > 0)
					await sendMessage(message.value);
				break;
			case MESSAGE_TYPE_FILE:
				sendFile(message.value);
				break;
		}

		const timeout = randomValue({min: 15 * 1000, max: 20 * 1000});
		await wait(timeout);
	}

	chrome.runtime.sendMessage({text: 'close'});
}

const init = async () => {
	await waitFor(() => document.readyState === 'complete');

	const currentURL = new URL(document.location.href);
	const shouldProcessURL = await Storage.get(Keys.Current);
	const url = new URL((window.location !== window.parent.location) ? document.referrer : document.location.href);

	if (typeof shouldProcessURL !== "string") return;

	let value = new URL(shouldProcessURL);
	if (value.hostname === url.hostname && value.pathname === url.pathname) {
		switch (currentURL.hostname) {
			case 'onetalk.alibaba.com':
				process();
				break;
			default:
				open();
				break;
		}
	}
}

init();
