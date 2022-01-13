<template>
	<div class="container-fluid">
		<popup v-if="ready && authorized"/>
		<div class="row" v-else>
			<div class="col">
				Please wait...
			</div>
		</div>
	</div>
</template>

<script>
	import Popup from "@/components/Popup";

	export default {
		name: 'App',
		data: () => ({
			ready: false
		}),
		components: {Popup},
		mounted() {
			Promise.all(['auth', 'log', 'settings'].map(name => this.$store.dispatch(`${name}/setup`))).finally(() => {
				chrome.identity.getAuthToken({interactive: true}, async (token) => {
					await this.authorize(token);
					console.log('hello!')
					this.ready = true
				});
			})
		},
		methods: {
			authorize(token) {
				return this.$store.dispatch('auth/set', token);
			}
		},
		computed: {
			authorized() {
				return this.$store.getters['auth/authorized'];
			}
		},
		watch: {
			authorized: {
				immediate: true,
				handler(value) {
					let html = document.querySelector('html');

					html.classList.add(value ? 'authorized' : 'not-authorized');
					html.classList.remove(value ? 'not-authorized' : 'authorized');
				}
			}
		}
	}
</script>

<style lang="scss">
	@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css");
</style>
