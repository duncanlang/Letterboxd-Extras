/* eslint-disable */

const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";


if (isChrome)
    var browser = chrome;

browser.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.name == null) {
        msg.name = "";
    }

    if (msg.name == "GETDATA") { // Standard call
        // Logging
        browser.storage.sync.get('options', (data) => {
            if (data != null) {
                var options = data.options;
                if (options != null && options.hasOwnProperty('console-log') && options['console-log'] == true) {
                    console.log("Letterboxd Extras | " + msg.url);
                }
            }
        });
        if (msg.type == null) {
            msg.type = "";
        }

        var options = null;
        if (msg.options != null)
            options = msg.options;

        if (msg.url.includes('kinopoiskapiunofficial.tech') && msg.options == null) {
            // do not steal pls :(
            var options = {
                method: 'GET',
                headers: {
                    'X-API-KEY': 'd761642c-8182-4167-b8db-cae260ade0db'
                }
            };
        }

        try {
            (async () => {
                // Permission Check
                const hasPermission = await CheckForPermission(msg.url);
                if (!hasPermission) {
                    response({ response: null, url: msg.url, status: 0, errors: [`No permission found matching url: ${msg.url}`] });
                    return;
                }

                let res = await fetch(encodeURI(msg.url), options);

                /*
                // Check for 202 response from IMDb (anti-bot measures)
                if (res.status === 202 && msg.url.includes('imdb.com')) {
                    console.log("HTTP 202 response detected. Triggering warmup...");

                    await warmupImdb(msg.url);

                    console.log("Warmup complete. Retrying fetch...");
                    res = await fetch(encodeURI(msg.url), options);
                    console.log(`Retry returned: ${res.status}`);
                }
                */

                if (res.status !== 200) {
                    let errors = res.errors || null;
                    response({ response: null, url: res.url, status: res.status, errors: errors });
                    return;
                }

                // Handle response
                let resData = (msg.type === "JSON") ? await res.json() : await res.text();
                response({ response: resData, url: res.url, status: res.status });

            })();

            return true;

        } catch (exception) {
            console.error("Fetch Exception:", exception);
            response({ response: null, url: null, status: 0 });
        }

    } else if (msg.name == "RESETSETTINGS") { // Reset saved settings
        return (async () => {
            var options = {};
            await browser.storage.sync.set({ options });
            await InitDefaultSettings();
            return true;
        })();

    } else if (msg.name == "GETPERMISSIONS") { // Get all permissions
        return (async () => {
            var permissions = await browser.permissions.getAll();
            return permissions;
        })();

    } else if (msg.name == "GETDEFAULTRATINGSORDER") {
        (async () => {
            var ratingsOrder = getDefaultRatingsOrder();
            response({ value: ratingsOrder });
        })();
    } else {
        response({ value: "" });
    }

    return true;
});

async function registerContentScripts() {
    await browser.storage.sync.get('options', async (data) => {
        if (data != null) {
            var storedSettings = data.options;
            if (storedSettings != null && storedSettings.hasOwnProperty("google") && storedSettings["google"] === true) {
                const script = {
                    id: 'google2letterboxd',
                    js: ['google2letterboxd.js'],
                    matches: ['https://www.google.com/search*'],
                };

                // Check for existing script
                let existingScripts = await browser.scripting.getRegisteredContentScripts();
                existingScripts = existingScripts.map((script) => script.id);
                if (existingScripts.includes(script.id)){
                    console.log(`Content script: ${script.id} is already registered.`);
                    return;
                }    

                // Register script
                try {
                    await browser.scripting.registerContentScripts([script]).catch(console.error);
                } catch (err) {
                    console.error(`Failed to register content script: ${err}`);
                }
            }
        }
    });
}

