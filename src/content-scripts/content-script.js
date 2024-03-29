import {randomValue, wait} from "@/shared/wait";
import {Keys, Storage} from "@/shared/storage";
import {FILES, FIRST_MESSAGE, THIRD_MESSAGE,MINIMUM_DELAY_TIME_PER_MESSAGE,MAXIMUM_DELAY_TIME_PER_MESSAGE,RANDOM_FILE_MESSAGE} from "@/shared/settings";
import {IMAGE_TYPE, EXCEL_TYPE, PDF_TYPE,COMPANY_NAME_COLUMN_INDEX,COMPANY_URL_COLUMN_INDEX} from "@/shared/settings";
import ExcelJS from "exceljs";
import Spinner from "node-spintax/Spinner";
const waitFor = (callback) => new Promise(resolve => {
	let interval = setInterval(() => {
		if (callback() === true) {
			resolve();
			clearInterval(interval);
		}
	}, 100);
});

const open = () => {
	// enable chat
	document.querySelector('.action-alitalk .atm-wrapper').click();
};

const base64toBlobOrFile = async (base64Data, {contentType, fileName}) => {
	contentType = contentType || '';
	fileName = fileName || '';
  if(fileName){
    let ext = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length).toLowerCase();
    if(EXCEL_TYPE.indexOf(ext) != -1){
      const bufferBefore = new Buffer(base64Data,"base64");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(bufferBefore);
      const worksheet = workbook.getWorksheet(1)
	    const settings = await Storage.get(Keys.Settings);
      worksheet.getCell(settings[COMPANY_NAME_COLUMN_INDEX]).value = await Storage.get(Keys.CurrentCompany)??'';
      worksheet.getCell(settings[COMPANY_URL_COLUMN_INDEX]).value = await Storage.get(Keys.Current)??'';
      const bufferAfter = await workbook.xlsx.writeBuffer();
      base64Data = bufferAfter.toString('base64');
    }
  }
	let sliceSize = 1024;
	let byteCharacters = atob(base64Data);
	let bytesLength = byteCharacters.length;
	let slicesCount = Math.ceil(bytesLength / sliceSize);
	let byteArrays = new Array(slicesCount);

	for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
		let begin = sliceIndex * sliceSize;
		let end = Math.min(begin + sliceSize, bytesLength);

		let bytes = new Array(end - begin);
		for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
			bytes[i] = byteCharacters[offset].charCodeAt(0);
		}
		byteArrays[sliceIndex] = new Uint8Array(bytes);
	}

	if (fileName)
		return new File(byteArrays, fileName, {type: contentType});

	return new Blob(byteArrays, {type: contentType});
};

/**
 * @param options {{name: string, type: string, value: string}}
 * @return {Promise<File>}
 */
const createFile = async (options) => {
	const {name, type, value} = options;
	const decodedValue = value.split(';base64,')[1];

	return await base64toBlobOrFile(decodedValue, {contentType: type, fileName: name});
};

const MESSAGE_TYPE_TEXT = 'TEXT';
const MESSAGE_TYPE_FILE = 'FILE';

