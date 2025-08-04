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

    // Make Fetch
    if (msg.name == "GETDATA") { // Standard call
        var options = null;
        if (msg.options != null)
            options = msg.options;

        try {
            fetch(msg.url, options).then(async function (res) {
                var errors = null;
                if (res.status !== 200) {
                    if (res.errors != null)
                        errors = res.errors;
                    
                    response({ response: null, url: null, status: res.status, errors: errors })
                    return;
                }
                
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
        } catch {
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

    if (options['imdb-enabled'] == null) options['imdb-enabled'] = true;
    if (options['tomato-enabled'] == null) options['tomato-enabled'] = true;
    if (options['metacritic-enabled'] == null) options['metacritic-enabled'] = true;
    if (options['mal-enabled'] == null) options['mal-enabled'] = true;
    if (options['al-enabled'] == null) options['al-enabled'] = true;
    if (options['cinema-enabled'] == null) options['cinema-enabled'] = true;
    if (options['mpa-enabled'] == null) options['mpa-enabled'] = true;
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

    if (options["convert-ratings"] === true) {
        options["convert-ratings"] = "5";
    }

    // Save
    await browser.storage.sync.set({ options });
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
    }
    else if (details.reason == 'update') {
        // Convert from previous versions
        var version = details.previousVersion.split('.');

        if (parseInt(version[1]) < 16 && isFirefox) {
            await ConvertLocalToSync();
        }

        // Init default settings
        await InitDefaultSettings();
    }
    else if (details.reason == 'browser_update' || details.reason == 'chrome_update') {
        // Do nothing
    }

    // Make sure to register content scripts
    registerContentScripts();
});