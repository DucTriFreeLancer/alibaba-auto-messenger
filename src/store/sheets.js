import {fetch} from "@/shared/fetch";

export default {
	namespaced: true,
	state: {},
	actions: {
		get({}, {spreadsheetId, range}) {
			let endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
			return fetch(endpoint).then(response => response.json());
		},
		update({}, {spreadsheetId, range, value}) {
			let endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`;

			return fetch(endpoint, {
				method: 'PUT',
				body: JSON.stringify(value)
			})
		},
		list({}, {folderId}) {
			let endpoint = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents`;
			return fetch(endpoint).then(response => response.json());
		},
	}
}

