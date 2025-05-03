let isAndroid = (navigator.userAgent.includes('Android'));
let isPopup = window.location.search.includes('type=action');

if (isAndroid || isPopup)
    AndroidImportReplacer();

var options;

var missingHostPermissions = [];
var missingContentScripts = [];

function initDefaultSettings(){
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
}

// Load from storage
async function load() {
    options = await browser.storage.local.get().then(function (storedSettings) {
        if (storedSettings["convert-ratings"] === true) {
            storedSettings["convert-ratings"] = "5";
        }
        return storedSettings;
    });
    // Init default settings
    initDefaultSettings();

    set();
}

function save() {
    browser.storage.local.set(options);
}

async function set() {
    for (const key in options){
        var element = document.querySelector('#' + key);
        if (element != null) {
            switch (typeof (options[key])) {
                case ('boolean'):
                    element.checked = options[key];
                    break;
                case ('string'):
                    element.value = options[key];
                    break;
            }
            checkSubIDToDisable(element);

            if (element.getAttribute("permission") != null) {
                await checkPermission(element);
            }
        }
    }    

    ValidateRequestAllVisiblity();
}

async function checkPermission(element) {
    // Check for Permissions
    let permission = element.getAttribute("permission");
    let permissionsToRequest = { origins: [permission] };
    var response = await browser.permissions.contains(permissionsToRequest);

    var div = element.parentNode.parentNode.querySelector(".div-request-permission");
    if (div != null) {
        if (response == false && element.checked == true) {
            // Permission does NOT exist and setting is enabled
            div.setAttribute("style", "display:block;");

            if (!missingHostPermissions.includes(permission)){ // add to array
                missingHostPermissions.push(permission);
            }
        } else {
            div.setAttribute("style", "display:none;");

            if (missingHostPermissions.includes(permission)){  // remove from array
                missingHostPermissions.splice(missingHostPermissions.indexOf(permission), 1);
            }
        }
    }

    // Check for content scripts
    let js = element.getAttribute("contentScript");
    let id = element.getAttribute("contentScriptID");
    if (js != null && id != null){
        let scripts = await browser.scripting.getRegisteredContentScripts();
        scripts = scripts.map((script) => script.id);
        response = (scripts.includes(id));

        div = element.parentNode.parentNode.querySelector(".div-request-contentscript");
        if (div != null) {
            if (response == false && element.checked == true) {
                // Permission does NOT exist and setting is enabled
                div.setAttribute("style", "display:block;");

                if (!missingContentScripts.some(obj => obj.id === id)){ // add to array
                    missingContentScripts.push({ id: id, js: [js], matches: [element.getAttribute("permission")] });
                }
            } else {
                div.setAttribute("style", "display:none;");
                
                const script = missingContentScripts.find(obj => obj.id == id);
                if (script != null){ // remove from array
                    missingContentScripts.splice(missingContentScripts.indexOf(script), 1);
                }
            }
        }
    }
}

function checkSubIDToDisable(element) {
    if (element.getAttribute("subid") != null) {
        var target = document.querySelector("#" + element.getAttribute("subid"));
        var targetValue = element.getAttribute("subidvalue");

        if (targetValue != null) {
            if (element.value == targetValue) {
                target.className = target.className.replace("disabled", "");
            } else {
                target.className += " disabled";
            }
        } else {
            if (element.checked) {
                target.className = target.className.replace("disabled", "");
            } else {
                target.className += " disabled";
            }
        }
    }
}


// On change, save
document.addEventListener('change', event => {
    if (event.target.id == "importpicker") {
        validateImportButton();
    } else {
        changeSetting(event);
    }
});

