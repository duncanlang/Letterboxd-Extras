import { LOAD_STATES } from '../constants';
import { DOUBAN_LOGO_SVG } from '../SVG';
import { Helper } from './Helper';

export class DoubanHelper extends Helper {

	constructor(storage, helpers) {

		super(storage, helpers, 'douban');

		this.id = null;

	}

	_loadData(id) {

		console.log(id);

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

		this._apiRequestCallback('Douban', url, options, response => {

			this.data = response;
			console.log(this.data);

			if (!this.data.rating) {
				this.loadState = LOAD_STATES['Failure'];
				return;
			}

			this.loadState = LOAD_STATES['Success'];

			if (this.data.alt) {
				this.linkURL = `${this.data.alt.replace('/movie/', '/subject/')}/`;
			}

			this.addButtonLink(this.linkURL, 'DOUBAN');
			this.populateRatingsSidebar();

		});

	}

	populateRatingsSidebar() {

		if (!this._canPopulateRatingsSidebar()) {
			return;
		}

		console.log('populating ratings sidebar');

		if (this.data.rating.average !== null) {
			this.rating = this.data.rating.average;
		}
		if (this.data.rating.numRaters !== null) {
			this.num_ratings = this.data.ratings_count;
		}

		if (this.rating === null && this.num_ratings === 0) return;


		const section = this._createChartSection(
			{
				innerHTML: DOUBAN_LOGO_SVG,
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

	_getHeaders(apiKey) {

		return {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=utf8'
			},
			body: `apikey=${apiKey}`
		};
	}

}
