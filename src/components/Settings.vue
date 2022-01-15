<template>
	<form @submit.prevent="onSubmit">
		<h4 class="mt-0">Settings</h4>
		<div class="row g-3">
			<div class="columns-wrapper">
				<div v-for="group in groups" :key="group.name" class="row g-3" v-bind="group.wrapper.props">
					<div v-for="field in group.fields" :key="field.name" v-bind="field.wrapper.props">
						<label :for="field.name" class="form-label">{{ field.label }}</label>
						<component :is="field.tag" :id="field.name" :disabled="processing" :value="value[field.name]" v-bind="field.props" @input="onInput(field, $event)">
							{{ value[field.name] }}
						</component>
					</div>
				</div>
			</div>
			<div class="col-12 d-grid">
				<button type="submit" class="btn btn-primary" :disabled="processing">Start</button>
			</div>
		</div>
	</form>
</template>

<script>
	import {characterToIndex} from "@/shared/characterToIndex";
	import {
		fields,
		fullWidthWrapper,
		NUMBER_OF_ROWS_TO_PROCESS,
		NUMBER_OF_ROWS_TO_SKIP,
		SHEET_NAME,
		SPREADSHEET_ID,
		STATUS_COLUMN_INDEX,
		URL_COLUMN_INDEX
	} from "@/shared/settings";
	import {Keys, Storage} from "@/shared/storage";
	import {toColumnName} from "@/shared/toColumnName";

	export default {
		name: "Settings",
		data: () => ({
			interval: -1,
			processing: false,
			context: 'SETTINGS',
			groups: [
				{
					name: 'left',
					wrapper: fullWidthWrapper,
					fields: fields
				},
			],
		}),
		mounted() {
			this.keepAlive();
		},
		methods: {
			keepAlive() {
				this.interval = setInterval(() => this.fetch(), 60 * 1000);
			},
			fetch() {
				const {sheetName, numberOfRowsToSkip, lastRowNumber} = this.fetchOptions;

				this.$log('Fetching the spreadsheet...');
				return this.$store.dispatch('sheets/get', {
					spreadsheetId: this.value[SPREADSHEET_ID],
					range: `'${sheetName}'!${numberOfRowsToSkip}:${lastRowNumber}`
				});
			},
			process(url) {
				return new Promise(async (resolve, reject) => {
					await Storage.set(Keys.Current, url);

					/** @type {chrome.tabs.Tab} */
					let tab = await this.$createTab(url);

					const rejectionTimeout = setTimeout(() => {
						if (tab === null) return;
						const tabId = tab.id;

						tab = null;
						chrome.tabs.remove(tabId);
						Storage.reset(Keys.Current);

						reject();
					}, 60 * 1000);


					const onRemoved = async (tabId) => {
						if (tab === null || tab.id !== tabId) return;

						tab = null;
						clearTimeout(rejectionTimeout);
						chrome.tabs.onRemoved.removeListener(onRemoved);

						resolve();
					}

					chrome.tabs.onRemoved.addListener(onRemoved)
				});
			},
			async update(range, values) {
				await this.$log(`Updating (SPREADSHEET_ID=${this.value[SPREADSHEET_ID]}`);
				await this.$store.dispatch('sheets/update', {
					range, value: {values},
					spreadsheetId: this.value[SPREADSHEET_ID],
				});
				await this.$log(`Updated (SPREADSHEET_ID=${this.value[SPREADSHEET_ID]}`);
			},
			async onSubmit() {
				if (this.processing) return;

				try {
					this.processing = true;

					const {sheetName, numberOfRowsToSkip} = this.fetchOptions;
					const response = await this.fetch();

					if (response.error) {
						this.$log(`An error occurred while fetching the spreadsheet: ${JSON.stringify(response.error)}`)
						this.$log(`Resetting the authorization token`);

						this.$store.dispatch('auth/reset');
					} else {
						const columns = {
							URL: characterToIndex(this.value[URL_COLUMN_INDEX]) - 1,
							STATUS: characterToIndex(this.value[STATUS_COLUMN_INDEX]) - 1
						};

						const {values} = response;

						this.$log(`Found ${values.length} rows.`);

						const mapped = values.map((value, index) => ({
							index,
							url: value[columns.URL] ?? '',
							status: value[columns.STATUS] ?? ''
						})).filter(item => item.url.length !== 0 && item.status.length === 0);

						if (values.length > mapped.length) {
							this.$log(`While mapping values, we've skipped ${Math.abs(values.length - mapped.length)} rows.`);
						}

						for (let {index, url} of mapped) {
							const rowIndex = index + numberOfRowsToSkip;
							const columnName = toColumnName(columns.STATUS + 1);

							try {
								await this.$log(`Processing (URL=${url})`);
								await this.process(url);
								await this.$log(`Processed. (URL=${url})`);

								await this.update(`'${sheetName}'!${columnName}${rowIndex}`, [[true]]);
							} catch (error) {
								console.trace();

								await this.$log(`An error occurred while processing the current page: ${JSON.stringify(error)}`);
								await this.update(`'${sheetName}'!${columnName}${rowIndex}`, [[false]]);
							} finally {
								await this.$wait({min: 5 * 60 * 1000, max: 10 * 60 * 1000});
							}
						}
					}
				} finally {
					this.processing = false;
				}
			},
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
			fetchOptions() {
				const sheetName = this.value[SHEET_NAME];
				const numberOfRowsToSkip = parseInt(this.value[NUMBER_OF_ROWS_TO_SKIP]) + 1;
				const numberOfRowsToProcess = parseInt(this.value[NUMBER_OF_ROWS_TO_PROCESS]) - 1;
				const lastRowNumber = numberOfRowsToSkip + numberOfRowsToProcess;

				return {sheetName, numberOfRowsToSkip, numberOfRowsToProcess, lastRowNumber};
			},
			value: {
				get() {
					return this.$store.state.settings.value;
				},
				set(value) {
					this.$store.dispatch('settings/set', value);
				}
			}
		},
		beforeDestroy() {
			clearInterval(this.interval);
			this.interval = -1;
		}
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
