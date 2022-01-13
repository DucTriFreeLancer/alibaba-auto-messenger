<template>
	<div class="wrapper">
		<h4 class="mt-0">Logs</h4>
		<div class="row g-3">
			<div class="log-output col-12">
				<label class="form-label">Log Output</label>
				<textarea id="logOutput" :value="value" class="form-control" disabled></textarea>
			</div>
			<div class="action-buttons col-12 d-grid gap-2">
				<button class="btn btn-secondary" type="button" @click="onCopy">{{ text }}</button>
				<button class="btn btn-danger" type="button" @click="onReset">Reset</button>
			</div>
		</div>
	</div>
</template>

<script>
	const COPY_TO_CLIPBOARD = 'Copy to clipboard';
	const COPIED = 'Copied!';

	export default {
		name: "Logs",
		data: () => ({
			timeout: -1,
			text: COPY_TO_CLIPBOARD,
		}),
		methods: {
			onCopy() {
				if (this.timeout !== -1) clearTimeout(this.timeout);

				this.text = COPIED;
				this.timeout = setTimeout(() => this.text = COPY_TO_CLIPBOARD, 1500);

				this.$copyText(this.value);
			},
			onReset() {
				return this.$store.dispatch('log/reset');
			}
		},
		computed: {
			value() {
				let {value} = this.$store.state.log;

				return value.map(({date, context, message}) => `[${date}] ${context}: ${message}`).join('\n');
			}
		}
	}
</script>

<style scoped lang="scss">
	@mixin flexColumn {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.wrapper {
		height: 100%;
		@include flexColumn;

		> .row {
			@include flexColumn;

			.log-output {
				@include flexColumn;

				textarea {
					flex: 1;
				}
			}

			.action-buttons {
				height: min-content;
			}
		}
	}
</style>
