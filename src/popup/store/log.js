const STORAGE_KEY = 'extension.logs';
const DEFAULT_VALUE = localStorage.getItem(STORAGE_KEY);

export default {
	namespaced: true,
	state: {
		value: DEFAULT_VALUE ? JSON.parse(DEFAULT_VALUE) : [],
	},
	mutations: {
		push(state, {message, context}) {
			let date = new Date();

			state.value = [
				...state.value,
				{
					date: date.toISOString(),
					message,
					context
				}
			];

			localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
		},
		reset(state) {
			state.value = [];
			localStorage.removeItem(STORAGE_KEY);
		}
	}
}
