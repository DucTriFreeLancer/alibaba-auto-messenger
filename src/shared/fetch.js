import {Keys, Storage} from "@/shared/storage";

export const fetch = async (input, init = {}) => {
	const token = await Storage.get(Keys.Token);
	const apiKey = chrome.runtime.getManifest().oauth2['api_key'];

	const url = new URL(input);
	url.searchParams.set('key', apiKey);

	const defaultParams = {
		method: 'GET',
		async: true,
		'contentType': 'json'
	};

	const defaultHeaders = {
		Authorization: 'Bearer ' + token,
		'Content-Type': 'application/json'
	};

	return window.fetch(url.toString(), {
		...defaultParams,
		...init,
		headers: {
			...(init.headers ?? {}),
			...defaultHeaders
		}
	})
}
