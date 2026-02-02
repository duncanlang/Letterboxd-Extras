const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
document.body.classList.add(isFirefox ? "firefox" : "chrome");

if (isChrome)
    var browser = chrome;

let isAndroid = (navigator.userAgent.includes('Android'));
let isPopup = window.location.search.includes('type=action');

if (isPopup)
    document.body.classList.add("popup");

if ((isAndroid || isPopup) && isFirefox)
    AndroidImportReplacer();

var options = {};

var missingHostPermissions = [];
var missingContentScripts = [];

// Load from storage
async function load() {
    // Assign the object
    var data = await browser.storage.sync.get('options');

    if (data != null && data.options != null) {
        Object.assign(options, data.options);
        // Set the settings
        await set();
    }
}

// Save
function save() {
    browser.storage.sync.set({ options });
}

async function set() {
    var elements = document.querySelectorAll('.setting');
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        var key = element.id;
        if (options.hasOwnProperty(key)) {
            switch (element.type) {
                case ('checkbox'):
                    element.checked = options[key];
                    break;
                case ('text'):
                    element.value = options[key];
                    break;
                default:
                    element.value = options[key];
                    break;
            }

            if (element.getAttribute("permission") != null) {
                ValidatePermission(element);
                ValidateContentScript(element);
            }
        }
        checkSubIDToDisable(element);
    }


    var ratingsOrder = options['ratings-order'];
    if (ratingsOrder == null){
        browser.runtime.sendMessage({ name: "GETDEFAULTRATINGSORDER" }, (value) => {
            ratingsOrder = value.value;
            options['ratings-order'] = value.value;;
            SetRatingsOrder(ratingsOrder);
            save();
        });
    }else{
        SetRatingsOrder(ratingsOrder);
    }
}

function SetRatingsOrder(ratingsOrder){
    var ratingIdMapping = [
        { key: "imdb-ratings", value: "IMDb"},
        { key: "mal-ratings", value: "MyAnimeList"},
        { key: "al-ratings", value: "AniList"},
        { key: "allocine-ratings", value: "AlloCiné"},
        { key: "tomato-ratings", value: "Rotten Tomatoes"},
        { key: "meta-ratings", value: "Metacritic"},
        { key: "sens-ratings", value: "SensCritique"},
        { key: "mubi-ratings", value: "Mubi"},
        { key: "filmaff-ratings", value: "FilmAffinity"},
        { key: "simkl-ratings", value: "Simkl"},
        { key: "kinopoisk-ratings", value: "Kinopoisk"},
        { key: "filmarks-ratings", value: "Filmarks"},
        { key: "cinemascore", value: "CinemaScore"},
    ];

    var listElement = document.querySelector('ul#ratings-order');
    listElement.textContent = '';
    for (var i = 0; i < ratingsOrder.length; i++){
        var key = ratingsOrder[i];
        var name = ratingIdMapping.find(x => x.key == key).value;

        var li = document.createElement('li');
        li.innerText = name;
        li.classList.add('sortable-item');
        li.setAttribute('draggable', 'true');
        li.setAttribute('rating-id', key);
        
        listElement.append(li);
    }
}

function checkSubIDToDisable(element) {
    if (element.getAttribute("subid") != null) {
        var target = document.querySelector("#" + element.getAttribute("subid"));
        var targetValue = element.getAttribute("subidvalue");

        if (targetValue != null) {
            if (element.value == targetValue) {
                // Disable
                target.className += " disabled";
            } else if (target.className.includes("disabled")) {
                // Enable
                target.className = target.className.replace("disabled", "");
            }
        } else {
            if (element.checked) {
                // Enable
                target.className = target.className.replace("disabled", "");
            } else if (!target.className.includes("disabled")) {
                // Disable
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
        let element = event.target;

        switch (element.type) {
            case ('checkbox'):
                options[element.id] = element.checked;
                break;
            case ('text'):
                options[element.id] = element.value;
                break;
            default:
                options[element.id] = element.value;
                break;
        }
        checkSubIDToDisable(element);

        save();

        // Check for permissions
        var origins = element.getAttribute("permission") ? [element.getAttribute("permission")] : [];
        var permissions = element.getAttribute("permissionBrowser") ? [element.getAttribute("permissionBrowser")] : [];

        if (origins.length > 0 || permissions.length > 0){
            let permissionsToRequest = { origins: origins, permissions: permissions };

            if (element.checked == true) {
                // Request the permission
                browser.permissions.request(permissionsToRequest, (granted) => {
                    if (granted) {
                        ValidatePermission(element);
                        if (element.getAttribute('contentScript') != null) {
                            registerContentScript(element);
                        }
                    } else {
                        element.checked = false;
                        options[element.id] = element.checked;
                        save();
                    }
                    checkSubIDToDisable(element);
                });
            } else {
                // Remove the permission
                browser.permissions.remove(permissionsToRequest, (removed) => {
                    if (removed) {
                        ValidatePermission(element);
                        if (element.getAttribute('contentScript') != null) {
                            registerContentScript(element);
                        }
                    } else {
                        element.checked = true;
                        options[element.id] = element.checked;
                        save();
                    }
                    checkSubIDToDisable(element);
                });
            }
        }

        if (element.id == 'override-ratings-order' && element.checked == false){
            ResetRatingsOrder();
        }
    }
});

async function ValidateAllPermissions(){
    var elements = document.querySelectorAll('.setting');
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        var key = element.id;
        if (options.hasOwnProperty(key)) {
            switch (element.type) {
                case ('checkbox'):
                    element.checked = options[key];
                    break;
                case ('text'):
                    element.value = options[key];
                    break;
                default:
                    element.value = options[key];
                    break;
            }

            if (element.getAttribute("permission") != null) {
                ValidatePermission(element);
                ValidateContentScript(element);
            }
        }
        checkSubIDToDisable(element);
    }
}

