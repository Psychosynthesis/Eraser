import { defaultSettings } from './constants.js';

export const normalizeHostname = (hostname = '') => String(hostname).trim().toLowerCase();

export const normalizeParamsList = (params = []) => {
	if (!Array.isArray(params)) {
		return [];
	}

	return Array.from(new Set(
		params
			.map(param => String(param).trim())
			.filter(Boolean)
	));
};

export const normalizeDomainParamsToRemove = (domainParamsToRemove = {}) => {
	if (
		!domainParamsToRemove ||
		typeof domainParamsToRemove !== 'object' ||
		Array.isArray(domainParamsToRemove)
	) {
		return {};
	}

	return Object.entries(domainParamsToRemove).reduce((result, [hostname, params]) => {
		const normalizedHostname = normalizeHostname(hostname);

		if (normalizedHostname) {
			result[normalizedHostname] = normalizeParamsList(params);
		}

		return result;
	}, {});
};

const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

export const normalizeDomainParamsEnabled = (
	domainParamsEnabled = {},
	domainParamsToRemove = {}
) => {
	const enabledSource = (
		domainParamsEnabled &&
		typeof domainParamsEnabled === 'object' &&
		!Array.isArray(domainParamsEnabled)
	) ? domainParamsEnabled : {};
	const normalizedDomainParams = normalizeDomainParamsToRemove(domainParamsToRemove);

	return Object.keys(normalizedDomainParams).reduce((result, hostname) => {
		result[hostname] = hasOwn(enabledSource, hostname) ?
			enabledSource[hostname] !== false :
			true;

		return result;
	}, {});
};

const normalizeSavedParams = (source, settingsDefaults) => {
	const defaultParams = normalizeParamsList(settingsDefaults.paramsToRemove);

	if (!hasOwn(source, 'paramsToRemove')) {
		return defaultParams;
	}

	const savedParams = normalizeParamsList(source.paramsToRemove);

	// Before editable full lists, Chrome stored only user-added params while
	// static rules removed the built-in list. Preserve that installed behavior
	// by migrating unversioned settings to the new full-list format.
	if (!source.settingsVersion && defaultParams.length) {
		return normalizeParamsList([...defaultParams, ...savedParams]);
	}

	return savedParams;
};

export const normalizeUTMeraserSettings = (settings = {}, settingsDefaults = defaultSettings) => {
	const source = settings && typeof settings === 'object' ? settings : {};
	const settingsVersion = settingsDefaults.settingsVersion || source.settingsVersion;
	const domainParamsToRemove = normalizeDomainParamsToRemove(
		hasOwn(source, 'domainParamsToRemove') ?
			source.domainParamsToRemove :
			settingsDefaults.domainParamsToRemove
	);

	return {
		...settingsDefaults,
		...source,
		settingsVersion,
		status: typeof source.status === 'boolean' ? source.status : settingsDefaults.status !== false,
		paramsToRemove: normalizeSavedParams(source, settingsDefaults),
		domainParamsToRemove,
		domainParamsEnabled: normalizeDomainParamsEnabled(
			hasOwn(source, 'domainParamsEnabled') ?
				source.domainParamsEnabled :
				settingsDefaults.domainParamsEnabled,
			domainParamsToRemove
		),
	};
};

export const hasDomainScopedParams = (settings = {}, hostname = '', settingsDefaults = defaultSettings) => {
	const normalizedSettings = normalizeUTMeraserSettings(settings, settingsDefaults);
	const normalizedHostname = normalizeHostname(hostname);

	return Boolean(
		normalizedHostname &&
		hasOwn(normalizedSettings.domainParamsToRemove, normalizedHostname)
	);
};

export const isDomainScopedParamsEnabled = (settings = {}, hostname = '', settingsDefaults = defaultSettings) => {
	const normalizedSettings = normalizeUTMeraserSettings(settings, settingsDefaults);
	const normalizedHostname = normalizeHostname(hostname);

	return Boolean(
		hasDomainScopedParams(normalizedSettings, normalizedHostname, settingsDefaults) &&
		normalizedSettings.domainParamsEnabled[normalizedHostname] !== false
	);
};

export const getParamsForHostname = (settings = {}, hostname = '', settingsDefaults = defaultSettings) => {
	const normalizedSettings = normalizeUTMeraserSettings(settings, settingsDefaults);
	const normalizedHostname = normalizeHostname(hostname);

	if (isDomainScopedParamsEnabled(normalizedSettings, normalizedHostname, settingsDefaults)) {
		return normalizedSettings.domainParamsToRemove[normalizedHostname];
	}

	return normalizedSettings.paramsToRemove;
};

export const getScopedParams = (
	settings = {},
	hostname = '',
	onlyForDomain = false,
	settingsDefaults = defaultSettings
) => {
	const normalizedSettings = normalizeUTMeraserSettings(settings, settingsDefaults);
	const normalizedHostname = normalizeHostname(hostname);

	if (onlyForDomain && normalizedHostname) {
		return hasDomainScopedParams(normalizedSettings, normalizedHostname, settingsDefaults) ?
			normalizedSettings.domainParamsToRemove[normalizedHostname] :
			normalizeParamsList(settingsDefaults.paramsToRemove);
	}

	return normalizedSettings.paramsToRemove;
};

export const setScopedParams = (
	settings = {},
	hostname = '',
	onlyForDomain = false,
	params = [],
	settingsDefaults = defaultSettings
) => {
	const normalizedSettings = normalizeUTMeraserSettings(settings, settingsDefaults);
	const normalizedHostname = normalizeHostname(hostname);
	const normalizedParams = normalizeParamsList(params);
	const domainParamsToRemove = { ...normalizedSettings.domainParamsToRemove };
	const domainParamsEnabled = { ...normalizedSettings.domainParamsEnabled };

	if (onlyForDomain && normalizedHostname) {
		domainParamsToRemove[normalizedHostname] = normalizedParams;
		domainParamsEnabled[normalizedHostname] = true;

		return {
			...normalizedSettings,
			domainParamsToRemove,
			domainParamsEnabled,
		};
	}

	if (normalizedHostname) {
		domainParamsEnabled[normalizedHostname] = false;
	}

	return {
		...normalizedSettings,
		paramsToRemove: normalizedParams,
		domainParamsToRemove,
		domainParamsEnabled,
	};
};
