import { SETTINGS_KEY, CANT_FIND_SETTINGS_MSG } from './constants.js';
import { normalizeUTMeraserSettings } from './settings.js';

export const resetSettings = () => {
	console.log('Set default settings');
	chrome.storage.sync.set({ [SETTINGS_KEY]: normalizeUTMeraserSettings() });
};

export const readUTMeraserSettings = (callback) => {
	chrome.storage.sync.get([SETTINGS_KEY], (data) => {
		if (!data[SETTINGS_KEY]) {
			console.log(CANT_FIND_SETTINGS_MSG + ' at readUTMeraserSettings');
			resetSettings();
			callback(normalizeUTMeraserSettings());
		} else {
			callback(normalizeUTMeraserSettings(data[SETTINGS_KEY] || {}));
		}
	});
};
