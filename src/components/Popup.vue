<template>
	<div class="container-fluid">
		<div class="row g-3">
			<div class="col">
				<Logs class="pt-3 pb-3"/>
			</div>
			<div class="col">
				<Settings class="pt-3 pb-3"/>
			</div>
		</div>
	</div>
</template>

<script>
	import Logs from "@/components/Logs";
	import Settings from "@/components/Settings";

	export default {
		name: 'Popup',
		components: {Settings, Logs}
	};
</script>

<style lang="scss" scoped>
</style>
