import { apiInterface, readUTMeraserSettings } from '../common/utils.js';
import { defaultSettings, SETTINGS_KEY } from '../common/constants.js';

function storageChangeHandler(changes, area) {
	if (Object.hasOwn(changes, SETTINGS_KEY)) {
	  const { oldValue, newValue } = changes[SETTINGS_KEY];
	  if (oldValue && (newValue.status !== oldValue.status)) {
		  document.getElementById("eraserCustomRadioItem").className = oldValue.status ? "eraserCustomRadio" : "eraserCustomRadio checked";
	  }
	}
}

function toggleUTMeraserSettings() {
	readUTMeraserSettings((readedSettings) => {
		if (!Object.hasOwn(readedSettings, SETTINGS_KEY)) {
			console.log("Can't find the settings, setup new.");
			browser.storage.sync.set({ [SETTINGS_KEY]: defaultSettings });
		} else {
			browser.storage.sync.set({
				[SETTINGS_KEY]: {
					...readedSettings[SETTINGS_KEY],
					status: !readedSettings[SETTINGS_KEY].status,
				}
			});
		}
	});
}

function onLoad(readedSettings){
	if (!Object.hasOwn(readedSettings, SETTINGS_KEY)) {
		console.log("Can't find the settings, setup new.");
		browser.storage.sync.set({ [SETTINGS_KEY]: defaultSettings });
	} else {
		if (readedSettings[SETTINGS_KEY].status) {
			document.getElementById("eraserCustomRadioItem").className = "eraserCustomRadio checked";
		}
	}
};

// При открытии попыапе вешаем обработчик на радио
document.getElementById("eraserCustomRadioItem").addEventListener("click", toggleUTMeraserSettings);
 // Читаем настройки
readUTMeraserSettings(onLoad);
apiInterface.storage.onChanged.addListener(storageChangeHandler);
