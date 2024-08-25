// 3rd Attempt
var options = {};

// On change, save
document.addEventListener('change', event => {
    var permission = event.target.getAttribute('permission');

    if (permission != null && permission != "") {
        var permission = { origins: [permission] };
        if (event.target.getAttribute("permissionBrowser") != null){
            permission = { origins: [permission], permissions: [event.target.getAttribute("permissionBrowser")] };
        }
        if (event.target.checked == true) {
            // Request the permission
            chrome.permissions.request(permission, (granted) => {
                if (granted) {
                    options[event.target.id] = event.target.checked;

                    save();

                    if (event.target.getAttribute('contentScript') != null){
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
                    
                    if (event.target.getAttribute('contentScript') != null){
                        registerContentScript(event.target);
                    }
                } else {
                    event.target.checked = true;
                }
                checkSubIDToDisable(event.target);
            });
        }
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

function checkSubIDToDisable(element){
    if (element.getAttribute("subid") != null){
        var target = document.querySelector("#" + element.getAttribute("subid"));
        var targetValue = element.getAttribute("subidvalue");

        if (targetValue != null){
            if (element.value == targetValue){
                target.className = target.className.replace("disabled","");
            }else{
                target.className += " disabled";
            }
        }else{
            if (element.checked){
                target.className = target.className.replace("disabled","");
            }else{
                target.className += " disabled";
            }
        }
    }
}

async function registerContentScript(target){
    var id = target.getAttribute('contentScriptID');
    var js = target.getAttribute('contentScript');
    var match = target.getAttribute('permission');

    var failed = false;

    if (target.checked){
        // Register
        const script = {
            id: id,
            js: [js],
            matches: [match],
        };

        try {
            await chrome.scripting.registerContentScripts([script]);
        } catch (err) {
            console.error(`failed to register content scripts: ${err}`);
            failed = true;
        }
    }else{
        // Unregister
        try {
            await chrome.scripting.unregisterContentScripts({
                ids: [id],
            });
        } catch (err) {
            console.error(`failed to unregister content scripts: ${err}`);
            failed = true
        }  
    }
    
    if (failed){
        target.checked = false;
        options[target.id] = target.checked;
        save();
    }

    return true;
}


// On load, load
document.addEventListener('DOMContentLoaded', event => {
    load();
});
// Load
async function load() {
    // Assign the object
    chrome.storage.sync.get('options', (data) => {
        Object.assign(options, data.options);
        if (options["convert-ratings"] === true){
            options["convert-ratings"] = "5";
        }

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

        // Set the settings
        var elements = document.querySelectorAll('.setting');
        elements.forEach(element => {
            var key = element.id;
            if (options.hasOwnProperty(key) && options[key] != "") {
                switch (element.type) {
                    case ('checkbox'):
                        element.checked = options[key];
                        break;
                    default:
                        element.value = options[key];
                        break;
                }
            }
            checkSubIDToDisable(element);
        });
    });
}