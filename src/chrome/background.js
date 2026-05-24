"use strict";
import { readUTMeraserSettings, resetSettings } from './common/utils.js';
import {
	getParamsForHostname,
	isDomainScopedParamsEnabled,
	normalizeHostname,
	normalizeParamsList,
	normalizeUTMeraserSettings,
} from './common/settings.js';
import { SETTINGS_KEY, CANT_FIND_SETTINGS_MSG } from './common/constants.js';

const RESOURCE_TYPES = ["xmlhttprequest", "main_frame", "sub_frame"];
const GLOBAL_RULE_ID = 1;
const DOMAIN_RULE_ID_START = 1000;

// Local settings are used to not make an asynchronous request to the store.
let cachedSettings = normalizeUTMeraserSettings();

function createRemoveParamsRule(id, paramsToRemove, condition = {}) {
	const params = normalizeParamsList(paramsToRemove);

	if (!params.length) {
		return null;
	}

	return {
		id,
		priority: 1,
		action: {
			type: "redirect",
			redirect: {
				transform: {
					queryTransform: {
						removeParams: params,
					},
				},
			},
		},
		condition: {
			...condition,
			resourceTypes: RESOURCE_TYPES,
		},
	};
}

function createDomainCondition(hostname) {
	return {
		requestDomains: [normalizeHostname(hostname)],
	};
}

async function syncDynamicRules(settings = cachedSettings) {
	const normalizedSettings = normalizeUTMeraserSettings(settings);
	const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
	const removeRuleIds = existingRules.map(rule => rule.id);
	const addRules = [];
	const domainEntries = Object.entries(normalizedSettings.domainParamsToRemove)
		.filter(([hostname]) => isDomainScopedParamsEnabled(normalizedSettings, hostname));

	if (normalizedSettings.status) {
		const globalRule = createRemoveParamsRule(
			GLOBAL_RULE_ID,
			normalizedSettings.paramsToRemove,
			domainEntries.length ? {
				urlFilter: "*",
				excludedRequestDomains: domainEntries.map(([hostname]) => hostname),
			} : {
				urlFilter: "*",
			}
		);

		if (globalRule) {
			addRules.push(globalRule);
		}

		domainEntries.forEach(([hostname, params], index) => {
			const domainRule = createRemoveParamsRule(
				DOMAIN_RULE_ID_START + index,
				params,
				createDomainCondition(hostname)
			);

			if (domainRule) {
				addRules.push(domainRule);
			}
		});
	}

	await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
	cachedSettings = normalizedSettings;
}

function initializeSettings() {
	readUTMeraserSettings((readSettings) => {
		if (!Object.hasOwn(readSettings, 'status')) {
			console.log(CANT_FIND_SETTINGS_MSG + ' on script load in background.js');
			resetSettings();
			cachedSettings = normalizeUTMeraserSettings();
		} else {
			cachedSettings = normalizeUTMeraserSettings(readSettings);
		}

		syncDynamicRules(cachedSettings).catch(error => {
			console.error('Error syncing dynamic rules:', error);
		});
	});
}

chrome.runtime.onInstalled.addListener((details) => {
	readUTMeraserSettings((existingSettings) => {
		if (details.reason === 'install' && !Object.hasOwn(existingSettings, 'status')) {
			resetSettings();
			cachedSettings = normalizeUTMeraserSettings();
		} else {
			cachedSettings = normalizeUTMeraserSettings(existingSettings);
		}

		syncDynamicRules(cachedSettings).catch(error => {
			console.error('Error syncing dynamic rules on install/update:', error);
		});
	});
});

chrome.runtime.onStartup.addListener(initializeSettings);
chrome.storage.onChanged.addListener((changes) => {
	if (Object.hasOwn(changes, SETTINGS_KEY)) {
		syncDynamicRules(changes[SETTINGS_KEY].newValue).catch(error => {
			console.error('Error syncing dynamic rules after settings change:', error);
		});
	}
});

initializeSettings();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.action) {
		case 'get-settings':
			readUTMeraserSettings((data) => {
				const settings = Object.hasOwn(data, 'status') ? normalizeUTMeraserSettings(data) : cachedSettings;
				sendResponse({
					status: settings.status,
					paramsToRemove: message.hostname ?
						getParamsForHostname(settings, message.hostname) :
						settings.paramsToRemove,
					globalParamsToRemove: settings.paramsToRemove,
					domainParamsToRemove: settings.domainParamsToRemove,
					domainParamsEnabled: settings.domainParamsEnabled,
				});
			});
			return true;

		case 'update-settings':
			const updatedSettings = normalizeUTMeraserSettings(message.settings || {
				...cachedSettings,
				paramsToRemove: [...(message.paramsToRemove || cachedSettings.paramsToRemove)],
			});

			chrome.storage.sync.set({ [SETTINGS_KEY]: updatedSettings }, () => {
				syncDynamicRules(updatedSettings)
					.then(() => sendResponse({ success: true }))
					.catch(error => sendResponse({ success: false, error: error.message }));
			});
			return true;

		default:
			return false;
	}
});