const process = async () => {
	const prefix = "#icbu-weblite-chat .icbu-im-im-weblite-chat .message-box";

	await waitFor(() => document.querySelector(prefix) !== null);

	/**
	 * @param text {string}
	 * @return {Promise<void>}
	 */
	const sendMessage = async (text) => {
		await waitFor(() => document.querySelector(`${prefix} .send-textarea`) !== null);
		await waitFor(() => document.querySelector(`${prefix} .contact-name`) !== null);
		const processCurrentCompany = await Storage.get(Keys.CurrentCompany)??'';
		const processCurrentContactName = document.querySelector(`${prefix} .contact-name`).innerHTML??'';
		if (text.indexOf('$name') > -1) {
			text = text.replace(/\$name/g,processCurrentContactName);
		}
		if (text.indexOf('$company') > -1) {
			text = text.replace(/\$company/g,processCurrentCompany);
		}
		var spinner = new Spinner(text);
		document.querySelector(`${prefix} .send-textarea`).value = spinner.unspinRandom(1, true)[0];
		document.querySelector(`${prefix} .im-next-btn`).click();
	}

	/**
	 * @param value {File}
	 */
	const sendFile = (value) => {
		/** @type {HTMLInputElement} */
		const input = document.querySelector('input[type=file][name=file]');

		let container = new DataTransfer();
		container.items.add(value);

		input.files = container.files;
		input.dispatchEvent(new Event('change', {bubbles: true}))
	}

	const settings = await Storage.get(Keys.Settings);
	const messages = [
		{type: MESSAGE_TYPE_TEXT, value: settings[FIRST_MESSAGE]}
	];
  const random_files= settings[RANDOM_FILE_MESSAGE];
  if(random_files===1){
    var imageFiltereds = settings[FILES].filter((image) => {
      let ext = image.name.substring(image.name.lastIndexOf(".") + 1, image.name.length).toLowerCase();
      return IMAGE_TYPE.indexOf(ext) != -1
    });
    if(imageFiltereds.length>0){
      var image = imageFiltereds[Math.floor(Math.random()*imageFiltereds.length)];
      messages.push({type: MESSAGE_TYPE_FILE, value: await createFile(image)});
    }
    var pdfFiltereds = settings[FILES].filter((pdf) => {
      let ext = pdf.name.substring(pdf.name.lastIndexOf(".") + 1, pdf.name.length).toLowerCase();
      return PDF_TYPE.indexOf(ext) != -1
    });
    if(pdfFiltereds.length>0){
      var pdf = pdfFiltereds[Math.floor(Math.random()*pdfFiltereds.length)];
      messages.push({type: MESSAGE_TYPE_FILE, value: await createFile(pdf)});
    }
    var excelFiltereds = settings[FILES].filter((excel) => {
      let ext = excel.name.substring(excel.name.lastIndexOf(".") + 1, excel.name.length).toLowerCase();
      return EXCEL_TYPE.indexOf(ext) != -1
    });
    if(excelFiltereds.length>0){
      var excel = excelFiltereds[Math.floor(Math.random()*excelFiltereds.length)];
      messages.push({type: MESSAGE_TYPE_FILE, value: await createFile(excel)});
    }
  }
  else {
    for (let file of settings[FILES]) {
      messages.push({type: MESSAGE_TYPE_FILE, value: await createFile(file)});
    }
  }
	messages.push({type: MESSAGE_TYPE_TEXT, value: settings[THIRD_MESSAGE]})
	for (let message of messages) {
		switch (message.type) {
			case MESSAGE_TYPE_TEXT:
				if (typeof message.value === 'string' && message.value.trim().length > 0){
					await sendMessage(message.value);
				}
				break;
			case MESSAGE_TYPE_FILE:
				sendFile(message.value);
				break;
		}
		const timeout = randomValue({min: parseInt(settings[MINIMUM_DELAY_TIME_PER_MESSAGE])*1000, max: parseInt(settings[MAXIMUM_DELAY_TIME_PER_MESSAGE])*1000});
		await wait(timeout);
	}

	chrome.runtime.sendMessage({text: 'close'});
}

const init = async () => {
	await waitFor(() => document.readyState === 'complete');

	const currentURL = new URL(document.location.href);
	const shouldProcessURL = await Storage.get(Keys.Current);
	const url = new URL((window.location !== window.parent.location) ? document.referrer : document.location.href);

	if (typeof shouldProcessURL !== "string") return;
	let value = new URL(shouldProcessURL);
	if (value.hostname === url.hostname && value.pathname === url.pathname) {
		switch (currentURL.hostname) {
			case 'onetalk.alibaba.com':
				process();
				break;
			default:
				open();
				break;
		}
	}
}

init();
