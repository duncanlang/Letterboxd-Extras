import { LOAD_STATES } from '../constants';

const buttonLinkOrder = [
	'.tomato-button',
	'.meta-button',
	'.sens-button',
	'.mubi-button',
	'.filmaff-button',
	'.simkl-button',
	'.kinopoisk-button',
	'.allo-button',
	'.mal-button',
	'.anilist-button',
	'.anidb-button',
	'.filmarks-button',
	'.mojo-button',
	'.wiki-button',
	'.ddd-button'
];

/**
 * A generic class used to unify how references sources are accessed and how their data is appended to the webpage.
 */
export class Helper {

	constructor(storage, helpers, selectorPrefix) {

		this.storage = storage;
		this.helpers = helpers;

		/**
		 * A string defining the prefix of a class or id selector on an HTML Element.
		 *
		 * @type {string}
		 */
		this.selectorPrefix = selectorPrefix;


		/**
		 * A string defining the prefix of a class or id selector on an HTML Element.
		 *
		 * @type {?'load' | 'render' | 'complete'}
		 */
		this.buildStage = null;

		/**
		 * A flag indicating what our current data loading progress during an API call to an external data source.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.loadState = LOAD_STATES['Uninitialized'];


		/**
		 * The data returned by the external data source.
		 *
		 * @type {any | null}
		 * @default null
		 */
		this.data = null;


		/**
		 * A link to the film's page on the data source.
		 *
		 * @type {string | null}
		 * @default null
		 */
		this.linkURL = null;

		/**
		 * The API Link that returns the film's information.
		 * Only populate this field if it's necessary to access the same api endpoint multiple times.
		 *
		 * @type {string | null}
		 * @default null
		 */
		this.apiURL = null;

		/**
		 * A flag indicating whether the web page is being viewed in its mobile configuration.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.isMobile = false;

		/**
		 * A flag indicating whether a button link to the data source has been added.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.linkAdded = false;

		/**
		 * A flag indicating whether a ratings section has been added to the sidebar.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.ratingsAdded = false;

	}

	/**
	 * Runs the data extraction step of pulling from a data source.
	 * @param {string} id - The id or url of the resource.
	 */
	getData(id) {

		if (!this._canLoadData()) {

			return;

		}

		this.loadState = LOAD_STATES['Loading'];

		this._loadData(id);

	}

	/**
	 * Gets the requested data for a film's data source.
	 * @param {string} id - The id or url of the resource.
	 */
	_loadData(id) {

		throw new Error(`Letterboxd Extras | Error! The function Helper._loadData' must be overriden by a subclass`);

	}

	/**
	 * Makes an API request to an external data source and handles the response via a callback.
	 *
	 * @param {string} errorHeader - The name of the service for error logging (e.g., "AniList API", "MyAnimeList API")
	 * @param {string} url - The API endpoint URL to request data from
	 * @param {Object} [options] - Optional request options (headers, method, body, etc.) to be passed to the fetch request
	 * @param {function(Object): void} dataLoadCallback - Callback function to process the successful API response
	 * @protected
	 */
	_apiRequestCallback(errorHeader, url, options, dataLoadCallback) {
		try {

			const request = {
				name: 'GETDATA',
				type: 'JSON',
				url: url
			};

			if (Object.keys(options).length !== 0) {
				request.options = options;
			}

			browser.runtime.sendMessage(request, value => {

				if (this.helpers.ValidateResponse(errorHeader, value) === false) {
					this.loadState = LOAD_STATES['Failure'];
					return;
				}

				dataLoadCallback(value.response);

			});

		} catch (error) {

			console.error(`Letterboxd Extras | Unable to parse ${errorHeader} URL`);
			this.loadState = LOAD_STATES['Failure'];

		}

	}


	/**
	 * Populates the ratings sidebar with information from the data source.
	 * @abstract
	 */
	populateRatingsSidebar() {

		throw new Error(`Letterboxd Extras | Error! The function 'populateRatingsSidebar' must be overriden by a subclass`);

	}

	/**
	 * Adds html to the ratings sidebar for a given reference source.
	 *
	 * @param {HTMLElement} rating - The html that will be appending to the ratings sidebar
	 */
	appendSidebarRating(rating) {
		const order = [
			'.imdb-ratings',
			'.mal-ratings',
			'.anilist-ratings',
			'.allocine-ratings',
			'.tomato-ratings',
			'.meta-ratings',
			'.sens-ratings',
			'.mubi-ratings',
			'.filmaff-ratings',
			'.simkl-ratings',
			'.kinopoisk-ratings',
			'.anidb-ratings',
			'.filmarks-ratings',
			'.cinemascore'
		];


		let className = this.selectorPrefix;
		if (this.selectorPrefix !== 'cinemascore') {
			className = `${this.selectorPrefix}-button`;
		}

		const index = order.indexOf(`.${className}`);
		let sidebar = document.querySelector('.sidebar');

		if (this.storage.get('hide-ratings-enabled') === true) {
			const currentSidebar = sidebar;
			sidebar = document.querySelector('.extras-ratings-holder');

			if (sidebar === null) {
				sidebar = this.helpers.createElement('div', {
					class: 'extras-ratings-holder',
					style: 'display: none'
				});
				currentSidebar.append(sidebar);

				const moreButton = this.helpers.createElement('a', {
					class: 'text-slug extras-show-more'
				});
				moreButton.innerText = 'Show more ratings';
				currentSidebar.append(moreButton);

				moreButton.addEventListener('click', event => {
					toggleAllRatings(event);
				});
			}
		}

		// First
		for (let i = index + 1; i < order.length; i++) {
			const temp = sidebar.querySelector(order[i]);
			if (temp !== null) {
				temp.before(rating);
				return;
			}
		}

		// Second
		for (let i = index - 1; i >= 0; i--) {
			const temp = sidebar.querySelector(order[i]);
			if (temp !== null) {
				temp.after(rating);
				return;
			}
		}

		// Third
		sidebar.append(rating);

	}

	/**
	 * Adds a link to an external reference source on a film's overview page.
	 *
	 * @param {string} url - The url the button will redirect the user to .
	 * @param {text} string - The text to be displayed on the button.
	 */
	addButtonLink(url, text) {

		if (url === null || url === '') {
			return;
		}

		const className = `${this.selectorPrefix}-button`;

		// Check if already added
		if (!this.linkAdded) {

			this.linkAdded = true;

			if (document.querySelector(`.${className}`)) {
				return;
			}

			// Create Button Element
			const button = this.helpers.createElement('a', {
				class: `micro-button track-event ${className}`,
				href: url
			});
			button.innerText = text;

			if (this.storage.get('open-same-tab') !== true) {
				button.setAttribute('target', '_blank');
			}

			console.log('test');

			const index = buttonLinkOrder.indexOf(`.${className}`);
			// First Attempt
			for (let i = index + 1; i < buttonLinkOrder.length; i++) {
				const temp = document.querySelector(buttonLinkOrder[i]);
				if (temp !== null) {
					temp.before(button);
					return;
				}
			}

			// Second Attempt
			for (let i = index - 1; i >= 0; i--) {
				const temp = document.querySelector(buttonLinkOrder[i]);
				if (temp !== null) {
					temp.after(button);
					return;
				}
			}

			// Third Attempt
			const buttons = document.querySelectorAll('.micro-button');
			const lastButton = buttons[buttons.length - 1];
			lastButton.after(button);
		}

	}

	/**
	 * Determines whether the ratings sidebar can be populated with data.
	 *
	 * @returns {boolean}
	 * @protected
	 */
	_canPopulateRatingsSidebar() {

		return document.querySelector('.sidebar') !== null && this.data !== null && !document.querySelector(`${this.selectorPrefix}-ratings`);

	}

	/**
	 * Determines whether we can load date by checking if the load process has already been initialized.
	 *
	 * @returns {boolean}
	 * @protected
	 */
	_canLoadData() {

		// No data present and have not started to load already
		return this.data === null && this.loadState === LOAD_STATES['Uninitialized'];

	}

	/**
	 * Creates tooltip text below the generated ratings section.
	 *
	 * @returns {boolean}
	 * @protected
	 */
	_createRatingDetailsText(section, tooltip) {
		const detailsSpan = this.helpers.createElement('span', {
			class: `${this.selectorPrefix}-score-details mobile-details-text`
		});

		if (this.storage.get('tooltip-show-details') != true) {
			detailsSpan.style.display = 'none';
		}

		const detailsText = this.helpers.createElement('p', {});
		detailsText.innerText = tooltip;
		detailsSpan.append(detailsText);

		if (this.isMobile || this.storage.get('tooltip-show-details') === true) {
			section.append(detailsSpan);
		}
	}

}
