import { LOAD_STATES } from '../constants';
import { CRITERION_LOGO_SVG } from '../SVG';
import { Helper } from './Helper';

export class CriterionHelper extends Helper {

	constructor(storage, helpers, pageState) {

		super(storage, helpers, pageState, 'criterion');

		this.spineID = null;
		this.spineAdded = false;
		this._stylesInjected = false;

	}

	_loadData({ websiteID, spineID }) {

		this.linkURL = `https://www.criterion.com/films/${websiteID}`;
		this.loadState = LOAD_STATES['Success'];

		if (this.storage.get('criterion-link-enabled') === true){
			this.addButtonLink(this.linkURL, 'CRITERION');
		}

		/* this._createWatchLink({
			sourceID: 'criterion',
			title: 'Criterion',
			link: this.linkURL
		}); */


		const logoSvg = this.helpers.createElement('span', {}, {
			height: '24px',
			width: '24px',
			'background-image': 'url("' + browser.runtime.getURL("images/criterion-logo.svg") + '")',
			'display': 'block',
			'background-size': 'contain'
		});
		this._addSpineIndicator({
			logoSVG: logoSvg,
			title: 'Criterion Collection',
			spineID: spineID ? spineID : null
		});

	}
}
