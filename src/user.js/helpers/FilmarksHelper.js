import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class FilmarksHelper extends Helper {


	_loadData(id) {

		this.id = id;
		const apiURL = `https://markuapi.apn.leapcell.app/${this.id}`;

		this._apiRequestCallback('Filmarks', apiURL, {}, value => {

			if (!value.response && !value.response.data) {

				this.loadState = LOAD_STATES['Failure'];
				return;

			}

			this.data = value.response.data.data;
			// Rating
			if (this.data.rating != null && this.data.rating != '-') {
				this.rating = this.data.rating;
			}

			// Review Count
			if (this.data.mark_count != null && this.dara.mark_count != '-') {
				this.num_ratings = this.data.mark_count;
			}

			// URL
			if (this.data.link != null) {
				this.url = this.data.link;
				this.addButtonLink(this.filmarks.url);
				this.populateRatingsSidebar();
			}

		});

	}


	// Should be a two part function (data calculation phase) + (dom tree generation phase)
	populateRatingsSidebar() {

		// Do not display if there is no score or ratings
		if (this.rating === null && this.num_ratings === 0) return;

		// Add to Letterboxd
		//* **************************************************************
		// Add the section to the page
		const section = this._createChartSection({
			href: this.url,
			style: `position: absolute; background-image: url("${browser.runtime.getURL('images/filmarks-logo.svg')}");`
		}, 'height: 20px !important;');

		// Score
		//* **************************************************************
		const ratingSpan = this.helpers.createElement('span', {
			class: 'filmarks-score rt-score-div',
			style: 'position: relative; display: block;'
		});
		ratingSpan.append(this.helpers.createAllocineCriticScore(letterboxd, 'filmarks', this.filmarks.rating, this.filmarks.num_ratings, null, this.filmarks.url, this.isMobile));
		ratingSpan.append(this.helpers.createAllocineStars(this.filmarks.rating));
		section.append(ratingSpan);

		// Add the tooltip as text for mobile
		// Critic Rating Tooltip
		const scoreSpan = section.querySelector('.filmarks-score .filmarks .tooltip');
		if (scoreSpan != null) {
			const tooltip = scoreSpan.getAttribute('data-original-title');
			this._createRatingDetailsText(section.querySelector('.filmarks-score'), tooltip);
		}

		// APPEND to the sidebar
		//* ***********************************************************
		this.appendSidebarRating(section);

		// Add the hover events
		//* ****************************************************************
		this.helpers.addTooltipEvents(section);

	}

}
