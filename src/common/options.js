const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
document.body.classList.add(isFirefox ? "firefox" : "chrome");

let mandatoryPermissions = { origins: ['https://letterboxd.com/*', 'https://query.wikidata.org/*'] };
let recommendedPermisions = { origins: ['https://*.imdb.com/*', 'https://www.rottentomatoes.com/*', 'https://www.boxofficemojo.com/*', 'https://webapp.cinemascore.com/*', 'https://www.metacritic.com/*', 'https://api.jikan.moe/*', 'https://graphql.anilist.co/*'] };

let isAndroid = (navigator.userAgent.includes('Android'));
let isPopup = window.location.search.includes('type=action');
let isSetup = window.location.search.includes('type=setup');
let isAddonManager = window.location.search.includes('type=embed');

if ((isAndroid || isPopup) && isFirefox)
    AndroidImportReplacer();

if (isAddonManager)
    document.querySelector('.logo-holder').setAttribute("style", "display:none;");

var options = {};

var missingHostPermissions = [];
var missingContentScripts = [];

if (isChrome)
    document.querySelector('#wiki-link-div').setAttribute("style", "display:none;");

if (isSetup)
    InitSetup();

// On change, save
document.addEventListener('change', event => {
    var permission = event.target.getAttribute('permission');

    if (permission != null && permission != "") {
        var permission = { origins: [permission] };
        if (event.target.getAttribute("permissionBrowser") != null) {
            permission = { origins: [event.target.getAttribute('permission')], permissions: [event.target.getAttribute("permissionBrowser")] };
        }
        if (event.target.checked == true) {
            // Request the permission
            chrome.permissions.request(permission, (granted) => {
                if (granted) {
                    options[event.target.id] = event.target.checked;

                    save();

                    if (event.target.getAttribute('contentScript') != null) {
                        registerContentScript(event.target);
                    }
                } else {
                    event.target.checked = false;
                }
                checkSubIDToDisable(event.target);
            });
        } else {
            // Remove the permission
            chrome.permissions.remove(permission, (removed) => {
                if (removed) {
                    options[event.target.id] = event.target.checked;
                    save();
                } else {
                    event.target.checked = true;
                }
                checkSubIDToDisable(event.target);
            });

            if (event.target.getAttribute('contentScript') != null) {
                registerContentScript(event.target);
            }
        }
    } else if (event.target.id == "importpicker") {
        validateImportButton();
    } else {
        switch (event.target.type) {
            case ('checkbox'):
                options[event.target.id] = event.target.checked;
                break;
            default:
                options[event.target.id] = event.target.value;
                break;
        }
        checkSubIDToDisable(event.target);

        save();
    }
});
// Save:
function save() {
    chrome.storage.sync.set({ options });
}

function checkSubIDToDisable(element) {
    if (element.getAttribute("subid") != null) {
        var target = document.querySelector("#" + element.getAttribute("subid"));
        var targetValue = element.getAttribute("subidvalue");

        if (targetValue != null) {
            if (element.value == targetValue) {
                target.className = target.className.replace("disabled", "").trim();
            } else if (!target.className.includes('disabled')) {
                target.className += " disabled";
            }
        } else {
            if (element.checked) {
                target.className = target.className.replace("disabled", "").trim();
            } else if (!target.className.includes('disabled')) {
                target.className += " disabled";
            }
        }
    }
}

async function requestPermission(event) {
    // Get the element that has the permission
    var permissionTarget = document.querySelector("#" + event.target.getAttribute("permissionTarget"));
    // Make sure it has the permission
    if (permissionTarget.getAttribute("permission") != null) {
        // Get the permission from the element that has it
        var permission = permissionTarget.getAttribute("permission");
        let permissionsToRequest = { origins: [permission] };

        // Request the permission
        const response = await chrome.permissions.request(permissionsToRequest);
        if (response == true) {
            event.target.parentNode.setAttribute("style", "display:none;");
        }
    }
}

