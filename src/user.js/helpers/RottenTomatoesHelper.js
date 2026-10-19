import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

/**
 * One score on the scorecard: the Tomatometer (critics) or the Popcornmeter (audience), for all
 * reviewers or a subset (top critics, verified audience).
 *
 * @typedef {Object} RTScorecardScore
 * @property {string} title - 'Tomatometer' or 'Popcornmeter'
 * @property {number} likedCount - Positive reviews
 * @property {number} notLikedCount - Negative reviews
 * @property {number} reviewCount
 * @property {string} scoreLinkUrl - Relative link to these reviews, e.g. '/m/oppenheimer_2023/reviews/top-critics'
 * @property {string} [score] - Percentage as a string, e.g. '93'; absent when there is no score yet
 * @property {string} [scorePercent] - The same with a percent sign, e.g. '93%'
 * @property {'POSITIVE' | 'NEGATIVE'} [sentiment]
 * @property {boolean} [certified] - Certified Fresh (critics) or Verified Hot (audience)
 * @property {string} [averageRating] - A string, e.g. '8.60'; out of 10 for critics, out of 5 for audiences
 * @property {number} [ratingCount]
 * @property {string} [bandedRatingCount] - e.g. '25,000+ Ratings'
 * @property {'ALL' | 'VERIFIED'} [scoreType]
 * @property {string} [reviewsPageUrl]
 * @property {string} [scoreLinkText] - e.g. '87 Top Critic Reviews'
 * @property {string} [certifiedFresh] - 'none' or 'certified'
 */

/**
 * The parts of the scorecard JSON this helper reads.
 *
 * @typedef {Object} RTScorecard
 * @property {Object} overlay
 * @property {RTScorecardScore} overlay.criticsAll
 * @property {RTScorecardScore} overlay.criticsTop
 * @property {RTScorecardScore} overlay.audienceAll
 * @property {RTScorecardScore} overlay.audienceVerified
 * @property {boolean} overlay.hasCriticsAll
 * @property {boolean} overlay.hasCriticsTop
 * @property {boolean} overlay.hasAudienceAll
 * @property {boolean} overlay.hasAudienceVerified
 * @property {'Movie' | 'TvSeason'} overlay.mediaType
 */

/**
 * A score in the form _createTomatoScore draws it.
 *
 * @typedef {Object} TomatoScore
 * @property {'CRITIC' | 'AUDIENCE'} type
 * @property {string} percent - '--' when there is no score; _createTomatoScore adds the '%' when drawing it
 * @property {string} state - Which icon to show: 'certified-fresh', 'verified-hot', 'fresh', 'rotten',
 *   'upright' or 'spilled'; '' when there is no score
 * @property {string} rating - Average rating, or '' when Rotten Tomatoes gives none
 * @property {number} num_ratings - likedCount + notLikedCount
 * @property {number} likedCount
 * @property {number} notLikedCount
 * @property {string} url - Relative link to these reviews
 */

/**
 * @param {'CRITIC' | 'AUDIENCE'} type
 * @returns {TomatoScore} A score with no data, which _createTomatoScore shows as '--'.
 */
function emptyTomatoScore(type) {

	return { type, percent: '--', state: '', rating: '', num_ratings: 0, likedCount: 0, notLikedCount: 0, url: '' };

}

/** Icon in images/ for each TomatoScore state. A state not listed gets the no-score icon. */
const tomatoIcons = {
	'certified-fresh': 'tomato-critic-certified-fresh',
	'verified-hot': 'tomato-audience-verified-hot',
	'fresh': 'tomato-critic-fresh',
	'rotten': 'tomato-critic-rotten',
	'upright': 'tomato-audience-hot',
	'spilled': 'tomato-audience-stale'
};

/** Query appended to `${linkURL}/reviews` so each score links to its own reviews. */
const tomatoReviewQueries = {
	'critic-all': '',
	'critic-top': '?type=top_critics',
	'audience-all': '?type=user',
	'audience-verified': '?type=verified_audience'
};

/**
 * Adds a film's Rotten Tomatoes scores to the ratings sidebar: the Tomatometer (all critics or top
 * critics) and the Popcornmeter (all audience or verified audience), each with a toggle between the two.
 */
export class RottenTomatoesHelper extends Helper {