// InitDefaultSettings - Run every update/install to make sure all settings are initilized
async function InitDefaultSettings() {
    // Get options from sync
    var options = {};
    const data = await browser.storage.sync.get('options');
    if (data != null && data.options != null) {
        Object.assign(options, data.options);
    }

    if (options == null)
        options = {};

    // mpa-enabled -> content-ratings
    if (options['mpa-enabled'] != null) {
        if (options['mpa-enabled'] === true) {
            options['content-ratings'] = 'mpaa';
        } else {
            options['content-ratings'] = 'none';
        }
        options['mpa-enabled'] = null;
    }

    // Default enabled settings
    if (options['imdb-enabled'] == null) options['imdb-enabled'] = true;
    if (options['tomato-enabled'] == null) options['tomato-enabled'] = true;
    if (options['metacritic-enabled'] == null) options['metacritic-enabled'] = true;
    if (options['mal-enabled'] == null) options['mal-enabled'] = true;
    if (options['al-enabled'] == null) options['al-enabled'] = true;
    if (options['cinema-enabled'] == null) options['cinema-enabled'] = true;
    if (options['mojo-link-enabled'] == null) options['mojo-link-enabled'] = true;
    if (options['wiki-link-enabled'] == null) options['wiki-link-enabled'] = true;
    if (options['tomato-critic-enabled'] == null) options['tomato-critic-enabled'] = true;
    if (options['tomato-audience-enabled'] == null) options['tomato-audience-enabled'] = true;
    if (options['metacritic-critic-enabled'] == null) options['metacritic-critic-enabled'] = true;
    if (options['metacritic-users-enabled'] == null) options['metacritic-users-enabled'] = true;
    if (options['metacritic-mustsee-enabled'] == null) options['metacritic-mustsee-enabled'] = true;
    if (options['sens-favorites-enabled'] == null) options['sens-favorites-enabled'] = true;
    if (options['allocine-critic-enabled'] == null) options['allocine-critic-enabled'] = true;
    if (options['allocine-users-enabled'] == null) options['allocine-users-enabled'] = true;
    if (options['content-ratings'] == null) options['content-ratings'] = 'mpaa';
    if (options['criterion-link-enabled'] == null) options['criterion-link-enabled'] = true;
    if (options['bluray-link-enabled'] == null) options['bluray-link-enabled'] = true;
    if (options['ebert-link-enabled'] == null) options['ebert-link-enabled'] = true;

    // Default disabled settings
    if (options['rt-default-view'] == null) options['rt-default-view'] = "hide";
    if (options['critic-default'] == null) options['critic-default'] = "all";
    if (options['audience-default'] == null) options['audience-default'] = "all";
    if (options['meta-default-view'] == null) options['meta-default-view'] = "hide";
    if (options['senscritique-enabled'] == null) options['senscritique-enabled'] = false;
    if (options['mubi-enabled'] == null) options['mubi-enabled'] = false;
    if (options['douban-enabled'] == null) options['douban-enabled'] = false;
    if (options['filmaff-enabled'] == null) options['filmaff-enabled'] = false;
    if (options['simkl-enabled'] == null) options['simkl-enabled'] = false;
    if (options['allocine-enabled'] == null) options['allocine-enabled'] = false;
    if (options['allocine-default-view'] == null) options['allocine-default-view'] = "user";
    if (options['search-redirect'] == null) options['search-redirect'] = false;
    if (options['tspdt-enabled'] == null) options['tspdt-enabled'] = false;
    if (options['bfi-enabled'] == null) options['bfi-enabled'] = false;
    if (options['convert-ratings'] == null) options['convert-ratings'] = "false";
    if (options['mpa-convert'] == null) options['mpa-convert'] = false;
    if (options['open-same-tab'] == null) options['open-same-tab'] = false;
    if (options['replace-fans'] == null) options['replace-fans'] = "false";
    if (options['tooltip-show-details'] == null) options['tooltip-show-details'] = false;
    if (options['google'] == null) options['google'] = false;
    if (options['boxoffice-enabled'] == null) options['boxoffice-enabled'] = false;
    if (options['ddd-enabled'] == null) options['ddd-enabled'] = false;
    if (options['ddd-apikey'] == null) options['ddd-apikey'] = '';
    if (options['kinopoisk-enabled'] == null) options['kinopoisk-enabled'] = false;
    if (options['kinopoisk-apikey'] == null) options['kinopoisk-apikey'] = '';
    if (options['filmarks-enabled'] == null) options['filmarks-enabled'] = false;
    if (options['hide-ratings-enabled'] == null) options['hide-ratings-enabled'] = 'unchanged';
    if (options['hide-reviews-enabled'] == null) options['hide-reviews-enabled'] = 'false';
    if (options['criterion-spine-default-view'] == null) options['criterion-spine-default-view'] = 'Row';

    if (options['hide-ratings-enabled'] === 'false' || options['hide-ratings-enabled'] === false) {
        options['hide-ratings-enabled'] = 'unchanged';
    }

    if (options["convert-ratings"] === true) {
        options["convert-ratings"] = "5";
    }

    if (options["override-ratings-order"] == null) options["override-ratings-order"] = false;

    if (options["override-ratings-order"] === false || options["ratings-order"] == null) {
        options["ratings-order"] = getDefaultRatingsOrder();
    } else {
        options["ratings-order"] = UpdateRatingsOrder(options["ratings-order"]);
    }

    // Save
    await browser.storage.sync.set({ options });
}

function getDefaultRatingsOrder() {
    var defaultOrder = [
        'imdb-ratings',
        'mal-ratings',
        'anilist-ratings',
        'allocine-ratings',
        'tomato-ratings',
        'meta-ratings',
        'sens-ratings',
        'mubi-ratings',
        'filmaff-ratings',
        'simkl-ratings',
        'kinopoisk-ratings',
        'filmarks-ratings',
        'douban-ratings',
        'cinemascore'
    ];

    return defaultOrder;
}

function UpdateRatingsOrder(currentOrder) {
    if (currentOrder == null)
        currentOrder = [];

    var defaultOrder = getDefaultRatingsOrder();

    for (var i = 0; i < defaultOrder.length; i++) {
        if (!currentOrder.includes(defaultOrder[i])) {
            currentOrder.push(defaultOrder[i]);
        }
    }

    return currentOrder;
}

