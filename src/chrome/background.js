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

// Store settings only on first install, sync on update
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        // Check if settings already exist in storage
        readUTMeraserSettings(async (existingSettings) => {
            if (!Object.hasOwn(existingSettings, 'status')) {
                // No existing settings found - set defaults
                await resetSettings();
                localReadedSettings = { ...defaultSettings };
                console.log('Initial settings created');
            } else {
                // Use existing settings
                localReadedSettings = { ...existingSettings };
                // Ensure ruleset state matches existing settings
                if (existingSettings.status) {
                    enableRuleset();
                } else {
                    disableRuleset();
                }
                console.log('Using existing settings');
            }
        });
    } else {
        // Update, reload, etc - sync with existing settings
        readUTMeraserSettings((existingSettings) => {
            if (Object.hasOwn(existingSettings, 'status')) {
                localReadedSettings = { ...existingSettings };
                // Ensure ruleset state matches settings
                if (existingSettings.status) {
                    enableRuleset();
                } else {
                    disableRuleset();
                }
            }
        });
    }
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

// Enable/disable ruleset functions
async function enableRuleset() {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["ruleset_1"],
      disableRulesetIds: []
    });
    console.log('Ruleset 1 enabled');
    return true;
  } catch (error) {
    console.error('Error enabling ruleset:', error);
    return false;
  }
}

async function disableRuleset() {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: [],
      disableRulesetIds: ["ruleset_1"]
    });
    console.log('Ruleset 1 disabled');
    return true;
  } catch (error) {
    console.error('Error disabling ruleset:', error);
    return false;
  }
}

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

// Enable/disable ruleset based on settings changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (Object.hasOwn(changes, SETTINGS_KEY)) {
    const { newValue } = changes[SETTINGS_KEY];
    if (newValue.status) {
      enableRuleset();
    } else {
      disableRuleset();
    }
  }
});
