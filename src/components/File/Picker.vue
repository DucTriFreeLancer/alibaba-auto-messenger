<template>
	<div class="file-picker">
		<div v-if="hasValue" class="alert alert-primary alert-dismissible" role="alert">
			<span>{{ label }}</span>
			<button :disabled="disabled" class="btn-close" type="button" @click="reset"></button>
		</div>
		<input v-else :disabled="disabled" class="form-control" type="file" v-bind="$attrs" @input="onInput"/>
	</div>
</template>

<script>
	const getBase64 = async file => new Promise((resolve, reject) => {
		let reader = new FileReader();

		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result)
		reader.onerror = error => reject(error)
	});

	const truncate = (n, len) => {
		let ext = n.substring(n.lastIndexOf(".") + 1, n.length).toLowerCase();
		let filename = n.replace('.' + ext, '');

		if (filename.length <= len) {
			return n;
		}

		filename = filename.substr(0, len) + (n.length > len ? '[...]' : '');
		return filename + '.' + ext;
	};

	export default {
		name: "Picker",
		props: {
			value: {
				type: Object,
				default: () => ({})
			},
			disabled: {
				type: Boolean,
				default: false,
			}
		},
		methods: {
			reset() {
				if (this.disabled) return;
				this.$emit('input', null)
			},
			async onInput($event) {
				const {target: {files}} = $event;
				if (files.length <= 0) return;

				const file = files.item(0);
				const {name, type, size} = file;

				this.$emit('input', {
					name, type, size,
					value: await getBase64(file)
				});
			}
		},
		computed: {
			label() {
				if (!this.hasValue) return null;

				const filename = this.value.name;
				return `${truncate(filename, 8)} (${this.value.size} bytes)`;
			},
			hasValue() {
				return typeof this.value !== 'undefined' && this.value !== null && 'name' in this.value;
			}
		}
	}
</script>
