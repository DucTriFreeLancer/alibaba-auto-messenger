<template>
	<div :key="field.name" v-bind="field.wrapper.props">
		<label :for="field.name" class="form-label">{{ field.label }}</label>
		<component :is="field.tag" :id="field.name" :disabled="disabled" :value="value" :checked="value == 1 ? true: false" v-bind="field.props" @input="onInput($event)">
			{{ value }}
		</component>
	</div>
</template>

<script>
	import {inputValue} from "@/shared/inputValue";

	export default {
		name: 'Field',
		props: {
			field: {
				type: Object,
				required: true,
			},
			value: null,
			disabled: {
				type: Boolean,
				default: false,
			}
		},
		methods: {
			onInput($event) {
				let value = inputValue(this.field, $event);

				this.$emit('input', value);
			}
		}
	}
</script>
