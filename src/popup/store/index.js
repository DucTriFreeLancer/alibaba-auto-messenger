import Vue from 'vue';
import Vuex from 'vuex';

import log from "@/popup/store/log";
import settings from "@/popup/store/settings";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		log,
		settings
	},
});
