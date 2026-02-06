import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class KinopoiskHelper extends Helper {

	constructor(storage, helpers) {

		super(storage, helpers, 'kinopoisk');

		this.id = null;

	}

	_loadData(kinopoiskID) {

		const apiKey = this.storage.get('kinopoisk-apikey');

		let options = null;

		if (apiKey) {

			options = {
				method: 'GET',
				headers: {
					'X-API-KEY': apiKey
				}
			};

		} else {

			options = null;

		}

		const apiURL = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${kinopoiskID}`;

		this._apiRequestCallback('Kinopoisk', apiURL, options, response => {

			if (!response) {

				this.loadState = LOAD_STATES['Failure'];
				return;

			}

			this.loadState = LOAD_STATES['Success'];
			if (this.data !== null) {
				if (this.data.ratingKinopoisk !== null) {
					this.rating = this.data.ratingKinopoisk;
				}
				if (this.data.ratingKinopoiskVoteCount !== null) {
					this.num_ratings = this.data.ratingKinopoiskVoteCount;
				}
				if (this.data.webUrl !== null) {
					this.url = this.data.webUrl;

					this.addButtonLink(this.kinopoisk.url, 'KINOPOISK');
				}
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
		if (this.data !== null) {
			if (this.data.ratingKinopoisk !== null) {
				this.rating = this.data.ratingKinopoisk;
			}
			if (this.data.ratingKinopoiskVoteCount !== null) {
				this.num_ratings = this.data.ratingKinopoiskVoteCount;
			}
			if (this.data.webUrl !== null) {
				this.url = this.data.webUrl;

				this.addButtonLink(this.kinopoisk.url, 'KINOPOISK');
			}
		}

		// Do not display if there is no score or ratings
		if (this.kinopoisk.rating === null && this.kinopoisk.num_ratings === 0) return;

		// Add to Letterboxd
		//* **************************************************************
		// Add the section to the page

		const section = this.helpers.createChartSection(
			this.selectorPrefix,
			{
				href: this.url,
				style: `position: absolute; background-image: url("${browser.runtime.getURL('images/kinopoisk-logo-rus.svg')}")`
			},
			{
				style: 'height: 13px'
			}
		);

		if (this.isMobile) {
			// Add the Show Details button
			const showDetails = this.helpers.createShowDetailsButton(this.selectorPrefix, 'kinopoisk-score-details');
			section.append(showDetails);
		}

		// Score
		//* **************************************************************
		const container = this.helpers.createElement('span', {}, {
			'display': 'block',
			'margin-bottom': '10px'
		});
		section.append(container);

		// Setup Score and Tooltip
		let score = this.kinopoisk.rating;
		let totalScore = '/10';
		if (this.storage.get('convert-ratings') === '5') {
			totalScore = '/5';
			score /= 2;
		}
		score = score.toFixed(1).toLocaleString();
		const num_ratings = this.kinopoisk.num_ratings.toLocaleString();

		// Add the hoverover text and href
		let tooltip = 'No score available';
		if (this.num_ratings > 0 && this.rating === null) {
			tooltip = `${num_ratings} rating`;
			if (this.kinopoisk.num_ratings > 1) tooltip += 's';
			score = 'N/A';

		} else if (this.kinopoisk.num_ratings > 0) {
			tooltip = `Average of ${score.toLocaleString()}${totalScore} based on ${num_ratings} ratings`;
		} else {
			score = 'N/A';
		}

		// The span that holds the score
		const span = this.helpers.createElement('a', {
			class: 'kinopoisk-box tooltip tooltip-extra',
			'href': `${this.kinopoisk.url}reviews/`,
			'data-original-title': tooltip
		}, {
			'display': 'inline-block',
			'width': 'auto',
			'padding-top': '5px'
		});

		// The element that is the score itself
		const text = this.helpers.createElement('span', {
			class: 'display-rating -highlight kinopoisk-score'
		});
		if (this.isMobile === true) text.setAttribute('class', `${text.getAttribute('class')} extras-mobile`);
		text.innerText = score;
		span.append(text);

		// Add the element /10 or /5 depending on score
		const scoreTotal = this.helpers.createElement('p', {
			style: 'display: inline-block; font-size: 10px; color: darkgray; margin-bottom: 0px;'
		});
		scoreTotal.innerText = totalScore;
		span.append(scoreTotal);

		container.append(span);

		// Add the tooltip as text for mobile
		this.helpers.createDetailsText('kinopoisk', section, tooltip, this.isMobile);

		// APPEND to the sidebar
		//* ***********************************************************
		this.appendSidebarRating(section, 'kinopoisk-ratings');

		// Add the hover events
		//* ****************************************************************
		this.helpers.addTooltipEvents(section);
	}

}
