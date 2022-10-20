import { defaultSettings, SETTINGS_KEY } from './constants.js';

export const readUTMeraserSettings = (callback) => {
	chrome.storage.sync.get(callback);
};

export const setDefaultSettings = () => {
	chrome.storage.sync.set({ [SETTINGS_KEY]: { ...defaultSettings} });
}
