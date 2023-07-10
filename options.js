// 3rd Attempt
var options = {};

// On change, save
document.addEventListener('change', event => {
    switch (event.target.type) {
        case ('checkbox'):
            options[event.target.id] = event.target.checked;
            break;
        default:
            options[event.target.id] = event.target.value;
            break;
    }

    save();
});
// Save:
function save(){
    chrome.storage.sync.set({options});
}


// On load, load
document.addEventListener('DOMContentLoaded', event => {
    load();
});
// Load
async function load(){
    // Assign the object
    chrome.storage.sync.get('options', (data) => {
        Object.assign(options, data.options);
        
        // Init default settings
        if (options['imdb-enabled'] == null) options['imdb-enabled'] = true;
        if (options['tomato-enabled'] == null) options['tomato-enabled'] = true;
        if (options['metacritic-enabled'] == null) options['metacritic-enabled'] = true;
        if (options['mal-enabled'] == null) options['mal-enabled'] = true;
        if (options['al-enabled'] == null) options['al-enabled'] = true;
        if (options['cinema-enabled'] == null) options['cinema-enabled'] = true;
        if (options['mpa-enabled'] == null) options['mpa-enabled'] = true;
        
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