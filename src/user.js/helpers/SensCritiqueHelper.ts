/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

const API_URL = 'https://apollo.senscritique.com/';

const ID_QUERY = `
	query ($id: Int!) {
		product(id: $id) {
			title
			rating
			dateRelease
			dateReleaseOriginal
			dateReleaseUS
			stats {
				ratingCount
				recommendCount
			}
			url
		}
	}
`;

const SEARCH_QUERY = `
	query Results($query: String, $filters: [SKFiltersSet], $page: SKPageInput, $sortBy: String) {
		results(query: $query, filters: $filters) {
			hits(page: $page, sortBy: $sortBy) {
				sortedBy
				page {
					from
					pageNumber
					total
					totalPages
					__typename
				}
				items {
					... on ResultHit {
					id
					product {
						title
						rating
						dateRelease
						dateReleaseOriginal
						dateReleaseUS
						stats {
							ratingCount
							recommendCount
						}
						directors {
							name
							person_id
							url
						}
						url
					}
					fields {
						title
						url
						year
					}
					}
				}
			}
		}
	}
`;

type SensMediaType = 'movie' | 'tvShow';

interface SensPerson {
	name: string
}

/** The `product` fields requested by ID_QUERY and SEARCH_QUERY. */
interface SensProduct {
	title: string
	/** Out of 10; null when the film has ratings but no published average. */
	rating: number | null
	stats: {
		ratingCount: number
		recommendCount: number
	}
	/** Path relative to https://www.senscritique.com */
	url: string
	directors?: SensPerson[] | null
	creators?: SensPerson[] | null
	producers?: SensPerson[] | null
}

/** A film from either query: the ID lookup returns `{ product }`, a search hit also has `fields`. */
interface SensFilm {
	product: SensProduct | null
	fields?: {
		title: string
		url: string | null
		year: string
	} | null
}

interface SensSearchResponse {
	data: {
		results: {
			hits: {
				items: SensFilm[]
			}
		} | null
	} | null
}

interface SensIDResponse {
	data: SensFilm | null
}

/** What the overview page knows about the film, for the ID lookup or the title search fallback. */
export interface SensCritiqueRequest {
	/** The SensCritique ID from WikiData, if there is one. */
	id: string | null
	title: string
	nativeTitle: string | null
	year: string
	/** Director (and producer) names, lowercased with diacritics removed. */
	directors: string[]
	isTV: boolean
}

export class SensCritiqueHelper extends Helper {

