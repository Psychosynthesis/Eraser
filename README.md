## Tracking URL Params Remover
This is browser extension for removing a lot of tracking query params from URLs before they load.

For now, the full list of query params that get stripped out of URLs are:
 - "utm_campaign"
 - "utm_content"
 - "utm_id"
 - "utm_source"
 - "utm_medium"
 - "utm_term"
 - "utm_name"
 - "fbclid"
 - "gclid"

---

### Debugging
For debugging, you need to install extensions directly from the file.

To do this, type in the address bar: `about:debugging#/runtime/this-firefox`

Sometimes it is necessary to install an unsigned update from a compiled file. For this go to `about:config` тype in search `xpinstall.signatures.required` and set to `false`.

In the current session, you will be able to install unsigned extensions until you restart firefox.

For build extensions run `bash build.sh` from the main directory of this repository.

---

### Firefox installation
Available on addons.mozilla.org: https://addons.mozilla.org/ru/firefox/addon/utm-eraser/

---

### Chrome / Chromium installation
1. Menu -> "More Tools" -> Extensions menu
2. Toggle Developer mode on
3. Click "Load unpacked"
4. Click and "Open" on the folder of the add-on you want to install in dev mode

This should stay installed even when exiting/restarting.
Might get a notification pop up warning you about dev-mode though.
Going to look into getting this on the Chrome store soon.