async function InitLocalStorage() {
    // Get options from sync
    var options = {};
    const data = await browser.storage.local.get('options');
    if (data != null && data.options != null) {
        Object.assign(options, data.options);
    }

    if (options['hide-lost-films'] == null) options['hide-lost-films'] = 'show';

    // Save
    await browser.storage.local.set({ options });
}

// Convert storage.local to storage.sync (Firefox)
async function ConvertLocalToSync() {
    // Get from local
    var options = await browser.storage.local.get().then(function (storedSettings) {
        return storedSettings;
    });

    // Clear the (now) unused local storage
    await browser.storage.local.clear();

    // Save
    await browser.storage.sync.set({ options });
}

browser.runtime.onStartup.addListener(registerContentScripts);

browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason == 'install') {
        // Init the default settings
        await InitDefaultSettings();
        await InitLocalStorage();
    }
    else if (details.reason == 'update') {
        // Convert from previous versions
        var version = details.previousVersion.split('.');

        if (parseInt(version[0]) == 3 && parseInt(version[1]) < 16 && isFirefox) {
            await ConvertLocalToSync();
        }

        // Init default settings
        await InitDefaultSettings();
        await InitLocalStorage();
    }
    else if (details.reason == 'browser_update' || details.reason == 'chrome_update') {
        // Do nothing
    }

    // Make sure to register content scripts
    registerContentScripts();
});

async function CheckForPermission(url) {
    // Wrap chrome API in a Promise
    const perms = await new Promise(resolve => {
        chrome.permissions.getAll(resolve);
    });

    // Loop through granted origins and check against the given URL
    for (const pattern of perms.origins) {
        try {
            const urlPattern = new URLPattern({
                protocol: pattern.split("://")[0],
                hostname: pattern.split("://")[1].split("/")[0],
                pathname: pattern.split("/").slice(3).join("/") || "*"
            });

            if (urlPattern.test(url)) {
                return true;
            }
        } catch (e) {
            console.warn("Invalid pattern in permissions:", pattern, e);
        }
    }

    return false;
}

/*
async function warmupImdb(url) {
    if (isFirefox) {
        // In Manifest V2, we can just create an iframe in the background script
        await createIframeForImdb();
    }
    else {
        // In Manifest V3, we have to use an offscreen document which will create the iframe

        await setupOffscreenDocument();

        return new Promise((resolve) => {
            // A one-time listener for the completion message
            const listener = (message) => {
                if (message.name === 'warmup-complete') {
                    console.log('received warmup-complete message');
                    chrome.runtime.onMessage.removeListener(listener);
                    resolve();
                }
            };

            chrome.runtime.onMessage.addListener(listener);

            // Trigger the warmup
            chrome.runtime.sendMessage({
                target: 'offscreen',
                name: 'warmup-imdb',
                url: url
            }).catch(err => {
                // Catching the "message channel closed" error here prevents the crash
                // This often happens if the offscreen doc was already busy
                console.debug("Note: Initial message sent, awaiting listener response.");
            });
        });
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Firefox only
async function createIframeForImdb() {
    if (document.querySelector('#imdb-iframe')) {
        document.body.removeChild(document.querySelector('#imdb-iframe'));
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'imdb-iframe';
    iframe.src = 'https://www.imdb.com';
    document.body.append(iframe);

    await awaitIframeLoad(iframe);
}

const awaitIframeLoad = (iframe) => {
    return new Promise((resolve) => {
        iframe.onload = () => {
            resolve(iframe);
        };
    });
};

// Chrome Only
let creating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument() {
    let path = 'offscreen.html';
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
        return;
    }

    // create offscreen document
    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: ['DOM_PARSER'],
            justification: 'To handle WAF challenges and session priming',
        });
        await creating;
        creating = null;
    }
}

const IMDB_RULE_ID = 1;
async function setupImdbRules() {
    const extensionId = chrome.runtime.id;

    const rules = [
        {
            id: IMDB_RULE_ID,
            priority: 1,
            action: {
                type: "modifyHeaders",
                requestHeaders: [
                    { header: "Referer", operation: "set", value: "https://www.imdb.com/" }
                ],
                responseHeaders: [
                    { header: 'X-Frame-Options', operation: 'remove' },
                    { header: 'Frame-Options', operation: 'remove' },
                    // Uncomment the following line to suppress `frame-ancestors` error
                    {header: 'Content-Security-Policy', operation: 'remove'},
                ],
            },
            condition: {
                urlFilter: "imdb.com",
                initiatorDomains: [extensionId],
                resourceTypes: ["xmlhttprequest"] // fetch calls are categorized as this
            }
        }
    ];

    // First, clear any old rules with this ID, then add the new one
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [IMDB_RULE_ID],
        addRules: rules
    });

    console.log("IMDb Spoofing Rule Active");
}

// Run this when the extension installs or starts up
chrome.runtime.onInstalled.addListener(setupImdbRules);
chrome.runtime.onStartup.addListener(setupImdbRules);
*/