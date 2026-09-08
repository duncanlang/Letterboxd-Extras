
const settingsWindow = window.location.href.includes('options');

// DOM Load
document.addEventListener('DOMContentLoaded', event => {
    validateImportButton();
});

// Button Click
document.addEventListener('click', event => {
    switch (event.target.id) {
        // Settings import
        case "importSettings":
            importSettings();
            break;

        // Custom lists import
        case "importLists":
            importLists();
            break;
    }
});

// File picker change (file picked)
document.addEventListener('change', event => {
    if (event.target.id == "importSettings-picker" || event.target.id == "importLists-picker") {
        validateImportButton();
    }
});

function validateImportButton() {
    // Settings
    const importPicker = document.querySelector("#importSettings-picker");
    const importButton = document.querySelector("#importSettings");
    importButton.disabled = (importPicker.value == "");
    
    // Custom Lists
    const importListsPicker = document.querySelector("#importLists-picker");
    const importListsButton = document.querySelector("#importLists");
    importListsButton.disabled = (importListsPicker.value == "");
}

async function importSettings() {
    const importPicker = document.querySelector("#importSettings-picker");

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

    // TODO, can we request permissions here?
    
    if (settingsWindow) {
        options = json.settings;

        set();
        save();

        window.alert("Your settings have been restored from file")
    } else {
        let options = json.settings;
        browser.storage.sync.set({ options });

        document.querySelector('#success-text').classList.remove('hidden');
    }
}

async function importLists() {
    const importPicker = document.querySelector("#importLists-picker");

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
        if (json.timeStamp == null || json.version == null || json.custom_lists == null){
            error = "File is not a valid Letterboxd Extras custom rankings file."
        }
        if (json.version != null && versionCompare(json.version, browser.runtime.getManifest().version, {lexicographical: false, zeroExtend: true}) > 0){
            error = "Custom rankings file is from a newer version (" + json.version + ") than the current add-on (" + browser.runtime.getManifest().version + "). Please update before importing your rankings."
        }
    }

    if (error != ""){
        window.alert("Invalid file: " + error + "\n\nThe import could not be completed");
        return;
    }

    // Read timestamp from file
    const date = (new Date(json.timeStamp)).toLocaleDateString(window.navigator.language);

    // Confirmation Popup
    if (!window.confirm("Your current custom ranking lists will be overwritten with data backed up on " + date + ".\n\nOverwrite all lists with data from file?")) {
        return;
    }

    if (settingsWindow) {
        custom_lists = json.custom_lists;
        saveCustomLists();
        SetCustomLists();

        window.alert("Your custom lists have been restored from file")
    } else {
        let custom_lists = json.custom_lists;
        await browser.storage.local.set({ custom_lists: custom_lists });

        document.querySelector('#success-text').classList.remove('hidden');
    }
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