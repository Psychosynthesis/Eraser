import { defaultSettings, SETTINGS_KEY } from './constants.js';

export const isNotChrome = (typeof(browser) !== "undefined");

export const apiInterface = isNotChrome ? browser : chrome;

export const readUTMeraserSettings = (callback) => {
	if (isNotChrome) {
		apiInterface.storage.sync.get(SETTINGS_KEY).then(
			callback,
			function(e) { console.error(e) }
		);
	} else {
		apiInterface.storage.sync.get(callback);
	}
};
