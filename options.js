// 3rd Attempt
var options = {};

// On change, save
document.addEventListener('change', event => {
    changeSetting(event)
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

    if (event.target.getAttribute("permission") != null && event.target.checked == true){
        let permissionsToRequest = { origins: [event.target.getAttribute("permission")] };
        const response = await browser.permissions.request(permissionsToRequest);

        if (response == true){
            console.log("permission requested");
        }else{
            console.log("permission NOT requested");
        }
    }else{
        console.log("settinmg does not have permission attribute");
    }

    save();
}

// Save:
function save(){
    browser.storage.local.set({options});
}


// On load, load
document.addEventListener('DOMContentLoaded', event => {
    load();
});
// Load
async function load(){
    // Assign the object
    browser.storage.local.get('options', (data) => {
        if (data.options["convert-ratings"] === true){
            data.options["convert-ratings"] = "5";
        }
        Object.assign(options, data.options);
        
        // Init default settings
        if (options['imdb-enabled'] == null) options['imdb-enabled'] = true;
        if (options['tomato-enabled'] == null) options['tomato-enabled'] = true;
        if (options['metacritic-enabled'] == null) options['metacritic-enabled'] = true;
        if (options['mal-enabled'] == null) options['mal-enabled'] = true;
        if (options['al-enabled'] == null) options['al-enabled'] = true;
        if (options['cinema-enabled'] == null) options['cinema-enabled'] = true;
        if (options['mpa-enabled'] == null) options('mpa-enabled', true);
        if (options['mojo-link-enabled'] == null) options('mojo-link-enabled', true);
        
        // Set the settings
        var elements = document.querySelectorAll('.setting');
        elements.forEach(element => {
            var key = element.id;
            if (options.hasOwnProperty(key) && options[key] != ""){
                switch (element.type) {
                    case ('checkbox'):
                        element.checked = options[key];
                        break;
                    default:
                        element.value = options[key];
                        break;
                }
            }
        });
    });
}