async function registerContentScript(target) {
    var id = target.getAttribute('contentScriptID');
    var js = target.getAttribute('contentScript');
    var match = target.getAttribute('permission');

    var failed = false;

    if (target.checked) {
        // Register
        const script = {
            id: id,
            js: [js],
            matches: [match],
        };

        try {
            const scripts = await chrome.scripting.getRegisteredContentScripts();
            const scriptIds = scripts.map(script => script.id);
            if (!scriptIds.includes(id)) {
                await chrome.scripting.registerContentScripts([script]);
            }
        } catch (err) {
            console.error(`failed to register content scripts: ${err}`);
            failed = true;
        }

        var request = target.parentNode.parentNode.querySelector('.div-request-contentscript');
        if (request != null) {
            request.setAttribute("style", "display:none;");
        }
    } else {
        // Unregister
        try {
            await chrome.scripting.unregisterContentScripts({
                ids: [id],
            });
        } catch (err) {
            console.error(`failed to unregister content scripts: ${err}`);
            return false;
        }
    }

    if (failed) {
        target.checked = false;
        options[target.id] = target.checked;
        save();
    }

    return true;
}

async function requestMandatoryPermissions() {
    const response = await chrome.permissions.request(mandatoryPermissions);
    if (response) {
        let div = document.getElementById('mandatory-permissions-div');
        div.setAttribute("style", "display:none;");
    }
}

async function requestRecommendedOptions() {
    const response = await chrome.permissions.request(recommendedPermisions);
    if (response) {
        let div = document.getElementById('recommended-options-div');
        div.setAttribute("style", "display:none;");

        options['imdb-enabled'] = true;
        options['tomato-enabled'] = true;
        options['metacritic-enabled'] = true;
        options['mal-enabled'] = true;
        options['al-enabled'] = true;
        options['cinema-enabled'] = true;
        options['mpa-enabled'] = true;
        options['mojo-link-enabled'] = true;
        options['tomato-critic-enabled'] = true;
        options['tomato-audience-enabled'] = true;
        options['metacritic-critic-enabled'] = true;
        options['metacritic-users-enabled'] = true;
        options['metacritic-mustsee-enabled'] = true;
        options['sens-favorites-enabled'] = true;
        options['allocine-critic-enabled'] = true;
        options['allocine-users-enabled'] = true;
        if (isFirefox)
            options['wiki-link-enabled'] = true;

        save();
        set();
    }
}

// On load, load
document.addEventListener('DOMContentLoaded', event => {
    load();
    validateImportButton();
});
// Load
async function load() {
    // Assign the object
    const data = await chrome.storage.sync.get('options');
    if (data != null && data.options != null) {
        Object.assign(options, data.options);
        // Set the settings
        set();
    }
}

async function set() {
    // Set the settings
    var elements = document.querySelectorAll('.setting');
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        var key = element.id;
        if (options.hasOwnProperty(key)) {
            switch (element.type) {
                case ('checkbox'):
                    element.checked = options[key];
                    break;
                default:
                    element.value = options[key];
                    break;
            }

            if (element.getAttribute("permission") != null) {
                await checkPermission(element);
            }
        }
        checkSubIDToDisable(element);
    }

    ValidateRequestAllVisiblity();
}

