/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

const API_URL = 'https://www.doesthedogdie.com/api/v3/items';

/** The parts of a /api/v3/items result this helper reads. */
interface DDDItem {
	id: number
	name: string
	releaseYear: number | string | null
	/** 0 or null when DDD has no TMDB ID for the item. */
	tmdbId: number | null
	itemTypeName: 'Movie' | 'TV Show' | string
}

/** What the overview page knows about the film, for matching it against DDD. */
export interface DoesTheDogDieRequest {
	/** The DDD media ID from WikiData; when present no API call is needed. */
	id: string | null
	imdbID: string
	tmdbID: string
	isTV: boolean
	title: string
	nativeTitle: string | null
	year: string
}

/** Adds a "DOG" button linking to the film's Does the Dog Die page. There is no sidebar rating. */
export class DoesTheDogDieHelper extends Helper {

	declare data: DDDItem | null;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'ddd');

	}

	_loadData(request: DoesTheDogDieRequest) {

		if (request.id !== null && request.id !== '') {
			this.helpers.WriteConsoleLog('DEBUG', 'DoesTheDogDie: ID found in WikiData.');
			this._addMediaLink(request.id);
			this.loadState = LOAD_STATES['Success'];
			return;
		}

		if (this.storage.get('ddd-api-enabled') !== true) {
			this.loadState = LOAD_STATES['Failure'];
			return;
		}

		const apiKey = this.storage.get('ddd-apikey');
		if (apiKey == '') {
			this.helpers.WriteConsoleLog('LOG', 'No DDD API key, cannot search for ID using the DDD API.');
			this.loadState = LOAD_STATES['Failure'];
			return;
		}

		const options = {
			method: 'GET',
			headers: {
				'X-API-KEY': apiKey
			}
		};

		if (request.imdbID !== '') {
			this._searchByIMDb(request, options);
		} else {
			this._searchByTitle(request, options);
		}

	}

	/** Looks the film up by IMDb ID, falling back to a title search if DDD's match looks wrong. */
	_searchByIMDb(request: DoesTheDogDieRequest, options: object) {

		const url = `${API_URL}?imdb=${request.imdbID}`;

		this._apiRequestCallback('DoesTheDogDie API (IMDb search)', url, 'JSON', options, value => {

			const items: DDDItem[] = value.response;
			const item = items.length > 0 ? items[0] : null;

			// A TMDB ID that disagrees with Letterboxd means DDD has the wrong film, e.g. https://letterboxd.com/film/the-hunt-2012/
			if (item !== null && !(item.tmdbId != null && item.tmdbId > 0 && item.tmdbId !== parseInt(request.tmdbID))) {
				this._onItemFound(item);
				return;
			}

			this._searchByTitle(request, options);

		}, value => {
			this._handleRequestFailure(value, [401], 'DoesTheDogDie returned a 401 Unauthorized response. Please enter a valid API key into the Letterboxd Extras settings.');
		});

	}

	_searchByTitle(request: DoesTheDogDieRequest, options: object) {

		const title = request.nativeTitle ?? request.title;
		const url = `${API_URL}?name=${encodeURIComponent(title)}`;

		this._apiRequestCallback('DoesTheDogDie API (Title search)', url, 'JSON', options, value => {

			const items: DDDItem[] = value.response;
			const item = this._findTitleMatch(items, request);

			if (item === null) {
				this.helpers.WriteConsoleLog('LOG', 'Unable to locate DDD film page using the API.');
				this.loadState = LOAD_STATES['Failure'];
				return;
			}

			this._onItemFound(item);

		}, value => {
			this._handleRequestFailure(value, [401, 403], 'DoesTheDogDie returned an Unauthorized response. Please enter a valid API key into the Letterboxd Extras settings.');
		});

	}

	/**
	 * An item with a matching TMDB ID wins outright. Items with a different TMDB ID are skipped.
	 * Otherwise the last item whose name and year match is used.
	 */
	_findTitleMatch(items: DDDItem[], request: DoesTheDogDieRequest): DDDItem | null {

		const expectedType = request.isTV ? 'TV Show' : 'Movie';
		let match: DDDItem | null = null;

		for (const item of items) {
			if (item.itemTypeName !== expectedType) {
				continue;
			}

			if (item.tmdbId != null && String(item.tmdbId) === request.tmdbID) {
				return item;
			}
			if (item.tmdbId != null && item.tmdbId > 0) {
				continue;
			}

			const sameYear = String(item.releaseYear) === request.year;
			const nameMatches =
				item.name === request.title ||
				item.name === `${request.title} ${request.year}` ||
				item.name === request.nativeTitle;

			if (nameMatches && sameYear) {
				match = item;
			}
		}

		return match;

	}

	_onItemFound(item: DDDItem) {

		this.data = item;
		this.loadState = LOAD_STATES['Success'];
		this._addMediaLink(String(item.id));

	}

	_addMediaLink(id: string) {

		this.linkURL = `https://www.doesthedogdie.com/media/${id}`;
		this.addButtonLink(this.linkURL, 'DOG');

	}

	_handleRequestFailure(value: any, unauthorizedStatuses: number[], message: string) {

		if (unauthorizedStatuses.includes(value?.status)) {
			this.helpers.ShowErrorMessage(message, 'ddd-key');
		}

	}

}