// Validate Permission - check to see if the permission is granted, and determine visibility of the warning
async function ValidatePermission(element){
    let permission = element.getAttribute("permission");
    let permissionsToRequest = { origins: [permission] };
    var response = await browser.permissions.contains(permissionsToRequest);

    var div = element.parentNode.parentNode.querySelector(".div-request-permission");
    if (div != null) {
        if (response == false && element.checked == true) {
            // Permission does NOT exist and setting is enabled
            div.setAttribute("style", "display:block;");

            if (!missingHostPermissions.includes(permission)){ // add to array
                missingHostPermissions.push(permission);
            }
        } else {
            div.setAttribute("style", "display:none;");

            if (missingHostPermissions.includes(permission)){  // remove from array
                missingHostPermissions.splice(missingHostPermissions.indexOf(permission), 1);
            }
        }
    }

    ValidateRequestAllVisiblity();
}

// Validate Content Script - check to see if the content script has been registered, and determine visibility of the warning
async function ValidateContentScript(element){
    let js = element.getAttribute("contentScript");
    let id = element.getAttribute("contentScriptID");
    if (js != null && id != null){
        let scripts = await browser.scripting.getRegisteredContentScripts();
        if (scripts != null){
            scripts = scripts.map((script) => script.id);
            response = (scripts.includes(id));
        }else{
            response = false;
        }

        div = element.parentNode.parentNode.querySelector(".div-request-contentscript");
        if (div != null) {
            if (response == false && element.checked == true) {
                // Permission does NOT exist and setting is enabled
                div.setAttribute("style", "display:block;");

                if (!missingContentScripts.some(obj => obj.id === id)){ // add to array
                    missingContentScripts.push({ id: id, js: [js], matches: [element.getAttribute("permission")] });
                }
            } else {
                div.setAttribute("style", "display:none;");
                
                const script = missingContentScripts.find(obj => obj.id == id);
                if (script != null){ // remove from array
                    missingContentScripts.splice(missingContentScripts.indexOf(script), 1);
                }
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
        case "reset":
            resetSettings();
            break;
        case "importbutton":
            OpenImportTab();
            break;
        case "requestall":
            RequestAllMissingPermissions();
            break;
        case "reset-rating-order":
            ResetRatingsOrder();
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

            // Remove from array
            if (missingHostPermissions.includes(permission)){
                missingHostPermissions.splice(missingHostPermissions.indexOf(permission), 1);
            }
        }else{
            // Add to array
            if (!missingHostPermissions.includes(permission)){
                missingHostPermissions.push(permission);
            }
        }

        ValidateRequestAllVisiblity();
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

document.addEventListener('focus', event => {
    //ValidateAllPermissions();
});

function validateImportButton() {
    const importPicker = document.querySelector("#importpicker");
    const importButton = document.querySelector("#import");

    importButton.disabled = (importPicker.value == "");
}

async function exportSettings() {
    // Create JSON
    var settings = await browser.storage.sync.get('options').then(function (storedSettings) {
        return storedSettings;
    });

    const userdata = {
        timeStamp: Date.now(),
        version: browser.runtime.getManifest().version,
        settings: settings.options
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

    options = json.settings;
    set();
    save();

    window.alert("Your settings have been restored from file")

    if (window.location.href.endsWith('restore.html')){
        browser.tabs.create({
            url: "/options.html",
            active: true
        });

        window.close();
    }
}

async function resetSettings(){
    // Confirmation Popup
    if (!window.confirm("Your settings will be reset.\n\nReset all settings to default?")) {
        return;
    }

    browser.runtime.sendMessage({ name: "RESETSETTINGS" }, (value) => {
        load();
        window.alert("Your settings have been reset to default.")
    });
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

async function OpenImportTab(){
    let permissionsToRequest = { permissions: ['tabs'] };
    const response = await browser.permissions.request(permissionsToRequest);
    if (response == true) {
        browser.tabs.create({
            url: "/restore.html",
            active: true
        });
        window.close();
    }
}

// Make a link to the android replacer page
// For some reason, FF on android has a bug where the filepicker does not work in the options_ui
// So we have a separate page where we want the android users to use instead
function AndroidImportReplacer(){
    if (document.URL.endsWith('restore.html'))
        return;

    const importDesktop = document.getElementById("importdivdesktop");
    importDesktop.style.display = 'none';

    const importAndroid = document.getElementById("importdivandroid");
    importAndroid.style.display = '';

    // Show the tab permission reminder
    browser.permissions.contains({ permissions: ['tabs'] }).then((value) => {
        let reminder = document.getElementById('tabpermissionreminder');

        if (reminder != null){
            if (isAndroid == false && value == false){
                reminder.style.display = '';
            }else{
                reminder.style.display = 'none';
            }
        }
    });
}

function ValidateRequestAllVisiblity(){
    const requestDiv = document.getElementById('requestalldiv');
    if (requestDiv != null){
        if (missingHostPermissions.length > 0 || missingContentScripts.length > 0){
            requestDiv.style.display = '';
        }else{
            requestDiv.style.display = 'none';
        }
    }
}

async function RequestAllMissingPermissions(){
    // Request any missing permissions
    if (missingHostPermissions.length > 0){
        let permissionsToRequest = { origins: missingHostPermissions };
        var response = await browser.permissions.request(permissionsToRequest);
        if (response == true) {
            missingHostPermissions = [];
        }else{
        }
    }
    
    // Request any content scripts
    if (missingContentScripts.length > 0){
        try {
            await browser.scripting.registerContentScripts(missingContentScripts);
            missingContentScripts = [];
        } catch (err) {
            console.error(`failed to register content scripts: ${err}`);
        }
    }
    await set();
}

// Sortable List
// https://www.geeksforgeeks.org/html/create-a-drag-and-drop-sortable-list-using-html-css-javascript/
// modified to work with touch
const list = document.querySelector('.sortable-list');
let draggingItem = null;

// Mouse Events
list.addEventListener('dragstart', (e) => {
    draggingItem = e.target;
    e.target.classList.add('dragging');
});

list.addEventListener('dragend', (e) => {
    handleDragEnd(e.target);
});

list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(list, e.clientY);
    updateListPosition(afterElement);
});

// Touch Events
list.addEventListener('touchstart', (e) => {
    // We target the closest sortable-item in case the handle was touched
    draggingItem = e.target.closest('.sortable-item');
    if (!draggingItem) return;
    
    draggingItem.classList.add('dragging');
    // Prevent scrolling while dragging
    e.preventDefault(); 
}, { passive: false });

list.addEventListener('touchmove', (e) => {
    if (!draggingItem) return;
    e.preventDefault();

    // Get the finger position
    const touch = e.touches[0];
    const afterElement = getDragAfterElement(list, touch.clientY);
    
    updateListPosition(afterElement);
}, { passive: false });

list.addEventListener('touchend', (e) => {
    if (!draggingItem) return;
    handleDragEnd(draggingItem);
});

function updateListPosition(afterElement) {
    if (afterElement) {
        list.insertBefore(draggingItem, afterElement);
    } else {
        list.appendChild(draggingItem);
    }
}

function handleDragEnd(item) {
    item.classList.remove('dragging');
    document.querySelectorAll('.sortable-item')
        .forEach(i => i.classList.remove('over'));
    
    SaveSortableList(list);
    draggingItem = null;
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function SaveSortableList(list){
    var key = list.id;
    var items = list.querySelectorAll('.sortable-item');
    var newArray = Array.from(items).map(child => child.getAttribute('rating-id'));

    options[key] = newArray;
    save();
}

function ResetRatingsOrder(){
    browser.runtime.sendMessage({ name: "GETDEFAULTRATINGSORDER" }, (value) => {
        options['ratings-order'] = value.value;
        set();
        save();
    });
}