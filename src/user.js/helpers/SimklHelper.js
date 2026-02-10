import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class SimklHelper extends Helper {

	constructor(storage, helpers) {

		super(storage, helpers, 'simkl');

	}

	_loadData({ imdbID, tmdbID, tmdbTV }) {

		// Configure URL
		// The current API requires a client_id? I don't believe it did before
		// Annoying because this does have a daily limit and now this client id is available online, but you can't have the secret!
		let url = 'https://api.simkl.com/ratings?client_id=05e838d7230a966313e654449100038628f7a89b840e3fcfaf4d4da94999213a';
		if (imdbID) {
			url += `&imdb=${this.imdbID}`;
		}
		if (tmdbID && tmdbID !== '0') {
			url += `&tmdb=${this.tmdbID}`;
		}
		if (tmdbTV) {
			url += '&type=show';
		}
		const regex = new RegExp('letterboxd.com\\/film\\/(.+)\\/');
		let letterboxdUrl = window.location.href;
		if (letterboxdUrl.match(regex)) {
			letterboxdUrl = letterboxdUrl.match(regex)[1];
			url += `&letterboxd=${letterboxdUrl}`;
		}
		url += '&fields=rank,simkl';

		this._apiRequestCallback('Simkl', url, {}, response => {

			this.data = response;

			console.log(this.data);

			if (this.data === null || this.data === 'null') {

				this.loadState = LOAD_STATES['Failure'];
				console.error('Letterboxd Extras | Simkl API error: null response');
				return;

			}

			if (this.data.error && this.date.error !== null) {

				this.loadState = LOAD_STATES['Failure'];
				console.error(`Letterboxd Extras | Simkl API error: ${this.data.code} ${this.data.message}`);
				return;

			}

			this.loadState = LOAD_STATES['Success'];

			if (this.data.link !== null) {

				this.linkURL = this.data.link;
				this.addButtonLink(this.linkURL, 'SIMKL');

			}

			this.populateRatingsSidebar();

		});

	}

	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		if (this.data.simkl !== null && this.data.simkl.rating !== null) {
			this.rating = this.data.simkl.rating;
		}
		if (this.data.simkl !== null && this.data.simkl.votes !== null) {
			this.num_ratings = this.data.simkl.votes;
		}

		// Do not display if there is no score or ratings
		if (this.rating === null && this.num_ratings === 0) {
			return;
		}

		// Add to Letterboxd
		//* **************************************************************
		// Add the section to the page
		const section = this._createChartSection({
			href: this.linkURL,
			style: `position: absolute; background-image: url("${browser.runtime.getURL('images/simkl-logo.png')}");`
		}, 'height: 13px');

		// Score
		//* **************************************************************
		const container = this.helpers.createElement('span', {}, {
			'display': 'block',
			'margin-bottom': '10px',
			'margin-top': '5px'
		});
		section.append(container);

		container.append(this._generateScoreSpan(this.linkURL));

		// Add the tooltip as text for mobile
		this._createRatingDetailsText(section, this.tooltip);

		// APPEND to the sidebar
		//* ***********************************************************
		this.appendSidebarRating(section);

		// Add the hover events
		//* ****************************************************************
		this.helpers.addTooltipEvents(section);


	}

}

/* Simkl Accurate Ratings Area
			const container = letterboxd.helpers.createElement('span', {}, {
				['display']: 'block',
				['margin-bottom']: '10px'
			});
			section.append(container);

			// Setup Score and Tooltip
			var score = this.simkl.rating;
			var totalScore = "/10";
			if (letterboxd.storage.get('convert-ratings') === "5") {
				totalScore = "/5";
				score = (score / 2);
			}
			score = score.toFixed(1).toLocaleString();
			var num_ratings = this.simkl.num_ratings.toLocaleString();

			// Add the hoverover text and href
			var tooltip = 'No score available';
			if (this.simkl.num_ratings > 0 && this.simkl.rating == null) {
				tooltip = num_ratings + ' rating';
				if (this.simkl.num_ratings > 1) tooltip += "s";
				score = "N/A";

			} else if (this.simkl.num_ratings > 0) {
				tooltip = "Average of " + score.toLocaleString() + totalScore + " based on " + num_ratings + ' ratings';
			} else {
				score = "N/A";
			}

			// The span that holds the score
			const span = letterboxd.helpers.createElement('a', {
				class: "simkl-box tooltip tooltip-extra",
				['href']: this.simkl.url,
				['data-original-title']: tooltip
			}, {
				['display']: 'inline-block',
				['width']: 'auto'
			});

			// The element that is the score itself
			const text = letterboxd.helpers.createElement('span', {
				class: 'display-rating -highlight simkl-score'
			});
			if (this.isMobile == true) text.setAttribute("class", text.getAttribute("class") + " extras-mobile");
			text.innerText = score;
			span.append(text);

			// Add the element /10 or /5 depending on score
			const scoreTotal = letterboxd.helpers.createElement('p', {
				style: 'display: inline-block; font-size: 10px; color: darkgray; margin-bottom: 0px;'
			});
			scoreTotal.innerText = totalScore;
			span.append(scoreTotal);

			container.append(span);

			*/
