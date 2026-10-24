/* Letterboxd Extras | Clone list
 *
 * 1. On a list page (letterboxd.com/{user}/list/{slug}/), adds a "Clone with Letterboxd Extras"
 *    button under Letterboxd's own "Clone this list" button.
 * 2. On click, collects every film of the list (all pages), caches it and builds a CSV in the
 *    Letterboxd import format (https://letterboxd.com/about/importing-data/).
 * 3. Opens https://letterboxd.com/list/new/ in a new tab, where this same script picks up the
 *    pending CSV and uploads it into the list importer. The user fills out the rest.
 */
/* eslint-disable */

(function () {
	const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
	const ext = isChrome ? chrome : browser;

	const LOG_PREFIX = 'Letterboxd Extras |';
	const PENDING_KEY = 'lbxe-clone-pending';  // The CSV waiting to be uploaded on /list/new/
	const CACHE_KEY = 'lbxe-clone-cache';      // Recently collected lists, keyed by list URL
	const CACHE_MAX = 10;
	const PENDING_MAX_AGE = 15 * 60 * 1000;    // Ignore pending clones older than 15 minutes
	const PAGE_DELAY = 750;                    // Be nice to Letterboxd between page requests
	const MAX_PAGES = 200;

	const listPathPattern = /^\/([^\/]+)\/list\/([^\/]+)\//;
	const reservedListSlugs = ['new'];

	const path = window.location.pathname;
	if (path.startsWith('/list/new')) {
		initNewListPage();
	} else {
		const match = path.match(listPathPattern);
		if (match != null && !reservedListSlugs.includes(match[2])) {
			initListPage(`https://letterboxd.com/${match[1]}/list/${match[2]}/`);
		}
	}

	// ======================================================================
	// List page: add the button and collect the films
	// ======================================================================

	function initListPage(listUrl) {
		console.log(LOG_PREFIX, 'Clone list loaded for', listUrl);
		addStyles();

		// The sidebar can be rendered late, so retry for a little while before using a fallback spot
		let attempts = 0;
		const tryAdd = () => {
			if (document.querySelector('.lbxe-clone-button') != null) return;
			if (addCloneButton(listUrl, false)) return;
			if (++attempts < 10) {
				setTimeout(tryAdd, 500);
			} else {
				addCloneButton(listUrl, true);
			}
		};
		tryAdd();
	}

	function findLetterboxdCloneLink() {
		const candidates = document.querySelectorAll('a, button');
		let best = null;
		for (const el of candidates) {
			if (el.closest('.lbxe-clone-item, .lbxe-clone-button')) continue;
			const text = el.textContent.trim();
			const href = el.getAttribute('href') || '';
			if (el.closest('.poster-list, .film-list, .list-set')) continue; // films/lists that happen to be named "Clone"
			const isClone = (/\bclone\b/i.test(text) && text.length < 40)
				|| /\/list\/new\/?\?.*(copy|clone)/i.test(href)
				|| /\/list\/[^\/]+\/clone\/?$/i.test(href);
			// Prefer the shortest matching element (the link itself, not a wrapper)
			if (isClone && (best == null || text.length < best.textContent.trim().length)) best = el;
		}
		return best;
	}

	function createCloneButton(listUrl, className) {
		const button = document.createElement('a');
		button.href = '#';
		button.className = className + ' lbxe-clone-button';
		button.textContent = 'Clone with Letterboxd Extras';
		button.title = 'Copy every film in this list into a new list of your own';
		button.addEventListener('click', event => {
			event.preventDefault();
			startClone(listUrl, button);
		});
		return button;
	}

	function insertAfter(anchor, button) {
		// Letterboxd's actions panel is a <ul> of <li>, so mirror that structure if present
		const parentLi = anchor.closest('li');
		if (parentLi != null) {
			const li = document.createElement('li');
			li.className = parentLi.className + ' lbxe-clone-item';
			li.append(button);
			parentLi.after(li);
		} else {
			anchor.after(button);
		}
	}

	function addCloneButton(listUrl, useFallback) {
		const cloneLink = findLetterboxdCloneLink();
		if (cloneLink != null) {
			insertAfter(cloneLink, createCloneButton(listUrl, cloneLink.className));
			console.log(LOG_PREFIX, 'Button added under', cloneLink);
			return true;
		}
		if (!useFallback) return false;

		// No "Clone this list" found (markup changed, or not logged in): use the sidebar actions panel
		const panel = document.querySelector('.actions-panel ul, .js-actions-panel, aside .actions-panel');
		if (panel != null) {
			const li = document.createElement('li');
			li.className = 'lbxe-clone-item';
			li.append(createCloneButton(listUrl, ''));
			panel.append(li);
			console.log(LOG_PREFIX, 'Clone link not found, button added to actions panel');
			return true;
		}

		// Last resort: a floating button, so the feature is always reachable
		const floating = createCloneButton(listUrl, 'lbxe-floating');
		document.body.append(floating);
		console.log(LOG_PREFIX, 'Clone link and actions panel not found, using floating button');
		return true;
	}

	async function startClone(listUrl, button) {
		if (button.dataset.busy === 'true') return;
		button.dataset.busy = 'true';
		const originalText = button.textContent;

		try {
			const setStatus = text => button.textContent = text;
			setStatus('Collecting films…');

			const list = await collectList(listUrl, setStatus);
			if (list.films.length === 0) {
				throw new Error('No films were found in this list.');
			}

			const csv = buildCsv(list.films);
			await saveToCache(list, csv);
			await ext.storage.local.set({
				[PENDING_KEY]: {
					sourceUrl: listUrl,
					sourceTitle: list.title,
					filmCount: list.films.length,
					csv: csv,
					createdAt: Date.now()
				}
			});

			setStatus(`Opening new list (${list.films.length} films)…`);
			await openNewListTab();
			setStatus(`Cloned ${list.films.length} films ✓`);
		} catch (error) {
			console.error(LOG_PREFIX, error);
			button.textContent = 'Clone failed — click to retry';
			button.title = String(error && error.message ? error.message : error);
			button.dataset.busy = 'false';
			return;
		}

		setTimeout(() => {
			button.textContent = originalText;
			button.dataset.busy = 'false';
		}, 5000);
	}

	async function openNewListTab() {
		const url = 'https://letterboxd.com/list/new/';
		try {
			const res = await ext.runtime.sendMessage({ name: 'OPENTAB', url: url });
			if (res && res.ok) return;
		} catch (e) {
			console.warn(LOG_PREFIX, 'Background tab open failed, falling back to window.open', e);
		}
		window.open(url, '_blank');
	}

	async function fetchDocument(url) {
		const res = await fetch(url, { credentials: 'include' });
		if (res.status !== 200) {
			throw new Error(`Letterboxd returned ${res.status} for ${url}`);
		}
		const html = await res.text();
		return new DOMParser().parseFromString(html, 'text/html');
	}

	async function collectList(listUrl, setStatus) {
		const firstPage = await fetchDocument(listUrl);

		const list = {
			url: listUrl,
			title: getListTitle(firstPage),
			films: []
		};
		const seen = new Set();
		collectFilmsFromPage(firstPage, list.films, seen);

		const pageCount = Math.min(getPageCount(firstPage), MAX_PAGES);
		for (let page = 2; page <= pageCount; page++) {
			setStatus(`Collecting films… page ${page}/${pageCount}`);
			await new Promise(r => setTimeout(r, PAGE_DELAY));
			const doc = await fetchDocument(`${listUrl}page/${page}/`);
			collectFilmsFromPage(doc, list.films, seen);
		}

		return list;
	}

	function getListTitle(doc) {
		const meta = doc.querySelector('meta[property="og:title"]');
		if (meta != null && meta.content) return meta.content.trim();

		const titleElement = doc.querySelector('.list-title-intro .title-1, h1.title-1');
		return titleElement != null ? titleElement.textContent.trim() : '';
	}

	function getPageCount(doc) {
		const pages = doc.querySelectorAll('.paginate-pages li.paginate-page');
		let max = 1;
		pages.forEach(page => {
			const n = parseInt(page.textContent.trim());
			if (!isNaN(n) && n > max) max = n;
		});
		return max;
	}

	function collectFilmsFromPage(doc, films, seen) {
		// Current markup: <li class="posteritem"><div class="react-component" data-item-slug=...>
		// Older markup used data-film-slug on div.film-poster
		let posters = doc.querySelectorAll('.poster-list .posteritem [data-item-slug]');
		if (posters.length === 0) {
			posters = doc.querySelectorAll('.poster-list [data-item-slug], .poster-list [data-film-slug]');
		}

		posters.forEach(poster => {
			const slug = poster.getAttribute('data-item-slug') || poster.getAttribute('data-film-slug');
			if (!slug || seen.has(slug)) return;
			seen.add(slug);

			const displayName = poster.getAttribute('data-item-full-display-name')
				|| poster.getAttribute('data-item-name')
				|| poster.getAttribute('data-film-name')
				|| (poster.querySelector('img') && poster.querySelector('img').getAttribute('alt'))
				|| '';
			const { title, year } = splitTitleAndYear(displayName,
				poster.getAttribute('data-item-release-year') || poster.getAttribute('data-film-release-year'));

			films.push({
				position: films.length + 1,
				slug: slug,
				title: title,
				year: year,
				uri: `https://letterboxd.com/film/${slug}/`
			});
		});
	}

	function splitTitleAndYear(name, yearAttr) {
		name = (name || '').trim();
		const match = name.match(/^(.*)\s\((\d{4})\)$/);
		if (match != null) return { title: match[1].trim(), year: match[2] };
		return { title: name, year: yearAttr || '' };
	}

	// ======================================================================
	// CSV + cache
	// ======================================================================

	function csvField(value) {
		value = value == null ? '' : String(value);
		if (/[",\r\n]/.test(value)) {
			return '"' + value.replace(/"/g, '""') + '"';
		}
		return value;
	}

	// Letterboxd import format: LetterboxdURI gives an exact match, Title/Year are only a fallback.
	// Position keeps the original order (unknown columns are ignored by the importer).
	function buildCsv(films) {
		const rows = [['Position', 'Title', 'Year', 'LetterboxdURI']];
		films.forEach(film => rows.push([film.position, film.title, film.year, film.uri]));
		return rows.map(row => row.map(csvField).join(',')).join('\r\n') + '\r\n';
	}

	async function saveToCache(list, csv) {
		const data = await ext.storage.local.get({ [CACHE_KEY]: {} });
		const cache = data[CACHE_KEY] || {};
		cache[list.url] = {
			title: list.title,
			films: list.films,
			csv: csv,
			collectedAt: Date.now()
		};

		// Keep only the most recent lists
		const urls = Object.keys(cache).sort((a, b) => cache[b].collectedAt - cache[a].collectedAt);
		urls.slice(CACHE_MAX).forEach(url => delete cache[url]);

		await ext.storage.local.set({ [CACHE_KEY]: cache });
	}

	function csvFileName(pending) {
		const slug = pending.sourceUrl.match(/\/list\/([^\/]+)\//);
		return `${slug ? slug[1] : 'letterboxd-list'}.csv`;
	}

	// ======================================================================
	// New list page: upload the pending CSV
	// ======================================================================

	async function initNewListPage() {
		const data = await ext.storage.local.get(PENDING_KEY);
		const pending = data[PENDING_KEY];
		if (pending == null) return;

		if (Date.now() - pending.createdAt > PENDING_MAX_AGE) {
			await ext.storage.local.remove(PENDING_KEY);
			return;
		}

		addStyles();
		const banner = showBanner(`Cloning “${pending.sourceTitle || pending.sourceUrl}” (${pending.filmCount} films)… uploading CSV.`);

		// 1. An uploader that is already part of the page
		let input = await waitFor(findFileInput, 1500);
		if (input != null) {
			return finishUpload(banner, pending, () => uploadCsv(input, pending));
		}

		// 2. Letterboxd's "Import" button (button.js-import-trigger) opens the file picker with an input that
		//    is never added to the page. Intercept that picker in the page and give it the CSV instead.
		const importTrigger = await waitFor(findImportTrigger, 5000);
		if (importTrigger == null) {
			logImportDiagnostics();
			showFallback(banner, pending, 'Couldn’t find Letterboxd’s import button automatically.');
			return;
		}

		const uploaded = new Promise(resolve => document.addEventListener('lbxe-csv-uploaded', () => resolve('intercepted'), { once: true }));
		const armed = await armFileIntercept(pending);
		console.log(LOG_PREFIX, 'File picker intercept armed:', armed, '| clicking', importTrigger.outerHTML.slice(0, 300));
		importTrigger.click();

		// Either the intercept fills the picker's input, or an uploader shows up in the page
		const result = await Promise.race([
			uploaded,
			waitFor(findFileInput, 10000).then(el => el != null ? el : new Promise(r => setTimeout(() => r(null), 500)))
		]);

		if (result === 'intercepted') {
			return finishUpload(banner, pending, () => {});
		}
		if (result != null) {
			// Already filled by the intercept a moment earlier: don't upload twice
			if (result.files != null && result.files.length > 0) return finishUpload(banner, pending, () => {});
			return finishUpload(banner, pending, () => uploadCsv(result, pending));
		}

		logImportDiagnostics();
		showFallback(banner, pending, 'Couldn’t upload the CSV into Letterboxd’s importer automatically.');
	}

	async function finishUpload(banner, pending, upload) {
		try {
			upload();
			await ext.storage.local.remove(PENDING_KEY);
			setBannerText(banner, `Uploaded ${pending.filmCount} films from “${pending.sourceTitle}”. Review the matches, then add a name, tags and privacy.`);
			addBannerClose(banner);
		} catch (error) {
			console.error(LOG_PREFIX, error);
			showFallback(banner, pending, 'The automatic upload failed.');
		}
	}

	// Installs the file picker intercept in the page itself (see armFileIntercept in background.js)
	async function armFileIntercept(pending) {
		try {
			const res = await ext.runtime.sendMessage({ name: 'ARMFILEINTERCEPT', csv: pending.csv, filename: csvFileName(pending) });
			if (res && res.ok) return 'background';
			console.warn(LOG_PREFIX, 'Background intercept failed:', res && res.error);
		} catch (e) {
			console.warn(LOG_PREFIX, 'Background intercept failed:', e);
		}

		// Firefox fallback: patch the page's prototype through the content script's Xray wrappers
		if (typeof exportFunction === 'function' && window.wrappedJSObject) {
			const proto = window.wrappedJSObject.HTMLInputElement.prototype;
			let armedXray = true;
			setTimeout(() => armedXray = false, 20000);
			['click', 'showPicker'].forEach(method => {
				const original = proto[method];
				if (typeof original !== 'function') return;
				exportFunction(function () {
					if (armedXray && this.type === 'file') {
						armedXray = false;
						uploadCsv(this, pending);
						document.dispatchEvent(new CustomEvent('lbxe-csv-uploaded'));
						return;
					}
					return original.apply(this, arguments);
				}, proto, { defineAs: method });
			});
			return 'xray';
		}
		return false;
	}

	// Printed when the upload fails, so the real markup of Letterboxd's importer can be reported back
	function logImportDiagnostics() {
		console.log(LOG_PREFIX, 'Import diagnostics for', window.location.href);
		console.log(LOG_PREFIX, 'File inputs on page:', document.querySelectorAll('input[type="file"]').length);
		document.querySelectorAll('a, button, label, input, [data-action], [class*="import"]').forEach(el => {
			const text = (el.textContent || el.value || '').trim();
			const attrs = Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' ');
			if (/import|csv|upload/i.test(text + ' ' + attrs)) {
				console.log(LOG_PREFIX, 'Candidate:', el.outerHTML.slice(0, 400));
			}
		});
	}

	function findFileInput() {
		const inputs = document.querySelectorAll('input[type="file"]');
		for (const input of inputs) {
			// Skip image-only uploaders (avatars, backdrops); anything else may be the CSV importer
			const accept = (input.getAttribute('accept') || '').toLowerCase();
			const imageOnly = accept !== '' && accept.split(',').every(a => a.trim().startsWith('image/'));
			if (!imageOnly) return input;
		}
		return null;
	}

	function findImportTrigger() {
		const known = document.querySelector('.js-import-trigger');
		if (known != null) return known;

		const candidates = document.querySelectorAll('a, button, label');
		for (const el of candidates) {
			if (el.closest('.lbxe-banner')) continue;
			const text = el.textContent.trim();
			const href = el.getAttribute('href') || '';
			if (/^import\b/i.test(text) || /\/import\b/i.test(href)) return el;
		}
		return null;
	}

	function uploadCsv(input, pending) {
		const file = new File([pending.csv], csvFileName(pending), { type: 'text/csv' });
		const transfer = new DataTransfer();
		transfer.items.add(file);
		input.files = transfer.files;

		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new Event('change', { bubbles: true }));
	}

	function waitFor(finder, timeout) {
		return new Promise(resolve => {
			const found = finder();
			if (found != null) return resolve(found);

			const observer = new MutationObserver(() => {
				const el = finder();
				if (el != null) {
					observer.disconnect();
					clearTimeout(timer);
					resolve(el);
				}
			});
			observer.observe(document.documentElement, { childList: true, subtree: true });
			const timer = setTimeout(() => {
				observer.disconnect();
				resolve(null);
			}, timeout);
		});
	}

	// ======================================================================
	// UI
	// ======================================================================

	function showBanner(text) {
		const banner = document.createElement('div');
		banner.className = 'lbxe-banner';
		const span = document.createElement('span');
		span.className = 'lbxe-banner-text';
		span.textContent = text;
		banner.append(span);
		document.body.append(banner);
		return banner;
	}

	function setBannerText(banner, text) {
		banner.querySelector('.lbxe-banner-text').textContent = text;
	}

	function addBannerClose(banner) {
		const close = document.createElement('button');
		close.className = 'lbxe-banner-button';
		close.textContent = '✕';
		close.title = 'Dismiss';
		close.addEventListener('click', () => banner.remove());
		banner.append(close);
	}

	// Manual fallback: let the user download the CSV and upload it themselves
	function showFallback(banner, pending, reason) {
		setBannerText(banner, `${reason} Download the CSV and use Letterboxd’s “Import” button on this page.`);

		const download = document.createElement('button');
		download.className = 'lbxe-banner-button';
		download.textContent = 'Download CSV';
		download.addEventListener('click', async () => {
			const blob = new Blob([pending.csv], { type: 'text/csv' });
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = csvFileName(pending);
			document.body.append(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(a.href), 1000);
			await ext.storage.local.remove(PENDING_KEY);
		});
		banner.append(download);
		addBannerClose(banner);
	}

	function addStyles() {
		if (document.getElementById('lbxe-clone-styles')) return;
		const style = document.createElement('style');
		style.id = 'lbxe-clone-styles';
		style.textContent = `
			.lbxe-clone-button[data-busy="true"] { cursor: progress; opacity: 0.8; }
			.lbxe-clone-button.lbxe-floating {
				position: fixed; right: 16px; bottom: 16px; z-index: 100000;
				padding: 10px 14px; border-radius: 4px; background: #00c030; color: #fff !important;
				font-weight: bold; font-size: 13px; text-decoration: none; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
			}
			.lbxe-banner {
				position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
				z-index: 100000; max-width: min(640px, calc(100vw - 32px));
				display: flex; align-items: center; gap: 12px;
				padding: 12px 16px; border-radius: 6px;
				background: #2c3440; color: #fff; border: 1px solid #00c030;
				font-size: 14px; line-height: 1.4; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
			}
			.lbxe-banner-text { flex: 1; }
			.lbxe-banner-button {
				background: #00c030; color: #fff; border: 0; border-radius: 3px;
				padding: 6px 10px; cursor: pointer; font-weight: bold; white-space: nowrap;
			}
		`;
		(document.head || document.documentElement).append(style);
	}
})();
