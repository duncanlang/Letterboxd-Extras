/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

const API_URL = 'https://markuapi.kabk.dev/';

/** A film, drama or anime from the markuapi Filmarks API. Missing values come back as '-'. */
interface FilmarksItem {
	title: string | null
	/** Out of 5. */
	rating: number | string | null
	mark_count: number | string | null
	link: string | null
	/** e.g. '2019年11月01日'; used for TV. */
	release_date?: string | null
	/** e.g. '2019年11月01日'; used for films. */
	screening_date?: string | null
}

interface FilmarksIDResponse {
	data: FilmarksItem | null
}

interface FilmarksSearchResponse {
	results: {
		movies?: FilmarksItem[] | null
		dramas?: FilmarksItem[] | null
		animes?: FilmarksItem[] | null
	} | null
}

/** What the overview page knows about the film, for the ID lookup or the title search fallback. */
export interface FilmarksRequest {
	/** The Filmarks ID from WikiData, if there is one. */
	id: string | null
	title: string
	nativeTitle: string | null
	year: string
	/** Letterboxd's alternative titles for the film. */
	altTitles: string[]
	isTV: boolean
	/** Whether MyAnimeList or AniList know the film, so the anime search is used for TV. */
	isAnime: boolean
}

/** How far apart the Letterboxd and Filmarks years may be and still count as a match. */
const YEAR_TOLERANCE = 3;

export class FilmarksHelper extends Helper {

	declare data: FilmarksItem | null;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'filmarks');

	}

	_loadData(request: FilmarksRequest) {

		if (request.id !== null && request.id !== '') {
			this.helpers.WriteConsoleLog('DEBUG', 'Filmarks: ID found in WikiData.');
			this._loadByID(request.id);
		} else {
			this.helpers.WriteConsoleLog('DEBUG', 'Filmarks: ID not found in WikiData, attempting search instead.');
			this._search(request);
		}

	}

	_loadByID(id: string) {

		this._apiRequestCallback('Filmarks', `${API_URL}${id}`, 'JSON', {}, value => {

			const response: FilmarksIDResponse = value.response;
			this._onItemFound(response.data);

		});

	}

	_search(request: FilmarksRequest) {

		let category = 'movies';
		if (request.isTV) {
			category = request.isAnime ? 'animes' : 'dramas';
		}

		const url = `${API_URL}search/${category}?limit=20&q=${encodeURIComponent(request.title)}`;

		this._apiRequestCallback('Filmarks', url, 'JSON', {}, value => {

			const response: FilmarksSearchResponse = value.response;
			this._onItemFound(this._findMatch(response, request));

		});

	}

	/**
	 * Matches a search result whose title equals the Letterboxd title, native title or one of the
	 * alternative titles, and whose year is within YEAR_TOLERANCE of the Letterboxd year.
	 */
	_findMatch(response: FilmarksSearchResponse, request: FilmarksRequest): FilmarksItem | null {

		const { results } = response;
		if (results == null) {
			return null;
		}

		const items = [results.movies, results.dramas, results.animes].find(list => list != null && list.length > 0) ?? [];

		const letterboxdYear = request.year !== '' ? parseInt(request.year) : 0;

		for (const item of items) {
			const title = item.title;
			const date = request.isTV ? item.release_date : item.screening_date;
			const year = parseInt(this._regexExtract(date, /(\d{4})年/, 1, '0'));

			if (title == null || title === '' || !(year > 0) || !(letterboxdYear > 0)) {
				continue;
			}

			if (Math.abs(letterboxdYear - year) > YEAR_TOLERANCE) {
				continue;
			}

			if (title === request.title || (request.nativeTitle != null && title === request.nativeTitle) || request.altTitles.includes(title)) {
				return item;
			}
		}

		return null;

	}

	/** Returns the given capture group of `pattern` in `input`, or `defaultValue` if there's no match. */
	_regexExtract(input: string | null | undefined, pattern: RegExp, captureGroup: number, defaultValue: string) {

		const found = input?.match(pattern);
		return found ? found[captureGroup] : defaultValue;

	}

	_onItemFound(item: FilmarksItem | null) {

		if (item === null) {
			this.helpers.WriteConsoleLog('LOG', 'Unable to find/match Filmarks page');
			this.loadState = LOAD_STATES['Failure'];
			return;
		}

		this.data = item;
		this.loadState = LOAD_STATES['Success'];
		this.populateRatingsSidebar();

	}

	populateRatingsSidebar() {

		const { data } = this;
		if (data === null || !this._canPopulateRatingsSidebar()) {
			return;
		}

		if (data.rating != null && data.rating !== '-') {
			this.rating = Number(data.rating);
		}
		// Passed through as-is: createAllocineCriticScore calls toLocaleString on it, which leaves an already formatted string alone
		const markCount = data.mark_count != null && data.mark_count !== '-' ? data.mark_count : 0;
		this.num_ratings = Number(markCount);

		this.linkURL = data.link ?? '';
		this.addButtonLink(this.linkURL, 'FILMARKS');

		// Do not display if there is no score or ratings
		if (this.rating == null && this.num_ratings === 0) {
			return;
		}

		const section: HTMLElement = this._createChartSection(
			{
				href: this.linkURL,
				style: `position: absolute; background-image: url("${browser.runtime.getURL('images/filmarks-logo.svg')}");`
			},
			'height: 20px !important;'
		);

		const ratingSpan: HTMLElement = this.helpers.createElement('span', {
			class: 'filmarks-score toggle-score-display',
			style: 'position: relative; display: block;'
		});

		ratingSpan.append(this.helpers.createAllocineCriticScore('filmarks', this.rating, markCount, null, this.linkURL, this.pageState.isMobile));
		ratingSpan.append(this.helpers.createDynamicStars('filmarks', this.rating));
		section.append(ratingSpan);

		// Add the tooltip as text for mobile
		const scoreElement = section.querySelector('.filmarks-score .filmarks .tooltip');
		if (scoreElement !== null) {
			const tooltip = scoreElement.getAttribute('data-original-title');
			this.helpers.createDetailsText('filmarks', ratingSpan, tooltip, this.pageState.isMobile);
		}

		this.appendSidebarRating(section);
		this.helpers.addTooltipEvents(section);
		this.ratingsAdded = true;

	}

}
