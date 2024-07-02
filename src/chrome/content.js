const queryParamsForRemove = [ // TODO: make configurable
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
	"_hsmi"
];

function stripTrackingQueryParams() {
	chrome.runtime.sendMessage('get-settings', (response) => { // Получение настроек расширения из service_worker'а
	  if (!response.status) {
		  return;
	  }

	  let requestedUrl = new URL(window.location.href);
	  let match = false;

	  queryParamsForRemove.forEach(name => {
		  if (requestedUrl.searchParams.has(name)) {
			  requestedUrl.searchParams.delete(name);
			  match = true;
		  }
	  });

	  if (match) {
		  history.replaceState(history.state, '', requestedUrl.href);
	  }
	});
}

stripTrackingQueryParams();
