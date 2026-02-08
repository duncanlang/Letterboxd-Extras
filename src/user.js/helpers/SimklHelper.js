import { Helper } from './Helper';

export class SimklHelper extends Helper {

	constructor(storage, helpers) {

		super(storage, helpers, 'simkl');

	}

	populateRatingsSidebar() {

		if (document.querySelector('.simkl-ratings')) return;

		if (!document.querySelector('.sidebar')) return;

		this.simkl.state = 3;

		// Collect Date from the SIMKL API
		//* **************************************************************
		if (this.simkl.data != null) {
			if (this.simkl.data.simkl != null && this.simkl.data.simkl.rating != null) {
				this.simkl.rating = this.simkl.data.simkl.rating;
			}
			if (this.simkl.data.simkl != null && this.simkl.data.simkl.votes != null) {
				this.simkl.num_ratings = this.simkl.data.simkl.votes;
			}
			if (this.simkl.data.link != null) {
				this.simkl.url = this.simkl.data.link;
			}
		}

		// Do not display if there is no score or ratings
		if (this.simkl.rating == null && this.simkl.num_ratings == 0) return;

		// Add to Letterboxd
		//* **************************************************************
		// Add the section to the page
		const section = this.helpers.createElement('section', {
			class: 'section ratings-histogram-chart simkl-ratings ratings-extras'
		});

		// Add the Header
		const heading = this.helpers.createElement('h2', {
			class: 'section-heading section-heading-extras',
			style: 'height: 13px;'
		});
		section.append(heading);

		const logoHolder = this.helpers.createElement('a', {
			class: 'logo-simkl',
			href: this.simkl.url,
			style: `position: absolute; background-image: url("${browser.runtime.getURL('images/simkl-logo.png')}");`
		});
		heading.append(logoHolder);

		if (this.isMobile) {
			// Add the Show Details button
			const showDetails = this.helpers.createShowDetailsButton('simkl', 'simkl-score-details');
			section.append(showDetails);
		}

		// Score
		//* **************************************************************
		const container = this.helpers.createElement('span', {}, {
			'display': 'block',
			'margin-bottom': '10px',
			'margin-top': '5px'
		});
		section.append(container);

		container.append(this._generateScoreSpan(this.url));

		// Setup Score and Tooltip
		let score = this.simkl.rating;
		let totalScore = '/10';
		if (this.storage.get('convert-ratings') === '5') {
			totalScore = '/5';
			score /= 2;
		}
		score = score.toFixed(1).toLocaleString();
		const num_ratings = this.simkl.num_ratings.toLocaleString();

		// Add the hoverover text and href
		let tooltip = 'No score available';
		if (this.simkl.num_ratings > 0 && this.simkl.rating == null) {
			tooltip = `${num_ratings} rating`;
			if (this.simkl.num_ratings > 1) tooltip += 's';
			score = 'N/A';

		} else if (this.simkl.num_ratings > 0) {
			tooltip = `Average of ${score.toLocaleString()}${totalScore} based on ${num_ratings} ratings`;
		} else {
			score = 'N/A';
		}

		// The span that holds the score
		const span = letterboxd.helpers.createElement('a', {
			class: 'simkl-box tooltip tooltip-extra',
			'href': this.simkl.url,
			'data-original-title': tooltip
		}, {
			'display': 'inline-block',
			'width': 'auto'
		});

		// The element that is the score itself
		const text = letterboxd.helpers.createElement('span', {
			class: 'display-rating -highlight simkl-score'
		});
		if (this.isMobile == true) text.setAttribute('class', `${text.getAttribute('class')} extras-mobile`);
		text.innerText = score;
		span.append(text);

		// Add the element /10 or /5 depending on score
		const scoreTotal = letterboxd.helpers.createElement('p', {
			style: 'display: inline-block; font-size: 10px; color: darkgray; margin-bottom: 0px;'
		});
		scoreTotal.innerText = totalScore;
		span.append(scoreTotal);

		container.append(span);

		// Add the tooltip as text for mobile
		this._createRatingDetailsText(section, tooltip);

		// APPEND to the sidebar
		//* ***********************************************************
		this.appendRating(section, 'simkl-ratings');

		// Add the hover events
		//* ****************************************************************
		letterboxd.helpers.addTooltipEvents(section);


	}


}
