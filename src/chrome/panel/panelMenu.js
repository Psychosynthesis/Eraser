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
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up radio button handler
    document.getElementById("eraserCustomRadioItem").addEventListener("click", toggleUTMeraserStatus);
    
    // Read initial settings
    readUTMeraserSettings(onLoad);
    
    // Listen for storage changes
    chrome.storage.onChanged.addListener(storageChangeHandler);
});

// Сохранить новые параметры


// Загрузить текущие параметры при открытии popup
