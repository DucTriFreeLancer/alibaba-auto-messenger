const STORAGE_KEY = 'extension.settings';
const DEFAULT_VALUE = localStorage.getItem(STORAGE_KEY);

export default {
	namespaced: true,
	state: {
		value: DEFAULT_VALUE ? JSON.parse(DEFAULT_VALUE) : [],
	},
	mutations: {
		set(state, value) {
			state.value = value;
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
		}
	}
}
