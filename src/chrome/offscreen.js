let currentWarmupPromise = null;

chrome.runtime.onMessage.addListener((message) => {
    if (message.target === 'offscreen' && message.name === 'warmup-imdb') {
        handleWarmup(message.url);
    }
});

async function handleWarmup(url) {
    // If we are already warming up, don't start a new one
    if (currentWarmupPromise) {
        return currentWarmupPromise;
    }

    // Create the promise that represents this specific warmup session
    currentWarmupPromise = new Promise((resolve) => {
        console.log(`Starting IMDb WAF warmup...`);

        const iframe = document.createElement('iframe');
        iframe.src = url;

        const cleanup = () => {
            console.log(`WAF Warmup complete, cleaning up.`);
            chrome.runtime.sendMessage({ name: 'warmup-complete' });
            //iframe.remove();
            currentWarmupPromise = null; // Reset the lock
            resolve();
        };

        // Timeout as a fallback in case the iframe hangs
        const timeout = setTimeout(cleanup, 15000);

        iframe.onload = () => {
            // Give the WAF scripts a second to actually set the cookies
            setTimeout(() => {
                clearTimeout(timeout);
                cleanup();
            }, 1500);
        };

        document.body.appendChild(iframe);
    });

    return currentWarmupPromise;
}


const awaitIframeLoad = (iframe) => {
    return new Promise((resolve) => {
        iframe.onload = () => {
            resolve(iframe);
        };
    });
};