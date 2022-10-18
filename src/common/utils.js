import { defaultSettings, SETTINGS_KEY } from './constants.js';

export const readUTMeraserSettings = (callback) => {
	browser.storage.sync.get(SETTINGS_KEY).then(
		callback,
		function(e) { console.error(e) }
	);
};

export const apiInterface = (typeof(browser) !== "undefined") ? browser : chrome;
