/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

/** One Metacritic score (the Metascore or the user score) with its review breakdown. */
interface MetaScore {
	/** A number as a string, e.g. '85' or '7.9', or 'tbd' (not enough reviews yet) or 'N/A' */
	rating: string
	num_ratings: number
	positive: number
	mixed: number
	negative: number
	/** The largest of positive, mixed and negative: the bar chart's full width */
	highest: number
	parseError: boolean
}

type ScoreType = 'critic' | 'user';

interface SectionParts {
	section: HTMLElement
	/** null when there is no Metacritic page to show details from */
	showDetails: HTMLElement | null
}

function emptyScore(): MetaScore {

	return { rating: 'N/A', num_ratings: 0, positive: 0, mixed: 0, negative: 0, highest: 0, parseError: false };

}

export class MetacriticHelper extends Helper {

	/** The Metacritic page, parsed */
	declare data: Document | null;

	/** The Metacritic page's address after any redirects, with a trailing slash */
	url: string;
	state: number;
	raw: string | null;
	mustSee: boolean;
	critic: MetaScore;
	user: MetaScore;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'meta');

		this.url = '';
		this.state = 0;
		this.data = null;
		this.raw = null;
		this.mustSee = false;
		this.critic = emptyScore();
		this.user = emptyScore();
	}

	/**
	 * Adds the Metacritic section to the ratings sidebar: the Metascore, the user score, their
	 * positive/mixed/negative breakdowns, and the Must-See badge.
	 *
	 * Reads the Metacritic page parsed into `this.data`.
	 *
	 * @param {Object} [options]
	 * @param {boolean} [options.isTV] - Labels the badge Must-Watch instead of Must-See
	 */
	populateRatingsSidebar({ isTV = false }: { isTV?: boolean } = {}) {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		this._collectScores();

		// Return if no scores what so ever
		if (this.critic.num_ratings == 0 && this.user.num_ratings == 0) return;

		const created = this._createSection(isTV);
		if (created === null) {
			this.ratingsAdded = true; // so it doesn't keep calling
			return;
		}
		const { section, showDetails } = created;

		// APPEND to the sidebar
		this.appendSidebarRating(section);

		// Move the details text
		if (this.pageState.isMobile == false) {
			const criticText = document.querySelector('.meta-details-critic.mobile-details-text');
			const userText = document.querySelector('.meta-details-user.mobile-details-text');

			if (criticText != null) {
				section.append(criticText);
			}
			if (userText != null) {
				section.append(userText);
			}
		}

		// Open the details if that is the user's default. There is no button without a Metacritic page.
		const defaultView = this.storage.get('meta-default-view');
		if (showDetails !== null && (defaultView === 'show' || (defaultView === 'remember' && this.storage.get('meta-score-details') === 'show'))) {
			showDetails.click();
		}

		this.helpers.addTooltipEvents(section);

		this.ratingsAdded = true;
	}

	/**
	 * Reads both scores, their review counts and the Must-See badge from the parsed Metacritic page
	 * into `critic`, `user` and `mustSee`.
	 */
	_collectScores() {

		// populateRatingsSidebar has already checked this; the compiler can't see through that call
		const page = this.data;
		if (page === null) {
			return;
		}

		// Scores
		const heroScores = page.querySelector('div.hero-scores');
		if (heroScores != null) {
			this.parseRatingScore(this.critic, heroScores.querySelector<HTMLElement>('[data-testid="product-score"] div[title*="Metascore "] span'));
			this.parseRatingScore(this.user, heroScores.querySelector<HTMLElement>('[data-testid="product-score"] div[title*="User score "] span'));
		} else {
			this.critic.parseError = true;
			this.user.parseError = true;
		}

		// Grab the 'must see'
		if (page.querySelector('.product-hero__scores img.c-global-image__img')) {
			this.mustSee = true;
		}

		if (this.critic.parseError) {
			this.helpers.WriteConsoleLog('ERROR', 'Metacritic: there was an error parsing the critic ratings.');
		}
		if (this.user.parseError) {
			this.helpers.WriteConsoleLog('ERROR', 'Metacritic: there was an error parsing the user ratings.');
		}

		// Grab the rating counts
		this.parseRatingCounts(this.critic, page.querySelector<HTMLElement>('div[data-testid="critic-reviews"]'));
		this.parseRatingCounts(this.user, page.querySelector<HTMLElement>('div[data-testid="user-reviews"]'));
	}

	/**
	 * Builds the sidebar section from the collected scores.
	 *
	 * @param {boolean} isTV - Labels the badge Must-Watch instead of Must-See
	 * @returns null when the user has turned off both the critic and the user score
	 */
	_createSection(isTV: boolean): SectionParts | null {

		const { isMobile } = this.pageState;

		// Add the section to the page
		const section: HTMLElement = this.helpers.createElement('section', {
			class: 'extras-section ratings-histogram-chart meta-ratings ratings-extras'
		});

		// Add the Header
		const heading: HTMLElement = this.helpers.createElement('h2', {
			class: 'section-heading section-heading-extras'
		});
		section.append(heading);

		const logoHolder: HTMLElement = this.helpers.createElement('a', {
			class: this.data != null ? 'logo-meta-link' : 'logo-meta',
			style: 'width: 100%;'
		});
		if (this.url != null && this.url != '') {
			logoHolder.setAttribute('href', this.url);
		}
		heading.append(logoHolder);

		logoHolder.append(this.helpers.createElement('span', {
			class: 'icon-meta',
			style: 'height: 20px; width: 20px; background-image: url("https://www.metacritic.com/images/icons/metacritic-icon.svg");'
		}));

		logoHolder.append(this.helpers.createElement('span', {
			class: 'text-meta',
			style: 'height: 20px; width: 100px; background-image: url("https://www.metacritic.com/images/icons/metacritic-wordmark.svg");'
		}));

		// Add the Show Details button
		let showDetails: HTMLElement | null = null;
		if (this.data != null) {
			showDetails = this.helpers.createShowDetailsButton('meta', 'meta-score-details') as HTMLElement;
			section.append(showDetails);
		}

		const criticURL = `${this.url}critic-reviews`;
		const addTooltip = (isMobile || this.storage.get('tooltip-show-details') === true);

		// Critic score
		let criticAdded = false;
		if (this.storage.get('metacritic-critic-enabled') === true) {
			section.append(this.createMetaScore('critic', 'Critic', criticURL, this.critic, this.mustSee, isMobile, addTooltip));
			criticAdded = true;
		}

		// User score
		let userAdded = false;
		if (this.storage.get('metacritic-users-enabled') === true && this.data != null) {
			const userURL = criticURL.replace('/critic-reviews', '/user-reviews');
			section.append(this.createMetaScore('user', 'User', userURL, this.user, this.mustSee, isMobile, addTooltip));
			userAdded = true;
		}

		// Add Must see if applicable
		if (this.storage.get('metacritic-mustsee-enabled') === true && this.mustSee == true) {
			section.append(this.helpers.createElement('span', {
				class: isTV
					? 'meta-must-see meta-must-watch tooltip tooltip-extra display-rating -highlight'
					: 'meta-must-see tooltip tooltip-extra display-rating -highlight',
				style: 'margin-top: 5px;',
				['data-original-title']: isTV ? 'Metacritic Must-Watch' : 'Metacritic Must-See'
			}));
		}

		if (!criticAdded && !userAdded) {
			return null;
		}

		return { section, showDetails };
	}

	parseRatingScore(data: MetaScore, element: HTMLElement | null) {

		if (element != null) {
			// Standard page with score
			data.rating = element.innerText;
		} else if (this.url.includes('/tv/') && this.url.includes('/episode-')) {
			// TV episodes with no Metascore
			data.rating = 'N/A';
		} else {
			data.parseError = true;
		}
	}

	parseRatingCounts(data: MetaScore, element: HTMLElement | null) {
		if (element != null) {
			const criticPositive = element.querySelectorAll<HTMLElement>('.reviews-stats__positive-stats span');
			const criticNeutral = element.querySelectorAll<HTMLElement>('.reviews-stats__neutral-stats span');
			const criticNegative = element.querySelectorAll<HTMLElement>('.reviews-stats__negative-stats span');

			if (criticPositive.length == 2) {
				data.positive = parseInt(criticPositive[1].innerText.replace(' Reviews', ''));
			}
			if (criticNeutral.length == 2) {
				data.mixed = parseInt(criticNeutral[1].innerText.replace(' Reviews', ''));
			}
			if (criticNegative.length == 2) {
				data.negative = parseInt(criticNegative[1].innerText.replace(' Reviews', ''));
			}

			data.num_ratings = data.positive + data.mixed + data.negative;

			// Metacritic will not show the breakdown when there are too few ratings, lets tally it up ourselves, shall we?
			if (data.rating == 'tbd' && data.num_ratings == 0) {
				data.positive = element.querySelectorAll('.c-reviews-container .review-card .c-siteReviewScore_background .c-siteReviewScore_green').length;
				data.mixed = element.querySelectorAll('.c-reviews-container .review-card .c-siteReviewScore_background .c-siteReviewScore_yellow').length;
				data.negative = element.querySelectorAll('.c-reviews-container .review-card .c-siteReviewScore_background .c-siteReviewScore_red').length;

				data.num_ratings = data.positive + data.mixed + data.negative;
			}

			data.highest = this._getMetaHighest(data);
		}
	}

	_getMetaHighest(data: MetaScore): number {
		const ratings = [data.positive, data.mixed, data.negative];
		let highest = 0;

		for (let i = 0; i < ratings.length; i++) {
			if (ratings[i] > highest) {
				highest = ratings[i];
			}
		}

		return highest;
	}

	createMetaScore(type: ScoreType, display: string, url: string, data: MetaScore, mustSee: boolean, isMobile: boolean | null, addTooltip: boolean): HTMLElement {
		// The span that holds the score
		let spanStyle = '';
		if (type == 'critic' || mustSee) {
			spanStyle += 'margin-right: 10px;';
		}
		const span: HTMLElement = this.helpers.createElement('span', {
			class: 'meta-span-' + type,
			style: spanStyle
		});

		let mobileClass = '';
		if (isMobile) {
			mobileClass = 'extras-mobile';
		}

		const colour = this._determineMetaColour(data.rating, (type == 'user'));
		const textColour = this._determineMetaTextColour(data.rating, (type == 'user'));
		let className = 'meta-score';
		if (type == 'user') {
			className += '-user';
		}
		let scoreStyle = 'background-color: ' + colour + '; color: ' + textColour;
		if (data.rating == 'tbd' || data.rating == 'N/A') {
			scoreStyle += '; border: 1px solid grey';
		}

		// The element that is the score itself
		const text: HTMLElement = this.helpers.createElement('a', {
			class: 'tooltip display-rating -highlight ' + className,
			style: scoreStyle
		});

		// Create Tooltip
		let tooltip = '';
		let rating = data.rating;

		if (data.num_ratings > 0 && (rating == 'tbd' || rating == 'N/A')) {
			tooltip = 'No score yet (' + data.num_ratings.toLocaleString() + ' ' + display + ' review';
			if (data.num_ratings == 1) {
				tooltip += ')';
			} else {
				tooltip += 's)';
			}

		} else if (data.num_ratings > 0) {
			let suffix = '/100';
			if (type == 'user') {
				suffix = '/10';
			}

			if ((this.storage.get('convert-ratings') === '5')) {
				suffix = '/5';
				if (type == 'critic') {
					rating = (Number(rating) / 10 / 2).toFixed(1);
				} else {
					rating = (Number(rating) / 2).toFixed(1);
				}
			} else if ((this.storage.get('convert-ratings') === '10')) {
				suffix = '/10';
				if (type == 'critic') {
					rating = (Number(rating) / 10).toFixed(1);
				}
			}

			tooltip = 'Weighted average of ' + rating + suffix + ' based on ' + data.num_ratings.toLocaleString() + ' ' + display + ' review';
			if (data.num_ratings != 1) {
				tooltip += 's';
			}

		} else if (url != '') {
			if (rating == 'N/A') {
				tooltip = 'No score available';
			} else {
				tooltip = 'No score yet';
			}
		}
		text.setAttribute('data-original-title', tooltip);

		if (tooltip != '') {
			text.className += ' tooltip-extra';
		}

		// Add href link
		if (data.num_ratings > 0) {
			text.setAttribute('href', url);
		}

		text.innerText = rating;
		span.append(text);

		// Add the positive/mixed/negative bars
		const chartSpan: HTMLElement = this.helpers.createElement('span', {
			class: 'meta-score-details score-' + type + ' ' + mobileClass,
			style: 'display: none'
		});
		if (type == 'critic' && this.storage.get('metacritic-mustsee-enabled') === true && mustSee) {
			chartSpan.className += ' short';
		}
		if ((isMobile) || (type == 'critic' && this.storage.get('metacritic-users-enabled') === true) || (type == 'user' && this.storage.get('metacritic-mustsee-enabled') === true && mustSee)) {
			chartSpan.style.marginBottom = '10px';
		}
		chartSpan.append(this._createMetaBarCount('Positive', data.positive, data.highest, this._determineMetaColour(100, false)));
		chartSpan.append(this._createMetaBarCount('Mixed', data.mixed, data.highest, this._determineMetaColour(50, false)));
		chartSpan.append(this._createMetaBarCount('Negative', data.negative, data.highest, this._determineMetaColour(0, false)));
		span.append(chartSpan);

		// Add the tooltip as text for mobile
		if (addTooltip && tooltip != '') {
			const detailsSpan: HTMLElement = this.helpers.createElement('span', {
				class: 'meta-details-' + type + ' mobile-details-text'
			});

			if (isMobile) {
				detailsSpan.className += ' meta-score-details';
				detailsSpan.style.display = 'none';
			}

			const detailsText: HTMLElement = this.helpers.createElement('p', {
			});
			detailsText.innerText = tooltip;
			detailsSpan.append(detailsText);

			span.append(detailsSpan);
		}

		return span;
	}

	_createMetaBarCount(type: string, count: number, total: number, color: string): HTMLElement {
		// Span that holds it all
		const span: HTMLElement = this.helpers.createElement('span', {
			style: 'display: block; width: 150px;'
		});
		// Text label
		const label: HTMLElement = this.helpers.createElement('span', {
			class: 'meta-bar-label'
		});
		label.innerText = type;
		span.append(label);

		// Span that holds the bar
		const barSpan: HTMLElement = this.helpers.createElement('span', {
			style: 'display: inline-block;'
		});
		// Bar outline
		const backBar: HTMLElement = this.helpers.createElement('span', {
			class: 'meta-bar outline'
		});
		// Bar that displays the percentage
		const width = Math.round((count / total) * 100);
		const frontBar: HTMLElement = this.helpers.createElement('span', {
			class: 'meta-bar fill',
			style: 'width: ' + width.toString() + '%; background-color:' + color + ';'
		});
		backBar.append(frontBar);
		barSpan.append(backBar);
		span.append(barSpan);

		// Text that shows the num of ratings
		const countText: HTMLElement = this.helpers.createElement('span', {
			class: 'meta-bar-value'
		});
		countText.innerText = count.toLocaleString();
		span.append(countText);

		return span;
	}

	_determineMetaColour(metascore: string | number, user: boolean): string {
		let output = 'transparent'; // transparent background tba
		if (metascore != 'tbd' && metascore != 'N/A') {
			let score = parseFloat(String(metascore));
			if (user == true) score = score * 10;

			if (score >= 61) {
				output = '#00ce7a'; // Green
			} else if (score >= 40) {
				output = '#ffbd3f'; // Yellow
			} else {
				output = '#ff6874'; // Red
			}
		}
		return output;
	}

	_determineMetaTextColour(metascore: string | number, user: boolean): string {
		let output = 'lightgray'; // Grey/black default
		if (metascore != 'tbd' && metascore != 'N/A') {
			let score = parseFloat(String(metascore));
			if (user == true) score = score * 10;

			if (score >= 40) {
				output = '#262626'; // Grey/black
			} else {
				output = '#fff'; // White
			}
		}
		return output;
	}
}
