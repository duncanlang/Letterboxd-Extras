
import { LOAD_STATES } from '../constants';
import { Helper } from '../helpers/Helper';

export class MALHelper extends Helper {

	constructor(storage, helpers, ratingsSuffix) {

		super(storage, helpers);

		this.ratingsSuffix = ratingsSuffix;

		this.id = null;
		this.url = null;
		this.data = null;
		this.highest = 0;
		this.num_ratings = 0;
		this.score = 'N/A';

	}

	getData(anilistID) {

		if (this._canLoadData()) {
			this.id = anilistID;

			const url = 'https://graphql.anilist.co';
			const query = this.helpers.getAniListQuery();
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

			try {
				this.loadState = LOAD_STATES['Loading'];
				browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: url, options: options }, value => {
					if (this.helpers.ValidateResponse('AniList API', value) === false) {
						return;
					}

					const anilistResponse = value.response;

					if (!anilistResponse || !anilistResponse.data) {
						this.loadState = LOAD_STATES['Failure'];
						if (value.errors !== null) {
							console.error(`Letterboxd Extras | AniList API Error: ${value.errors[0].message}`);
						} else {
							console.error(`Letterboxd Extras | AniList Unknown API Error. Status: ${value.status}`);
						}
						return;
					}

					this.data = anilistResponse.data.Media;

					if (!this.data) {
						this.loadState = this.LOAD_STATES['Failure'];
						return;
					}

					this.url = this.data.siteUrl;
					this.addLink(this.data.siteUrl, 'AL', 'anilist-button');

					this.loadState = LOAD_STATES['Success'];
					this.populateSidebar();

				});
			} catch {
				console.error('Letterboxd Extras | Unable to parse AniList URL');
				this.loadState = LOAD_STATES['Failure'];
			}
		}

	}


	populateSidebar() {

		if (!this._canPopulateSidebar()) {
			return;
		}

		if (document.querySelector('.anilist-ratings')) {
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
		const scoreSection = this.helpers.createChartSectionElement('anilist');
		const heading = this.helpers.createChartSectionHeader();
		scoreSection.append(heading);

		const logoHolder = this.helpers.createElement('a', {
			class: 'logo-holder-anilist',
			style: 'width: 100%;',
			href: `${this.data.siteUrl}/stats`
		});
		// heading.append(logoHolder);

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

		let showDetails = null;
		if (this.isMobile) {
			// Add the Show Details button
			showDetails = this.helpers.createShowDetailsButton('anilist', 'anilist-score-details');
			scoreSection.append(showDetails);
		}

		scoreSection.append(this.helpers.createHistogramScore(this.storage, 'anilist', this.score, this.num_ratings, `${this.data.siteUrl}/reviews`, this.isMobile));
		scoreSection.append(this.helpers.createHistogramGraph(this.storage, 'anilist', '', this.num_ratings, this.data.stats.scoreDistribution, this.data.stats.scoreDistribution[ii], this.highest));

		// Add the tooltip as text for mobile
		const score = scoreSection.querySelector('.average-rating .tooltip');
		let tooltip = '';
		if (score !== null) {
			tooltip = score.getAttribute('data-original-title');
			this.helpers.createDetailsText('anilist', scoreSection, tooltip, this.isMobile);
		}

		console.log('appending sidebar');

		// Append to the sidebar
		//* ****************************************************************
		this.appendSidebarRating(scoreSection, 'al-ratings');

		// Add the hover events
		//* ****************************************************************
		this.helpers.addTooltipEvents(scoreSection);

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
