import {beforeEach, describe, expect, test} from 'vitest';

import {MetacriticHelper} from '../../../../src/user.js/helpers/MetacriticHelpers.js';
import {createHelpers, createPageState, createStorage, parseHTML} from '../../utils/fakes.js';

const filmURL = 'https://www.metacritic.com/movie/the-maltese-falcon/';

/**
 * A minimal Metacritic page holding only the elements MetacriticHelper reads. Selectors mirror the
 * ones in _collectScores and parseRatingCounts; when Metacritic changes its markup, update both.
 */
function metacriticPage({
	metascore = '85',
	userScore = '7.9',
	mustSee = false,
	heroScores = true,
	critic = {positive: 40, mixed: 8, negative: 2},
	user = {positive: 30, mixed: 5, negative: 5},
} = {}) {
	const stats = ({positive, mixed, negative}) => `
		<div class="reviews-stats__positive-stats"><span>Positive</span><span>${positive} Reviews</span></div>
		<div class="reviews-stats__neutral-stats"><span>Mixed</span><span>${mixed} Reviews</span></div>
		<div class="reviews-stats__negative-stats"><span>Negative</span><span>${negative} Reviews</span></div>`;

	return parseHTML(`
		<div class="product-hero__scores">${mustSee ? '<img class="c-global-image__img">' : ''}</div>
		${heroScores ? `
		<div class="hero-scores">
			<div data-testid="product-score"><div title="Metascore ${metascore} out of 100"><span>${metascore}</span></div></div>
			<div data-testid="product-score"><div title="User score ${userScore} out of 10"><span>${userScore}</span></div></div>
		</div>` : ''}
		<div data-testid="critic-reviews">${critic ? stats(critic) : ''}</div>
		<div data-testid="user-reviews">${user ? stats(user) : ''}</div>`);
}

/** Every Metacritic option switched on, plus a ratings order to place the section in. */
const enabledOptions = {
	'ratings-order': ['imdb-ratings', 'tomato-ratings', 'meta-ratings', 'sens-ratings', 'mubi-ratings'],
	'metacritic-enabled': true,
	'metacritic-critic-enabled': true,
	'metacritic-users-enabled': true,
	'metacritic-mustsee-enabled': true,
};

function createHelper({options = {}, pageState = {}} = {}) {
	const helpers = createHelpers();
	const helper = new MetacriticHelper(
		createStorage({...enabledOptions, ...options}),
		helpers,
		createPageState(pageState),
	);
	return {helper, helpers};
}

function emptyScore(overrides = {}) {
	return {rating: 'N/A', num_ratings: 0, positive: 0, mixed: 0, negative: 0, highest: 0, parseError: false, ...overrides};
}

describe('parseRatingScore', () => {
	const {helper} = createHelper();

	test('reads the score from its element', () => {
		const data = emptyScore();
		helper.parseRatingScore(data, parseHTML('<span>85</span>').querySelector('span'));
		expect(data.rating).toBe('85');
		expect(data.parseError).toBe(false);
	});

	test('treats a missing score on a TV episode as N/A, not an error', () => {
		// Force a TV URL onto the example
		helper.url = 'https://www.metacritic.com/tv/severance/season-1/episode-1-good-news-about-hell/';
		const data = emptyScore({rating: '?'});
		helper.parseRatingScore(data, null);
		expect(data.rating).toBe('N/A');
		expect(data.parseError).toBe(false);
	});

	test('flags a parse error when a film has no score element', () => {
		helper.url = filmURL;
		const data = emptyScore();
		helper.parseRatingScore(data, null);
		expect(data.parseError).toBe(true);
	});
	
});

