
import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class MyAnimeListHelper extends Helper {

	constructor(storage, helpers, ratingsSuffix) {

		super(storage, helpers, 'mal');

		this.ratingsSuffix = ratingsSuffix;

		this.id = null;
		this.url = null;
		this.data = null;
		this.highest = 0;
		this.num_ratings = 0;
		this.score = 'N/A';

	}

	_loadData(id) {

		this.id = myAnimeListID;

		const url = `https://api.jikan.moe/v4/anime/${myAnimeListID}`;
		this.url = url;

		try {
			this.loadState = LOAD_STATES['Loading'];
			browser.runtime.sendMessage({ name: 'GETDATA', url: url }, value => {
				if (this.ValidateResponse('Jikan (MAL API)', value) === false) {
					return;
				}

				const malResponse = value.response;

				if (malResponse === '') {
					this.loadState = LOAD_STATES['Failure'];
					return;
				}

				const tempJSON = JSON.parse(malResponse);

				if (!tempJSON.data) {
					this.loadState = LOAD_STATES['Failure'];
					return;
				}

				this.data = tempJSON.data;
				this.url = tempJSON.url;

			});

			browser.runtime.sendMessage({ name: 'GETDATA', url: `${url}/statistics` }, value => {
				if (this.helpers.ValidateResponse('Jikan (MAL API) ratings', value) === false) {
					return;
				}

				const malResponse = value.response;
				if (malResponse === '') {
					this.loadState = LOAD_STATES['Failure'];
					return;
				}

				const tempJSON = JSON.parse(malResponse);
				if (!tempJSON.data) {
					this.loadState = LOAD_STATES['Failure'];
					return;
				}

				this.statistics = tempJSON.data;

			});

			this.loadState = LOAD_STATES['Success'];
			this.addButtonLink(this.url, 'MAL');
			this.populateRatingsSidebar();

		} catch {
			console.error('Letterboxd Extras | Unable to parse MAL URL');
			this.loadState = LOAD_STATES['Failure'];
		}
	}


	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		// Init
		this.score = 'N/A';
		this.scored_by = 0;

		if (this.data.score !== null) { this.score = this.data.score; }
		if (this.data.scored_by !== null) { this.scored_by = this.data.scored_by; }

		// Return if there are no ratings
		if (this.scored_by === 0) { return; }

		// Create and Add
		// Add the section to the page
		const scoreSection = this.helpers.createChartSection('mal', {
			href: `${this.mal.data.url}/stats`,
			style: `position: absolute; background-image: url("${browser.runtime.getURL('images/mal-logo.png')}");`
		});

		let showDetails = null;
		if (this.isMobile) {
			// Add the Show Details button
			showDetails = this.helpers.createShowDetailsButton('mal', 'mal-score-details');
			scoreSection.append(showDetails);
		}

		// Loop first and determine highest votes
		for (let ii = 0; ii < 10; ii++) {
			if (this.statistics.scores[ii].votes > this.mal.highest) { this.highest = this.statistics.scores[ii].votes; }
		}

		scoreSection.append(this.helpers.createHistogramScore(
			this.storage,
			'mal',
			this.score,
			this.scored_by,
			`${this.mal.data.url}/reviews`,
			this.isMobile
		));

		scoreSection.append(this.helpers.createHistogramGraph(
			this.storage,
			'mal',
			'',
			this.scored_by,
			this.statistics.scores,
			this.statistics.scores,
			this.highest
		));

		// Add the tooltip as text for mobile
		const score = scoreSection.querySelector('.average-rating .tooltip');
		let tooltip = '';
		if (score !== null) {
			tooltip = score.getAttribute('data-original-title');
			this._createRatingDetailsText('mal', scoreSection, tooltip, this.isMobile);
		}

		// Append to the sidebar
		//* ****************************************************************
		this.appendSidebarRating(scoreSection);

		// Add the hover events
		//* ****************************************************************
		this.helpers.addTooltipEvents(scoreSection);

	}

}
