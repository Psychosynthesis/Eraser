"use strict";
import { readUTMeraserSettings, resetSettings } from './common/utils.js';
import { defaultSettings, SETTINGS_KEY, CANT_FIND_SETTINGS_MSG } from './common/constants.js';

// Local settings are used to not make an asynchronous request to the store
let localReadedSettings = { ...defaultSettings };

function localSettingsUpdater(changes, area) {
	if (Object.hasOwn(changes, SETTINGS_KEY)) {
		localReadedSettings = changes[SETTINGS_KEY].newValue;
	}
};

 // Store settings once on install
chrome.runtime.onInstalled.addListener(async () => {
    await resetSettings();
    localReadedSettings = { ...defaultSettings };
});

chrome.storage.onChanged.addListener(localSettingsUpdater);

// Get settings on script load
readUTMeraserSettings((readedSettings) => {
	console.log('readedSettings on first load: ', readedSettings)
	if (!Object.hasOwn(readedSettings, 'status')) {
		console.log(CANT_FIND_SETTINGS_MSG + ' on script load in background.js');
		resetSettings();
	} else {
		localReadedSettings = { ...readedSettings };
	}
});

/* Старая версия, тестировать
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'get-settings') {
    sendResponse(localReadedSettings);
  }
});
*/

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.action) {
		case 'get-settings':
			readUTMeraserSettings((data) => {
				 const settings = Object.hasOwn(data, 'status') ? data : localReadedSettings;
			   sendResponse({
			     status: settings.status,
			     paramsToRemove: settings.paramsToRemove
			   });
			});
	    return true; // Обязательно для асинхронного ответа
			break;

		case 'update-settings':
			const updatedSettings = {
				...localReadedSettings,
				paramsToRemove: [...message.paramsToRemove]
			};
			chrome.storage.sync.set({ [SETTINGS_KEY]: updatedSettings }, () => {
				localReadedSettings = {...updatedSettings};
				sendResponse({ success: true });
			});
			return true; // Для асинхронного ответа
			break;

		default:
			return false;
			break;
	}
});
