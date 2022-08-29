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