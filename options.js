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
    if (options['wiki-link-enabled'] == null) options['wiki-link-enabled'] = true;
    if (options['tomato-critic-enabled'] == null) options['tomato-critic-enabled'] = true;
    if (options['tomato-audience-enabled'] == null) options['tomato-audience-enabled'] = true;
    if (options['metacritic-critic-enabled'] == null) options['metacritic-critic-enabled'] = true;
    if (options['metacritic-users-enabled'] == null) options['metacritic-users-enabled'] = true;
    if (options['metacritic-mustsee-enabled'] == null) options['metacritic-mustsee-enabled'] = true;
    if (options['sens-favorites-enabled'] == null) options['sens-favorites-enabled'] = true;
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

                    if (element.getAttribute("subid") != null){
                        var target = document.querySelector("#" + element.getAttribute("subid"));
                        if (element.checked){
                            target.className = target.className.replace("disabled","");
                        }else{
                            target.className += " disabled";
                        }
                    }
                    break;
                case ('string'):
                    element.value = options[key];
                    break;
            }
            if (element.getAttribute("permission") != null){
                checkPermission(element);
            }
        }
    })
}

async function checkPermission(element){
    let permissionsToRequest = { origins: [element.getAttribute("permission")] };
    const response = await browser.permissions.contains(permissionsToRequest);

    var div = element.parentNode.parentNode.querySelector(".div-request-permission");
    if (div != null){
        if (response == true && element.checked == true){
            // Permission exists and setting is enabled
            div.setAttribute("style","display:none;");
        }else if(response == false && element.checked == true){
            // Permission does NOT exist and setting is enabled
            div.setAttribute("style","display:block;");
        }else{
            div.setAttribute("style","display:none;");
        }
    }
}


// On change, save
document.addEventListener('change', event => {
    changeSetting(event);
});

async function changeSetting(event) {
    switch (event.target.type) {
        case ('checkbox'):
            options[event.target.id] = event.target.checked;

            if (event.target.getAttribute("subid") != null){
                var target = document.querySelector("#" + event.target.getAttribute("subid"));
                if (event.target.checked){
                    target.className = target.className.replace("disabled","");
                }else{
                    target.className += " disabled";
                }
            }
            break;
        default:
            options[event.target.id] = event.target.value;
            break;
    }

    save();
    
    if (event.target.getAttribute("permission") != null){
        let permissionsToRequest = { origins: [event.target.getAttribute("permission")] };
        if (event.target.checked == true){
            const response = await browser.permissions.request(permissionsToRequest);

            if (response != true){
                event.target.checked = false;
                options[event.target.id] = event.target.checked;
                save();
            }
        }else{
            browser.permissions.remove(permissionsToRequest);
            checkPermission(event.target); // this will hide the "missing permission" if it's showing
        }
    }
}

// Request permission if missing
document.addEventListener('click', event => {
    if (event.target.getAttribute("class") != null && event.target.getAttribute("class") == "request-permission" && event.target.getAttribute("permissionTarget") != null){
        requestPermission(event);
    }
});
async function requestPermission(event){
    // Get the element that has the permission
    var permissionTarget = document.querySelector("#" + event.target.getAttribute("permissionTarget"));
    // Make sure it has the permission
    if (permissionTarget.getAttribute("permission") != null){
        // Get the permission from the element that has it
        var permission = permissionTarget.getAttribute("permission");
        let permissionsToRequest = { origins: [permission] };

        // Request the permission
        const response = await browser.permissions.request(permissionsToRequest);
        if (response == true){
            event.target.parentNode.setAttribute("style","display:none;");
        }
    }
}

// On load, load
document.addEventListener('DOMContentLoaded', event => {
    load();
});
