/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

/** Which kind of AlloCine page the WikiData ID refers to. */
export type AllocineMediaType = 'FILM' | 'TV';

export interface AllocineRequest {
	/** The AlloCine film (P1265) or series (P1267) ID from WikiData. */
	id: string
	type: AllocineMediaType
}

/** The two AlloCine review pages, parsed. */
interface AllocinePages {
	user: Document
	critic: Document
}

interface AllocineUserScore {
	/** Out of 5. */
	rating: number | null
	num_ratings: number
	num_reviews: number
	highest: number
	/** Review counts per star bucket, lowest bucket first. */
	votes: number[]
	/** Each bucket's share of num_reviews, as a fixed-point string such as '12.5'. */
	percents: string[]
}

interface AllocineCriticScore {
	/** Out of 5; 0 when the film has no press rating. */
	rating: number
	num_ratings: number
}

const LOGO_STYLE = 'background-image: url("https://assets.allocine.fr/skin/img/allocine/sprite.a961a077.png");';

/** The number of star buckets in AlloCine's user review breakdown (0.5 to 5). */
const HISTOGRAM_BUCKETS = 6;

export class AllocineHelper extends Helper {

	declare data: AllocinePages | null;

	urlUser: string | null;
	urlCritic: string | null;

	userPage: Document | null;
	criticPage: Document | null;

