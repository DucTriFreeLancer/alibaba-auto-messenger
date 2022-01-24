<template>
	<div class="repeater">
		<template v-for="index in count">
			<Field :key="index - 1" :field="field" :disabled="disabled" :value="valueOf(index - 1)" @input="onInput(index - 1, $event)"/>
		</template>
		<Field :field="{...field, props: {...field.props, required: false, resetOnInput: true}}" :disabled="disabled" @input="onInput(count, $event)"/>
	</div>
</template>

<script>
	import {cloneDeep} from "lodash";
	import Field from "@/components/Field";
	import {inputValue} from "@/shared/inputValue";

	export default {
		name: 'Repeater',
		components: {Field},
		props: {
			value: null,
			field: {
				type: Object,
				required: true,
			},
			disabled: {
				type: Boolean,
				default: false,
			}
		},
		methods: {
			onInput(index, $event) {
				let value = inputValue(this.field, $event);
				let clonedValue = cloneDeep(this.value);

				if (clonedValue) {
					if (value === null) clonedValue.splice(index, 1);
					else clonedValue[index] = value;
				} else clonedValue = [value];

				this.$emit('input', clonedValue);
			},
			valueOf(index) {
				return this.value ? this.value[index] : undefined;
			}
		},
		computed: {
			count() {
				return this.value ? this.value.length : 0;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.repeater {
		div:not(:first-child) {
			margin-top: 8px;
		}
	}
</style>
