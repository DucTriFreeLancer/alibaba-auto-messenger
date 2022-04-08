import Repeater from '@/components/Repeater';
import Picker from "@/components/File/Picker";

export const SPREADSHEET_ID = 'spreadsheetId';
export const SHEET_NAME = 'sheetName';
export const NUMBER_OF_ROWS_TO_SKIP = 'numberOfRowsToSkip';
export const NUMBER_OF_ROWS_TO_PROCESS = 'numberOfRowsToProcess';
export const MINIMUM_DELAY_TIME_PER_JOB = 'minimumOfWaitTimePerJob';
export const MAXIMUM_DELAY_TIME_PER_JOB = 'maximumOfWaitTimePerJob';
export const MINIMUM_DELAY_TIME_PER_MESSAGE = 'minimumOfWaitTimePerMessage';
export const MAXIMUM_DELAY_TIME_PER_MESSAGE = 'maximumOfWaitTimePerMessage';
export const URL_COLUMN_INDEX = 'URLColumnIndex';
export const STATUS_COLUMN_INDEX = 'statusColumnIndex';
export const RANDOM_FILE_MESSAGE = "randomFileMessage"

export const FILES = 'files';

export const FIRST_MESSAGE = 'firstMessage';
export const SECOND_MESSAGE = 'file';
export const FILE_MESSAGE = 'file';
export const THIRD_MESSAGE = 'thirdMessage';

export const IMAGE_TYPE = ["jpeg", "jpg", "png", "gif"];
export const EXCEL_TYPE = ["xls", "xlsx"];

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
	{
		name: MINIMUM_DELAY_TIME_PER_JOB,
		label: 'Minimum wait time per job',
		tag: 'input',
		props: {
			...baseInputProps,
			type: 'number',
			min: 1,
		},
		wrapper: halfWidthWrapper
	},
	{
		name: MAXIMUM_DELAY_TIME_PER_JOB,
		label: 'Maximum wait time per job',
		tag: 'input',
		props: {
			...baseInputProps,
			type: 'number',
			min: 3,
		},
		wrapper: halfWidthWrapper
	},
	{
		name: MINIMUM_DELAY_TIME_PER_MESSAGE,
		label: 'Minimum wait time per message',
		tag: 'input',
		props: {
			...baseInputProps,
			type: 'number',
			min: 5,
		},
		wrapper: halfWidthWrapper
	},
	{
		name: MAXIMUM_DELAY_TIME_PER_MESSAGE,
		label: 'Maximum wait time per message',
		tag: 'input',
		props: {
			...baseInputProps,
			type: 'number',
			min: 10,
		},
		wrapper: halfWidthWrapper
	},
  {
		name: RANDOM_FILE_MESSAGE,
		label: 'Randomly send only one file of each type',
		tag: 'input',
		props: {
			...baseInputProps,
      type:'checkbox',
      class:'form-check-input ms-1',
      required: false,
      value: 1,
		},
		wrapper: fullWidthWrapper
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
		name: FILES,
		label: 'Messages',
		tag: Repeater,
		onInputCallback: (event) => event,
		props: {
			...baseProps,
			class: '',
			field: {
				name: FILE_MESSAGE,
				label: 'File',
				tag: Picker,
				props: {
					required: true
				},
				wrapper: fullWidthWrapper,
				onInputCallback: (event) => event,
			},
		},
		wrapper: fullWidthWrapper
	},
	{
		name: THIRD_MESSAGE,
		label: 'Third Message',
		tag: 'textarea',
		props: {
			...baseProps,
			required: false
		},
		wrapper: fullWidthWrapper
	}
];

export const fields = [...settingFields, ...messageFields];
