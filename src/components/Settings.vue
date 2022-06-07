<template>
	<form @submit.prevent="onSubmit">
		<h4 class="mt-0">Settings</h4>
		<div class="row g-3">
			<div class="columns-wrapper">
				<div class="row g-3 col-12">
					<Field v-for="field in fields" :key="field.name" :disabled="processing" :field="field" :value="value[field.name]" @input="onInput(field, $event)"/>
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
		FILES,
		FIRST_MESSAGE,
		NUMBER_OF_ROWS_TO_PROCESS,
		NUMBER_OF_ROWS_TO_SKIP,
		MINIMUM_DELAY_TIME_PER_JOB,
		MAXIMUM_DELAY_TIME_PER_JOB,
		MINIMUM_DELAY_TIME_PER_MESSAGE,
		MAXIMUM_DELAY_TIME_PER_MESSAGE,
		SHEET_NAME,
		SPREADSHEET_ID,
		STATUS_COLUMN_INDEX,
		THIRD_MESSAGE,
		URL_COLUMN_INDEX
	} from "@/shared/settings";
	import {Keys, Storage} from "@/shared/storage";
	import {toColumnName} from "@/shared/toColumnName";
	import Field from "@/components/Field";

	export default {
		name: "Settings",
		components: {Field},
		data: () => ({
			interval: -1,
			processing: false,
			context: 'SETTINGS',
			fields,
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
				if (!sheetName || !numberOfRowsToSkip || !lastRowNumber) return;

				return this.$store.dispatch('sheets/get', {
					spreadsheetId: this.value[SPREADSHEET_ID],
					range: `'${sheetName}'!${numberOfRowsToSkip}:${lastRowNumber}`
				});
			},
			numberOfMessages() {
				let numberOfMessages = 0;

				if (this.value[FIRST_MESSAGE] && this.value[FIRST_MESSAGE].trim().length > 0)
					numberOfMessages += 1;

				if (this.value[FILES] && this.value[FILES].length)
					numberOfMessages += this.value[FILES].length;

				if (this.value[THIRD_MESSAGE] && this.value[THIRD_MESSAGE].trim().length > 0)
					numberOfMessages += 1;

				return numberOfMessages;
			},
			process(url,companyname) {
				return new Promise(async (resolve, reject) => {
					const {maximumOfWaitTimePerMessage} = this.fetchOptions;
					await Storage.set(Keys.Current, url);
					await Storage.set(Keys.CurrentCompany, companyname);
					/** @type {chrome.tabs.Tab} */
					let tab = await this.$createTab(url);

					const rejectionTimeout = setTimeout(() => {
						if (tab === null) return;
						const tabId = tab.id;

						tab = null;
						chrome.tabs.remove(tabId);
						Storage.reset(Keys.Current);
						Storage.reset(Keys.CurrentCompany);
						reject();
					}, (maximumOfWaitTimePerMessage * 1000 + 5 * 1000) * this.numberOfMessages() + (60 * 1000));


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

					const {sheetName, numberOfRowsToSkip,minimumOfWaitTimePerJob,maximumOfWaitTimePerJob} = this.fetchOptions;
					const response = await this.fetch();

					if (response.error) {
						this.$log(`An error occurred while fetching the spreadsheet: ${JSON.stringify(response.error)}`)
						this.$log(`Resetting the authorization token`);

						this.$store.dispatch('auth/reset');
						if(response.error.code=="401"){
              chrome.identity.getAuthToken({interactive: true}, async (token) => {
                this.$log(`Renew the authorization token!`);
                this.$store.dispatch('auth/set', token);
              });
						}
					} else {
						const columns = {
							URL: characterToIndex(this.value[URL_COLUMN_INDEX]) - 1,
							STATUS: characterToIndex(this.value[STATUS_COLUMN_INDEX]) - 1
						};

						const {values} = response;

						this.$log(`Found ${values.length} rows.`);

						const mapped = values.map((value, index) => ({
							index,
							companyname: value[columns.URL-1]??'',
							url: value[columns.URL] ?? '',
							status: value[columns.STATUS] ?? ''
						})).filter(item => item.url.length !== 0 && item.status.length === 0);

						if (values.length > mapped.length) {
							this.$log(`While mapping values, we've skipped ${Math.abs(values.length - mapped.length)} rows.`);
						}

						for (let {index,companyname,url} of mapped) {
							const rowIndex = index + numberOfRowsToSkip;
							const columnName = toColumnName(columns.STATUS + 1);

							try {
								await this.$log(`Processing (URL=${url},Company=${companyname})`);
								await this.process(url,companyname);
								await this.$log(`Processed. (URL=${url},Company=${companyname})`);

								await this.update(`'${sheetName}'!${columnName}${rowIndex}`, [[true]]);
							} catch (error) {
								console.log(error);
								if(response.error.code=="401"){
									chrome.identity.getAuthToken({interactive: true}, async (token) => {
										this.$log(`Renew the authorization token!`);
										this.$store.dispatch('auth/set', token);
									});
								}
								await this.$log(`An error occurred while processing the current page: ${JSON.stringify(error)}`);
								await this.update(`'${sheetName}'!${columnName}${rowIndex}`, [[false]]);
							} finally {
								await this.$wait({min: minimumOfWaitTimePerJob * 60 * 1000, max: maximumOfWaitTimePerJob * 60 * 1000});
							}
						}
					}
				} finally {
					this.processing = false;
				}
			},
			async onInput(field, $event) {
				console.log({field, $event});
				const {name} = field;

				this.value = {
					...this.value,
					[name]: $event
				}
			}
		},
		computed: {
			fetchOptions() {
				const sheetName = this.value[SHEET_NAME];
				const numberOfRowsToSkip = parseInt(this.value[NUMBER_OF_ROWS_TO_SKIP]) + 1;
				const numberOfRowsToProcess = parseInt(this.value[NUMBER_OF_ROWS_TO_PROCESS]) - 1;
				const minimumOfWaitTimePerJob = parseInt(this.value[MINIMUM_DELAY_TIME_PER_JOB]);
				const maximumOfWaitTimePerJob = parseInt(this.value[MAXIMUM_DELAY_TIME_PER_JOB]);
				const minimumOfWaitTimePerMessage = parseInt(this.value[MINIMUM_DELAY_TIME_PER_MESSAGE]);
				const maximumOfWaitTimePerMessage = parseInt(this.value[MAXIMUM_DELAY_TIME_PER_MESSAGE]);
				const lastRowNumber = numberOfRowsToSkip + numberOfRowsToProcess;

				return {sheetName, numberOfRowsToSkip, numberOfRowsToProcess, minimumOfWaitTimePerJob,maximumOfWaitTimePerJob,minimumOfWaitTimePerMessage, maximumOfWaitTimePerMessage, lastRowNumber};
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
