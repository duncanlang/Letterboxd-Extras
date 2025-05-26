/* Polyfill for non userscript environments */
/* eslint-disable camelcase, no-unused-vars */

function GM_addStyle(styles) {
	const style = document.createElement('style');
	style.textContent = styles;
	(document.head || document.body || document.documentElement || document).appendChild(style);
}

function GM_xmlhttpRequest(options) {
	const request = new XMLHttpRequest();

	request.onload = function() {
		options.onload(this);
	};

	request.onerror = function() {
		options.onerror(this);
	};

	request.ontimeout = function() {
		options.ontimeout(this);
	};

	request.open(options.method, options.url);

	if (options.headers) {
		for (const header in options.headers) {
			if (options.headers.hasOwnProperty(header)) {
				request.setRequestHeader(header, options.headers[header]);
			}
		}
	}

	if (typeof options.timeout !== 'undefined') {
		request.timeout = options.timeout;
	}

	if (typeof options.data === 'undefined') {
		request.send();
	} else {
		request.send(options.data);
	}
}

/* Extensions cannot access the document's window directly */
function inject(func) {
	const script = document.createElement('script');
	script.appendChild(document.createTextNode(`(${func})();`));
	const target = document.head || document.body || document.documentElement || document;
	target.appendChild(script);
	target.removeChild(script); // Removing since once it executes it is no longer needed
}
