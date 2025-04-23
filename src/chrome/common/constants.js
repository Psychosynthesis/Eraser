export const defaultSettings = {
	status: true,
	paramsToRemove: [ // Перенесите сюда список из content.js
			"itm_source",
			"utm_campaign",
			"utm_content",
			"utm_id",
			"utm_source",
			"utm_referrer",
			"utm_medium",
			"utm_term",
			"utm_name",
			"fbclid",
			"gclid",
			"ysclid",
			"_hsmi",
			"from"
	]
};

export const EXTENSION_NAME = "UTM Eraser";

export const SETTINGS_KEY = "UTMeraserSettings";

export const CANT_FIND_SETTINGS_MSG = "Can't find the UTMeraser settings. Setup new.";
