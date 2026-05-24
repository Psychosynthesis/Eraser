<h1>
    <p align="center">Tracking URL Params Remover</p>
</h1>

![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FPsychosynthesis%2FEraser%2Fmain%2Fsrc%2Ffirefox%2Fmanifest.json&query=%24.version&style=flat&logo=firefox&label=Firefox%20Addon) &nbsp; &nbsp; ![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FPsychosynthesis%2FEraser%2Fmain%2Fsrc%2Fchrome%2Fmanifest.json&query=%24.version&style=flat&logo=Google%20Chrome&logoColor=%2321ff21&label=Chrome%20Addon&color=%234d94d5) &nbsp; &nbsp;
[<img src="https://badgen.net/badge/♥/Donate/red?icon=heart" alt="Donation page">](https://github.com/Psychosynthesis/Donation)

### About
  This is browser extension for removing a lot of tracking query params (`itm_*`, `utm_*`, `fbcli`, `gclid`, `ysclid`, ...and so on.) from URLs before they load.
  The editable default list of blocked parameters is stored in the shared constants file:
  - https://github.com/Psychosynthesis/Eraser/blob/main/src/shared/constants.js#L1

  Users can edit this full list in the popup or save a separate full list for the current domain.

---

### Debugging
 For debugging, you need to install extensions directly from the file.

 To do this, type in the address bar: `about:debugging#/runtime/this-firefox`

 Sometimes it is necessary to install an unsigned update from a compiled file. For this go to `about:config` тype in search `xpinstall.signatures.required` and set to `false`.

 In the current session, you will be able to install unsigned extensions until you restart firefox.

 For build extensions run `bash build.sh` from the main directory of this repository. Or just manually pack the files in the directory corresponding to the browser into a zip archive (for Firefox you need to change its extension to `.xpi`).

Shared constants and settings helpers live in `src/shared/constants.js`, `src/shared/settings.js`, and `src/shared/settingsUtils.js`. During `bash build.sh`, they are copied into each browser package as `common/constants.js`, `common/settings.js`, and `common/settingsUtils.js` before zipping and removed again after the archives are created, so generated browser-local copies should not be committed. For unpacked debugging from `src/chrome` or `src/firefox`, run `bash build.sh --keep-shared` first to leave those temporary copies in place.

---

### Firefox installation
Available on addons.mozilla.org: https://addons.mozilla.org/ru/firefox/addon/utm-eraser

---

### Chrome / Chromium installation
Available on Chrome Store: https://chrome.google.com/webstore/detail/utm-eraser

For debug extension on Chrome do next steps:  
 1. Run `bash build.sh --keep-shared` from the repository root
 2. Menu -> "More Tools" -> Extensions menu
 3. Toggle Developer mode on
 4. Click "Load unpacked"
 5. Click and "Open" on the folder src/chrome

This should stay installed even when exiting/restarting.  
Might get a notification pop up warning you about dev-mode though.

---

### Differences between versions
Please note that Firefox and Chrome versions use different approaches.  

Using "webRequestBlocking" is not compatible with the v.3 manifest because the geniuses from Chrome team decided to charge money for this functionality — it's only available for "enterprise" add-ons (because it allowed to effectively block ads and, of course, that was unacceptable!). Therefore, the Chrome version uses dynamic `declarativeNetRequest` rules generated from the user's editable parameter list. Firefox still uses `webRequestBlocking`, so both versions can apply the selected full list before the page load, but through different APIs.

Old versions of Firefox (for old OS) doesn't allow you to work properly with the third version of the manifest, although it can still be done: the developer preview of Manifest V3 is available since Firefox 101. To test your extensions you need to turn on the MV3 features. To do this, go to `about:config` and: \
 `Set extensions.manifestV3.enabled to true.`  
 `Set xpinstall.signatures.required to false.`  


### TODO
 - Check Firefox Mobile Extensions API for compatibility
 - Check is re-export of `normalizeUTMeraserSettings` from `sharedUtils` is necessary. It looks like some kind of artifact, but I've already forgotten why I did it...
