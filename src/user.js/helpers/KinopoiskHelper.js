import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class KinopoiskHelper extends Helper {

	constructor(storage, helpers) {

		super(storage, helpers, 'kinopoisk');

		this.id = null;

	}

	_loadData(kinopoiskID) {

		const options = this._getHeaders();
		const apiURL = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${kinopoiskID}`;

		this._apiRequestCallback('Kinopoisk', apiURL, options, response => {

			this.data = response;
			this.loadState = LOAD_STATES['Success'];

			if (this.data.webUrl !== null) {
				this.url = this.data.webUrl;
				this.addButtonLink(this.url, 'KINOPOISK');
			}

			this.populateRatingsSidebar();
		});

	}

	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		// Collect Date from the SIMKL API
		//* **************************************************************

		if (this.data.ratingKinopoisk !== null) {
			this.rating = this.data.ratingKinopoisk;
		}
		if (this.data.ratingKinopoiskVoteCount !== null) {
			this.num_ratings = this.data.ratingKinopoiskVoteCount;
		}

		// Do not display if there is no score or ratings
		if (this.rating === null && this.num_ratings === 0) return;

		// Add to Letterboxd
		//* **************************************************************
		// Add the section to the page

		const section = this._createChartSection(
			{
				href: this.url,
				style: `position: absolute; background-image: url("${browser.runtime.getURL('images/kinopoisk-logo-rus.svg')}")`
			},
			{
				style: 'height: 13px'
			}
		);

		// Score
		//* **************************************************************
		const container = this.helpers.createElement('span', {}, {
			'display': 'block',
			'margin-bottom': '10px'
		});
		section.append(container);

		container.append(this._generateScoreSpan({ href: `${this.url}reviews` }));

		// Add the tooltip as text for mobile
		this._createRatingDetailsText(section, this.tooltip);

		// APPEND to the sidebar
		//* ***********************************************************
		this.appendSidebarRating(section);

		// Add the hover events
		//* ****************************************************************
		this.helpers.addTooltipEvents(section);
	}

	_getHeaders() {
		const apiKey = this.storage.get('kinopoisk-apikey');

		if (apiKey) {
			return {
				method: 'GET',
				headers: {
					'X-API-KEY': apiKey
				}
			};
		}

		return {};
	}

}
