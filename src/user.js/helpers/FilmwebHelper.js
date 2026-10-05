import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class FilmwebHelper extends Helper {

	constructor(storage, helpers, pageState) {

		super(storage, helpers, pageState, 'filmweb');

		this.loadState = LOAD_STATES['Uninitialized'];
		this.id = null;
		this.url = null;
		this.linkUrl = null;
		this.data = null;
		this.highest = 0;
		this.num_ratings = 0;
		this.score = null;
		this.votes = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.percents = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	}

	_loadData(id) {

		this.id = id;

		// First, we need to get the proper url (with title slug) so we can link to the sub pages properly
		this.url = `https://www.filmweb.pl/api/v1/film/${id}/preview`;
		this._apiRequestCallback('Filmweb', this.url, 'JSON', {}, response => {			

			if (response && response.year && response.title && response.title.title) {
				this.linkUrl = `https://www.filmweb.pl/film/${response.title.title.replace(' ', '+')}-${response.year}-${id}`;
				this.addButtonLink(this.linkUrl, 'Filmweb');

				// Now we can call the ratings API
				this.url = `https://www.filmweb.pl/api/v1/film/${id}/rating`;

				this._apiRequestCallback('Filmweb', this.url, 'JSON', {}, response => {

					if (response) {
						this.data = response;
						this.loadState = LOAD_STATES['Success'];

						this.score = this.data.rate;
						this.num_ratings = this.data.count;

						for (let ii = 0; ii < 10; ii++) {

							let amount = this.data['countVote' + (ii+1)];
							this.votes[ii] = amount;
							this.percents[ii] = ((amount / this.num_ratings) * 100).toFixed(1);
							
							if (amount > this.highest) {
								this.highest = amount;
							}
						}

						this.populateRatingsSidebar();
					}

				});
			}
		});
	}

	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		const { isMobile } = this.pageState;

		// Return if there are no ratings
		if (this.num_ratings === 0) { return; }

		// Create and Add
		// Add the section to the page
		const section = this._createChartSectionElement(true);
		const heading = this._createChartSectionHeader();
		section.append(heading);

		const logo = this.helpers.createElement('a', {
			class: 'logo-filmweb',
			href: this.linkUrl,
			style: `height: 20px; width: 75px; background-image: url("${browser.runtime.getURL('/images/filmweb-logo.svg')}");`
		});
		heading.append(logo);

		if (isMobile) {
			section.append(this._createShowDetailsButton());
		}

		section.append(this.helpers.createHistogram(
			this.storage,
			'filmweb',
			this.linkUrl + '/opinie#/community/popular',
			this.score,
			this.num_ratings,
			this.votes,
			this.percents,
			this.highest
		));

		// Add the tooltip as text for mobile
		const score = section.querySelector('.averagerating.tooltip');
		let tooltip = '';
		if (score !== null) {
			tooltip = score.getAttribute('data-original-title');
			this._createRatingDetailsText(section, tooltip);
		}

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