	user: AllocineUserScore;
	critic: AllocineCriticScore;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'allocine');

		this.urlUser = null;
		this.urlCritic = null;
		this.userPage = null;
		this.criticPage = null;

		this.user = {
			rating: null,
			num_ratings: 0,
			num_reviews: 0,
			highest: 0,
			votes: new Array(HISTOGRAM_BUCKETS),
			percents: new Array(HISTOGRAM_BUCKETS)
		};

		this.critic = {
			rating: 0,
			num_ratings: 0
		};

	}

	_loadData({ id, type }: AllocineRequest) {

		if (type === 'FILM') {
			this.linkURL = `https://www.allocine.fr/film/fichefilm_gen_cfilm=${id}.html`;
			this.urlUser = `https://www.allocine.fr/film/fichefilm-${id}/critiques/spectateurs/`;
			this.urlCritic = `https://www.allocine.fr/film/fichefilm-${id}/critiques/presse/`;
		} else {
			this.linkURL = `https://www.allocine.fr/series/ficheserie_gen_cserie=${id}.html`;
			this.urlUser = `https://www.allocine.fr/series/ficheserie-${id}/critiques/`;
			this.urlCritic = `https://www.allocine.fr/series/ficheserie-${id}/critiques/presse/`;
		}

		this._requestPage('AlloCine (user ratings)', this.urlUser, page => {
			this.userPage = page;
		});

		this._requestPage('AlloCine (critic ratings)', this.urlCritic, page => {
			this.criticPage = page;
		});

	}

	_requestPage(errorHeader: string, url: string, onLoad: (page: Document) => void) {

		this._apiRequestCallback(errorHeader, url, 'HTML', {}, value => {

			try {
				onLoad(this.helpers.parseHTML(value.response));
			} catch (error) {
				console.error(error);
				this.loadState = LOAD_STATES['Failure'];
				return;
			}

			this._onPageLoaded();

		});

	}

	_onPageLoaded() {

		if (this.loadState === LOAD_STATES['Failure'] || this.userPage === null || this.criticPage === null) {
			return;
		}

		this.data = { user: this.userPage, critic: this.criticPage };
		this.loadState = LOAD_STATES['Success'];

		this.populateRatingsSidebar();

	}

	populateRatingsSidebar() {

		const { data } = this;
		if (data === null || !this._canPopulateRatingsSidebar()) {
			return;
		}

		this.addButtonLink(this.linkURL, 'ALLO');

		this._collectUserScore(data.user);
		this._collectCriticScore(data.critic);

		// Do not display if there is no score or ratings
		if (this.user.num_ratings === 0 && this.critic.num_ratings === 0) {
			return;
		}

		const section: HTMLElement = this._createChartSection(
			{
				href: this.linkURL,
				style: LOGO_STYLE
			},
			'height: 15px !important;'
		);

		if (this.storage.get('allocine-style') === 'ratings') {
			this._appendRatingsStyle(section);
		} else {
			this._appendHistogramStyle(section);
		}

		this.appendSidebarRating(section);

		// Switch to the critic score if that is the default view, or the only score shown
		if (section.querySelector('.toggle-button.allocine-button')) {
			if (this.critic.rating !== 0 && (this.storage.get('allocine-default-view') === 'critic' || this.storage.get('allocine-users-enabled') !== true)) {
				section.querySelector<HTMLElement>('.toggle-button.allo-critic')?.click();
			}
		}

		this.helpers.addTooltipEvents(section);
		this.ratingsAdded = true;

	}

	_collectUserScore(page: Document) {

		const ratingElement = page.querySelector<HTMLElement>('.big-note .note');
		if (ratingElement) {
			this.user.rating = Number(ratingElement.innerText.replace(',', '.'));
		}

		const countElement = page.querySelector<HTMLElement>('.big-note .user-note-count');
		if (countElement) {
			this.user.num_ratings = this._matchNumber(countElement.innerText, /([0-9]+) notes*/);
		}

		const reviewsElement = page.querySelector<HTMLElement>('.reviews-users-by-note .titlebar-title');
		if (reviewsElement) {
			const match = reviewsElement.innerText.match(/([0-9 ]+) critique/);
			if (match) {
				this.user.num_reviews = Number(this.helpers.cleanNumber(match[1]));
			}
		}

		const histogramData = page.querySelectorAll('.reviews-users-by-note .item');
		if (histogramData.length > 0) {
			for (let i = 0; i < histogramData.length; i++) {
				const votesElement = histogramData[i].querySelector<HTMLElement>('.item-unit .nb');
				const votes = this._matchNumber(votesElement?.innerText ?? '', /([0-9]+) critique/);

				this.user.votes[i] = votes;
				this.user.percents[i] = ((votes / this.user.num_reviews) * 100).toFixed(1);

				if (this.user.highest < votes) {
					this.user.highest = votes;
				}
			}

			// AlloCine lists the highest bucket first; the histogram expects lowest first
			this.user.votes.reverse();
			this.user.percents.reverse();
		}

	}

	_collectCriticScore(page: Document) {

		const ratingElement = page.querySelector<HTMLElement>('.big-note .note');
		if (ratingElement) {
			this.critic.rating = Number(ratingElement.innerText.replace(',', '.'));
		} else {
			this.critic.rating = 0;
		}

		const countElement = page.querySelector<HTMLElement>('.big-note .user-note-count');
		if (countElement) {
			this.critic.num_ratings = this._matchNumber(countElement.innerText, /([0-9]+) titre/);
		}

	}

	/** Returns the first capture group of `pattern` in `text` as a number, or 0 if it doesn't match. */
	_matchNumber(text: string, pattern: RegExp) {

		const match = text.match(pattern);
		return match ? Number(match[1]) : 0;

	}

	/** Critic and user scores side by side, each with stars and no histogram. */
	_appendRatingsStyle(section: HTMLElement) {

		const { isMobile } = this.pageState;

		if (this.storage.get('allocine-critic-enabled') === true) {
			const criticSpan = this._createRatingsStyleSpan('allocine-critic-score', 'Critics');
			criticSpan.append(this.helpers.createAllocineCriticScore('ratings-style', this.critic.rating, this.critic.num_ratings, null, this.urlCritic, isMobile));
			criticSpan.append(this.helpers.createDynamicStars('allocine-ratings', this.critic.rating));
			section.append(criticSpan);
		}

		if (this.storage.get('allocine-users-enabled') === true) {
			const userSpan = this._createRatingsStyleSpan('allocine-user-score', 'Users');
			userSpan.append(this.helpers.createAllocineCriticScore('ratings-style', this.user.rating, this.user.num_ratings, this.user.num_reviews, this.urlUser, isMobile));
			userSpan.append(this.helpers.createDynamicStars('allocine-ratings', this.user.rating));
			section.append(userSpan);
		}

		// Add the tooltips as text for mobile
		this._createTooltipDetailsText(section, '.allocine-critic-score .allocine-critic .tooltip', section);
		this._createTooltipDetailsText(section, '.allocine-user-score .allocine-critic .tooltip', section);

	}

	_createRatingsStyleSpan(className: string, labelText: string): HTMLElement {

		const span = this.helpers.createElement('span', {
			class: `${className} allocine-ratings-style`,
			style: 'position: relative; height: 60px;'
		});

		const label = this.helpers.createElement('span', {
			class: 'allocine-label'
		});
		label.innerText = labelText;
		span.append(label);

		return span;

	}

	/** A user histogram and a critic score, switched between with toggle buttons. */
	_appendHistogramStyle(section: HTMLElement) {

		const { isMobile } = this.pageState;

		const buttonDiv: HTMLElement = this.helpers.createElement('div', {
			class: 'toggle-button-holder allocine-buttons'
		});
		section.append(buttonDiv);

		buttonDiv.append(this.helpers.createToggleButton('allocine-button allo-user', 'USER', 'allocine-user-score', true, false, isMobile));
		buttonDiv.append(this.helpers.createToggleButton('allocine-button allo-critic', 'CRITIC', 'allocine-critic-score', false, (this.critic.rating === 0), isMobile));
		if (this.storage.get('allocine-users-enabled') !== true || this.storage.get('allocine-critic-enabled') !== true) {
			buttonDiv.style.display = 'none';
		}

		// User score
		const userSpan: HTMLElement = this.helpers.createElement('span', {
			class: 'allocine-user-score toggle-score-display',
			style: 'position: relative; display: block; margin-top: 5px;'
		});

		userSpan.append(this.helpers.createHistogram(
			this.storage,
			'allocine',
			this.urlUser,
			this.user.rating,
			this.user.num_reviews,
			this.user.votes,
			this.user.percents,
			this.user.highest
		));

		section.append(userSpan);

		if (this.storage.get('allocine-critic-enabled') === false) {
			userSpan.querySelector<HTMLElement>('.rating-histogram')?.style.setProperty('margin-top', '15px');
		}

		// Critic score
		const criticSpan: HTMLElement = this.helpers.createElement('span', {
			class: 'allocine-critic-score toggle-score-display',
			style: 'position: relative; display: block; height: 44px; display:none; margin-top: 5px;'
		});
		criticSpan.append(this.helpers.createAllocineCriticScore('allocine', this.critic.rating, this.critic.num_ratings, null, this.urlCritic, isMobile));
		criticSpan.append(this.helpers.createDynamicStars('allocine-critic', this.critic.rating));
		section.append(criticSpan);

		// Add the tooltips as text for mobile
		this._createTooltipDetailsText(section, '.allocine-user-score .average-rating .tooltip', userSpan);
		this._createTooltipDetailsText(section, '.allocine-critic-score .allocine-critic .tooltip', criticSpan);

	}

	/** Copies a score's hover text into a details line under `target`, so it can be read on mobile. */
	_createTooltipDetailsText(section: HTMLElement, tooltipSelector: string, target: HTMLElement) {

		const score = section.querySelector(tooltipSelector);
		if (score === null) {
			return;
		}

		const tooltip = score.getAttribute('data-original-title');
		this.helpers.createDetailsText('allocine', target, tooltip, this.pageState.isMobile);

	}

}
