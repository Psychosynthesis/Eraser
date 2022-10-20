import { SETTINGS_KEY, defaultSettings } from './constants.js';

export const readUTMeraserSettings = (callback) => {
	browser.storage.sync.get(SETTINGS_KEY).then(
		callback,
		function(e) { console.error("Fail get settings: ", e); }
	);
};

export const setDefaultSettings = () => {
	browser.storage.sync.set({ [SETTINGS_KEY]: { ...defaultSettings} });
}
