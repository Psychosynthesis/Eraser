async function stripTrackingQueryParams() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'get-settings' });
		if (!response || !response.status) { return; }
		const queryParamsForRemove = response.paramsToRemove || [];
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
  } catch (error) {
		console.error('Ошибка при получении настроек расширения:', error);
  }
}

stripTrackingQueryParams();
