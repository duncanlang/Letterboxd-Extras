import {vi} from 'vitest';

// Shared by the unit tests in test/unit.
// Stand-ins for the three things letterboxd-extras.js passes to every Helper:
// `new SomeHelper(storage, helpers, pageState)`. letterboxd-extras.js itself can't be imported in a
// test, because it starts observing the page and reading browser storage as soon as it loads.

/**
 * A synchronous stand-in for `letterboxd.storage`.
 *
 * @param {Record<string, any>} [values] - Options as they would be saved, e.g. `{'metacritic-enabled': true}`
 */
export function createStorage(values = {}) {
	const data = {...values};
	return {
		data,
		get: key => data[key],
		set(key, value) {
			data[key] = value;
		},
	};
}

/**
 * A stand-in for `letterboxd.helpers`, the shared helpers. Only what helpers call is provided.
 * Functions that touch globals defined outside the bundle (`toggleDetails`, `ShowTwipsy` in
 * common/additional.js) are replaced with spies so tests can assert they would have run.
 */
export function createHelpers() {
	const helpers = {
		// Copied from letterboxd.helpers.createElement. Import the real one instead once shared helpers
		// live in their own module (the planned singleton).
		createElement(tag, attrs, styles) {
			const element = document.createElement(tag);
			for (const aKey in attrs) {
				if (!Object.prototype.hasOwnProperty.call(attrs, aKey)) continue;
				element.setAttribute(aKey, attrs[aKey]);
			}
			for (const sKey in styles) {
				if (!Object.prototype.hasOwnProperty.call(styles, sKey)) continue;
				element.style[sKey] = styles[sKey];
			}
			return element;
		},

		// Same element as letterboxd.helpers.createShowDetailsButton; clicking calls the toggleDetails spy.
		createShowDetailsButton(name, target) {
			const showDetails = helpers.createElement('a', {
				class: 'all-link more-link show-details ' + name + '-show-details',
				target,
			});
			showDetails.innerText = 'SHOW DETAILS';
			showDetails.addEventListener('click', event => helpers.toggleDetails(event));
			return showDetails;
		},

		toggleDetails: vi.fn(),
		addTooltipEvents: vi.fn(),
		WriteConsoleLog: vi.fn(),
	};
	return helpers;
}

/** A stand-in for `letterboxd.overview.pageState`: a desktop page with ratings visible. */
export function createPageState(overrides = {}) {
	return {
		isMobile: false,
		hideRatings: false,
		hideReviews: false,
		filmWatched: false,
		...overrides,
	};
}

/** Parses HTML the way letterboxd.helpers.parseHTML does for fetched pages. */
export function parseHTML(html) {
	return new DOMParser().parseFromString(html, 'text/html');
}
