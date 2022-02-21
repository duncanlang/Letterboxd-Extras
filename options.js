var options;

// Load from storage
async function load(){
    options = await browser.storage.local.get().then(function (storedSettings) {
        return storedSettings;
    });
    set();
}

function save(){ //key, value){
    //options[key] = value;
    browser.storage.local.set(options);
}

function set(){
    Object.keys(options).forEach(key => {
        var element = document.querySelector('#' + key);
        if (element != null){
            switch (typeof (options[key])) {
                case ('boolean'):
                    element.checked = options[key];
                    break;
                case ('string'):
                    element.value = options[key];
                    break;
            }

            //element.value = options[key];
        }
    })
}


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

    save();//event.target.id, event.target.value);
});

// On load, load
document.addEventListener('DOMContentLoaded', event => {
    load();
});
