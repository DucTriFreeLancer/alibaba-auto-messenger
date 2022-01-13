import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

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

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount('#app');
