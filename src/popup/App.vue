<template>
	<div class="container-fluid">
		<popup/>
	</div>
</template>

<script>
	import Popup from '@/components/Popup.vue';

	export default {
		name: 'App',
		components: {Popup},
	};
</script>

<style>
	@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css");

	html {
		width: 800px;
		/*height: 400px;*/
	}
</style>

<style lang="scss" scoped>
	.container-fluid {
		height: 100%;
		overflow-y: auto;
	}
</style>
