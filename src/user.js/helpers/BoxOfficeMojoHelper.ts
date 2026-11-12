/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };

export interface BoxOfficeMojoRequest {
	imdbID: string
	/** Called once the page has been read (not on failure), after the details rows are added. */
	onLoad?: (helper: BoxOfficeMojoHelper) => void
}

/**
 * Reads a film's budget, box office, MPAA rating and domestic release date from its Box Office
 * Mojo page, adds the budget and box office to the film's details, and adds a "MOJO" button.
 * There is no sidebar rating.
 */
export class BoxOfficeMojoHelper extends Helper {

	declare data: Document | null;

	/** As displayed by Mojo, e.g. '$5,000,000'; '' until loaded or when Mojo doesn't list it. */
	budget = '';
	boxOfficeUS = '';
	boxOfficeWW = '';
	mpaaRating: string | null = null;

	/** From the "Earliest Release Date" summary row, when it is a domestic release. */
	earliestDomesticDate: string | null = null;

	/**
	 * From the release tables further down the page. The overview page only uses this when it
	 * has no release date from anywhere else.
	 */
	fallbackDomesticDate: string | null = null;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'mojo');

	}

	_loadData({ imdbID, onLoad }: BoxOfficeMojoRequest) {

		this.linkURL = `https://www.boxofficemojo.com/title/${imdbID}/`;

		if (this.storage.get('mojo-link-enabled') === true) {
			this.addButtonLink(this.linkURL, 'MOJO');
		}

		this._apiRequestCallback('BoxOfficeMojo', this.linkURL, 'HTML', {}, value => {

			this.data = this.helpers.parseHTML(value.response);
			this._collectSummary();
			this._collectFallbackDate();
			this._addDetailsRows();

			this.loadState = LOAD_STATES['Success'];
			onLoad?.(this);

		});

	}

	/** Whether the request has finished, successfully or not. */
	isFinished() {

		return this.loadState === LOAD_STATES['Success'] || this.loadState === LOAD_STATES['Failure'];

	}

	_collectSummary() {

		const page = this.data;
		if (page === null) {
			return;
		}

		for (const row of page.querySelectorAll('.mojo-performance-summary-table div')) {
			const header = row.querySelector('.a-size-small');
			const value = row.querySelector<HTMLElement>('.money');
			if (header === null || value === null) {
				continue;
			}

			if (header.innerHTML.includes('Domestic')) {
				this.boxOfficeUS = value.innerText;
			} else if (header.innerHTML.includes('Worldwide')) {
				this.boxOfficeWW = value.innerText;
			}
		}

		const summaryValues = page.querySelector('.a-section.a-spacing-none.mojo-summary-values.mojo-hidden-from-mobile');
		if (summaryValues === null) {
			return;
		}

		for (const node of summaryValues.children) {
			const header = (node.children[0] as HTMLElement | undefined)?.innerText;
			const data = (node.children[1] as HTMLElement | undefined)?.innerText;
			if (header === undefined || data === undefined) {
				continue;
			}

			if (header === 'Budget') {
				this.budget = data;
			} else if (header === 'MPAA') {
				this.mpaaRating = data;
			} else if (header === 'Earliest Release Date' && data.includes('Domestic')) {
				this.earliestDomesticDate = this._formatDate(data.split('\n')[0]);
			}
		}

	}

	/** Reads the domestic release date from the "Domestic" or "By Release" table, whichever is shown. */
	_collectFallbackDate() {

		const section = this.data?.querySelector<HTMLElement>('.a-section.mojo-h-scroll');
		if (section == null || section.childElementCount === 0) {
			return;
		}

		const heading = (section.children[0] as HTMLElement).innerText;

		if (heading.includes('Domestic')) {
			const rows = (section.children[2] as HTMLTableElement | undefined)?.rows ?? [];
			for (let i = 1; i < rows.length; i++) {
				const header = rows[i].cells[0]?.innerText;
				const date = rows[i].cells[1]?.innerText;

				if (header === 'Domestic' && date !== undefined) {
					this.fallbackDomesticDate = this._formatDate(date);
				}
			}
		}

		if (heading.includes('By Release')) {
			const rows = (section.children[1] as HTMLTableElement | undefined)?.rows ?? [];
			for (let i = 1; i < rows.length; i++) {
				const group = rows[i].cells[0]?.innerText;
				const date = rows[i].cells[1]?.innerText;
				const markets = rows[i].cells[2]?.innerText;

				if (group === 'Original Release' && markets?.includes('Domestic') && date !== undefined) {
					this.fallbackDomesticDate = this._formatDate(date);
				}
			}
		}

	}

	/** 'Nov 1, 2019' → '1 Nov 2019' */
	_formatDate(date: string) {

		return new Date(date.replace(',', '')).toLocaleDateString('en-UK', DATE_OPTIONS);

	}

	_addDetailsRows() {

		if (this.budget === '' && this.boxOfficeWW === '' && this.boxOfficeUS === '') {
			return;
		}

		if (this.budget !== '' && !document.querySelector('.budget')) {
			this.helpers.createDetailsRow('Budget', this.budget);
		}

		if (this.boxOfficeUS !== '') {
			this.helpers.createDetailsRow('Box Office (US)', this.boxOfficeUS);
		}

		// Don't add the WW box office if it's equal to the US
		if (this.boxOfficeWW !== '') {
			if (parseInt(this.helpers.cleanNumber(this.boxOfficeWW)) > parseInt(this.helpers.cleanNumber(this.boxOfficeUS))) {
				this.helpers.createDetailsRow('Box Office (WW)', this.boxOfficeWW);
			}
		}

	}

}
