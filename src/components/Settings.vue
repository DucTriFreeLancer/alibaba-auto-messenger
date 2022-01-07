<template>
	<form>
		<h4 class="mt-0">Settings</h4>
		<div class="row g-3">
			<div class="columns-wrapper">
				<div v-for="group in groups" :key="group.name" class="row g-3" v-bind="group.wrapper.props">
					<div v-for="field in group.fields" :key="field.name" v-bind="field.wrapper.props">
						<label :for="field.name" class="form-label">{{ field.label }}</label>
						<component :is="field.tag" :id="field.name" :value="value[field.name]" v-bind="field.props" @input="onInput(field, $event)"/>
					</div>
				</div>
			</div>
			<div class="col-12 d-grid">
				<button type="submit" class="btn btn-primary">Start</button>
			</div>
		</div>
	</form>
</template>

<script>
	import Picker from "@/components/File/Picker";

	const baseProps = {
		class: 'form-control',
		required: true,
	};

	const baseInputProps = {
		...baseProps,
		type: 'text'
	};

	const fullWidthWrapper = {
		props: {
			class: 'col-12',
		}
	};

	const halfWidthWrapper = {
		props: {
			class: 'col-6',
		}
	};

	let settingFields = [
		{
			name: 'googleSheetURL',
			label: 'Sheet URL',
			tag: 'input',
			props: {
				...baseInputProps,
				type: 'url',
			},
			wrapper: fullWidthWrapper
		},
		{
			name: 'sheetName',
			label: 'Sheet Name',
			tag: 'input',
			props: {
				...baseInputProps,
			},
			wrapper: fullWidthWrapper
		},
		{
			name: 'URLColumnIndex',
			label: 'URL Column Index',
			tag: 'input',
			props: {
				...baseInputProps,
				pattern: '[A-Za-z]+',
			},
			wrapper: halfWidthWrapper
		},
		{
			name: 'statusColumnIndex',
			label: 'Status Column Index',
			tag: 'input',
			props: {
				...baseInputProps,
				pattern: '[A-Za-z]+',
			},
			wrapper: halfWidthWrapper
		},
		{
			name: 'numberOfRowsToSkip',
			label: 'No. of rows to skip',
			tag: 'input',
			props: {
				...baseInputProps,
				type: 'number',
				min: 0,
			},
			wrapper: halfWidthWrapper
		},
		{
			name: 'numberOfRowsToProcess',
			label: 'No. of rows to process',
			tag: 'input',
			props: {
				...baseInputProps,
				type: 'number',
				min: 1,
			},
			wrapper: halfWidthWrapper
		},
	];

	let messageFields = [
		{
			name: 'firstMessage',
			label: 'First Message',
			tag: 'textarea',
			props: {
				...baseProps
			},
			wrapper: fullWidthWrapper
		},
		{
			name: 'file',
			label: 'File (Second Message)',
			tag: Picker,
			props: {
				required: true
			},
			wrapper: fullWidthWrapper,
			onInputCallback: (event) => event,
		},
		{
			name: 'thirdMessage',
			label: 'Third Message',
			tag: 'textarea',
			props: {
				...baseProps,
			},
			wrapper: fullWidthWrapper
		}
	];

	const fields = [...settingFields, ...messageFields];

	export default {
		name: "Settings",
		data: () => ({
			groups: [
				{
					name: 'left',
					wrapper: fullWidthWrapper,
					fields: fields
				},
			],
		}),
		methods: {
			async onInput(field, $event) {
				const {tag, name} = field;

				let value;
				if (typeof tag === 'object') {
					if ('onInputCallback' in field && typeof field.onInputCallback === 'function') {
						value = field.onInputCallback($event);
					} else {
						throw new Error('onInputCallback is not defined or is not a valid function.');
					}
				} else {
					value = $event.target.value
				}

				this.value = {
					...this.value,
					[name]: value
				}
			}
		},
		computed: {
			value: {
				get() {
					return this.$store.state.settings.value;
				},
				set(value) {
					this.$store.commit('settings/set', value);
				}
			}
		},
	}
</script>

<style lang="scss" scoped>
	.columns-wrapper {
		display: flex;
		justify-content: space-around;
		min-width: calc(100% + var(--bs-gutter-x));
		margin-left: calc(-1 * var(--bs-gutter-x) * .5);
	}
</style>
