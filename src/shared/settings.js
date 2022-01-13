import Picker from "@/components/File/Picker";

export const SPREADSHEET_ID = 'spreadsheetId';
export const SHEET_NAME = 'sheetName';
export const NUMBER_OF_ROWS_TO_SKIP = 'numberOfRowsToSkip';
export const NUMBER_OF_ROWS_TO_PROCESS = 'numberOfRowsToProcess';
export const URL_COLUMN_INDEX = 'URLColumnIndex';
export const STATUS_COLUMN_INDEX = 'statusColumnIndex';

export const FIRST_MESSAGE = 'firstMessage';
export const SECOND_MESSAGE = 'file';
export const THIRD_MESSAGE = 'thirdMessage';

export const baseProps = {
	class: 'form-control',
	required: true,
};

export const baseInputProps = {
	...baseProps,
	type: 'text'
};

export const fullWidthWrapper = {
	props: {
		class: 'col-12',
	}
};

export const halfWidthWrapper = {
	props: {
		class: 'col-6',
	}
};

let settingFields = [
	{
		name: SPREADSHEET_ID,
		label: 'Spreadsheet ID',
		tag: 'input',
		props: {
			...baseInputProps,
		},
		wrapper: fullWidthWrapper
	},
	{
		name: SHEET_NAME,
		label: 'Sheet Name',
		tag: 'input',
		props: {
			...baseInputProps,
		},
		wrapper: fullWidthWrapper
	},
	{
		name: URL_COLUMN_INDEX,
		label: 'URL Column Index',
		tag: 'input',
		props: {
			...baseInputProps,
			pattern: '[A-Za-z]+',
		},
		wrapper: halfWidthWrapper
	},
	{
		name: STATUS_COLUMN_INDEX,
		label: 'Status Column Index',
		tag: 'input',
		props: {
			...baseInputProps,
			pattern: '[A-Za-z]+',
		},
		wrapper: halfWidthWrapper
	},
	{
		name: NUMBER_OF_ROWS_TO_SKIP,
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
		name: NUMBER_OF_ROWS_TO_PROCESS,
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
		name: FIRST_MESSAGE,
		label: 'First Message',
		tag: 'textarea',
		props: {
			...baseProps
		},
		wrapper: fullWidthWrapper
	},
	{
		name: SECOND_MESSAGE,
		label: 'File (Second Message)',
		tag: Picker,
		props: {
			required: true
		},
		wrapper: fullWidthWrapper,
		onInputCallback: (event) => event,
	},
	{
		name: THIRD_MESSAGE,
		label: 'Third Message',
		tag: 'textarea',
		props: {
			...baseProps,
		},
		wrapper: fullWidthWrapper
	}
];

export const fields = [...settingFields, ...messageFields];
