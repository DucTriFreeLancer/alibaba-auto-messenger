import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';

import App from './App.vue';
import store from "@/popup/store";

VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);

/* eslint-disable no-new */
new Vue({
	el: '#app',
	store,
	render: (h) => h(App),
});
