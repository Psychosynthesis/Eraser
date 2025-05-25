export const defaultSettings = {
	status: true
};

export const EXTENSION_NAME = "UTM Eraser";

export const SETTINGS_KEY = "UTMeraserSettings";

export const CANT_FIND_SETTINGS_MSG = "Can't find the UTMeraser settings. Setup new.";

export const DEFAULT_PARAMS_TO_REMOVE = [ // TODO: make configurable
	"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id", "utm_referrer", "utm_name",
	"itm_campaign", "itm_medium", "itm_source",
	"mtm_content", "mtm_keyword","mtm_group","mtm_cid","mtm_medium","mtm_placement","mtm_source","mtm_campaign",
	"otm_source", "otm_medium", "otm_campaign", "otm_content", "otm_term",
	"ga_source", "ga_medium", "ga_campaign", "ga_term", "ga_content", "gclid", "cmpid", "dclid", "_ga", "yclid", "_openstat",
	"fb_action_types", "fb_action_ids", "fb_source", "fb_ref", "fbclid",
	"gs_l", "mkt_tok", "hmb_campaign", "hmb_medium", "hmb_source",
	"mc_eid","mc_cid","mc_tc", "mc_",
	"os_ehash","_gl","__twitter_impression","wt_mc","wtrid","tracking_source","ceneo_spo",
	"__hsfp","__hssc","__hstc","_hsenc","hsCtaTracking","ml_subscriber","ml_subscriber_hash",
	"msclkid","oly_anon_id","oly_enc_id","rb_clickid","s_cid","vero_conv","vero_id", "vn_", "wickedid","twclid",
	"_trksid", "athena", "athAsset", "social_share", "content_source"
];
