
import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class MyAnimeListHelper extends Helper {

	constructor(storage, helpers, pageState, ratingsSuffix) {

		super(storage, helpers, pageState, 'mal');

		this.ratingsSuffix = ratingsSuffix;

		this.id = null;
		this.url = null;
		this.data = null;
		this.highest = 0;
		this.num_ratings = 0;
		this.score = 'N/A';

	}

	_loadData(id) {

		const apiHeader = 'Jikan (MAL API)';

		const url = `https://api.jikan.moe/v4/anime/${id}`;
		this._apiRequestCallback(apiHeader, url, {}, response => {

			if (!response.data) {
				this.loadState = LOAD_STATES['Failure'];
				return;
			}

			this.data = response.data;
			this.linkURL = this.data.url;

			this._apiRequestCallback(`${apiHeader} ratings`, `${url}/statistics`, {}, response => {

				if (!response.data) {

					this.loadState = LOAD_STATES['Failure'];
					return;

				}

				this.statistics = response.data;
				this.loadState = LOAD_STATES['Success'];

				this.addButtonLink(this.linkURL, 'MAL');
				this.populateRatingsSidebar();

			});

		});
	}


	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		const { isMobile } = this.pageState;

		if (this.data.score !== null) {
			this.rating = this.data.score;
		}
		if (this.data.scored_by !== null) {
			this.num_ratings = this.data.scored_by;
		}

		// Return if there are no ratings
		if (this.num_ratings === 0) { return; }

		// Create and Add
		// Add the section to the page
		const scoreSection = this._createChartSection({
			href: `${this.data.url}/stats`,
			style: `position: absolute; background-image: url("${browser.runtime.getURL('images/mal-logo.png')}");`
		});

		// Loop first and determine highest votes
		for (let ii = 0; ii < 10; ii++) {
			if (this.statistics.scores[ii].votes > this.highest) {
				this.highest = this.statistics.scores[ii].votes;
			}
		}

		scoreSection.append(this.helpers.createHistogramScore(
			this.storage,
			'mal',
			this.rating,
			this.num_ratings,
			`${this.data.url}/reviews`,
			isMobile
		));

		scoreSection.append(this.helpers.createHistogramGraph(
			this.storage,
			'mal',
			'',
			this.num_ratings,
			this.statistics.scores,
			this.statistics.scores,
			this.highest
		));

		// Add the tooltip as text for mobile
		const score = scoreSection.querySelector('.average-rating .tooltip');
		let tooltip = '';
		if (score !== null) {
			tooltip = score.getAttribute('data-original-title');
			this._createRatingDetailsText(scoreSection, tooltip);
		}

		// Append to the sidebar
		//* ****************************************************************
		this.appendSidebarRating(scoreSection);

		// Add the hover events
		//* ****************************************************************
		this.helpers.addTooltipEvents(scoreSection);

	}

}
