import { LOAD_STATES } from '../constants';
import { MUBI_LOGO_SVG, MUBI_STAR_SVG } from '../SVG';
import { Helper } from './Helper';

export class MubiHelper extends Helper {

	constructor(storage, helpers, pageState) {

		super(storage, helpers, pageState, 'mubi');
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
	_loadData(mubiURL) {

		const options = this._getMubiHeaders();

		this._apiRequestCallback('Mubi', mubiURL, 'JSON', options, response => {

			if (response !== '') {
				this.data = response;
				this.loadState = LOAD_STATES['Success'];
				this.addButtonLink(this.url, 'MUBI');
				this.populateRatingsSidebar();
			}

		});

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

					if (index >= 0) {
						this.data = films[index];

						this.loadState = LOAD_STATES['Success'];

						this.addButtonLink(this.url, 'MUBI');
						this.populateRatingsSidebar();
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

	populateRatingsSidebar() {

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
		if (this.rating == null && this.num_ratings === 0) return;

		// Add to Letterboxd
		//* **************************************************************
		// Add the section to the page
		const section = this._createChartSection(
			{
				innerHTML: MUBI_LOGO_SVG,
				href: this.url
			}
		);

		// Score
		//* **************************************************************
		// Create a span that holds the entire
		const mubiSpan = this.helpers.createElement('span', {}, {
			display: 'block',
			'margin-bottom': '10px',
			'margin-top': '5px'
		});
		section.append(mubiSpan);

		// Add the star SVG (taken from MUBI)
		mubiSpan.innerHTML = MUBI_STAR_SVG;

		mubiSpan.append(this._generateScoreSpan({
			href: `${this.url}/ratings`
		}));

		// Add the tooltip as text for mobile
		this._createRatingDetailsText(section, this.tooltip);

		// APPEND to the sidebar
		//* ***********************************************************
		this.appendSidebarRating(section);

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
