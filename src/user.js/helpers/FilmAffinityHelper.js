import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class FilmAffinityHelper extends Helper {

	constructor(storage, helpers) {

		super(storage, helpers, 'filmaff');
		this.rating = null;
		this.num_ratings = 0;
		this.isMobile = false;

	}

	_loadData(id) {

		this.id = id;

		const validLocales = ['us', 'ca', 'mx', 'es', 'uk', 'ie', 'au', 'ar', 'cl', 'co', 'uy', 'py', 'pe', 'ec', 've', 'cr', 'hn', 'gt', 'bo', 'do'];
		let locale = 'us';
		const browserLocale = window.navigator.language.substring(3, 5).toLowerCase();
		if (validLocales.includes(browserLocale)) {
			locale = browserLocale;
		}

		this.linkURL = `https://www.filmaffinity.com/${locale}/film${id}.html`;
		this._apiRequestCallback('FilmAffinity', this.linkURL, {}, response => {

			const filmaffData = response;
			console.log(filmaffData);
			if (filmaffData !== '') {
				this.data = this.helpers.parseHTML(filmaffData);

				this.loadState = LOAD_STATES['Success'];

				this.addButtonLink(this.linkURL, 'Affinity');
				this.populateRatingsSidebar();
			}

		});

	}

	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		// Collect Date from the FilmAffinity Page
		//* **************************************************************
		if (this.isMobile === true) {
			// Get score from mobile site
			if (this.data.querySelector('span[itemprop="ratingValue"]') !== null) {
				this.rating = this.data.querySelector('span[itemprop="ratingValue"]').getAttribute('content');
				this.rating = parseFloat(this.rating);
			}
			if (this.data.querySelector('span[itemprop="ratingValue"]') !== null) {
				this.num_ratings = this.data.querySelector('span[itemprop="ratingCount"]').getAttribute('content');
				this.num_ratings = parseFloat(this.num_ratings);
			}
		} else {
			// Get score from desktop site
			if (this.data.querySelector('#movie-rat-avg') !== null) {
				this.rating = this.data.querySelector('#movie-rat-avg').getAttribute('content');
				this.rating = parseFloat(this.rating);
			}
			if (this.data.querySelector('#movie-count-rat span') !== null) {
				this.num_ratings = this.data.querySelector('#movie-count-rat span').getAttribute('content');
				this.num_ratings = parseFloat(this.num_ratings);
			}
		}

		// Do not display if there is no score or ratings
		if (this.rating === null && this.num_ratings === 0) return;

		// Add to Letterboxd
		//* **************************************************************
		// Add the section to the page
		const section = this.helpers.createElement('section', {
			class: 'section ratings-histogram-chart filmaff-ratings ratings-extras'
		});

		// Add the Header
		const heading = this.helpers.createElement('h2', {
			class: 'section-heading section-heading-extras'
		});
		section.append(heading);

		const logo = this.helpers.createElement('a', {
			class: 'logo-filmaff',
			style: 'height: 20px; width: 75px; background-image: url("https://www.filmaffinity.com/images/logo4.png");'
		});
		logo.setAttribute('href', this.linkURL);
		heading.append(logo);

		let showDetails = null;
		if (this.isMobile) {
			// Add the Show Details button
			showDetails = this.helpers.createShowDetailsButton('filmaff', 'filmaff-score-details');
			section.append(showDetails);
		}

		// Score
		//* **************************************************************
		const container = this.helpers.createElement('span', {}, {
			'display': 'block',
			'margin-bottom': '10px'
		});
		section.append(container);

		container.append(this._generateScoreSpan({
			href: this.linkUrl
		}));

		// Add the tooltip as text for mobile
		this._createRatingDetailsText(section, this.tooltip);

		// APPEND to the sidebar
		//* ***********************************************************
		this.appendSidebarRating(section);

		// Add Hover events
		//* ***********************************************************
		this.helpers.addTooltipEvents(section);
	}

}