async function checkPermission(element) {
    // Check for Permissions
    let permission = element.getAttribute("permission");
    let permissionsToRequest = { origins: [permission] };
    var response = await chrome.permissions.contains(permissionsToRequest);

    var div = element.parentNode.parentNode.querySelector(".div-request-permission");
    if (div != null) {
        if (response == false && element.checked == true) {
            // Permission does NOT exist and setting is enabled
            div.setAttribute("style", "display:block;");

            if (!missingHostPermissions.includes(permission)) { // add to array
                missingHostPermissions.push(permission);
            }
        } else {
            div.setAttribute("style", "display:none;");

            if (missingHostPermissions.includes(permission)) {  // remove from array
                missingHostPermissions.splice(missingHostPermissions.indexOf(permission), 1);
            }
        }
    }

    // Check for content scripts
    let js = element.getAttribute("contentScript");
    let id = element.getAttribute("contentScriptID");
    if (js != null && id != null) {
        let scripts = await chrome.scripting.getRegisteredContentScripts();
        scripts = scripts.map((script) => script.id);
        response = (scripts.includes(id));

        div = element.parentNode.parentNode.querySelector(".div-request-contentscript");
        if (div != null) {
            if (response == false && element.checked == true) {
                // Permission does NOT exist and setting is enabled
                div.setAttribute("style", "display:block;");

                if (!missingContentScripts.some(obj => obj.id === id)) { // add to array
                    missingContentScripts.push({ id: id, js: [js], matches: [element.getAttribute("permission")] });
                }
            } else {
                div.setAttribute("style", "display:none;");

                const script = missingContentScripts.find(obj => obj.id == id);
                if (script != null) { // remove from array
                    missingContentScripts.splice(missingContentScripts.indexOf(script), 1);
                }
            }
        }
    }
}

// Request permission if missing
document.addEventListener('click', event => {
    if (event.target.getAttribute("class") != null && event.target.getAttribute("class") == "request-permission" && event.target.getAttribute("permissionTarget") != null) {
        requestPermission(event);
    }
    if (event.target.getAttribute("class") != null && event.target.getAttribute("class") == "request-contentscript" && event.target.getAttribute("permissionTarget") != null) {
        var target = document.querySelector("#" + event.target.getAttribute("permissionTarget"));
        registerContentScript(target);
    }

    if (event.target.id == 'mandatory-permissions') {
        requestMandatoryPermissions();
    }
    else if (event.target.id == 'recommended-options') {
        requestRecommendedOptions();
    }

    switch (event.target.id) {
        case "export":
            exportSettings();
            break;
        case "import":
            importSettings();
            break;
        case "reset":
            resetSettings();
            break;
        case "importbutton":
            OpenImportTab();
            break;
        case "requestall":
            RequestAllMissingPermissions();
            break;
    }
});

function validateImportButton() {
    const importPicker = document.querySelector("#importpicker");
    const importButton = document.querySelector("#import");

    importButton.disabled = (importPicker.value == "");
}

async function exportSettings() {
    // Create JSON
    var settings = await chrome.storage.sync.get().then(function (storedSettings) {
        return storedSettings.options;
    });

    const userdata = {
        timeStamp: Date.now(),
        version: chrome.runtime.getManifest().version,
        settings: settings
    }

    const timeOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };

    var url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(userdata, null, '  '));
    var date = (new Date).toLocaleDateString('ja-JP', timeOptions);
    var filename = 'letterboxd-extras-backup-' + date + '.json';

    // Download
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename || '');
    a.setAttribute('type', 'text/plain');
    a.dispatchEvent(new MouseEvent('click'));
}

async function importSettings() {
    const importPicker = document.querySelector("#importpicker");

    // Make sure file is selected
    if (importPicker.files.length == 0) {
        window.alert("No file selected.")
        return;
    }

    // Get file and read the contents
    const selectedFile = importPicker.files[0];
    const content = await readFileAsText(selectedFile);

    var json;
    var error = "";
    try {
        json = JSON.parse(content);
    } catch (err) {
        error = "File is not valid JSON."
    }

    if (json != null) {
        // Validate file contents
        if (json.timeStamp == null || json.version == null || json.settings == null) {
            error = "File is not a valid Letterboxd Extras backup."
        }
        if (json.version != null && versionCompare(json.version, chrome.runtime.getManifest().version, { lexicographical: false, zeroExtend: true }) > 0) {
            error = "Backup is from a newer version (" + json.version + ") than the current add-on (" + chrome.runtime.getManifest().version + "). Please update before importing settings."
        }
    }

    if (error != "") {
        window.alert("Invalid file: " + error + "\n\nThe import could not be completed");
        return;
    }

    // Read timestamp from file
    const date = (new Date(json.timeStamp)).toLocaleDateString(window.navigator.language);

    // Confirmation Popup
    if (!window.confirm("Your settings will be overwritten with data backed up on " + date + ".\n\nOverwrite all settings with data from file?")) {
        return;
    }

    options = json.settings;
    set();
    save();

    window.alert("Your settings have been restored from file")

    if (window.location.href.endsWith('restore.html')) {
        chrome.tabs.create({
            url: "/options.html",
            active: true
        });

        window.close();
    }
}

