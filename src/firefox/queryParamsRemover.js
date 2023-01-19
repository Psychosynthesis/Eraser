"use strict";
import { readUTMeraserSettings, setDefaultSettings } from './common/utils.js';
import {
	defaultSettings,
	SETTINGS_KEY,
	CANT_FIND_SETTINGS_MSG,
	DEFAULT_PARAMS_TO_REMOVE,
} from './common/constants.js';

// Local settings are used to not make an asynchronous request to the store
let localReadedSettins = { ...defaultSettings };

function localSettingsUpdater(changes, area) {
	if (Object.hasOwn(changes, SETTINGS_KEY)) {
		localReadedSettins =  changes[SETTINGS_KEY].newValue;
	}
};

function stripTrackingQueryParams(request) {
	const dontProcessUrlComm = { cancel: false };
	if (!localReadedSettins.status) {
		return dontProcessUrlComm;
	}

	let requestedUrl = new URL(request.url);
	let match = false;

	DEFAULT_PARAMS_TO_REMOVE.forEach(name => {
		if (requestedUrl.searchParams.has(name)) {
			requestedUrl.searchParams.delete(name);
			match = true;
		}
	});

	// Return the stripped URL if a match is found. Otherwise, pass the URL on as normal {cancel: false}
	return match ? { redirectUrl: requestedUrl.href } : dontProcessUrlComm;
};

function checkForSavedSettings(settings) {
	if (!Object.hasOwn(settings, SETTINGS_KEY)) {
		console.log(CANT_FIND_SETTINGS_MSG);
		setDefaultSettings();
	} else {
		localReadedSettins = { ...settings };
	}
};

browser.runtime.onInstalled.addListener(() => { // Store settings once on install
	setDefaultSettings();
});

// Повторная проверка настроек при запуске профиля, который установил расширение
browser.runtime.onStartup.addListener(() => { readUTMeraserSettings(checkForSavedSettings); });

// Get settings on script load
readUTMeraserSettings(checkForSavedSettings);

// Event listener for onBeforeRequest (HTTP Requests)
// Info for the RequestFilter: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/RequestFilter
// Info on Types: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/ResourceType
browser.webRequest.onBeforeRequest.addListener(
	stripTrackingQueryParams,
	{
		// Filters: Match all HTTP and HTTPS URLs.
		urls: ["http://*/*", "https://*/*"],
		types: ["main_frame", "sub_frame", "ping"]
	},
	["blocking"]
);
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Использование "webRequestBlocking", не совместимо с манифестом v.3, потому что
// м****и из хрома решили брать деньги за эту функциональность - она доступна только для
// "корпоративных" дополнений. А загружать расширения с манифестом старой версии в
// гуглостор бесплатно нельзя. Поэтому данный подход работает только в Firefox.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

browser.storage.onChanged.addListener(localSettingsUpdater);
