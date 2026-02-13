import { LOAD_STATES } from '../constants';

const buttonLinkOrder = [
	'.tomato-button',
	'.meta-button',
	'.sens-button',
	'.mubi-button',
	'.filmaff-button',
	'.simkl-button',
	'.kinopoisk-button',
	'.douban-button',
	'.allocine-button',
	'.mdl-button',
	'.mal-button',
	'.anilist-button',
	'.anidb-button',
	'.filmarks-button',
	'.criterion-button',
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
		/* this.buildStage = null; */

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

		/**
		 * Description of the data displayed in the sidebar.
		 *
		 * @type {string}
		 * @default ''
		 */
		this.tooltip = '';

		this.spineAdded = false;

	}

	/**
	 * Runs the data extraction step of pulling from a data source.
	 * @param {any} data - The id or url of the resource.
	 */
	getData(data) {

		if (!this._canLoadData()) {

			return;

		}

		this.loadState = LOAD_STATES['Loading'];

		this._loadData(data);

	}

	/**
	 * Gets the requested data for a film's data source.
	 * @param {any} data - The id or url of the resource.
	 */
	_loadData(data) {

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

				if (!value.response) {

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
			'.mdl-ratings',
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
			'.douban-ratings',
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
	 * @param {string} text - The text to be displayed on the button.
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
	 * @param {HTMLElement} section - The sidebar section element to append the details text to
	 * @param {string} tooltip - The tooltip text to display
	 * @protected
	 */
	_createRatingDetailsText(section, tooltip) {
		const detailsSpan = this.helpers.createElement('span', {
			class: `${this.selectorPrefix}-score-details mobile-details-text`
		});

		if (this.storage.get('tooltip-show-details') !== true) {
			detailsSpan.style.display = 'none';
		}

		const detailsText = this.helpers.createElement('p', {});
		detailsText.innerText = tooltip;
		detailsSpan.append(detailsText);

		if (this.isMobile || this.storage.get('tooltip-show-details') === true) {
			section.append(detailsSpan);
		}
	}


	/**
	 * Calculates the display score, tooltip text, and score denominator for a rating.
	 *
	 * @param {number | null} score - The rating score on a 10-point scale
	 * @param {number | null} [altScore] - An optional pre-calculated 5-point score from the API
	 * @returns {{ tooltip: string, score: string | number, totalScore: string }}
	 * @protected
	 */
	_handleAverageScore(score, altScore) {

		let totalScore = '/10';

		if (score !== null && this.storage.get('convert-ratings') === '5') {
			totalScore = '/5';
			score = altScore ? altScore : score / 2;
		}

		let tooltip = 'No score available';
		const ratingsText = `rating${this.num_ratings > 0 ? 's' : ''}`;

		if (score === null && this.num_ratings === 0) {

			score = 'N/A';
			return { tooltip, score, totalScore };

		}

		if (this.num_ratings > 0 && this.rating === null) {

			tooltip = `${this.num_ratings} ${ratingsText}`;
			score = 'N/A';
			return { tooltip, score, totalScore };

		}

		score = score.toFixed(1);
		tooltip = `Average of ${score.toLocaleString()}${totalScore} based on ${this.num_ratings.toLocaleString()} ${ratingsText}`;

		return { tooltip, score, totalScore };

	}

	/**
	 * Generates a span containing the film's rating on a 5-point or 10-point scale.
	 *
	 * @param {Object} options
	 * @param {string} options.href - The URL that the score link will redirect to
	 * @returns {HTMLSpanElement}
	 * @protected
	 */
	_generateScoreSpan({ href }) {

		// The span that holds the score
		const scoreSpan = this.helpers.createElement('span', {
			class: `${this.selectorPrefix}-score`
		}, {
			display: 'inline-block'
		});

		const { tooltip, score, totalScore } = this._handleAverageScore(this.rating, this.ratingAlt);
		this.tooltip = tooltip;

		// The element that is the score itself
		const scoreText = this.helpers.createElement('a', {
			class: `tooltip tooltip-extra display-rating -highlight ${this.selectorPrefix}-score`
		});

		if (this.isMobile === true) scoreText.setAttribute('class', `${scoreText.getAttribute('class')} extras-mobile`);
		scoreText.innerText = score;
		scoreText.setAttribute('data-original-title', tooltip);
		scoreText.setAttribute('href', href);

		scoreSpan.append(scoreText);

		// Create score denominator
		const scoreTotal = this.helpers.createElement('p', {
			style: 'display: inline-block; font-size: 10px; color: darkgray; margin-bottom: 0px;'
		});
		scoreTotal.innerText = totalScore;
		scoreSpan.append(scoreTotal);

		return scoreSpan;

	}

	/**
	 * Creates a section element that will be used on the Letterboxd sidebar.
	 * @returns {HTMLSectionElement}
	 * @protected
	 */
	_createChartSectionElement() {

		return this.helpers.createElement('section', {
			class: `section ratings-histogram-chart ${this.selectorPrefix}-ratings ratings-extras extras-chart`
		});

	}

	/**
	 * Creates a header for a Letterboxd sidebar section.
	 *
	 * @param {Object} [headerStyle] - Optional style properties for the header element
	 * @param {string} [headerStyle.style] - CSS style string to apply to the heading
	 * @returns {HTMLHeadingElement}
	 * @protected
	 */
	_createChartSectionHeader(headerStyle) {

		const headerProps = {
			class: 'section-heading section-heading-extras',
			...(headerStyle ? { style: headerStyle } : {})
		};

		const heading = this.helpers.createElement('h2', headerProps);
		return heading;

	}

	/**
	 * Creates a holder for the data source's logo on the sidebar section.
	 *
	 * @param {Object} logoProps
	 * @param {string} logoProps.href - The URL the logo links to
	 * @param {string} [logoProps.style] - CSS style string for the logo element
	 * @param {string} [logoProps.innerHTML] - HTML string to set as the logo's inner content
	 * @returns {HTMLAnchorElement}
	 * @protected
	 */
	_createChartSectionLogoHolder(logoProps) {

		const logoHolder = this.helpers.createElement('a', {
			class: `logo-${this.selectorPrefix}`,
			href: logoProps.href,
			style: logoProps.style
		});

		if (logoProps.innerHTML) {
			logoHolder.innerHTML += logoProps.innerHTML;
		}

		return logoHolder;

	}

	/**
	 * Creates a "SHOW DETAILS" button for mobile views.
	 *
	 * @returns {HTMLAnchorElement}
	 * @protected
	 */
	_createShowDetailsButton() {

		// Add the Show Details button
		const showDetails = this.helpers.createElement('a', {
			class: `all-link more-link show-details ${this.selectorPrefix}-show-details`,
			'target': `${this.selectorPrefix}-score-details`
		});
		showDetails.innerText = 'SHOW DETAILS';

		// Add click event
		showDetails.addEventListener('click', event => {
			toggleDetails(event, this.storage, this.isMobile);
		});

		return showDetails;
	}


	/**
	 * Creates the base section element for the data source's sidebar ratings element.
	 *
	 * @param {Object} logoProps
	 * @param {string} logoProps.href - The URL the logo links to
	 * @param {string} [logoProps.style] - CSS style string for the logo element
	 * @param {string} [logoProps.innerHTML] - HTML string to set as the logo's inner content
	 * @param {Object} [headerStyle] - Optional style properties for the header element
	 * @param {string} [headerStyle.style] - CSS style string to apply to the heading
	 * @returns {HTMLSectionElement}
	 * @protected
	 */
	_createChartSection(logoProps, headerStyle) {

		const chartSection = this._createChartSectionElement();
		const heading = this._createChartSectionHeader(headerStyle);
		chartSection.append(heading);

		const logoHolder = this._createChartSectionLogoHolder(logoProps);
		heading.append(logoHolder);

		if (this.isMobile) {
			// Add the Show Details button
			const showDetails = this._createShowDetailsButton();
			chartSection.append(showDetails);
		}

		return chartSection;

	}

	/**
	 * Creates the base section element for the data source's sidebar ratings element.
	 *
	 * @param {Object} options
	 * @param {string} options.sourceID - Id of the HTMLElement for the newly created service
	 * @param {string} options.title - Descriptor for the data-original-title
	 * @param {string} options.link - Link for the movie
	 * @returns {HTMLSectionElement}
	 * @protected
	 */
	_createWatchLink(options) {

		const watchSection = document.getElementById('watch');

		if (watchSection === null) {
			console.log('unable to find watch section');
			return;
		}

		let sections = watchSection.querySelector('.services');

		if (sections === null) {
			sections = this.helpers.createElement('div', {
				class: 'services'
			});
			watchSection.append(sections);
		}

		const serviceParagraph = this.helpers.createElement('p', {
			class: 'service extras-service',
			id: `source-${options.sourceID}`
		});


		serviceParagraph.append(this._createWatchLinkDisplay(options));
		serviceParagraph.append(this._createWatchLinkPurchaseOptions(
			[{ text: 'Buy', link: options.link }], { sourceID: options.sourceID, sourceName: options.title }
		));

		sections.append(serviceParagraph);

	}

	_createWatchLinkDisplay(options) {

		const watchLinkDisplay = this.helpers.createElement('a', {
			class: 'label track-event tooltip',
			'data-track-action': 'availability',
			target: '_blank',
			rel: 'nofollow noopener noreferrer',
			'data-original-title': `View on ${options.title}`,
			'data-track-params': `{"service": "${options.sourceID}"}`,
			href: options.link
		});
		watchLinkDisplay.setAttribute('data-track-action', 'availability');
		watchLinkDisplay.setAttribute('data-original-title', `View on ${options.title}`);
		watchLinkDisplay.setAttribute('data-track-params', `{"service": "${options.sourceID}"}`);

		const brandElement = this.helpers.createElement('span', {
			class: 'brand'
		});

		brandElement.innerHTML += '<svg></svg>';

		const titleElement = this.helpers.createElement('span', {
			class: 'title'
		});
		const nameSpan = this.helpers.createElement('span', {
			class: 'name'
		});
		nameSpan.innerText = options.title;
		titleElement.append(nameSpan);

		watchLinkDisplay.append(brandElement);
		watchLinkDisplay.append(titleElement);

		return watchLinkDisplay;


	}

	/**
	 * Creates a purchase option button on a watch service row in the watch section.
	 *
	 * @param {Object} purchaseOption - Options related to the purchasing action itself.
	 * @param {string} purchaseOption.text - Verb for the purchase action.
	 * @param {string} purchaseOption.link - Link directing the user to the purchase option (in most cases is just the link to the film itself)
	 * @param {Object} sourceOption - Options related to the source for the purchase action.
	 * @param {string} sourceOption.sourceName - Name of the source.
	 * @param {string} sourceOption.sourceID - The id of the source
	 * @returns {HTMLSpanElement}
	 * @protected
	 */
	_createWatchLinkPurchaseButton(purchaseOption, sourceOptions) {

		const purchaseButton = this.helpers.createElement('a', {
			class: `link -${purchaseOption.text.toLowerCase()} track-event`,
			'data-track-action': 'availability',
			'data-track-params': `{"service": "${sourceOptions.sourceID}"}`,
			href: purchaseOption.link,
			title: `${purchaseOption.text} from ${sourceOptions.sourceName}`,
			target: '_blank',
			rel: 'nofollow noopener noreferrer'
		});

		const textSpan = this.helpers.createElement('span', {
			class: 'extended'
		});
		textSpan.innerText = purchaseOption.text;

		purchaseButton.append(textSpan);

		return purchaseButton;

	}

	_createWatchLinkPurchaseOptions(purchaseOptions, sourceOptions) {

		const purchaseOptionsSpan = this.helpers.createElement('span', {
			class: 'options js-film-availability-options'
		});

		for (const purchaseOption of purchaseOptions) {

			purchaseOptionsSpan.append(
				this._createWatchLinkPurchaseButton(purchaseOption, sourceOptions)
			);

		}

		return purchaseOptionsSpan;

	}

	_addSpineIndicator({ logoSVG, title, spineID }) {
		if (this.spineAdded) return;

		const posterSection = document.querySelector('section.poster-list.-p230.-single');
		if (posterSection === null) return;

		if (posterSection.querySelector('.extras-spine-indicator') !== null) return;

		const spineLink = this.helpers.createElement('a', {
			class: 'extras-spine-indicator criterion-spine',
			href: this.linkURL,
			title: `${title} - Spine #${spineID}`,
			target: '_blank',
			rel: 'noopener noreferrer'
		});

		const logoContainer = this.helpers.createElement('span', {
			class: 'spine-logo'
		});
		logoContainer.innerHTML = logoSVG;
		spineLink.append(logoContainer);

		const spineStr = String(spineID);
		const digitCount = spineStr.length;
		const spineClass = digitCount <= 2 ? `spine-number spine-digits-${digitCount}` : 'spine-number';
		const spineNumber = this.helpers.createElement('span', {
			class: spineClass
		});
		spineNumber.innerText = spineID;
		spineLink.append(spineNumber);

		posterSection.prepend(spineLink);
		this.spineAdded = true;
	}

}
