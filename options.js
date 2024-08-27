var options;

// Load from storage
async function load() {
    options = await browser.storage.local.get().then(function (storedSettings) {
        if (storedSettings["convert-ratings"] === true) {
            storedSettings["convert-ratings"] = "5";
        }
        return storedSettings;
    });
    // Init default settings
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
    set();
}

function save() {
    browser.storage.local.set(options);
}

function set() {
    Object.keys(options).forEach(key => {
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
                checkPermission(element);
            }
        }
    })
}

async function checkPermission(element) {
    // Check for Permissions
    let permissionsToRequest = { origins: [element.getAttribute("permission")] };
    var response = await browser.permissions.contains(permissionsToRequest);

    var div = element.parentNode.parentNode.querySelector(".div-request-permission");
    if (div != null) {
        if (response == true && element.checked == true) {
            // Permission exists and setting is enabled
            div.setAttribute("style", "display:none;");
        } else if (response == false && element.checked == true) {
            // Permission does NOT exist and setting is enabled
            div.setAttribute("style", "display:block;");
        } else {
            div.setAttribute("style", "display:none;");
        }
    }

    // Check for content scripts
    let id = element.getAttribute("contentScriptID");
    let scripts = await browser.scripting.getRegisteredContentScripts();
    scripts = scripts.map((script) => script.id);
    response = (scripts.includes(id));

    div = element.parentNode.parentNode.querySelector(".div-request-contentscript");
    if (div != null) {
        if (response == true && element.checked == true) {
            // Permission exists and setting is enabled
            div.setAttribute("style", "display:none;");
        } else if (response == false && element.checked == true) {
            // Permission does NOT exist and setting is enabled
            div.setAttribute("style", "display:block;");
        } else {
            div.setAttribute("style", "display:none;");
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
    var reader = new FileReader();
    reader.readAsText(selectedFile, 'UTF-8');
    reader.onload = readerEvent => {
        var content = readerEvent.target.result;        
        const json = JSON.parse(content);

        // TODO validate json is valid json
        // TODO validate file contents
        // TODO validate version (cannot be newer version than current)

        // Read timestamp from file
        const date = (new Date(json.timeStamp)).toLocaleDateString(window.navigator.language);

        // Confirmation Popup
        if (!window.confirm("Your settings will be overwritten with data backed up on " + date + ".\n\nOverwrite all settings with data from file?")) {
            return;
        }

        // TODO, request all permissions?

        options = json.settings;
        set();
        save();
    }
}