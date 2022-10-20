"use strict";
import { readUTMeraserSettings, setDefaultSettings } from './common/utils.js';
import { defaultSettings, SETTINGS_KEY, CANT_FIND_SETTINGS_MSG } from './common/constants.js';

function localSettingsUpdater(changes, area) {
	if (Object.hasOwn(changes, SETTINGS_KEY)) {
		localReadedSettins =  changes[SETTINGS_KEY].newValue;
	}
};

// Local settings are used to not make an asynchronous request to the store
let localReadedSettins = { ...defaultSettings };

chrome.runtime.onInstalled.addListener(() => { // Store settings once on install
	setDefaultSettings();
});

chrome.storage.onChanged.addListener(localSettingsUpdater);

// Get settings on script load
readUTMeraserSettings((readedSettings) => {
	if (!Object.hasOwn(readedSettings, SETTINGS_KEY)) {
		console.log(CANT_FIND_SETTINGS_MSG);
		setDefaultSettings();
	} else {
		localReadedSettins = { ...readedSettings };
	}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'get-settings') {
    sendResponse(localReadedSettins);
  }
});
