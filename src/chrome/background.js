"use strict";
import { readUTMeraserSettings, resetSettings } from './common/utils.js';
import { defaultSettings, SETTINGS_KEY, CANT_FIND_SETTINGS_MSG } from './common/constants.js';

// Local settings are used to not make an asynchronous request to the store
let cachedSettings = { ...defaultSettings };

// Enable/disable ruleset functions
async function toggleRuleset(status) {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
			enableRulesetIds: status ? ["ruleset"] : [],
			disableRulesetIds: status ? [] : ["ruleset"],
    });
		console.log(`Ruleset ${ status ? 'enabled' : 'disabled' }`);
    return true;
  } catch (error) {
		console.error('Error toggle ruleset:', error);
    return false;
  }
}

// Store settings only on first install, sync on update
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        // Check if settings already exist in storage
        readUTMeraserSettings(async (existingSettings) => {
            if (!Object.hasOwn(existingSettings, 'status')) {
                // No existing settings found - set defaults
                await resetSettings();
                cachedSettings = { ...defaultSettings };
                console.log('Initial settings created');
            } else {
                // Use existing settings
                cachedSettings = { ...existingSettings };
                // Ensure ruleset state matches existing settings
								toggleRuleset(cachedSettings.status)
                console.log('Using existing settings');
            }
        });
    } else {
        // Update, reload, etc - sync with existing settings
        readUTMeraserSettings((existingSettings) => {
            if (Object.hasOwn(existingSettings, 'status')) {
                cachedSettings = { ...existingSettings };
                // Ensure ruleset state matches settings
								toggleRuleset(cachedSettings.status);
            }
        });
    }
});

function localSettingsUpdater(changes, area) {
	if (Object.hasOwn(changes, SETTINGS_KEY)) {
		const { newValue } = changes[SETTINGS_KEY];
		toggleRuleset(newValue.status);
		cachedSettings = { ...changes[SETTINGS_KEY].newValue };
	}
};

chrome.storage.onChanged.addListener(localSettingsUpdater);

// Get settings on script load
readUTMeraserSettings((readedSettings) => {
	console.log('readedSettings on first load: ', readedSettings)
	if (!Object.hasOwn(readedSettings, 'status')) {
		console.log(CANT_FIND_SETTINGS_MSG + ' on script load in background.js');
		resetSettings();
	} else {
		cachedSettings = { ...readedSettings };
	}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.action) {
		case 'get-settings':
			readUTMeraserSettings((data) => {
				 const settings = Object.hasOwn(data, 'status') ? data : cachedSettings;
			   sendResponse({
			     status: settings.status,
			     paramsToRemove: settings.paramsToRemove
			   });
			});
			return true; // Required for async response
			break;

		case 'update-settings':
			const updatedSettings = {
				...cachedSettings,
				paramsToRemove: [...message.paramsToRemove]
			};
			chrome.storage.sync.set({ [SETTINGS_KEY]: updatedSettings }, () => {
				cachedSettings = {...updatedSettings};
				sendResponse({ success: true });
			});
			return true; // Required for async response
			break;

		case 'enable-ruleset':
			enableRuleset()
				.then(success => sendResponse({ success }))
				.catch(error => sendResponse({ success: false, error: error.message }));
			return true;

		case 'disable-ruleset':
			disableRuleset()
				.then(success => sendResponse({ success }))
				.catch(error => sendResponse({ success: false, error: error.message }));
			return true;

		default:
			return false;
			break;
	}
});
