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

const normalizeSavedParams = (source, defaultSettings) => {
	const defaultParams = normalizeParamsList(defaultSettings.paramsToRemove);

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

export const normalizeUTMeraserSettings = (settings = {}, defaultSettings = {}) => {
	const source = settings && typeof settings === 'object' ? settings : {};
	const settingsVersion = defaultSettings.settingsVersion || source.settingsVersion;

	return {
		...defaultSettings,
		...source,
		settingsVersion,
		status: typeof source.status === 'boolean' ? source.status : defaultSettings.status !== false,
		paramsToRemove: normalizeSavedParams(source, defaultSettings),
		domainParamsToRemove: normalizeDomainParamsToRemove(
			hasOwn(source, 'domainParamsToRemove') ?
				source.domainParamsToRemove :
				defaultSettings.domainParamsToRemove
		),
	};
};

export const hasDomainScopedParams = (settings = {}, hostname = '', defaultSettings = {}) => {
	const normalizedSettings = normalizeUTMeraserSettings(settings, defaultSettings);
	const normalizedHostname = normalizeHostname(hostname);

	return Boolean(
		normalizedHostname &&
		hasOwn(normalizedSettings.domainParamsToRemove, normalizedHostname)
	);
};

export const getParamsForHostname = (settings = {}, hostname = '', defaultSettings = {}) => {
	const normalizedSettings = normalizeUTMeraserSettings(settings, defaultSettings);
	const normalizedHostname = normalizeHostname(hostname);

	if (hasDomainScopedParams(normalizedSettings, normalizedHostname, defaultSettings)) {
		return normalizedSettings.domainParamsToRemove[normalizedHostname];
	}

	return normalizedSettings.paramsToRemove;
};

export const getScopedParams = (
	settings = {},
	hostname = '',
	onlyForDomain = false,
	defaultSettings = {}
) => {
	const normalizedSettings = normalizeUTMeraserSettings(settings, defaultSettings);
	const normalizedHostname = normalizeHostname(hostname);

	if (onlyForDomain && normalizedHostname) {
		return hasDomainScopedParams(normalizedSettings, normalizedHostname, defaultSettings) ?
			normalizedSettings.domainParamsToRemove[normalizedHostname] :
			normalizeParamsList(defaultSettings.paramsToRemove);
	}

	return normalizedSettings.paramsToRemove;
};

export const setScopedParams = (
	settings = {},
	hostname = '',
	onlyForDomain = false,
	params = [],
	defaultSettings = {}
) => {
	const normalizedSettings = normalizeUTMeraserSettings(settings, defaultSettings);
	const normalizedHostname = normalizeHostname(hostname);
	const normalizedParams = normalizeParamsList(params);
	const domainParamsToRemove = { ...normalizedSettings.domainParamsToRemove };

	if (onlyForDomain && normalizedHostname) {
		domainParamsToRemove[normalizedHostname] = normalizedParams;

		return {
			...normalizedSettings,
			domainParamsToRemove,
		};
	}

	if (normalizedHostname) {
		delete domainParamsToRemove[normalizedHostname];
	}

	return {
		...normalizedSettings,
		paramsToRemove: normalizedParams,
		domainParamsToRemove,
	};
};
