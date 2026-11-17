/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

const API_URL = 'https://api.graphql.imdb.com/';

/** The parts of IMDb's GraphQL `title` this helper and Cast Extras read. */
interface IMDBTitle {
	ratingsSummary?: {
		/** Out of 10. */
		aggregateRating: number | null
		voteCount: number | null
		/** Set when the title is in the IMDb Top 250. */
		topRanking: { rank: number } | null
	} | null
	aggregateRatingsBreakdown?: {
		histogram?: {
			/** One per star, 1 to 10. */
			histogramValues: { rating: number, voteCount: number }[] | null
		} | null
	} | null
	/** Only requested when Cast Extras is on. */
	credits?: unknown
}

/** `data` of the GraphQL response. */
export interface IMDBData {
	title?: IMDBTitle | null
}

export interface IMDBRequest {
	/** e.g. 'tt0468569' */
	id: string
	/** The film's IMDb ratings page, from Letterboxd's IMDb button. */
	url: string
	/** Called with the helper once the data has loaded and the score has been added. */
	onLoad?: (helper: IMDBHelper) => void
}

/** IMDb's ten star buckets, 1 to 10. */
const HISTOGRAM_BUCKETS = 10;

/**
 * Adds a film's IMDb score and rating histogram to the ratings sidebar. The same response also feeds
 * the IMDb Top 250 ranking and Cast Extras, which the overview page passes it on to through onLoad.
 */
export class IMDBHelper extends Helper {

	declare data: IMDBData | null;

	votes: number[] = new Array(HISTOGRAM_BUCKETS);
	/** Each bucket's share of num_ratings, as a fixed-point string such as '12.5'. */
	percents: string[] = new Array(HISTOGRAM_BUCKETS);
	highest = 0;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'imdb');

	}

	_loadData({ id, url, onLoad }: IMDBRequest) {

		this.linkURL = url;

		this._apiRequestCallback('IMDb Ratings', API_URL, 'JSON', this._getQuery(id), value => {

			const data: IMDBData | null = value.response.data ?? null;
			if (data === null) {
				this.loadState = LOAD_STATES['Failure'];
				return;
			}

			this.data = data;
			this.loadState = LOAD_STATES['Success'];

			if (this.storage.get('imdb-enabled') === true) {
				this.populateRatingsSidebar();
			}

			onLoad?.(this);

		});

	}

	/** The film's place in the IMDb Top 250, 0 when it isn't in it, or null before the data loads. */
	getTopRanking(): number | null {

		const ratingsSummary = this.data?.title?.ratingsSummary ?? null;
		if (ratingsSummary === null) {
			return null;
		}
		return ratingsSummary.topRanking?.rank ?? 0;

	}

	populateRatingsSidebar() {

		const { data } = this;
		if (data === null || !this._canPopulateRatingsSidebar()) {
			return;
		}

		const ratingsSummary = data.title?.ratingsSummary ?? null;
		if (ratingsSummary !== null) {
			this.rating = ratingsSummary.aggregateRating ?? 0;
			this.num_ratings = ratingsSummary.voteCount ?? 0;
		}

		const histogramValues = data.title?.aggregateRatingsBreakdown?.histogram?.histogramValues ?? [];
		for (const { rating, voteCount } of histogramValues) {
			const index = rating - 1;
			this.votes[index] = voteCount;
			this.percents[index] = ((voteCount / this.num_ratings) * 100).toFixed(1);

			if (voteCount > this.highest) {
				this.highest = voteCount;
			}
		}

		if (!this.rating || this.num_ratings === 0 || histogramValues.length === 0) {
			return;
		}

		const logoSvg: HTMLElement = this.helpers.createElement('span', {
			style: `height: 16px; width: 32px; position: absolute; background-image: url("${browser.runtime.getURL('images/imdb-logo.svg')}");`
		});

		const section: HTMLElement = this._createChartSection(
			{
				href: this.linkURL,
				style: 'position: absolute;',
				svg: logoSvg
			},
			'margin-bottom: 15px !important;'
		);

		section.append(this.helpers.createHistogram(
			this.storage,
			'imdb',
			this.linkURL,
			this.rating,
			this.num_ratings,
			this.votes,
			this.percents,
			this.highest
		));

		// Add the tooltip as text for mobile
		const score = section.querySelector('.averagerating.tooltip');
		if (score !== null) {
			const tooltip = score.getAttribute('data-original-title');
			this.helpers.createDetailsText('imdb', section, tooltip, this.pageState.isMobile);
		}

		this.appendSidebarRating(section);
		this.helpers.addTooltipEvents(section);
		this.ratingsAdded = true;

	}

	/** Request options for IMDb's GraphQL API. Cast photos and character names are only fetched for Cast Extras. */
	_getQuery(id: string) {

		let credits = '';
		if (this.storage.get('cast-extras-enabled') === true) {
			credits = `
						credits(first: 50) {
							edges {
								node {
									... on Cast {
										characters {
											name
										}
										name {
											nameText {
												text
											}
										}
									}
								}
							}
						}`;
		}

		const query = `
				query GetRatings {
					title(id: "${id}") {
						ratingsSummary {
							aggregateRating
							voteCount
							topRanking {
								rank
							}
						}
						aggregateRatingsBreakdown {
							histogram {
								histogramValues {
									rating
									voteCount
								}
							}
						}
						${credits}
					}
				}
			`;

		return {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-imdb-client-name': 'imdb-web-next'
			},
			body: JSON.stringify({
				query,
				variables: {}
			})
		};

	}

}