	declare data: SensFilm | null;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'sens');

	}

	_loadData(request: SensCritiqueRequest) {

		if (request.id !== null && request.id !== '') {
			this.helpers.WriteConsoleLog('DEBUG', 'SensCritique: ID found in WikiData.');
			this._loadByID(request.id);
		} else {
			this.helpers.WriteConsoleLog('DEBUG', 'SensCritique: ID not found in WikiData, attempting search instead.');
			this._search(request);
		}

	}

	_loadByID(id: string) {

		const options = this._getIDQuery(id);

		this._apiRequestCallback('SensCritique API', API_URL, 'JSON', options, value => {

			const response: SensIDResponse = value.response;
			this._onFilmFound(response.data);

		});

	}

	_search(request: SensCritiqueRequest) {

		let title = request.title;
		if (request.nativeTitle !== null && request.nativeTitle.match(/[A-Za-z0-9]/i)) {
			title = request.nativeTitle;
		}

		const type: SensMediaType = request.isTV ? 'tvShow' : 'movie';
		const options = this._getSearchQuery(type, title);

		this._apiRequestCallback('SensCritique search', API_URL, 'JSON', options, value => {

			const response: SensSearchResponse = value.response;
			const items = response.data?.results?.hits.items;
			if (!items) {
				this.loadState = LOAD_STATES['Failure'];
				return;
			}

			this._onFilmFound(this._findBestMatch(items, request));

		});

	}

	/** Request options for a GraphQL POST to the SensCritique API. */
	_getGraphQLOptions(query: string, variables: object) {

		return {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json'
			},
			body: JSON.stringify({ query, variables })
		};

	}

	_getIDQuery(id: string) {

		return this._getGraphQLOptions(ID_QUERY, {
			id: parseInt(id)
		});

	}

	_getSearchQuery(type: SensMediaType, title: string) {

		return this._getGraphQLOptions(SEARCH_QUERY, {
			filters: [{ identifier: 'universe', value: type }],
			pages: { from: 0, size: 16 },
			query: title
		});

	}

	/**
	 * Picks the search result most likely to be this film. A director match scores 100 minus the
	 * distance in years; an exact title and year match scores 90. Anything under 90 is discarded.
	 */
	_findBestMatch(items: SensFilm[], request: SensCritiqueRequest): SensFilm | null {

		const results: { score: number, film: SensFilm }[] = [];

		for (const film of items) {
			const { product } = film;
			if (product == null) {
				continue;
			}

			let score = 0;
			const year = film.fields?.year;

			if (request.directors.length > 0) {
				const people = [
					...(product.directors ?? []),
					...(product.creators ?? []),
					...(product.producers ?? [])
				];

				for (const person of people) {
					const name = person.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
					if (request.directors.includes(name)) {
						score = 100 - Math.abs(parseInt(request.year) - parseInt(year ?? ''));
						break;
					}
				}
			}

			if (score === 0 && request.title === product.title && request.year == year) {
				score = 90;
			}

			if (score >= 90) {
				results.push({ score, film });
			}
		}

		if (results.length === 0) {
			return null;
		}

		results.sort((a, b) => b.score - a.score);
		return results[0].film;

	}

	_onFilmFound(film: SensFilm | null) {

		if (film === null || film.product === null) {
			this.loadState = LOAD_STATES['Failure'];
			return;
		}

		this.data = film;
		this.loadState = LOAD_STATES['Success'];
		this.populateRatingsSidebar();

	}

	populateRatingsSidebar() {

		const { data } = this;
		if (data === null || data.product === null || !this._canPopulateRatingsSidebar()) {
			return;
		}

		const { product } = data;
		const { ratingCount, recommendCount } = product.stats;

		this.linkURL = data.fields?.url ?? `https://www.senscritique.com${product.url}`;
		this.addButtonLink(this.linkURL, 'CRITIQUE');

		// Do not display if there is no score or ratings
		if (product.rating == null && ratingCount == 0) {
			return;
		}

		const section: HTMLElement = this._createChartSection({
			href: this.linkURL,
			style: `height: 25px; width: 110px; position: absolute; background-image: url("${browser.runtime.getURL('images/senscritique-logo.svg')}");`
		});

		const container: HTMLElement = this.helpers.createElement('span', {}, {
			'display': 'block',
			'margin-bottom': '10px'
		});

		const { tooltip, displayRating } = this._getScoreText(product.rating, ratingCount);

		container.append(this._createScore(tooltip, displayRating));
		container.append(this._createFavoritesText(recommendCount));
		section.append(container);

		// Add the tooltip as text for mobile
		this.helpers.createDetailsText('sens', section, tooltip, this.pageState.isMobile);

		this.appendSidebarRating(section);
		this.helpers.addTooltipEvents(section);
		this.ratingsAdded = true;

	}

	/** The hover text, and the score as it should be displayed (converted to /5 if that setting is on). */
	_getScoreText(rating: number | null, ratingCount: number) {

		if (ratingCount > 0 && rating == null) {
			const tooltip = `${ratingCount.toLocaleString()} rating${ratingCount > 1 ? 's' : ''}`;
			return { tooltip, displayRating: 'N/A' };
		}

		if (ratingCount > 0 && rating != null) {
			let suffix = '/10';
			let displayRating = String(rating);
			if (this.storage.get('convert-ratings') === '5') {
				suffix = '/5';
				displayRating = Number(rating / 2).toFixed(1);
			}
			const tooltip = `Weighted average of ${displayRating}${suffix} based on ${ratingCount.toLocaleString()} ratings`;
			return { tooltip, displayRating };
		}

		return { tooltip: 'No score available', displayRating: 'N/A' };

	}

	_createScore(tooltip: string, displayRating: string): HTMLElement {

		const span: HTMLElement = this.helpers.createElement('div', {}, {
			'display': 'inline-block',
			'width': 'auto'
		});

		const ratingHolder: HTMLElement = this.helpers.createElement('a', {
			class: 'tooltip tooltip-extra sens-score'
		});
		ratingHolder.setAttribute('data-original-title', tooltip);
		ratingHolder.setAttribute('href', `${this.linkURL}/critiques`);

		const ratingIcon: HTMLElement = this.helpers.createElement('span', {
			class: 'sens-score-icon'
		});
		ratingHolder.append(ratingIcon);

		const ratingText: HTMLElement = this.helpers.createElement('span', {
			class: 'display-rating -highlight'
		});
		ratingText.innerText = displayRating;
		ratingHolder.append(ratingText);

		// 'N/A' is NaN, so it falls through to the white icon
		if (Number(displayRating) >= 6.5) {
			ratingHolder.className += ' green';
			ratingIcon.style.backgroundImage = `url("${browser.runtime.getURL('images/senscritique-icon-green.svg')}")`;
		} else {
			ratingIcon.style.backgroundImage = `url("${browser.runtime.getURL('images/senscritique-icon-white.svg')}")`;
		}

		span.append(ratingHolder);
		return span;

	}

	/** The "♥ count" recommend total, when the sens-favorites setting is on. */
	_createFavoritesText(recommendCount: number): HTMLElement {

		const textSpan: HTMLElement = this.helpers.createElement('div', {}, {
			'display': 'inline-block',
			'width': 'auto',
			'vertical-align': 'top'
		});

		if (this.storage.get('sens-favorites-enabled') === true) {
			const text: HTMLElement = this.helpers.createElement('p', {
				class: 'display-rating sens-text'
			});
			text.innerText = `♥ ${recommendCount.toLocaleString()}`;
			textSpan.append(text);
		}

		return textSpan;

	}

}
