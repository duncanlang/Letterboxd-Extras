async function registerContentScripts() {
    await browser.storage.local.get().then(async function (storedSettings) {
        if (storedSettings["google"] === true){
            const script = {
                id: 'google2letterboxd',
                js: ['google2letterboxd.js'],
                matches: ['https://www.google.com/search*'],
            };
            await browser.scripting.registerContentScripts([script]).catch(console.error);
        }
    });
}

browser.runtime.onStartup.addListener(registerContentScripts); 
browser.runtime.onInstalled.addListener(registerContentScripts);