/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

/** One film in a CinemaScore title search. */
interface CinemascoreFilm {
	/** Upper case, sometimes with the year appended, e.g. 'OCEAN\'S 11 (2001)' */
	TITLE: string
	YEAR: string | null
	/** e.g. 'A-'; '' when the film was never graded */
	GRADE: string
}

/** Where a searched title must sit within a result's TITLE: the whole title, its start, or its end. */
type TitleMatch = 'all' | 'begin' | 'end';

/** The Letterboxd film being looked up. */
interface LetterboxdFilm {
	title: string
	year: string | null
}

/** What WikiData adds once it has loaded. */
interface WikiDataFilm {
	/** Release dates as WikiData gives them; their years are also accepted as a result's YEAR. */
	releaseDates: (string | null)[]
	usTitle: string | null
	altTitle: string | null
	isTV: boolean
}

const SEARCH_URL = 'https://webapp.cinemascore.com/guest/search/title/';

/** CinemaScore was founded in 1978, so there is nothing to find for earlier films. */
const FIRST_YEAR = 1978;

const ROMAN_NUMERAL = /\b(M{1,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|C?D|D?C{1,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|X?L|L?X{1,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|I?V|V?I{1,3}))\b/;
const NUMERIC = /([0-9]+)/;

/**
 * Rewrites a title the way CinemaScore lists it: a leading 'The' or 'A' moved to the end, accents
 * removed, and a few films CinemaScore has under a different name corrected.
 */
function cinemascoreTitle(title: string, year?: string | null): string {

	if (title.startsWith('The ')) {
		title = `${title.replace('The ', '')}, The`;
	} else if (title.startsWith('A ')) {
		title = `${title.replace('A ', '')}, A`;
	}

	// Normalize (ie, remove accents/diacritics)
	title = title.normalize('NFD').replace(/[̀-ͯ]/g, '');

	// I don't like doing it this way, but there is no other way for certain movies where cinemascore has incorrect data
	switch (title) {
		case 'Harry Potter and the Order of the Phoenix':
			return 'Harry Potter and Order of the Phoenix';
		case 'Ocean\'s Eleven':
			return year == '2001' ? 'Ocean\'s 11' : title;
		case 'One Eight Seven':
			return year == '1997' ? '187' : title;
		case 'A.I. Artificial Intelligence':
			return year == '2001' ? 'A.I.: Artificial Intelligence' : title;
		default:
			return title;
	}

}

/**
 * Truncates a title at its first character outside Latin-1, which CinemaScore's search can't
 * take, after turning en dashes into hyphens.
 */
function validASCIIString(input: string): string {

	let output = '';

	for (let i = 0; i < input.length; i++) {
		if (input[i] === '–') {
			output += '-';
		} else if ((input.codePointAt(i) ?? 0) >= 256) {
			break;
		} else {
			output += input[i];
		}
	}

	return output;

}

/** Base64 of the UTF-8 bytes, which is how CinemaScore's search URL takes the title. */
function encodeASCII(text: string): string {

	return btoa(unescape(encodeURIComponent(text)));

}

function romanize(num: number): string {

	if (isNaN(num)) {
		return 'NaN';
	}

	const digits = String(+num).split('');
	const key = [
		'', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
		'', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
		'', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
	];
	let roman = '';
	let i = 3;
	while (i--) {
		roman = (key[+(digits.pop() ?? '') + (i * 10)] || '') + roman;
	}
	return Array(+digits.join('') + 1).join('M') + roman;

}

/**
 * Adds a film's CinemaScore grade to the ratings sidebar. CinemaScore has no IDs to look up, so
 * this searches by title, retrying with variations of it, and later with WikiData's US and
 * alternate titles, until a result's title and year match the film.
 */
export class CinemascoreHelper extends Helper {

	/** Every search result so far, from all searches. */
	declare data: CinemascoreFilm[] | null;

	film: LetterboxdFilm | null = null;

	/** Years a result's YEAR may have: Letterboxd's, then WikiData's release years once known. */
	years: string[] = [];

	/** The result that matched the film. */
	result: CinemascoreFilm | null = null;

	altTitlesSearched = false;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'cinemascore');

	}

	_loadData(film: LetterboxdFilm) {

		this.film = film;
		this.years = [film.year ?? '', '', '', ''];
		this.search(film.title);

	}

	/**
	 * Searches again once WikiData has loaded: first the results already found against
	 * WikiData's release years, then the US and alternate titles. Safe to call repeatedly; it
	 * runs once, after the first search has returned.
	 */
	searchAlternateTitles({ releaseDates, usTitle, altTitle, isTV }: WikiDataFilm) {

		const film = this.film;
		if (film === null) {
			return;
		}

		const releaseYears = this.updateReleaseYears(releaseDates);

		if (this.data === null || this.altTitlesSearched || this.ratingsAdded) {
			return;
		}
		this.altTitlesSearched = true;

		if (isTV) {
			return;
		}

		// A different release year may match a result the first search already returned
		const otherYear = releaseYears.some(year => year !== '' && year != film.year);
		if (otherYear && this.verify(this.data, cinemascoreTitle(film.title), 'all')) {
			this.populateRatingsSidebar();
			return;
		}

		if (usTitle != null && usTitle != film.title) {
			this.search(usTitle);
		}
		if (altTitle != null && altTitle != film.title) {
			this.search(altTitle);
		}

	}

	/**
	 * Accepts WikiData's release years as a result's YEAR. WikiData's dates can arrive before the
	 * first search returns, so call this whenever they may have changed. Returns the years.
	 */
	updateReleaseYears(releaseDates: (string | null)[]): string[] {

		const releaseYears = releaseDates.map(date => (date != null ? new Date(date).getFullYear().toString() : ''));
		if (this.film !== null) {
			this.years = [this.film.year ?? '', '', ...releaseYears];
		}
		return releaseYears;

	}

	populateRatingsSidebar() {

		if (document.querySelector('.cinemascore')) return;

		if (this.result === null || this.ratingsAdded) return;

		this.ratingsAdded = true;

		// Add the section to the page
		const section = this.helpers.createElement('section', {
			class: 'extras-section ratings-histogram-chart cinemascore ratings-extras'
		});

		// Add the Header
		const heading = this.helpers.createElement('h2', {
			class: 'section-heading section-heading-extras',
			style: 'height: 13px;'
		});
		section.append(heading);
		const headerTitle = this.helpers.createElement('a', {
			href: 'https://www.cinemascore.com/'
		});
		headerTitle.innerText = 'CinemaScore';
		heading.append(headerTitle);

		// The span that holds the score
		const span = this.helpers.createElement('span', {
			style: 'display: inline-block;'
		});
		section.append(span);

		// The element that is the score itself
		const scoreText = this.helpers.createElement('a', {
			class: 'tooltip display-rating -highlight cinema-grade'
		});
		scoreText.innerText = this.result.GRADE;
		span.append(scoreText);

		// APPEND to the sidebar
		this.appendSidebarRating(section);

	}

	/** Searches for a title, then for variations of it if nothing matches. */
	private search(title: string) {

		const film = this.film;
		if (film === null) {
			return;
		}

		if (film.year != null && parseInt(film.year) < FIRST_YEAR) {
			return;
		}

		if (this.storage.get('cinema-enabled') !== true) {
			return;
		}

		// First Attempt - 'The' at end, no accents
		const cleanTitle = validASCIIString(cinemascoreTitle(title, film.year));
		this.request(cleanTitle, 'all', () => this.searchVariations(cleanTitle));

	}

	/** Tries each rewording of a title that found nothing. */
	private searchVariations(title: string) {

		// Replace Ampersand (and)
		if (!this.ratingsAdded && title.includes('&')) {
			this.request(validASCIIString(title.replace('&', 'and')), 'all');
		}

		// Search After Hyphen (-)
		if (!this.ratingsAdded && title.includes(' - ')) {
			const parts = title.split(' - ');
			if (parts[1].toUpperCase().includes('THE MOVIE')) {
				this.request(validASCIIString(parts[0]), 'begin');
			} else {
				this.request(validASCIIString(parts[1]), 'end');
			}
		}

		// Search After Colon (:)
		if (!this.ratingsAdded && title.includes(': ')) {
			const parts = title.split(': ');
			if (parts[1].toUpperCase().includes('THE MOVIE')) {
				this.request(validASCIIString(parts[0]), 'begin');
			} else {
				this.request(validASCIIString(parts[1]), 'end');
			}
		}

		// Search Before Colon (:), unless the search after it already covered this
		if (!this.ratingsAdded && title.includes(': ')) {
			const parts = title.split(': ');
			if (!parts[1].toUpperCase().includes('THE MOVIE')) {
				this.request(validASCIIString(parts[0]), 'begin');
			}
		}

		// Replace Numbers with Roman Numerals
		const number = /( [0-9]+)/g;
		if (!this.ratingsAdded && number.test(title)) {
			const num = title.substring(title.search(number), title.length).trim();
			const roman = romanize(parseInt(num));
			this.request(validASCIIString(title.replace(number, ` ${roman}`)), 'all');
		}

		// Search before roman numerals
		const romanMatch = title.match(ROMAN_NUMERAL);
		if (!this.ratingsAdded && romanMatch) {
			const before = title.split(romanMatch[0])[0].trim();
			if (before !== '') {
				this.request(validASCIIString(before), 'begin');
			}
		}

	}

	/** Runs one search, adds the grade if a result matches, and otherwise calls onNoMatch. */
	private request(title: string, titleMatch: TitleMatch, onNoMatch?: () => void) {

		const url = SEARCH_URL + encodeASCII(title);

		this._apiRequestCallback('Cinemascore', url, 'JSON', {}, value => {

			const results: CinemascoreFilm[] = value.response;
			this.data = this.data === null ? results : this.data.concat(results);

			if (this.verify(results, title, titleMatch)) {
				this.populateRatingsSidebar();
			} else {
				onNoMatch?.();
			}

		});

	}

	/**
	 * Looks for a result whose year is one of the film's and whose title matches. Stores it in
	 * `result` and returns true if found.
	 */
	private verify(results: CinemascoreFilm[], title: string, titleMatch: TitleMatch): boolean {

		const film = this.film;
		if (film === null || this.ratingsAdded || results == null || results.length === 0 || results[0].GRADE === '') {
			return false;
		}

		const filmHasNumber = ROMAN_NUMERAL.test(film.title) || NUMERIC.test(film.title);

		for (const candidate of results) {

			// Check to see if the year cinemascore uses is one of the years we have
			if (candidate.YEAR == null || !this.years.includes(candidate.YEAR)) {
				continue;
			}

			let found = false;

			if (titleMatch === 'all') {
				const withYear = `${title.toUpperCase()} (${candidate.YEAR})`;
				if (candidate.TITLE === title.toUpperCase() || candidate.TITLE === withYear) {
					found = true;
				} else if (/^[0-9]+$/.test(title) && candidate.TITLE === `${title}**`) {
					found = true;
				} else {
					// If not, make sure it starts with the exact title
					found = new RegExp(`^(${title}){1}( |,|\\.|:|-|$)`, 'i').test(candidate.TITLE);
				}
			} else if (titleMatch === 'end') {
				found = new RegExp(`(${title}){1}$`, 'i').test(candidate.TITLE);
			} else {
				found = new RegExp(`^(${title}){1}( |,|\\.|:|-|$)`, 'i').test(candidate.TITLE);
			}

			// A sequel's number must appear in the result too, or it is likely the original film
			if (filmHasNumber && !(ROMAN_NUMERAL.test(candidate.TITLE) || NUMERIC.test(candidate.TITLE))) {
				found = false;
			}

			if (found) {
				this.result = candidate;
				return true;
			}

		}

		return false;

	}

}
