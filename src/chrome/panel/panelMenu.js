import {
	getParamsForScope,
	hasDomainSpecificParams,
	normalizeParamsList,
	normalizeUTMeraserSettings,
	readUTMeraserSettings,
	resetSettings,
} from '../common/utils.js';
import { defaultSettings, SETTINGS_KEY, CANT_FIND_SETTINGS_MSG } from '../common/constants.js';

let currentHostname = '';
let currentSettings = normalizeUTMeraserSettings(defaultSettings);
let activeOnlyForDomain = false;
let globalParamsDraft = [];
let domainParamsDraft = [];
let domainParamsSaved = false;
let domainParamsTouched = false;

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
		`Only for ${currentHostname}` :
		"Only for this domain";
	scopeLabel.textContent = activeOnlyForDomain && currentHostname ?
		`UTM's to remove for ${currentHostname} (separated by ,)` :
		"UTM's to remove for all sites (separated by ,)";
}

function renderActiveScope() {
	setSwitchControl(getDomainScopeSwitch(), activeOnlyForDomain);
	updateScopeLabel();
	setParamsText(activeOnlyForDomain ? domainParamsDraft : globalParamsDraft);
}

function initializeDrafts(settings) {
	currentSettings = normalizeUTMeraserSettings(settings);
	globalParamsDraft = [...currentSettings.paramsToRemove];
	domainParamsSaved = hasDomainSpecificParams(currentSettings, currentHostname);
	domainParamsTouched = false;
	domainParamsDraft = domainParamsSaved ?
		[...getParamsForScope(currentSettings, currentHostname, true)] :
		[...defaultSettings.paramsToRemove];
	activeOnlyForDomain = Boolean(currentHostname && domainParamsSaved);

	setStatusControl(currentSettings.status);
	renderActiveScope();
}

function buildSettingsFromDrafts() {
	const domainParamsToRemove = { ...currentSettings.domainParamsToRemove };

	if (currentHostname && (domainParamsSaved || domainParamsTouched || activeOnlyForDomain)) {
		domainParamsToRemove[currentHostname] = normalizeParamsList(domainParamsDraft);
	}

	return normalizeUTMeraserSettings({
		...currentSettings,
		paramsToRemove: normalizeParamsList(globalParamsDraft),
		domainParamsToRemove,
	});
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
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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
				...(currentHostname && (domainParamsSaved || domainParamsTouched || activeOnlyForDomain) ? {
					[currentHostname]: domainParamsDraft,
				} : {}),
			},
		};
		setStatusControl(nextSettings.status);
	}
}

function toggleUTMeraserStatus() {
	readUTMeraserSettings((readSettings) => {
		const settings = normalizeUTMeraserSettings(readSettings);
		chrome.storage.sync.set({
			[SETTINGS_KEY]: { ...settings, status: !settings.status }
		});
	});
}

function onLoad(readSettings) {
	if (!Object.hasOwn(readSettings, 'status')) {
		console.log(CANT_FIND_SETTINGS_MSG + ' at onLoad');
		resetSettings();
	} else {
		initializeDrafts(readSettings);
	}
}

function saveSettings() {
	rememberActiveDraft();
	const updatedSettings = buildSettingsFromDrafts();

	chrome.runtime.sendMessage({ action: 'update-settings', settings: updatedSettings }, () => {
		window.close();
	});
}

document.addEventListener('DOMContentLoaded', () => {
	readCurrentHostname((hostname) => {
		currentHostname = hostname;
		readUTMeraserSettings(onLoad);
	});

	document.getElementById("eraserCustomRadioItem").addEventListener("click", toggleUTMeraserStatus);
	getDomainScopeSwitch().addEventListener('click', switchDomainScope);
	getParamsInput().addEventListener('input', () => {
		if (activeOnlyForDomain) {
			domainParamsDraft = readParamsText();
			domainParamsTouched = true;
		} else {
			globalParamsDraft = readParamsText();
		}
	});
	document.getElementById('eraserSaveParamsBtn').addEventListener('click', saveSettings);

	chrome.storage.onChanged.addListener(storageChangeHandler);
});
