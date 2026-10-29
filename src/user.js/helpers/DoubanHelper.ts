/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

/** The parts of Douban's /v2/movie/subject/{id} response this helper reads. */
interface DoubanSubject {
	rating?: {
		/** Out of 10; 0 when the film has no rating yet. */
		average: number | null
	}
	ratings_count?: number | null
	/** The film's page, e.g. 'https://movie.douban.com/movie/1292052' */
	alt?: string
}

export class DoubanHelper extends Helper {

	declare data: DoubanSubject | null;

	/** The film's Douban subject ID. */
	id: string | null;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'douban');

		this.id = null;

	}

	_loadData(id: string) {

		this.id = id;
		this.linkURL = `https://movie.douban.com/subject/${id}/`;

		const apiKey = this.storage.get('douban-apikey');
		if (!apiKey) {
			this.addButtonLink(this.linkURL, 'DOUBAN');
			this.loadState = LOAD_STATES['Failure'];
			return;
		}

		const url = `https://api.douban.com/v2/movie/subject/${id}`;
		const options = this._getHeaders(apiKey);

		this._apiRequestCallback('Douban', url, 'JSON', options, value => {

			const data: DoubanSubject = value.response;
			this.data = data;

			if (!data.rating) {
				this.loadState = LOAD_STATES['Failure'];
				return;
			}

			this.loadState = LOAD_STATES['Success'];

			if (data.alt) {
				this.linkURL = `${data.alt.replace('/movie/', '/subject/')}/`;
			}

			this.addButtonLink(this.linkURL, 'DOUBAN');
			this.populateRatingsSidebar();

		});

	}

	populateRatingsSidebar() {

		const { data } = this;
		if (data === null || !this._canPopulateRatingsSidebar()) {
			return;
		}

		if (data.rating?.average != null && data.rating.average > 0) {
			this.rating = data.rating.average;
		}
		if (data.ratings_count != null) {
			this.num_ratings = data.ratings_count;
		}

		if (this.rating == null && this.num_ratings === 0) return;


		const logoSvg = this.helpers.createElement('span', {}, {
			height: '16.7667px',
			width: '65px',
			display: 'inline-block',
			'margin-right': '5px',
			'margin-bottom': '2px',
			'background-image': 'url("' + browser.runtime.getURL("images/douban-logo.svg") + '")'
		});
		const section = this._createChartSection(
			{
				svg: logoSvg,
				href: this.linkURL
			}
		);

		const logoHolder = section.querySelector('.logo-douban');
		const logoText = this.helpers.createElement('span', {
			class: 'text-douban'
		});
		logoText.innerText = '(豆瓣电影)';
		logoHolder.append(logoText);


		const container = this.helpers.createElement('span', {}, {
			'display': 'block',
			'margin-bottom': '10px'
		});
		section.append(container);

		container.append(this._generateScoreSpan({ href: this.linkURL }));

		this._createRatingDetailsText(section, this.tooltip);
		this.appendSidebarRating(section);
		this.helpers.addTooltipEvents(section);

	}

	_getHeaders(apiKey: string) {

		return {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=utf8'
			},
			body: `apikey=${apiKey}`
		};
	}

}
