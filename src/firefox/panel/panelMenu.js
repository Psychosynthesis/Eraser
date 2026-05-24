import {
	readUTMeraserSettings,
	setDefaultSettings,
} from '../common/utils.js';
import {
	getScopedParams,
	hasDomainScopedParams,
	isDomainScopedParamsEnabled,
	normalizeParamsList,
	normalizeUTMeraserSettings,
	setScopedParams,
} from '../common/settings.js';
import { defaultSettings, SETTINGS_KEY, CANT_FIND_SETTINGS_MSG } from '../common/constants.js';

let currentHostname = '';
let currentSettings = normalizeUTMeraserSettings();
let activeOnlyForDomain = false;
let globalParamsDraft = [];
let domainParamsDraft = [];
let domainParamsSaved = false;

const i18n = globalThis.browser?.i18n || globalThis.chrome?.i18n;

function getMessage(messageName, substitutions = [], fallback = '') {
	const message = i18n?.getMessage(messageName, substitutions);

	return message || fallback;
}

function translateStaticText() {
	document.querySelectorAll('[data-i18n]').forEach((element) => {
		const messageName = element.dataset.i18n;
		element.textContent = getMessage(messageName, [], element.textContent);
	});
}

function setSwitchControl(element, status) {
	element.className = status ? "eraserCustomRadio checked" : "eraserCustomRadio";
}

function setStatusControl(status) {
	setSwitchControl(document.getElementById("eraserCustomRadioItem"), status);
}

function getDomainScopeSwitch() {
	return document.getElementById("eraserDomainScopeSwitch");
}

function getParamsInput() {
	return document.getElementById('eraserParamsToRemoveList');
}

function readParamsText() {
	return normalizeParamsList(getParamsInput().value.split(','));
}

function setParamsText(params) {
	getParamsInput().value = params.join(', ');
}

function rememberActiveDraft() {
	if (activeOnlyForDomain) {
		domainParamsDraft = readParamsText();
	} else {
		globalParamsDraft = readParamsText();
	}
}

function updateScopeLabel() {
	const label = document.getElementById("eraserOnlyForDomainLabel");
	const scopeLabel = document.getElementById("eraserParamsScopeLabel");
	const container = document.querySelector('.domain-scope-switch-container');

	container.classList.toggle('disabled', !currentHostname);
	label.textContent = currentHostname ?
		getMessage('popupOnlyForDomainHost', [currentHostname], `Only for ${currentHostname}`) :
		getMessage('popupOnlyForDomain', [], "Only for this domain");
	scopeLabel.textContent = activeOnlyForDomain && currentHostname ?
		getMessage('popupParamsForDomain', [currentHostname], `UTM's to remove for ${currentHostname} (separated by ,)`) :
		getMessage('popupParamsForAll', [], "UTM's to remove for all sites (separated by ,)");
}

function renderActiveScope() {
	setSwitchControl(getDomainScopeSwitch(), activeOnlyForDomain);
	updateScopeLabel();
	setParamsText(activeOnlyForDomain ? domainParamsDraft : globalParamsDraft);
}

function initializeDrafts(settings) {
	currentSettings = normalizeUTMeraserSettings(settings);
	globalParamsDraft = [...currentSettings.paramsToRemove];
	domainParamsSaved = hasDomainScopedParams(currentSettings, currentHostname);
	domainParamsDraft = domainParamsSaved ?
		[...getScopedParams(currentSettings, currentHostname, true)] :
		[...defaultSettings.paramsToRemove];
	activeOnlyForDomain = Boolean(
		currentHostname &&
		isDomainScopedParamsEnabled(currentSettings, currentHostname)
	);

	setStatusControl(currentSettings.status);
	renderActiveScope();
}

function buildSettingsFromDrafts() {
	const settingsWithGlobalDraft = normalizeUTMeraserSettings({
		...currentSettings,
		paramsToRemove: normalizeParamsList(globalParamsDraft),
	});

	if (!currentHostname) {
		return settingsWithGlobalDraft;
	}

	return setScopedParams(
		settingsWithGlobalDraft,
		currentHostname,
		activeOnlyForDomain,
		activeOnlyForDomain ? domainParamsDraft : globalParamsDraft
	);
}

function switchDomainScope() {
	if (!currentHostname) {
		return;
	}

	rememberActiveDraft();
	activeOnlyForDomain = !activeOnlyForDomain;
	renderActiveScope();
}

function readCurrentHostname(callback) {
	browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
		const [activeTab] = tabs || [];

		try {
			const url = new URL(activeTab && activeTab.url);
			callback(/^https?:$/.test(url.protocol) ? url.hostname.toLowerCase() : '');
		} catch (error) {
			callback('');
		}
	});
}

function storageChangeHandler(changes, area) {
	if (Object.hasOwn(changes, SETTINGS_KEY)) {
		const nextSettings = normalizeUTMeraserSettings(changes[SETTINGS_KEY].newValue);
		currentSettings = {
			...nextSettings,
			paramsToRemove: globalParamsDraft,
			domainParamsToRemove: {
				...nextSettings.domainParamsToRemove,
				...(currentHostname && (domainParamsSaved || activeOnlyForDomain) ? {
					[currentHostname]: domainParamsDraft,
				} : {}),
			},
			domainParamsEnabled: {
				...nextSettings.domainParamsEnabled,
				...(currentHostname ? {
					[currentHostname]: activeOnlyForDomain,
				} : {}),
			},
		};
		setStatusControl(nextSettings.status);
	}
}

function toggleUTMeraserSettings() {
	readUTMeraserSettings((readSettings) => {
		if (!Object.hasOwn(readSettings, 'status')) {
			console.log(CANT_FIND_SETTINGS_MSG);
			setDefaultSettings();
		} else {
			const settings = normalizeUTMeraserSettings(readSettings);
			browser.storage.sync.set({
				[SETTINGS_KEY]: { ...settings, status: !settings.status }
			});
		}
	});
}

function onLoad(readSettings) {
	if (!Object.hasOwn(readSettings, 'status')) {
		console.log(CANT_FIND_SETTINGS_MSG);
		setDefaultSettings();
	} else {
		initializeDrafts(readSettings);
	}
}

function saveSettings() {
	rememberActiveDraft();
	const updatedSettings = buildSettingsFromDrafts();

	browser.storage.sync.set({ [SETTINGS_KEY]: updatedSettings }).then(() => {
		window.close();
	});
}

document.addEventListener('DOMContentLoaded', () => {
	translateStaticText();
	readCurrentHostname((hostname) => {
		currentHostname = hostname;
		readUTMeraserSettings(onLoad);
	});

	document.getElementById("eraserCustomRadioItem").addEventListener("click", toggleUTMeraserSettings);
	getDomainScopeSwitch().addEventListener('click', switchDomainScope);
	getParamsInput().addEventListener('input', () => {
		if (activeOnlyForDomain) {
			domainParamsDraft = readParamsText();
		} else {
			globalParamsDraft = readParamsText();
		}
	});
	document.getElementById('eraserSaveParamsBtn').addEventListener('click', saveSettings);

	browser.storage.onChanged.addListener(storageChangeHandler);
});