describe('parseRatingCounts', () => {
	const {helper} = createHelper();

	test('reads positive, mixed and negative counts, their total and the largest', () => {
		const data = emptyScore({rating: '85'});
		helper.parseRatingCounts(data, metacriticPage().querySelector('div[data-testid="critic-reviews"]'));
		expect(data).toMatchObject({positive: 40, mixed: 8, negative: 2, num_ratings: 50, highest: 40});
	});

	test('counts individual review cards when a "tbd" score has no breakdown', () => {
		const card = colour => `<div class="review-card"><div class="c-siteReviewScore_background"><div class="c-siteReviewScore_${colour}"></div></div></div>`;
		const section = parseHTML(`
			<div data-testid="critic-reviews"><div class="c-reviews-container">
				${card('green')}${card('green')}${card('yellow')}${card('red')}
			</div></div>`).querySelector('div[data-testid="critic-reviews"]');

		const data = emptyScore({rating: 'tbd'});
		helper.parseRatingCounts(data, section);
		expect(data).toMatchObject({positive: 2, mixed: 1, negative: 1, num_ratings: 4, highest: 2});
	});

	test('leaves the score untouched when the reviews section is missing', () => {
		const data = emptyScore({rating: '85'});
		helper.parseRatingCounts(data, null);
		expect(data).toEqual(emptyScore({rating: '85'}));
	});
});

describe('score colours', () => {
	const {helper} = createHelper();

	test.each([
		['61', false, '#00ce7a', '#262626'],
		['60', false, '#ffbd3f', '#262626'],
		['40', false, '#ffbd3f', '#262626'],
		['39', false, '#ff6874', '#fff'],
		['6.1', true, '#00ce7a', '#262626'], // User scores are out of 10
		['3.9', true, '#ff6874', '#fff'],
		['tbd', false, 'transparent', 'lightgray'],
		['N/A', true, 'transparent', 'lightgray'],
	])('score %s (user: %s) has background %s and text %s', (score, isUser, background, text) => {
		expect(helper._determineMetaColour(score, isUser)).toBe(background);
		expect(helper._determineMetaTextColour(score, isUser)).toBe(text);
	});
});

describe('createMetaScore', () => {
	const criticURL = filmURL + 'critic-reviews';

	function scoreElement(span, type = 'critic') {
		return span.querySelector(type === 'user' ? '.meta-score-user' : '.meta-score');
	}

	test('shows the score, links to the reviews and describes them in the tooltip', () => {
		const {helper} = createHelper();
		const span = helper.createMetaScore('critic', 'Critic', criticURL, emptyScore({rating: '84', num_ratings: 50}), false, false, false);
		const score = scoreElement(span);
		expect(score.innerText).toBe('84');
		expect(score.getAttribute('href')).toBe(criticURL);
		expect(score.getAttribute('data-original-title')).toBe('Weighted average of 84/100 based on 50 Critic reviews');
		expect(score.classList.contains('tooltip-extra')).toBe(true);
	});

	test.each([
		['5', 'critic', '84', 'Weighted average of 4.2/5'],
		['10', 'critic', '84', 'Weighted average of 8.4/10'],
		['5', 'user', '8.0', 'Weighted average of 4.0/5'],
		[undefined, 'user', '8.0', 'Weighted average of 8.0/10'],
	])('with convert-ratings %s, a %s score of %s reads "%s…"', (convert, type, rating, expected) => {
		const {helper} = createHelper({options: {'convert-ratings': convert}});
		const display = type === 'user' ? 'User' : 'Critic';
		const span = helper.createMetaScore(type, display, criticURL, emptyScore({rating, num_ratings: 10}), false, false, false);
		expect(scoreElement(span, type).getAttribute('data-original-title')).toMatch(new RegExp('^' + expected));
	});

	test('says "No score yet" for a tbd score that has reviews, with the right plural', () => {
		const {helper} = createHelper();
		const one = helper.createMetaScore('critic', 'Critic', criticURL, emptyScore({rating: 'tbd', num_ratings: 1}), false, false, false);
		const three = helper.createMetaScore('critic', 'Critic', criticURL, emptyScore({rating: 'tbd', num_ratings: 3}), false, false, false);
		expect(scoreElement(one).getAttribute('data-original-title')).toBe('No score yet (1 Critic review)');
		expect(scoreElement(three).getAttribute('data-original-title')).toBe('No score yet (3 Critic reviews)');
	});

	test('has no link and no tooltip when there are no reviews and no URL', () => {
		const {helper} = createHelper();
		const span = helper.createMetaScore('critic', 'Critic', '', emptyScore(), false, false, false);
		const score = scoreElement(span);
		expect(score.hasAttribute('href')).toBe(false);
		expect(score.classList.contains('tooltip-extra')).toBe(false);
	});

	test('adds a hidden positive/mixed/negative chart', () => {
		const {helper} = createHelper();
		const span = helper.createMetaScore('critic', 'Critic', criticURL, emptyScore({rating: '84', num_ratings: 50, positive: 40, mixed: 8, negative: 2, highest: 40}), false, false, false);
		const chart = span.querySelector('.meta-score-details.score-critic');
		expect(chart.style.display).toBe('none');
		expect([...chart.querySelectorAll('.meta-bar-value')].map(value => value.innerText)).toEqual(['40', '8', '2']);
		expect(chart.querySelector('.meta-bar.fill').style.width).toBe('100%');
	});

	test('writes the tooltip out as text when asked, hidden behind SHOW DETAILS on mobile', () => {
		const {helper} = createHelper();
		const desktop = helper.createMetaScore('critic', 'Critic', criticURL, emptyScore({rating: '84', num_ratings: 50}), false, false, true);
		const mobile = helper.createMetaScore('critic', 'Critic', criticURL, emptyScore({rating: '84', num_ratings: 50}), false, true, true);

		expect(desktop.querySelector('.meta-details-critic.mobile-details-text').innerText).toBe('Weighted average of 84/100 based on 50 Critic reviews');
		expect(mobile.querySelector('.meta-details-critic').classList.contains('meta-score-details')).toBe(true);
		expect(mobile.querySelector('.meta-details-critic').style.display).toBe('none');
	});
});

