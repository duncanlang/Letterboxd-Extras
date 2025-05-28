const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
document.body.classList.add(isFirefox ? "firefox" : "chrome");

let mandatoryPermission = { origins: ['https://letterboxd.com/*', 'https://query.wikidata.org/*'] };

VerifyMandatoryPermissions();

// Request permission if missing
document.addEventListener('click', event => {
    if (event.target.id == 'mandatory-permissions') {
        RequestPermissions(mandatoryPermission);
    }

    // TODO, add each permission to a list when checked, then use that to request all at once with the button
    // make sure to enable the button if there is at least one permission in the list
    // should the button follow the page? that way it's always visible even if scrolling
});

async function RequestPermissions(permissionsToRequest) {
    // Request the permission
    const response = await chrome.permissions.request(permissionsToRequest);
    VerifyMandatoryPermissions();
}

async function VerifyMandatoryPermissions(){
    var response = await chrome.permissions.contains(mandatoryPermission);
    let div = document.getElementById('mandatory-permissions-div');
    if (response == true){
        div.setAttribute("style", "display:none;");
    }
}