import {Storage, Keys} from "@/shared/storage";

export default {
	namespaced: true,
	state: {
		value: [],
	},
	mutations: {
		set(state, value) {
			state.value = value;
		},
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
		},
		reset(state) {
			state.value = [];
		}
	},
	actions: {
		async setup({commit}) {
			const value = await Storage.get(Keys.Logs, [])
			commit('set', value);
		},
		push({state, commit}, {message, context}) {
			commit('push', {message, context});
			return Storage.set(Keys.Logs, state.value);
		},
		reset({commit}) {
			commit('reset')
			return Storage.reset(Keys.Logs);
		}
	}
}
