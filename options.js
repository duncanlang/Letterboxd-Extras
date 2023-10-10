var options;

// Load from storage
async function load() {
    options = await browser.storage.local.get().then(function (storedSettings) {
        if (storedSettings["convert-ratings"] === true){
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
        }

        if (element.getAttribute("permission") != null){
            checkPermission(element);
        }
    })
}

async function checkPermission(element){
    let permissionsToRequest = { origins: [element.getAttribute("permission")] };
    const response = await browser.permissions.contains(permissionsToRequest);

    if (response == false && element.checked == true){
        element.checked = false;
    }
}


// On change, save
document.addEventListener('change', event => {
    changeSetting(event);
});

async function changeSetting(event) {
    if (event.target.getAttribute("permission") != null){
        let permissionsToRequest = { origins: [event.target.getAttribute("permission")] };
        if (event.target.checked == true){
            const response = await browser.permissions.request(permissionsToRequest);

            if (response != true){
                event.target.checked = false;
            }
        }else{
            browser.permissions.remove(permissionsToRequest);
        }
    }

    switch (event.target.type) {
        case ('checkbox'):
            options[event.target.id] = event.target.checked;
            break;
        default:
            options[event.target.id] = event.target.value;
            break;
    }

    save();
}

// On load, load
document.addEventListener('DOMContentLoaded', event => {
    load();
});
