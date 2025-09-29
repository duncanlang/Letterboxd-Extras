const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";


if (isChrome)
    var browser = chrome;

browser.runtime.onMessage.addListener((msg, sender, response) => {
    // Logging
    browser.storage.sync.get('options', (data) => {
        if (data != null){
            var options = data.options;
            if (options != null && options.hasOwnProperty('console-log') && options['console-log'] == true) {
                console.log("Letterboxd Extras | " + msg.url);
            }
        }
    });

    if (msg.type == null){
        msg.type = "";
    }

    if (msg.name == "GETDATA") { // Standard call
        var options = null;
        if (msg.options != null)
            options = msg.options;

        if (msg.url.includes('kinopoiskapiunofficial.tech') && msg.options == null){
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
                // Check for permission before call
                if (await CheckForPermission(msg.url)){
                    fetch(encodeURI(msg.url), options).then(async function (res) {
                        var errors = null;

                        // Check for errors
                        if (res.status !== 200) {
                            if (res.errors != null)
                                errors = res.errors;
                            
                            response({ response: null, url: null, status: res.status, errors: errors })
                            return;
                        }
                        
                        // Get response body
                        var resData = null;
                        if (msg.type == "JSON"){
                            await res.json().then(function (data) {
                                resData = data;
                            });
                        }else{
                            await res.text().then(function (data) {
                                resData = data;
                            });
                        }

                        response({ response: resData, url: res.url, status: res.status });
                    });
                }else{
                    response({ response: null, url: msg.url, status: 0, errors: ["No permission found matching url: " + msg.url] });
                }
            })();
        } catch (exception){
            response({ response: null, url: null, status: 0 })
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
    }

    return true;
});

async function registerContentScripts() {
    await browser.storage.sync.get('options', async (data) => {
        if (data != null){
            var storedSettings = data.options;
            if (storedSettings != null && storedSettings.hasOwnProperty("google") && storedSettings["google"] === true) {
                const script = {
                    id: 'google2letterboxd',
                    js: ['google2letterboxd.js'],
                    matches: ['https://www.google.com/search*'],
                };
                await browser.scripting.registerContentScripts([script]).catch(console.error);
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
    if (options['mpa-enabled'] != null){
        if (options['mpa-enabled'] === true){
            options['content-ratings'] = 'mpaa';
        }else{
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

    // Default disabled settings
    if (options['rt-default-view'] == null) options['rt-default-view'] = "hide";
    if (options['critic-default'] == null) options['critic-default'] = "all";
    if (options['audience-default'] == null) options['audience-default'] = "all";
    if (options['meta-default-view'] == null) options['meta-default-view'] = "hide";
    if (options['senscritique-enabled'] == null) options['senscritique-enabled'] = false;
    if (options['mubi-enabled'] == null) options['mubi-enabled'] = false;
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
    if (options['hide-ratings-enabled'] == null) options['hide-ratings-enabled'] = false;
    if (options['tooltip-show-details'] == null) options['tooltip-show-details'] = false;
    if (options['google'] == null) options['google'] = false;
    if (options['boxoffice-enabled'] == null) options['boxoffice-enabled'] = false;
    if (options['ddd-enabled'] == null) options['ddd-enabled'] = false;
    if (options['ddd-apikey'] == null) options['ddd-apikey'] = '';
    if (options['kinopoisk-enabled'] == null) options['kinopoisk-enabled'] = false;
    if (options['kinopoisk-apikey'] == null) options['kinopoisk-apikey'] = '';
    if (options['filmarks-enabled'] == null) options['filmarks-enabled'] = false;

    if (options["convert-ratings"] === true) {
        options["convert-ratings"] = "5";
    }


    // Save
    await browser.storage.sync.set({ options });
}

async function InitLocalStorage(){
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
