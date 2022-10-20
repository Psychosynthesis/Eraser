"use strict";
import { readUTMeraserSettings, setDefaultSettings } from './common/utils.js';
import { defaultSettings, SETTINGS_KEY } from './common/constants.js';

browser.runtime.onInstalled.addListener(() => { // Store settings once on install
	setDefaultSettings();
});

// Local settings are used to not make an asynchronous request to the store
let localReadedSettins = { ...defaultSettings };

const queryParamsForRemove = [ // TODO: make configurable
	"utm_campaign",
	"utm_content",
	"utm_id",
	"utm_source",
	"utm_medium",
	"utm_term",
	"utm_name",
	"fbclid",
	"gclid",
];

function localSettingsUpdater(changes, area) {
	if (Object.hasOwn(changes, SETTINGS_KEY)) {
		localReadedSettins =  changes[SETTINGS_KEY].newValue;
	}
}

function stripTrackingQueryParams(request) {
	const dontProcessUrlComm = { cancel: false };
	if (!localReadedSettins.status) {
		return dontProcessUrlComm;
	}

	let requestedUrl = new URL(request.url);
	let match = false;

	queryParamsForRemove.forEach(name => {
		if (requestedUrl.searchParams.has(name)) {
			requestedUrl.searchParams.delete(name);
			match = true;
		}
	});

	// Return the stripped URL if a match is found. Otherwise, pass the URL on as normal {cancel: false}
	return match ? { redirectUrl: requestedUrl.href } : dontProcessUrlComm;
}

// Get settings on script load
readUTMeraserSettings((readedSettings) => {
	if (!Object.hasOwn(readedSettings, SETTINGS_KEY)) {
		console.log("Can't find the settings, setup new.");
		setDefaultSettings();
	} else {
		localReadedSettins = { ...readedSettings };
	}
});

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
