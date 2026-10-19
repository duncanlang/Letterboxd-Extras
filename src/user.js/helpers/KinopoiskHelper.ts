/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

export class KinopoiskHelper extends Helper {

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'kinopoisk');

	}

	_loadData(kinopoiskID: string | number) {

		const options = this._getHeaders();
		const apiURL = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${kinopoiskID}`;

		this._apiRequestCallback('Kinopoisk', apiURL, 'JSON', options, value => {

			this.data = value.response;
			this.loadState = LOAD_STATES['Success'];

			if (this.data.webUrl !== null) {
				this.addButtonLink(this.data.webUrl, 'KINOPOISK');
				this.linkURL = this.data.webUrl;
			}

			this.populateRatingsSidebar();
		});

	}

	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		// Collect Date from the Kinopoisk API
		//* **************************************************************

		if (this.data.ratingKinopoisk != null) {
			this.rating = this.data.ratingKinopoisk;
		}
		if (this.data.ratingKinopoiskVoteCount != null) {
			this.num_ratings = this.data.ratingKinopoiskVoteCount;
		}

		// Do not display if there is no score or ratings
		if (this.rating == null && this.num_ratings === 0) return;

		// Add to Letterboxd
		//* **************************************************************
		// Add the section to the page

		const section = this._createChartSection(
			{
				href: this.linkURL,
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

		container.append(this._generateScoreSpan({ href: `${this.linkURL}reviews` }));

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
