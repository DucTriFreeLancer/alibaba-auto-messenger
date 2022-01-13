import {Keys, Storage} from "@/shared/storage";

export default {
	namespaced: true,
	state: {
		token: null
	},
	mutations: {
		set(state, value) {
			state.token = value;
		},
		reset(state) {
			state.token = null;
		}
	},
	actions: {
		async setup({commit}) {
			const value = await Storage.get(Keys.Token, null);
			commit('set', value);
		},
		set({commit}, value) {
			commit('set', value);
			return Storage.set(Keys.Token, value);
		},
		reset({commit}) {
			commit('reset');
			return Storage.reset(Keys.Token);
		}
	},
	getters: {
		authorized(state) {
			return state.token;
		}
	}
}
