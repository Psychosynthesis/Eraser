"use strict";
import { apiInterface, readUTMeraserSettings } from './common/utils.js';
import { defaultSettings, SETTINGS_KEY } from './common/constants.js';

let localReadedSettins = defaultSettings;

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

function settingsUpdater(changes, area) {
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
		browser.storage.sync.set({ [SETTINGS_KEY]: defaultSettings });
	} else {
		localReadedSettins = readedSettings;
	}
});

/**
*  Event listener for onBeforeRequest (HTTP Requests)
*  Info for the RequestFilter: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/RequestFilter
*  Info on Types: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/ResourceType
*
*/
apiInterface.webRequest.onBeforeRequest.addListener(
	stripTrackingQueryParams,
	{
		// Filters: Match all HTTP and HTTPS URLs.
		urls: ["http://*/*", "https://*/*"],
		types: ["main_frame", "sub_frame", "ping"]
	},
	["blocking"]
);

apiInterface.storage.onChanged.addListener(settingsUpdater);
