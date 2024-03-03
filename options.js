// 3rd Attempt
var options = {};

// On change, save
document.addEventListener('change', event => {
    var permission = event.target.getAttribute('permission');
    if (permission != null && permission != "") {
        if (event.target.checked == true) {
            // Request the permission
            chrome.permissions.request({
                origins: [permission]
            }, (granted) => {
                if (granted) {
                    options[event.target.id] = event.target.checked;

                    save();
                } else {
                    event.target.checked = false;
                }
                checkSubIDToDisable(event.target);
            });
        } else {
            // Remove the permission
            chrome.permissions.remove({
                origins: [permission]
            }, (removed) => {
                if (removed) {
                    options[event.target.id] = event.target.checked;
                    save();
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
        if (element.checked){
            target.className = target.className.replace("disabled","");
        }else{
            target.className += " disabled";
        }
    }
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