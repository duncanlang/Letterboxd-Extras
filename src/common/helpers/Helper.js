import { LOAD_STATES } from '../constants';

export class Helper {

	constructor(helpers) {

		this.loadState = 0;
		this.data = null;
		this.helpers = helpers;

	}

	_canPopulateSidebar() {

		return document.querySelector('.sidebar') !== null && this.data !== null;

	}

	_canLoadData() {

		// No data present and have not started to load already
		return this.data === null && this.loadState === LOAD_STATES['Uninitialized'];

	}

}