describe('_collectScores', () => {
	test('reads both scores, their counts and the Must-See badge from the page', () => {
		const {helper} = createHelper();
		helper.url = filmURL;
		helper.data = metacriticPage({mustSee: true});

		helper._collectScores();

		expect(helper.critic).toMatchObject({rating: '85', num_ratings: 50, highest: 40});
		expect(helper.user).toMatchObject({rating: '7.9', num_ratings: 40, highest: 30});
		expect(helper.mustSee).toBe(true);
	});

	test('logs an error for each score when the page has no score area', () => {
		const {helper, helpers} = createHelper();
		helper.url = filmURL;
		helper.data = metacriticPage({heroScores: false});

		helper._collectScores();

		expect(helper.critic.parseError).toBe(true);
		expect(helper.user.parseError).toBe(true);
		expect(helpers.WriteConsoleLog).toHaveBeenCalledWith('ERROR', 'Metacritic: there was an error parsing the critic ratings.');
		expect(helpers.WriteConsoleLog).toHaveBeenCalledWith('ERROR', 'Metacritic: there was an error parsing the user ratings.');
	});
});

describe('populateRatingsSidebar', () => {
	beforeEach(() => {
		document.body.innerHTML = '<aside class="sidebar"></aside>';
	});

	function section() {
		return document.querySelector('.sidebar .meta-ratings');
	}

	function loadedHelper(options = {}, pageState = {}, page = {}) {
		const created = createHelper({options, pageState});
		created.helper.url = filmURL;
		created.helper.data = metacriticPage(page);
		return created;
	}

	test('adds a section with the Metascore and the user score, linking to their reviews', () => {
		const {helper, helpers} = loadedHelper();

		helper.populateRatingsSidebar();

		expect(section()).not.toBeNull();
		expect(section().querySelector('.meta-score').innerText).toBe('85');
		expect(section().querySelector('.meta-score').getAttribute('href')).toBe(filmURL + 'critic-reviews');
		expect(section().querySelector('.meta-score-user').innerText).toBe('7.9');
		expect(section().querySelector('.meta-score-user').getAttribute('href')).toBe(filmURL + 'user-reviews');
		expect(section().querySelector('a.logo-meta-link').getAttribute('href')).toBe(filmURL);
		expect(section().querySelector('.meta-show-details')).not.toBeNull();
		expect(helpers.addTooltipEvents).toHaveBeenCalledWith(section());
		expect(helper.ratingsAdded).toBe(true);
	});

	test('places the section according to the ratings order', () => {
		document.querySelector('.sidebar').innerHTML = '<section class="imdb-ratings"></section><section class="mubi-ratings"></section>';
		const {helper} = loadedHelper();

		helper.populateRatingsSidebar();

		const order = [...document.querySelector('.sidebar').children].map(element => element.classList[element.classList.length - 1]);
		expect(order).toEqual(['imdb-ratings', 'ratings-extras', 'mubi-ratings']);
		expect(document.querySelector('.sidebar').children[1]).toBe(section());
	});

	test('does nothing if the section is already on the page', () => {
		document.querySelector('.sidebar').innerHTML = '<section class="meta-ratings"></section>';
		const {helper} = loadedHelper();

		helper.populateRatingsSidebar();

		expect(document.querySelectorAll('.meta-ratings')).toHaveLength(1);
		expect(helper.ratingsAdded).toBe(false);
	});

	test('does nothing on a page without a sidebar', () => {
		document.body.innerHTML = '';
		const {helper} = loadedHelper();

		helper.populateRatingsSidebar();

		expect(document.querySelector('.meta-ratings')).toBeNull();
		expect(helper.ratingsAdded).toBe(false);
	});

	test('adds nothing when Metacritic has no reviews yet', () => {
		const {helper} = loadedHelper({}, {}, {critic: null, user: null});

		helper.populateRatingsSidebar();

		expect(section()).toBeNull();
		expect(helper.ratingsAdded).toBe(false);
	});

	test('leaves out the user score when the user turned it off', () => {
		const {helper} = loadedHelper({'metacritic-users-enabled': false});

		helper.populateRatingsSidebar();

		expect(section().querySelector('.meta-score')).not.toBeNull();
		expect(section().querySelector('.meta-score-user')).toBeNull();
	});

	test('adds nothing, and stops trying, when both scores are turned off', () => {
		const {helper} = loadedHelper({'metacritic-critic-enabled': false, 'metacritic-users-enabled': false});

		helper.populateRatingsSidebar();

		expect(section()).toBeNull();
		expect(helper.ratingsAdded).toBe(true);
	});

	test.each([
		[false, 'Metacritic Must-See'],
		[true, 'Metacritic Must-Watch'],
	])('labels the badge for a Must-See film (isTV: %s) as "%s"', (isTV, title) => {
		const {helper} = loadedHelper({}, {}, {mustSee: true});

		helper.populateRatingsSidebar({isTV});

		const badge = section().querySelector('.meta-must-see');
		expect(badge.getAttribute('data-original-title')).toBe(title);
		expect(badge.classList.contains('meta-must-watch')).toBe(isTV);
	});

	test('shows no badge when the user turned the badge off', () => {
		const {helper} = loadedHelper({'metacritic-mustsee-enabled': false}, {}, {mustSee: true});

		helper.populateRatingsSidebar();

		expect(section().querySelector('.meta-must-see')).toBeNull();
	});

	test('opens the details when that is the user\'s default view', () => {
		const {helper, helpers} = loadedHelper({'meta-default-view': 'show'});

		helper.populateRatingsSidebar();

		expect(helpers.toggleDetails).toHaveBeenCalledTimes(1);
	});

	test('moves the written-out tooltips below both scores on desktop', () => {
		const {helper} = loadedHelper({'tooltip-show-details': true});

		helper.populateRatingsSidebar();

		const lastTwo = [...section().children].slice(-2).map(element => element.className);
		expect(lastTwo).toEqual(['meta-details-critic mobile-details-text', 'meta-details-user mobile-details-text']);
	});

});
