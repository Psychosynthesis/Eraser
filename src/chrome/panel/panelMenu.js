import { readUTMeraserSettings, resetSettings } from '../common/utils.js';
import { defaultSettings, SETTINGS_KEY, CANT_FIND_SETTINGS_MSG } from '../common/constants.js';

function storageChangeHandler(changes, area) {
	if (Object.hasOwn(changes, SETTINGS_KEY)) {
	  const { oldValue, newValue } = changes[SETTINGS_KEY];
	  if (oldValue && (newValue.status !== oldValue.status)) {
		  document.getElementById("eraserCustomRadioItem").className = oldValue.status ?
		  	"eraserCustomRadio" : "eraserCustomRadio checked";
	  }
	}
}

function toggleUTMeraserStatus() {
	readUTMeraserSettings((readedSettings) => {
		chrome.storage.sync.set({
			[SETTINGS_KEY]: { ...readedSettings, status: !readedSettings.status }
		});
	});
}

function onLoad(readedSettings){
	if (!Object.hasOwn(readedSettings, 'status')) {
		console.log(CANT_FIND_SETTINGS_MSG + ' at onLoad');
		resetSettings();
	} else {
		document.getElementById("eraserCustomRadioItem").className = readedSettings.status ?
			"eraserCustomRadio checked" : "eraserCustomRadio";
	}
};

// При открытии попыапе вешаем обработчик на радио
document.getElementById("eraserCustomRadioItem").addEventListener("click", toggleUTMeraserStatus);

// Сохранить новые параметры
document.getElementById('eraserSaveParamsBtn').addEventListener('click', () => {
  const params = document.getElementById('eraserParamsToRemoveList').value
    .split(',')
    .map(p => p.trim())
    .filter(p => p);

  chrome.runtime.sendMessage({ action: 'update-settings', paramsToRemove: params }, () => {
    window.close(); // Закрыть popup после сохранения
  });
});

 // Читаем настройки
readUTMeraserSettings(onLoad);
chrome.storage.onChanged.addListener(storageChangeHandler);

// Загрузить текущие параметры при открытии popup
chrome.runtime.sendMessage({ action: 'get-settings' }, (response) => {
	if (response.paramsToRemove) {
		document.getElementById('eraserParamsToRemoveList').value = response.paramsToRemove.join(', ');
	}
});
