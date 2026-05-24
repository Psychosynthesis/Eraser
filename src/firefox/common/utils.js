import { SETTINGS_KEY, defaultSettings } from './constants.js';
import { normalizeUTMeraserSettings } from './sharedUtils.js';

export {
	getParamsForScope,
	getParamsToRemoveForHostname,
	hasDomainSpecificParams,
	normalizeHostname,
	normalizeParamsList,
	normalizeUTMeraserSettings,
	setParamsForScope,
} from './sharedUtils.js';

export const readUTMeraserSettings = (callback) => {
	browser.storage.sync.get(SETTINGS_KEY).then(
		(data) => {
			if (!data[SETTINGS_KEY]) {
				setDefaultSettings();
				callback(normalizeUTMeraserSettings(defaultSettings));
			} else {
				callback(normalizeUTMeraserSettings(data[SETTINGS_KEY]));
			}
		},
		function(e) { console.error("Fail get settings: ", e); }
	);
};

export const setDefaultSettings = () => {
	browser.storage.sync.set({ [SETTINGS_KEY]: normalizeUTMeraserSettings(defaultSettings) });
};
