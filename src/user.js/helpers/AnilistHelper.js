
import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';


/**
 * A class that helps access and display data from Anilist.
 *
 * @augments Helper
 */
export class AnilistHelper extends Helper {

	constructor(storage, helpers, ratingsSuffix) {

		super(storage, helpers, 'anilist');

		this.ratingsSuffix = ratingsSuffix;

		this.id = null;
		this.linkURL = null;
		this.data = null;
		this.highest = 0;
		this.num_ratings = 0;
		this.score = 'N/A';

	}

	_loadData(id) {

		this.id = id;

		const url = 'https://graphql.anilist.co';
		const options = this._getHeaders();

		this.loadState = LOAD_STATES['Loading'];

		this._apiRequestCallback('Anilist API', url, options, response => {

			const anilistResponse = response;

			if (!anilistResponse || !anilistResponse.data) {
				this.loadState = LOAD_STATES['Failure'];
				return;
			}

			this.data = anilistResponse.data.Media;

			if (!this.data) {
				this.loadState = this.LOAD_STATES['Failure'];
				return;
			}

			this.loadState = LOAD_STATES['Success'];

			this.url = this.data.siteUrl;
			this.addButtonLink(this.data.siteUrl, 'AL');

			this.populateRatingsSidebar();

		});

	}

	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		if (this.data.averageScore !== null) {
			this.score = this.data.averageScore;
		}

		this.num_ratings = 0;
		let ii = 0;
		// Loop first and determine highest votes and total
		if (this.data.stats.scoreDistribution.length === 10) {
			for (ii = 0; ii < 10; ii++) {
				const amount = this.data.stats.scoreDistribution[ii].amount;
				if (amount > this.highest) {
					this.highest = amount;
				}

				this.num_ratings += amount;
			}
		}

		// Return if there are no ratings
		if (this.num_ratings === 0) { return; }

		// Create and Add
		// Add the section to the page
		const scoreSection = this._createChartSectionElement();
		const heading = this._createChartSectionHeader();
		scoreSection.append(heading);

		const logoHolder = this.helpers.createElement('a', {
			class: 'logo-holder-anilist',
			style: 'width: 100%;',
			href: `${this.data.siteUrl}/stats`
		});
		heading.append(logoHolder);

		const logo = this.helpers.createElement('span', {
			class: 'logo-anilist',
			style: 'height: 20px; width: 20px; background-image: url("https://graphql.anilist.co/img/icons/icon.svg");'
		});
		logoHolder.append(logo);

		const logoText = this.helpers.createElement('span', {
			class: 'text-anilist',
			style: 'vertical-align: super;'
		});
		logoText.innerText = 'AniList';
		logoHolder.append(logoText);

		if (this.isMobile) {
			scoreSection.append(this._createShowDetailsButton());
		}

		scoreSection.append(this.helpers.createHistogramScore(this.storage, 'anilist', this.score, this.num_ratings, `${this.data.siteUrl}/reviews`, this.isMobile));
		scoreSection.append(this.helpers.createHistogramGraph(this.storage, 'anilist', '', this.num_ratings, this.data.stats.scoreDistribution, this.data.stats.scoreDistribution[ii], this.highest));

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

	_getHeaders() {

		const query = this._getAniListQuery();

		const options = {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json'
			},
			body: JSON.stringify({
				query: query,
				variables: { id: this.id }
			})
		};

		return options;

	}

	_getAniListQuery() {
		const query = `
					query ($id: Int!) {
						Media(id: $id, type: ANIME) {
							averageScore
							meanScore
							popularity
							stats {
								scoreDistribution {
								score
								amount
								}
							}
							siteUrl
							}
					}
				`;
		return query;
	}

}