async function resetSettings() {
    // Confirmation Popup
    if (!window.confirm("Your settings will be reset.\n\nReset all settings to default?")) {
        return;
    }

    options = {};
    initDefaultSettings();
    save();
    set();
}

async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            resolve(e.target.result); // Resolve the promise with file content
        };

        reader.onerror = function (e) {
            reject(e); // Reject the promise if an error occurs
        };

        reader.readAsText(file);
    });
}

// https://gist.github.com/TheDistantSea/8021359
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

async function OpenImportTab() {
    let permissionsToRequest = { permissions: ['tabs'] };
    const response = await chrome.permissions.request(permissionsToRequest);
    if (response == true) {
        chrome.tabs.create({
            url: "/restore.html",
            active: true
        });
        window.close();
    }
}

// Make a link to the android replacer page
// For some reason, FF on android has a bug where the filepicker does not work in the options_ui
// So we have a separate page where we want the android users to use instead
function AndroidImportReplacer() {
    if (document.URL.endsWith('restore.html'))
        return;

    const importDesktop = document.getElementById("importdivdesktop");
    importDesktop.style.display = 'none';

    const importAndroid = document.getElementById("importdivandroid");
    importAndroid.style.display = '';

    // Show the tab permission reminder
    browser.permissions.contains({ permissions: ['tabs'] }).then((value) => {
        let reminder = document.getElementById('tabpermissionreminder');

        if (reminder != null) {
            if (isAndroid == false && value == false) {
                reminder.style.display = '';
            } else {
                reminder.style.display = 'none';
            }
        }
    });
}

function ValidateRequestAllVisiblity() {
    const requestButton = document.getElementById('requestall');
    const permissionWarning = document.getElementById('permission-warning');
    const permissionNotice = document.getElementById('permission-notice');

    if (requestButton != null) {
        if (missingHostPermissions.length > 0 || missingContentScripts.length > 0) {
            requestButton.disabled = false;
            permissionWarning.style.display = '';
            permissionNotice.style.display = 'none';
        } else {
            requestButton.disabled = true;
            permissionWarning.style.display = 'none';
            permissionNotice.style.display = '';
        }
    }
}

async function RequestAllMissingPermissions() {
    // Request any missing permissions
    if (missingHostPermissions.length > 0) {
        let permissionsToRequest = { origins: missingHostPermissions };
        var response = await chrome.permissions.request(permissionsToRequest);
        if (response == true) {
            missingHostPermissions = [];
        } else {
        }
    }

    // Request any content scripts
    if (missingContentScripts.length > 0) {
        try {
            await chrome.scripting.registerContentScripts(missingContentScripts);
            missingContentScripts = [];
        } catch (err) {
            console.error(`failed to register content scripts: ${err}`);
        }
    }
    await set();
}

async function InitSetup(){
    // Check if we already have mandatory permissions
    var response = await chrome.permissions.contains(mandatoryPermissions);
    let div = document.getElementById('mandatory-permissions-div');
    if (response == true) {
        div.setAttribute("style", "display:none;");
    }

    // Display the setup div
    document.querySelector('#first-time-setup').setAttribute("style", "display:block;");
}