async function changeSetting(event) {
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

    if (event.target.getAttribute("permission") != null) {
        let permissionsToRequest = { origins: [event.target.getAttribute("permission")] };
        if (event.target.getAttribute("permissionBrowser") != null) {
            permissionsToRequest = { origins: [event.target.getAttribute("permission")], permissions: [event.target.getAttribute("permissionBrowser")] };
        }

        if (event.target.checked == true) {
            const response = await browser.permissions.request(permissionsToRequest);

            if (response != true) {
                event.target.checked = false;
                options[event.target.id] = event.target.checked;
                save();
            }
        } else {
            browser.permissions.remove(permissionsToRequest);
            checkPermission(event.target); // this will hide the "missing permission" if it's showing
        }
        checkSubIDToDisable(event.target);

        if (event.target.getAttribute('contentScript') != null) {
            const response = await registerContentScript(event.target);

            if (response != true) {
                event.target.checked = false;
                options[event.target.id] = event.target.checked;
                save();
            }
        }

        ValidateRequestAllVisiblity();
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

async function requestPermission(event) {
    // Get the element that has the permission
    var permissionTarget = document.querySelector("#" + event.target.getAttribute("permissionTarget"));
    // Make sure it has the permission
    if (permissionTarget.getAttribute("permission") != null) {
        // Get the permission from the element that has it
        var permission = permissionTarget.getAttribute("permission");
        let permissionsToRequest = { origins: [permission] };

        // Request the permission
        const response = await browser.permissions.request(permissionsToRequest);
        if (response == true) {
            event.target.parentNode.setAttribute("style", "display:none;");
        }
    }
}

async function registerContentScript(target) {
    var id = target.getAttribute('contentScriptID');
    var js = target.getAttribute('contentScript');
    var match = target.getAttribute('permission');

    if (target.checked) {
        // Register
        const script = {
            id: id,
            js: [js],
            matches: [match],
        };

        try {
            await browser.scripting.registerContentScripts([script]);
        } catch (err) {
            console.error(`failed to register content scripts: ${err}`);
            return false;
        }

        var request = target.parentNode.parentNode.querySelector('.div-request-contentscript');
        if (request != null) {
            request.setAttribute("style", "display:none;");
        }
    } else {
        // Unregister
        try {
            await browser.scripting.unregisterContentScripts({
                ids: [id],
            });
        } catch (err) {
            console.error(`failed to unregister content scripts: ${err}`);
            return false;
        }
    }

    return true;
}

// On load, load
document.addEventListener('DOMContentLoaded', event => {
    load();
    validateImportButton();
});

document.addEventListener('focus', event => {
    //missingHostPermissions = [];
    //missingContentScripts = [];
    set();
});

function validateImportButton() {
    const importPicker = document.querySelector("#importpicker");
    const importButton = document.querySelector("#import");

    importButton.disabled = (importPicker.value == "");
}

async function exportSettings() {
    // Create JSON
    var settings = await browser.storage.local.get().then(function (storedSettings) {
        if (storedSettings["convert-ratings"] === true) {
            storedSettings["convert-ratings"] = "5";
        }
        return storedSettings;
    });

    const userdata = {
        timeStamp: Date.now(),
        version: browser.runtime.getManifest().version,
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
    } catch(err) {
        error = "File is not valid JSON."
    }

    if (json != null){
        // Validate file contents
        if (json.timeStamp == null || json.version == null || json.settings == null){
            error = "File is not a valid Letterboxd Extras backup."
        }
        if (json.version != null && versionCompare(json.version, browser.runtime.getManifest().version, {lexicographical: false, zeroExtend: true}) > 0){
            error = "Backup is from a newer version (" + json.version + ") than the current add-on (" + browser.runtime.getManifest().version + "). Please update before importing settings."
        }
    }

    if (error != ""){
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

    if (isAndroid){
        let creating = browser.tabs.create({
            url: "/options.html",
            active: true
        });

        window.close();
    }
}

async function resetSettings(){
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
        
        reader.onload = function(e) {
            resolve(e.target.result); // Resolve the promise with file content
        };
        
        reader.onerror = function(e) {
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

async function OpenImportTab(){
    let permissionsToRequest = { permissions: ['tabs'] };
    const response = await browser.permissions.request(permissionsToRequest);
    if (response == true) {
        browser.tabs.create({
            url: "/restore.html",
            active: true
        });
        window.close();
    }
}

// Make a link to the android replacer page
// For some reason, FF on android has a bug where the filepicker does not work in the options_ui
// So we have a separate page where we want the android users to use instead
function AndroidImportReplacer(){
    if (document.URL.endsWith('restore.html'))
        return;

    const importDesktop = document.getElementById("importdivdesktop");
    importDesktop.style.display = 'none';

    const importAndroid = document.getElementById("importdivandroid");
    importAndroid.style.display = '';
}

function ValidateRequestAllVisiblity(){
    const requestDiv = document.getElementById('requestalldiv');
    if (requestDiv != null){
        if (missingHostPermissions.length > 0 || missingContentScripts.length > 0){
            requestDiv.style.display = '';
        }else{
            requestDiv.style.display = 'none';
        }
    }
}

async function RequestAllMissingPermissions(){
    // Request any missing permissions
    if (missingHostPermissions.length > 0){
        let permissionsToRequest = { origins: missingHostPermissions };
        var response = await browser.permissions.request(permissionsToRequest);
        if (response == true) {
            missingHostPermissions = [];
        }else{
        }
    }
    
    // Request any content scripts
    if (missingContentScripts.length > 0){
        try {
            await browser.scripting.registerContentScripts(missingContentScripts);
            missingContentScripts = [];
        } catch (err) {
            console.error(`failed to register content scripts: ${err}`);
        }
    }
    await set();
}