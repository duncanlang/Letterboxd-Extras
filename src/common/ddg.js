let linkAdded = false;

async function ddd2letterboxd(){
    // Get storage
    var options = await browser.storage.sync.get().then(function (storedSettings) {
        storedSettings = storedSettings['options'];
        return storedSettings;
    });

    // Verify the setting is enabled
    if (options['ddg-search-enabled'] == null || options['ddg-search-enabled'] === false){
        // This shouldn't happen
        linkAdded = true;
        return;
    }

    // Check that there already isn't a letterboxd link (just incase DDG decides to include this in the future)
    let existingLink = document.querySelector('div[data-testid="about"] a[href*="letterboxd.com"]');
    if (existingLink != null){
        linkAdded = true;
        return;
    }

    // Find element with IMDb
    let imdbLink = document.querySelector('div[data-testid="about"] a[href*="imdb.com"]');
    if (imdbLink == null || linkAdded){
        linkAdded = true;
        return;
    }
    
    linkAdded = true;

    const imdbUrl = imdbLink.getAttribute('href')
    const imdbId = imdbUrl.split('title/').pop().replace('/','')
    const letterboxdUrl = `https://letterboxd.com/imdb/${imdbId}`

    // Create Letterboxd link
    const letterboxdLink = imdbLink.cloneNode(true)
    letterboxdLink.href = letterboxdUrl

    // Change text and image
    letterboxdLink.querySelector('span').innerText = 'Letterboxd';

    const img = letterboxdLink.querySelector('img')
    if (img)
        img.src = browser.runtime.getURL("images/letterboxd-logo.svg");

    // Add to page
    imdbLink.parentElement.appendChild(letterboxdLink)
}

const observer = new MutationObserver(() => {
    if (linkAdded == false)
        ddd2letterboxd();
});

observer.observe(document, { childList: true, subtree: true });