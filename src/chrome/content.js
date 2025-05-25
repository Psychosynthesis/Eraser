async function stripTrackingQueryParams() {
  let response = false;
  try {
    response = await chrome.runtime.sendMessage({ action: 'get-settings' });
  } catch (error) {
    console.error('Error on send message:', error, 'Is extension enabled?');
  }

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
}

stripTrackingQueryParams();
