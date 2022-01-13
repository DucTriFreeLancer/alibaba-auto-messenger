import Vue from 'vue';
import Vuex from 'vuex';

import log from "@/store/log";
import auth from "@/store/auth";
import sheets from "@/store/sheets";
import settings from "@/store/settings";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		log,
		auth,
		sheets,
		settings,
	},
});
