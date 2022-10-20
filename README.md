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
For debug extension on Chrome do next steps:  
 1. Menu -> "More Tools" -> Extensions menu
 2. Toggle Developer mode on
 3. Click "Load unpacked"
 4. Click and "Open" on the folder src/chrome

This should stay installed even when exiting/restarting.  
Might get a notification pop up warning you about dev-mode though.

---

### Differences between versions
Please note that Firefox and Chrome versions use different approaches.  

Using "webRequestBlocking" is not compatible with the v.3 manifest because the clowns from chrome team decided to charge money for this functionality - it's only available for "enterprise" add-ons (because it allowed to effectively block ads and, of course, that was unacceptable!). So now we can’t just upload extensions with an old version manifest to Google Store. Therefore, this approach only works in Firefox and we get the need to use different approaches and clumsy code. Big "thanks" to Chrome.  

It is for this reason that the Chrome version, unfortunately, does not actually prevent tracking through tracking parameters, but only cleans the link, which is useful anyway if user who wants to share the address. Perhaps in the future we will figure out what we can do with it.

Even funnier is that Firefox still doesn't allow you to work properly with the third version of the manifest, although it can still be done: the developer preview of Manifest V3 is available since Firefox 101. To test your extensions you need to turn on the MV3 features. To do this, go to about:config and:  
 `Set extensions.manifestV3.enabled to true.`  
 `Set xpinstall.signatures.required to false.`  