	constructor(storage, helpers, pageState) {

		super(storage, helpers, pageState, 'tomato');

		/**
		 * The film page's HTML
		 *
		 * @type {string | null}
		 */
		this.raw = null;

		/** @type {TomatoScore} The score from all critics */
		this.criticAll = emptyTomatoScore('CRITIC');
		/** @type {TomatoScore} The score from top critics */
		this.criticTop = emptyTomatoScore('CRITIC');
		/** @type {TomatoScore} The score from RottenTomatoes users */
		this.audienceAll = emptyTomatoScore('AUDIENCE');
		/** @type {TomatoScore} The score from verified RottenTomatoes users */
		this.audienceVerified = emptyTomatoScore('AUDIENCE');

	}

	_loadData(url) {

		this.linkURL = url;
		this.addButtonLink(url, 'RT');

		this._apiRequestCallback('RottenTomatoes', url, 'HTML', {}, value => {

			this.raw = value.response;
			this.data = this.helpers.parseHTML(value.response);
			// Renamed films redirect to their current address; link there rather than via the redirect.
			this.linkURL = value.url;
			this.loadState = LOAD_STATES['Success'];

			this.populateRatingsSidebar();

		});

	}

	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		if (this.raw.includes('404 - Not Found')) {
			return;
		}

		const scorecardElement = this.data.querySelector('#media-scorecard-json');
		if (scorecardElement === null) {
			return;
		}

		const scorecard = JSON.parse(scorecardElement.innerHTML);
		this._collectScore(this.criticAll, scorecard.overlay.criticsAll);
		this._collectScore(this.criticTop, scorecard.overlay.criticsTop);
		this._collectScore(this.audienceAll, scorecard.overlay.audienceAll);
		this._collectScore(this.audienceVerified, scorecard.overlay.audienceVerified);

		if (this.criticAll.num_ratings === 0 && this.audienceAll.num_ratings === 0) {
			return;
		}

		// Assembled from the parts rather than with _createChartSection, which only adds the
		// SHOW DETAILS button on mobile: Rotten Tomatoes shows it everywhere.
		const section = this._createChartSectionElement(false);
		const heading = this._createChartSectionHeader();
		section.append(heading);
		heading.append(this._createChartSectionLogoHolder({
			href: this.linkURL,
			style: 'height: 20px; width: 75px; background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/rtlogo.9b892cff3fd.png");'
		}));

		const showDetails = this._createShowDetailsButton();
		section.append(showDetails);

		const criticAdded = this.storage.get('tomato-critic-enabled') === true;
		if (criticAdded) {
			section.append(this._createScoreGroup({
				group: 'critic',
				subset: 'top',
				subsetLabel: 'TOP',
				all: this.criticAll,
				subsetScore: this.criticTop,
				allName: 'Critic',
				subsetName: 'Top Critic'
			}));
		}

		const audienceAdded = this.storage.get('tomato-audience-enabled') === true;
		if (audienceAdded) {
			section.append(this._createScoreGroup({
				group: 'audience',
				subset: 'verified',
				subsetLabel: 'VERIFIED',
				all: this.audienceAll,
				subsetScore: this.audienceVerified,
				allName: 'Audience',
				subsetName: 'Verified Audience'
			}));
		}

		if (!criticAdded && !audienceAdded) {
			this.ratingsAdded = true; // so it doesn't keep trying
			return;
		}

		this.appendSidebarRating(section);

		const { isMobile } = this.pageState;

		// On desktop the per-score details text sits below all the scores until SHOW DETAILS is
		// clicked; toggleDetails (common/additional.js) moves it back beside each score.
		if (!isMobile) {
			for (const name of ['critic-all', 'critic-top', 'audience-all', 'audience-verified']) {
				const detailsText = section.querySelector(`.mobile-details-text.score-${name}`);
				if (detailsText !== null) {
					section.append(detailsText);
				}
			}
		}

		// Switch to the subset score if that is the user's default and there is one.
		if (this.criticTop.percent !== '--' && this.storage.get('critic-default') === 'top') {
			section.querySelector(isMobile ? '.toggle-button.critic-toggle' : '.toggle-button.critic-top')?.click();
		}
		if (this.audienceVerified.percent !== '--' && this.storage.get('audience-default') === 'verified') {
			section.querySelector(isMobile ? '.toggle-button.audience-toggle' : '.toggle-button.audience-verified')?.click();
		}

		const defaultView = this.storage.get('rt-default-view');
		if (defaultView === 'show' || (defaultView === 'remember' && this.storage.get('rt-score-details') === 'show')) {
			showDetails.click();
		}

		this.helpers.addTooltipEvents(section);

