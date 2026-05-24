import { defaultSettings } from './constants.js';
import {
	getParamsForHostname,
	getScopedParams,
	hasDomainScopedParams,
	normalizeUTMeraserSettings as normalizeSettingsWithDefaults,
	setScopedParams,
} from './settings.js';

export { normalizeHostname, normalizeParamsList } from './settings.js';

export const normalizeUTMeraserSettings = (settings = {}) => (
	normalizeSettingsWithDefaults(settings, defaultSettings)
);

export const getParamsToRemoveForHostname = (settings = {}, hostname = '') => (
	getParamsForHostname(settings, hostname, defaultSettings)
);

export const hasDomainSpecificParams = (settings = {}, hostname = '') => (
	hasDomainScopedParams(settings, hostname, defaultSettings)
);

export const getParamsForScope = (settings = {}, hostname = '', onlyForDomain = false) => (
	getScopedParams(settings, hostname, onlyForDomain, defaultSettings)
);

export const setParamsForScope = (
	settings = {},
	hostname = '',
	onlyForDomain = false,
	params = []
) => (
	setScopedParams(settings, hostname, onlyForDomain, params, defaultSettings)
);
