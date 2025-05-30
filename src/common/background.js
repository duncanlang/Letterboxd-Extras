const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    chrome.storage.sync.get('options', (data) => {
        var options = data.options;
        if (options != null && options.hasOwnProperty('console-log') && options['console-log'] == true) {
            console.log(msg.url);
        }
    });

    if (msg.name == "GETDATA") { // Standard call
        fetch(msg.url).then(function (res) {
            if (res.status !== 200) {
                response({ response: null, url: null, status: res.status })
                return;
            }
            res.text().then(function (data) {
                response({ response: data, url: res.url, status: res.status });
            });
        });

    } else if (msg.name == "GETWIKIDATA") { // Wikidata
        fetch(msg.url).then(function (res) {
            if (res.status !== 200) {
                response({ results: null, url: null, status: res.status })
                return;
            }
            res.json().then(function (data) {
                response({ results: data.results, status: res.status });
            });
        });

    } else if (msg.name == "GETALDATA") { // Anilist
        var query = msg.query;
        fetch(msg.url,
            {
                url: msg.url,
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json'
                },
                data: JSON.stringify({
                    query,
                    variables: { id: msg.al_id }
                })
            }
        ).then(function (res) {
            try {
                res.json().then(function (data) {
                    if (data != null) {
                        response({ response: data, url: res.url, status: res.status, errors: data.errors });
                    } else {
                        response({ response: null, url: null, status: res.status })
                    }
                });
            } catch {
                response({ response: null, url: null, status: res.status })
            }
        });
    } else if (msg.name == "GETALDATA2") { // Anilist
        var query = msg.query;
        fetch(msg.url, msg.options).then(function (res) {
            try {
                res.json().then(function (data) {
                    if (data != null) {
                        response({ response: data, url: res.url, status: res.status, errors: data.errors });
                    } else {
                        response({ response: null, url: null, status: res.status })
                    }
                });
            } catch {
                response({ response: null, url: null, status: res.status })
            }
        });
    } else if (msg.name == "GETSENSDATA") { // SensCritique
        var query = msg.query;
        fetch(msg.url, msg.options).then(function (res) {
            try {
                res.json().then(function (data) {
                    if (data != null) {
                        response({ response: data, url: res.url, status: res.status, errors: data.errors });
                    } else {
                        response({ response: null, url: null, status: res.status })
                    }
                });
            } catch {
                response({ response: null, url: null, status: res.status })
            }
        });
    } else if (msg.name == "GETMUBIDATA") { // MUBI
        var query = msg.query;
        fetch(msg.url,
            {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json',
                    'client_country': 'US',
                    'client': 'web'
                }
            }
        ).then(function (res) {
            try {
                res.json().then(function (data) {
                    if (data != null) {
                        response({ response: data, url: res.url, status: res.status, errors: data.errors });
                    } else {
                        response({ response: null, url: null, status: res.status })
                    }
                });
            } catch {
                response({ response: null, url: null, status: res.status })
            }
        });
    } else if (msg.name == "JSON") { // Standard JSON - used for CinemaScore
        fetch(msg.url).then(function (res) {
            if (res.status !== 200) {
                response({ results: null, url: null, status: res.status })
                return;
            }
            res.json().then(function (data) {
                response({ results: data, status: res.status });
            });
        });

    }

    return true;
});

async function registerContentScripts() {
    await chrome.storage.sync.get('options', async (data) => {
        var storedSettings = data.options;
        if (storedSettings != null && storedSettings.hasOwnProperty("google") && storedSettings["google"] === true) {
            const script = {
                id: 'google2letterboxd',
                js: ['google2letterboxd.js'],
                matches: ['https://www.google.com/search*'],
            };
            await chrome.scripting.registerContentScripts([script]).catch(console.error);
        }
    });
}

async function InitDefaultSettings(convert) {
    var options = {};
    if (convert) {
        // Convert from local to sync
        options = await chrome.storage.local.get().then(function (storedSettings) {
            return storedSettings;
        });
        // Clear the (now) unused local storage
        chrome.storage.local.clear();
    } else {
        await chrome.storage.sync.get('options', (data) => {
            console.log(data);
            console.log(data.options);
            console.log(data.options['imdb-enabled']);
            Object.assign(options, data.options);
        });
    }
    if (options == null)
        options = {};

    // TODO something is fucky here

    if (options['imdb-enabled'] != null)
        console.log('background.js | imdb-enabled is not null: ' + options['imdb-enabled']);
    else
        console.log('background.js | imdb-enabled IS null');

    // No more defaults - all settings are disabled
    if (options['imdb-enabled'] == null) options['imdb-enabled'] = false;
    if (options['tomato-enabled'] == null) options['tomato-enabled'] = false;
    if (options['metacritic-enabled'] == null) options['metacritic-enabled'] = false;
    if (options['mal-enabled'] == null) options['mal-enabled'] = false;
    if (options['al-enabled'] == null) options['al-enabled'] = false;
    if (options['cinema-enabled'] == null) options['cinema-enabled'] = false;
    if (options['mpa-enabled'] == null) options['mpa-enabled'] = false;
    if (options['mojo-link-enabled'] == null) options['mojo-link-enabled'] = false;
    if (options['wiki-link-enabled'] == null) options['wiki-link-enabled'] = false;
    if (options['tomato-critic-enabled'] == null) options['tomato-critic-enabled'] = false;
    if (options['tomato-audience-enabled'] == null) options['tomato-audience-enabled'] = false;
    if (options['metacritic-critic-enabled'] == null) options['metacritic-critic-enabled'] = false;
    if (options['metacritic-users-enabled'] == null) options['metacritic-users-enabled'] = false;
    if (options['metacritic-mustsee-enabled'] == null) options['metacritic-mustsee-enabled'] = false;
    if (options['sens-favorites-enabled'] == null) options['sens-favorites-enabled'] = false;
    if (options['allocine-critic-enabled'] == null) options['allocine-critic-enabled'] = false;
    if (options['allocine-users-enabled'] == null) options['allocine-users-enabled'] = false;

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

    if (options["convert-ratings"] === true) {
        options["convert-ratings"] = "5";
    }

    console.log('background.js | saving');
    // Save
    chrome.storage.sync.set({options});
}

chrome.runtime.onStartup.addListener(registerContentScripts);

chrome.runtime.onInstalled.addListener((details) => {
    // Make sure to register content scripts
    registerContentScripts();

    if (details.reason == 'install') {
        // Init the default settings
        InitDefaultSettings(false);
        
        chrome.tabs.create({
            url: "/options.html?type=setup",
            active: true
        });
    }
    else if (details.reason == 'update') {
        var version = parseInt(details.previousVersion.substring(0, 1));
        if (isFirefox && version < 4) {
            // Convert and unit the default settings
            InitDefaultSettings(true);
        } else {
            // Init the default settings
            InitDefaultSettings(false);
        }

    }
    else if (details.reason == 'browser_update' || details.reason == 'chrome_update') {
        // Do nothing
    }
});
