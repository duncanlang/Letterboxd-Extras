document.body.classList.add(isFirefox ? "firefox" : "chrome");

if (isChrome && typeof browser === "undefined")
    var browser = chrome;

document.querySelector('#settings-link').href = browser.runtime.getURL('options.html');


// Request permission if missing
document.addEventListener('click', event => {
    switch (event.target.id) {
        case "button-recommended":
            setRecommendedSettings();
            break;
    }
});

async function setRecommendedSettings() {
    // Request permissions
    let permissionsToRequest = { origins: [
		"https://*.imdb.com/*",
		"https://www.rottentomatoes.com/*",
		"https://www.boxofficemojo.com/*",
		"https://webapp.cinemascore.com/*",
		"https://www.metacritic.com/*",
		"https://graphql.anilist.co/*",
		"https://api.tenrai.org/*"
    ]};
    const response = await browser.permissions.request(permissionsToRequest);
    if (response) {

        browser.runtime.sendMessage({ name: "SETRECOMMENDEDSETTINGS" }, (value) => {
            document.querySelector('#success-text').style.display = '';
        });
    }
}