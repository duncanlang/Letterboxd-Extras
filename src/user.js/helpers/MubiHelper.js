import { LOAD_STATES } from '../constants';
import { MUBI_LOGO_SVG, MUBI_STAR_SVG } from '../SVG';
import { Helper } from './Helper';

export class MubiHelper extends Helper {

	constructor(storage, helpers) {

		super(storage, helpers, 'mubi');
		this.rating = null;
		this.ratingAlt = null;
		this.num_ratings = 0;
		this.popularity = 0;

	}

	/**
	 * Get Mubi data using the provided url. .
	 *
	 * @param {string} mubiURL - The MUBI url for the current film.
	 */
	getData(mubiURL) {

		if (!this._canLoadData()) {

			return;

		}

		const options = this._getMubiHeaders();

		try {
			this.loadState = LOAD_STATES['Loading'];
			browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: mubiURL, options: options }, value => {

				if (!this.helpers.ValidateResponse('Mubi', value)) {
					return;
				}

				const mubiData = value.response;
				if (mubiData !== '') {
					this.data = mubiData;
					this.loadState = LOAD_STATES['Success'];
					this.addMubi();
					this.addButtonLink(this.url, 'MUBI');
				}

			});

		} catch {
			console.error('Letterboxd Extras | Unable to parse MUBI URL');
			this.loadState = LOAD_STATES['Failure'];
		}
	}


	/**
	 * Search Mubi for the specified film using the title, release year, and directors.
	 *
	 * @param {string} movieTitle - The title of the film
	 * @param {string | number} releaseYear - The year the film was first released.
	 * @param {string[]} altDirectors - A list of directors who are credited for the film.
	 */
	searchData(movieTitle, releaseYear, altDirectors) {

		if (!this._canLoadData()) {
			return;
		}

		// No ID from Wikidata, search using the API instead
		const url = `https://api.mubi.com/v3/search/films?query=${movieTitle}&page=1&per_page=24`;
		this.loadState = LOAD_STATES['Loading'];

		try {
			browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: url, options: this._getMubiHeaders() }, value => {
				if (this.helpers.ValidateResponse('Mubi search', value) === false) {
					return;
				}

				const mubi = value.response;
				if (mubi !== null) {
					const films = mubi.films;

					let index = -1;
					for (let i = 0; i < films.length; i++) {
						// If TV, must have TV genres
						if (this.tmdbTV === true && !(films[i].genres.includes('TV Series') || films[i].genres.includes('TV Mini-series'))) {
							continue;
						}

						if (typeof releaseYear === 'string') {
							releaseYear = parseInt(releaseYear);
						}

						// Check if the year and name is exact match
						if (releaseYear === films[i].year && (movieTitle.toUpperCase() === films[i].title.toUpperCase() || movieTitle.toUpperCase() === films[i].original_title)) {
							index = i;
							break;
						}

						// Match based on directors and within 5 years (to account for differences in listed year)
						for (let k = 0; k < films[i].directors.length; k++) {
							// Director name to lowercase and removed diacritics
							const director = films[i].directors[k].name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
							if (altDirectors.includes(director)) {
								// Check to see if film is within 5 years
								const score = Math.abs(parseInt(this.year) - films[i].year);
								if (score < 5) {
									index = i;
									break;
								}
							}
						}
						if (index !== -1) {
							break;
						}
					}

					console.log(index);

					if (index >= 0) {
						this.data = films[index];
						console.log(films[index]);
						this.loadState = LOAD_STATES['Success'];

						this.addMubi();

						this.addButtonLink(this.url, 'MUBI');
					} else {
						this.loadState === LOAD_STATES['Failure'];
					}
				}
			});
		} catch {
			console.error('Letterboxd Extras | Unable to parse MUBI search URL');
			this.loadState = LOAD_STATES['Failure'];
		}
	}

	addMubi() {

		// Collect Date from MUBI response
		//* **************************************************************
		this.rating = this.data.average_rating_out_of_ten;
		this.ratingAlt = this.data.average_rating;
		if (this.data.number_of_ratings !== null) {
			this.num_ratings = this.data.number_of_ratings;
		}
		if (this.data.popularity !== null) {
			this.popularity = this.data.popularity;
		}
		this.url = this.data.web_url;

		// Do not display if there is no score or ratings
		if (this.rating === null && this.num_ratings === 0) return;

		// Add to Letterboxd
		//* **************************************************************
		// Add the section to the page
		const section = this.helpers.createElement('section', {
			class: 'section ratings-histogram-chart mubi-ratings ratings-extras'
		});

		// Add the Header
		const heading = this.helpers.createElement('h2', {
			class: 'section-heading section-heading-extras'
		});
		section.append(heading);

		const logo = this.helpers.createElement('a', {
			class: 'logo-mubi'
		});
		logo.innerHTML = MUBI_LOGO_SVG;
		logo.setAttribute('href', this.url);
		heading.append(logo);

		let showDetails = null;
		if (this.isMobile) {
			showDetails = this.helpers.createShowDetailsButton('mubi', 'mubi-score-details');
			section.append(showDetails);
		}

		// Score
		//* **************************************************************
		// Create a span that holds the entire
		const mubiSpan = this.helpers.createElement('span', {
		}, {
			display: 'block',
			'margin-bottom': '10px',
			'margin-top': '5px'
		});
		section.append(mubiSpan);

		// Add the star SVG (taken from MUBI)
		mubiSpan.innerHTML = MUBI_STAR_SVG;

		// The span that holds the score
		const scoreSpan = this.helpers.createElement('span', {
			class: 'mubi-score'
		}, {
			display: 'inline-block'
		});
		mubiSpan.append(scoreSpan);

		// The element that is the score itself
		const scoreText = this.helpers.createElement('a', {
			class: 'tooltip tooltip-extra display-rating -highlight mubi-score'
		});
		scoreSpan.append(scoreText);

		// Score and hover
		let score = this.rating;
		let totalScore = '/10';

		if (this.storage.get('convert-ratings') === '5') {
			totalScore = '/5';
			score = this.ratingAlt;
		}

		let hover = `Average of ${score.toFixed(1)}${totalScore} based on ${this.num_ratings.toLocaleString()} rating`;
		if (this.num_ratings !== 1) { hover += 's'; }

		// If no ratings, display as N/A and change hover
		if (score === null && this.num_ratings === 0) {
			score = 'N/A';
			hover = 'No score available';
		} else if (this.num_ratings === 0) {
			score = 'N/A';
			hover = `${this.num_ratings.toLocaleString()} rating`;
			if (this.num_ratings !== 1) { hover += 's'; }
		} else {
			score = score.toFixed(1);
		}

		scoreText.innerText = score;
		scoreText.setAttribute('data-original-title', hover);
		scoreText.setAttribute('href', `${this.url}/ratings`);

		// Add the element /10 or /5 depending on score
		const scoreTotal = this.helpers.createElement('p', {
			style: 'display: inline-block; font-size: 10px; color: darkgray; margin-bottom: 0px;'
		});
		scoreTotal.innerText = totalScore;
		scoreSpan.append(scoreTotal);

		// Add the tooltip as text for mobile
		this.helpers.createDetailsText('mubi', section, hover, this.isMobile);

		// APPEND to the sidebar
		//* ***********************************************************
		this.appendSidebarRating(section, 'mubi-ratings');

		// Add Hover events
		//* ***********************************************************
		this.helpers.addTooltipEvents(section);
	}


	_getMubiHeaders() {
		const headers = {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json',
				'client_country': 'US',
				'client': 'web'
			}
		};
		return headers;
	}

}
