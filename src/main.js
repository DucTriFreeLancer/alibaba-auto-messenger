import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import {randomValue, wait} from "@/shared/wait";

Vue.config.productionTip = false;
Vue.config.devtools = true;
/**
 * @param message {string}
 * @return {Promise<any>}
 */
Vue.prototype.$log = function (message) {
	return this.$store.dispatch('log/push', {
		context: this.context ?? 'NA',
		message
	})
}

/**
 * @param url {string}
 * @return {Promise<chrome.tabs.Tab>}
 */
Vue.prototype.$createTab = async function (url) {
	await this.$log(`Creating a tab. (URL=${url})`)
	return new Promise(resolve => {
		chrome.tabs.create({url}, (value) => resolve(value))
	});
}

Vue.prototype.$wait = async function (delay = {min: 1000, max: 3000}) {
	const timeout = randomValue(delay);

	await this.$log(`Waiting for ${timeout}ms...`);
	await wait(timeout);
}

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount('#app');
