/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

export class CriterionHelper extends Helper {

	spineID: string | null;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'criterion');

		this.spineID = null;
		this.spineAdded = false;

	}

	_loadData({ websiteID, spineID }: { websiteID: string, spineID?: string }) {

		this.linkURL = `https://www.criterion.com/films/${websiteID}`;
		this.loadState = LOAD_STATES['Success'];

		if (this.storage.get('criterion-link-enabled') === true){
			this.addButtonLink(this.linkURL, 'CRITERION');
		}
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
