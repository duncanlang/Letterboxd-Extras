import { LOAD_STATES } from '../constants';
import { CRITERION_LOGO_SVG } from '../SVG';
import { Helper } from './Helper';

export class CriterionHelper extends Helper {

	constructor(storage, helpers) {

		super(storage, helpers, 'criterion');
		this.spineID = null;
		this.spineAdded = false;
		this._stylesInjected = false;

	}

	_loadData({ websiteID, spineID }) {

		this.linkURL = `https://www.criterion.com/films/${websiteID}`;
		this.loadState = LOAD_STATES['Success'];

		this.addButtonLink(this.linkURL, 'CRITERION');
		this._createWatchLink({
			sourceID: 'criterion',
			title: 'Criterion',
			link: this.linkURL
		});

		if (this.spineID !== null || this.spineID !== undefined) {
			this._addSpineIndicator({
				logoSVG: CRITERION_LOGO_SVG,
				title: 'Criterion Collection',
				spineID: spineID
			});
		}
	}
}