		this.ratingsAdded = true;

	}

	/**
	 * Builds one column of the section: a toggle between "all" and a subset, and both scores, with
	 * the subset hidden until toggled.
	 *
	 * @param {Object} options
	 * @param {'critic' | 'audience'} options.group The group a reviewer belongs to (either audiences or critics).
	 * @param {'top' | 'verified'} options.subset The subset of the group the reviewer belongs to
	 * @param {string} options.subsetLabel - Button text for the subset, e.g. 'TOP'
	 * @param {TomatoScore} options.all - 
	 * @param {TomatoScore} options.subsetScore
	 * @param {string} options.allName - Used in the hover text, e.g. 'Critic'
	 * @param {string} options.subsetName - Used in the hover text, e.g. 'Top Critic'
	 * @returns {HTMLSpanElement}
	 * @private
	 */
	_createScoreGroup({ group, subset, subsetLabel, all, subsetScore, allName, subsetName }) {

		const { isMobile } = this.pageState;
		const addTooltip = isMobile || this.storage.get('tooltip-show-details') === true;

		// We assume that Rotten Tomatoes always has an 'ALL' score for both all of the audience and all of the critics
		// Consequently, only 'Top' and 'Verified' get disabled
		const noSubsetScore = subsetScore.percent === '--';

		const span = this.helpers.createElement('span', {
			style: 'display: inline-block; padding-right: 10px;'
		});

		const buttonHolder = this.helpers.createElement('div', {
			class: 'toggle-button-holder'
		});
		span.append(buttonHolder);

		if (isMobile) {
			// One button that flips between the two scores
			buttonHolder.append(this.helpers.createToggleButton(`${group}-toggle`, 'ALL', `score-${group}-all,score-${group}-${subset}`, true, noSubsetScore, isMobile));
		} else {
			buttonHolder.append(this.helpers.createToggleButton(`${group}-all`, 'ALL', `score-${group}-all`, true, false, false));
			buttonHolder.append(this.helpers.createToggleButton(`${group}-${subset}`, subsetLabel, `score-${group}-${subset}`, false, noSubsetScore, false));
		}

		span.append(this._createTomatoScore(`${group}-all`, allName, all, 'block', addTooltip));
		span.append(this._createTomatoScore(`${group}-${subset}`, subsetName, subsetScore, 'none', addTooltip));

		return span;

	}

	/**
	 * Builds one score: its icon, the percentage linking to its reviews, the fresh/rotten bars shown
	 * by SHOW DETAILS, and optionally the hover text written out beneath it.
	 *
	 * @param {'critic-all' | 'critic-top' | 'audience-all' | 'audience-verified'} type
	 * @param {string} display - Used in the hover text, e.g. 'Top Critic'
	 * @param {TomatoScore} data
	 * @param {'block' | 'none'} visibility - 'none' for the subset score, hidden until toggled
	 * @param {boolean} addTooltip - Also write the hover text out as visible text
	 * @returns {HTMLDivElement}
	 * @private
	 */
	_createTomatoScore(type, display, data, visibility, addTooltip) {

		const { isMobile } = this.pageState;
		const isCritic = type.startsWith('critic');
		const baseType = type.split('-')[0];

		const scoreDiv = this.helpers.createElement('div', {
			class: `toggle-score-display score-${type}`,
			style: `display: ${visibility};`
		});

		if (visibility === 'none') {
			scoreDiv.className += ' disabled';
		}

		const icon = tomatoIcons[data.state] ?? (isCritic ? 'tomato-critic-no-score' : 'tomato-audience-no-score');
		scoreDiv.append(this.helpers.createElement('span', {
			class: 'icon-popcorn',
			style: `background-image: url("${browser.runtime.getURL(`images/${icon}.svg`)}");`
		}));

		// Critics rate out of 10 and audiences out of 5; convert one to the other if the user asked.
		let suffix = isCritic ? '/10' : '/5';
		let rating = data.rating;
		const convertRatings = this.storage.get('convert-ratings');
		if (convertRatings === '10') {
			suffix = '/10';
			if (!isCritic) {
				rating = Number(rating * 2).toFixed(1);
			}
		} else if (convertRatings === '5') {
			suffix = '/5';
			if (isCritic) {
				rating = Number(rating / 2).toFixed(1);
			}
		}

		const plural = data.num_ratings !== 1 ? 's' : '';
		const hover = rating === ''
			? `${data.num_ratings} ${display} rating${plural}`
			: `Average of ${rating}${suffix} based on ${data.num_ratings.toLocaleString()} ${display} rating${plural}`;

		// The score itself, linking to the matching reviews
		const score = this.helpers.createElement('a', {
			class: 'tooltip tooltip-extra display-rating -highlight tomato-score',
			href: `${this.linkURL}/reviews${tomatoReviewQueries[type]}`,
			style: 'display: inline-block; width: 50px',
			['data-original-title']: hover
		});
		score.innerText = data.percent === '--' ? data.percent : `${data.percent}%`;
		scoreDiv.append(score);

		// The fresh/rotten bars, hidden until SHOW DETAILS
		if (data.likedCount + data.notLikedCount > 0) {
			const chartSpan = this.helpers.createElement('span', {
				class: 'rt-score-details',
				style: 'display: none; width: 140px; margin-left: 5px;'
			});
			if ((isCritic && this.storage.get('tomato-audience-enabled') === true) || isMobile) {
				chartSpan.style['margin-bottom'] = '10px';
			}
			chartSpan.append(this._createTomatoBarCount('Fresh', data.likedCount, data.num_ratings));
			chartSpan.append(this._createTomatoBarCount('Rotten', data.notLikedCount, data.num_ratings));

			scoreDiv.append(chartSpan);
		}

		// Add the tooltip as text for mobile
		if (addTooltip) {
			const detailsSpan = this.helpers.createElement('span', {
				class: `toggle-score-display score-${baseType} score-${type} mobile-details-text`
			});

			if (isMobile) {
				detailsSpan.className += ' rt-score-details';
			}

			if (type === 'critic-top' || type === 'audience-verified' || isMobile) {
				detailsSpan.style.display = 'none';
			}

			const detailsText = this.helpers.createElement('p');
			detailsText.innerText = hover;
			detailsSpan.append(detailsText);

			scoreDiv.append(detailsSpan);
		}

		return scoreDiv;

	}

	/**
	 * Builds one row of the details chart: a label, a bar filled to count / total, and the count.
	 *
	 * @param {'Fresh' | 'Rotten'} label
	 * @param {number} count
	 * @param {number} total
	 * @returns {HTMLSpanElement}
	 * @private
	 */
	_createTomatoBarCount(label, count, total) {

		const mobileClass = this.pageState.isMobile ? ' extras-mobile' : '';

		const span = this.helpers.createElement('span', {
			style: 'display: block; width: 140px;'
		});

		const labelSpan = this.helpers.createElement('span', {
			class: `rt-bar text-label${mobileClass}`
		});
		labelSpan.innerText = label;
		span.append(labelSpan);

		const barSpan = this.helpers.createElement('span', {
			style: 'display: inline-block;'
		});
		const backBar = this.helpers.createElement('span', {
			class: 'rt-bar outline'
		});
		const frontBar = this.helpers.createElement('span', {
			class: 'rt-bar fill',
			style: `width: ${Math.round((count / total) * 100)}%;`
		});
		backBar.append(frontBar);
		barSpan.append(backBar);
		span.append(barSpan);

		const countText = this.helpers.createElement('span', {
			class: `rt-bar text-count${mobileClass}`
		});
		countText.innerText = count.toLocaleString();
		span.append(countText);

		return span;

	}

	/**
	 * Copies one scorecard entry into a TomatoScore, and works out which icon it gets.
	 *
	 * @param {TomatoScore} data - Updated in place
	 * @param {RTScorecardScore | undefined} scoredetails
	 * @private
	 */
	_collectScore(data, scoredetails) {

		if (scoredetails == null || scoredetails.score == null) {
			return;
		}

		data.percent = scoredetails.score;
		data.likedCount = scoredetails.likedCount;
		data.notLikedCount = scoredetails.notLikedCount;
		data.num_ratings = data.likedCount + data.notLikedCount;
		data.url = scoredetails.scoreLinkUrl;
		data.rating = scoredetails.averageRating ?? '';

		const positive = scoredetails.sentiment === 'POSITIVE';
		const negative = scoredetails.sentiment === 'NEGATIVE';

		if (scoredetails.certified === true) {
			data.state = data.type === 'CRITIC' ? 'certified-fresh' : 'verified-hot';
		} else if (data.type === 'CRITIC') {
			data.state = positive ? 'fresh' : negative ? 'rotten' : scoredetails.sentiment ?? '';
		} else {
			data.state = positive ? 'upright' : negative ? 'spilled' : scoredetails.sentiment ?? '';
		}

	}

}
