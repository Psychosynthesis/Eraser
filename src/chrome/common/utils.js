import { defaultSettings, SETTINGS_KEY, CANT_FIND_SETTINGS_MSG } from './constants.js';

export const resetSettings = () => {
	console.log('Set default settings');
	chrome.storage.sync.set({ [SETTINGS_KEY]: { ...defaultSettings} });
}

export const readUTMeraserSettings = (callback) => {
	chrome.storage.sync.get([SETTINGS_KEY], (data) => {
		if (!data[SETTINGS_KEY]) {
			console.log(CANT_FIND_SETTINGS_MSG + ' at readUTMeraserSettings');
			resetSettings();
			callback(defaultSettings);
		} else {
			callback(data[SETTINGS_KEY] || {});
		}
	});
};
