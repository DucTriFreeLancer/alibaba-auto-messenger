import {Storage, Keys} from "@/shared/storage";

export default {
	namespaced: true,
	state: {
		value: {},
	},
	mutations: {
		set(state, value) {
			state.value = value;
		}
	},
	actions: {
		async setup({commit}) {
			const value = await Storage.get(Keys.Settings, {});
			commit('set', value);
		},
		set({state, commit}, value) {
			commit('set', value);
			return Storage.set(Keys.Settings, state.value)
		}
	}
}
