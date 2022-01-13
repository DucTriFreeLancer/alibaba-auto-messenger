<template>
	<form @submit.prevent="onSubmit">
		<h4 class="mt-0">Settings</h4>
		<div class="row g-3">
			<div class="columns-wrapper">
				<div v-for="group in groups" :key="group.name" class="row g-3" v-bind="group.wrapper.props">
					<div v-for="field in group.fields" :key="field.name" v-bind="field.wrapper.props">
						<label :for="field.name" class="form-label">{{ field.label }}</label>
						<component :is="field.tag" :id="field.name" :value="value[field.name]" v-bind="field.props" @input="onInput(field, $event)">
							{{ value[field.name] }}
						</component>
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
	import {randomWait} from "@/shared/wait";
	import {toColumnName} from "@/shared/toColumnName";

	export default {
		name: "Settings",
		data: () => ({
			context: 'SETTINGS',
			groups: [
				{
					name: 'left',
					wrapper: fullWidthWrapper,
					fields: fields
				},
			],
		}),
		methods: {
			process(url) {
				return new Promise(async (resolve) => {
					await Storage.set(Keys.Current, url);

					/** @type {chrome.tabs.Tab} */
					const tab = await this.$createTab(url);
					const onRemoved = async (tabId) => {
						if (tab.id !== tabId) return;

						await Storage.reset(Keys.Current);
						await randomWait();

						chrome.tabs.onRemoved.removeListener(onRemoved);

						resolve();
					}

					chrome.tabs.onRemoved.addListener(onRemoved)
				});
			},
			async onSubmit() {
				const sheetName = this.value[SHEET_NAME];

				const numberOfRowsToSkip = parseInt(this.value[NUMBER_OF_ROWS_TO_SKIP]) + 1;
				const numberOfRowsToProcess = parseInt(this.value[NUMBER_OF_ROWS_TO_PROCESS]) - 1;

				const lastRowNumber = numberOfRowsToSkip + numberOfRowsToProcess;

				this.$log('Fetching the spreadsheet...');
				const response = await this.$store.dispatch('sheets/get', {
					spreadsheetId: this.value[SPREADSHEET_ID],
					range: `'${sheetName}'!${numberOfRowsToSkip}:${lastRowNumber}`
				});

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
						try {
							await this.$log(`Processing (URL=${url})`);
							await this.process(url);
						} catch (error) {
							await this.$log(`An error occurred while processing the current page: ${JSON.stringify(error)}`);
							console.trace();
						} finally {
							await this.$log(`Processed. (URL=${url})`);

							await this.$log(`Updating (SPREADSHEET_ID=${this.value[SPREADSHEET_ID]}`);
							const rowIndex = index + numberOfRowsToSkip;
							const columnName = toColumnName(columns.STATUS + 1);

							await this.$store.dispatch('sheets/update', {
								spreadsheetId: this.value[SPREADSHEET_ID],
								range: `'${sheetName}'!${columnName}${rowIndex}`,
								value: {
									values: [
										[true]
									]
								}
							});
							await this.$log(`Updated (SPREADSHEET_ID=${this.value[SPREADSHEET_ID]}`);
						}
					}
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
			value: {
				get() {
					return this.$store.state.settings.value;
				},
				set(value) {
					this.$store.dispatch('settings/set', value);
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
