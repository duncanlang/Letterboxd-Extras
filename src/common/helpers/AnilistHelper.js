
import { LOAD_STATES } from '../constants';
import { Helper } from './helper';

export class AnilistHelper extends Helper {

	constructor(helpers) {

		super(helpers);

		this.id = null;
		this.url = null;
		this.data = null;
		this.highest = 0;
		this.num_ratings = 0;
		this.score = 'N/A';

	}

	getData() {

		if (this._canLoadData()) {
			this.wikiData.Anilist_ID = this.wiki.Anilist_ID.value;
			this.al.id = this.wiki.Anilist_ID.value;

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
					variables: { id: this.al.id }
				})
			};

			try {
				this.al.state = LOAD_STATES['Loading'];
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

					this.al.data = anilistResponse.data.Media;

					if (!this.al.data) {
						this.loadState = this.LOAD_STATES['Failure'];
						return;
					}


					this.al.url = this.al.data.siteUrl;
					this.addLink(this.al.data.siteUrl);

					this.al.state = LOAD_STATES['Success'];
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
			this.al.score = this.al.data.averageScore;
		}

		this.al.num_ratings = 0;
		// Loop first and determine highest votes and total
		if (this.al.data.stats.scoreDistribution.length === 10) {
			for (let ii = 0; ii < 10; ii++) {
				const amount = this.al.data.stats.scoreDistribution[ii].amount;
				if (amount > this.al.highest) { this.al.highest = amount; }

				this.al.num_ratings += amount;
			}
		}

		// Return if there are no ratings
		if (this.al.num_ratings === 0) { return; }

		// Create and Add
		// Add the section to the page
		const scoreSection = this.helpers.createChartSection('anilist-ratings');

		const logoHolder = this.helpers.createElement('a', {
			class: 'logo-holder-anilist',
			style: 'width: 100%;',
			href: `${this.al.data.siteUrl}/stats`
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

		scoreSection.append(this.helpers.createHistogramScore(letterboxd, 'anilist', this.al.score, this.al.num_ratings, `${this.al.data.siteUrl}/reviews`, this.isMobile));
		scoreSection.append(this.helpers.createHistogramGraph(letterboxd, 'anilist', '', this.al.num_ratings, this.al.data.stats.scoreDistribution, this.al.data.stats.scoreDistribution[ii], this.al.highest));

		// Add the tooltip as text for mobile
		const score = scoreSection.querySelector('.average-rating .tooltip');
		let tooltip = '';
		if (score !== null) {
			tooltip = score.getAttribute('data-original-title');
			this.helpers.createDetailsText('anilist', scoreSection, tooltip, this.isMobile);
		}

		// Append to the sidebar
		//* ****************************************************************
		this.appendRating(scoreSection, 'al-ratings');

		// Add the hover events
		//* ****************************************************************
		this.helpers.addTooltipEvents(scoreSection);

	}

}
