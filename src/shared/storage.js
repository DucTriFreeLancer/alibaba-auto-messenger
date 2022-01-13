const get = (key, defaultValue = null) => {
	const callback = (resolve) => chrome.storage.local.get((value) => resolve(key in value ? value[key] : defaultValue));
	return new Promise(callback)
}
const reset = (key) => {
	const callback = (resolve) => chrome.storage.local.remove(key, () => resolve())
	return new Promise(callback);
};
const set = (key, value) => {
	const callback = (resolve) => chrome.storage.local.set({[key]: value}, () => resolve())
	return new Promise(callback);
};

export const Keys = {
	Logs: 'extension.logs',
	Settings: 'extension.settings',
	Token: 'extension.auth.token',
	Current: 'extension.current.url',
}

export const Storage = {
	set,
	get,
	reset
}
