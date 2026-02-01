import { LOAD_STATES } from '../constants';

const buttonLinkOrder = [
	'.tomato-button',
	'.meta-button',
	'.sens-button',
	'.mubi-button',
	'.filmaff-button',
	'.simkl-button',
	'.kinopoisk-button',
	'.allo-button',
	'.mal-button',
	'.anilist-button',
	'.anidb-button',
	'.filmarks-button',
	'.mojo-button',
	'.wiki-button',
	'.ddd-button'
];

export class Helper {

	constructor(storage, helpers) {

		this.storage = storage;
		this.helpers = helpers;

		this.loadState = LOAD_STATES['Uninitialized'];
		this.data = null;
		this.linkAdded = false;

	}

	// TODO: Could possibly be placed in letterboxd.helpers
	// since it doesn't really have to do with fetching data from
	// an arbitrary API.
	appendSidebarRating(rating, className) {
		const order = [
			'.imdb-ratings',
			'.mal-ratings',
			'.anilist-ratings',
			'.allocine-ratings',
			'.tomato-ratings',
			'.meta-ratings',
			'.sens-ratings',
			'.mubi-ratings',
			'.filmaff-ratings',
			'.simkl-ratings',
			'.kinopoisk-ratings',
			'.anidb-ratings',
			'.filmarks-ratings',
			'.cinemascore'
		];

		const index = order.indexOf(`.${className}`);
		let sidebar = document.querySelector('.sidebar');

		if (this.storage.get('hide-ratings-enabled') === true) {
			const currentSidebar = sidebar;
			sidebar = document.querySelector('.extras-ratings-holder');

			if (sidebar === null) {
				sidebar = this.helpers.createElement('div', {
					class: 'extras-ratings-holder',
					style: 'display: none'
				});
				currentSidebar.append(sidebar);

				const moreButton = this.helpers.createElement('a', {
					class: 'text-slug extras-show-more'
				});
				moreButton.innerText = 'Show more ratings';
				currentSidebar.append(moreButton);

				moreButton.addEventListener('click', event => {
					toggleAllRatings(event);
				});
			}
		}

		// First
		for (let i = index + 1; i < order.length; i++) {
			const temp = sidebar.querySelector(order[i]);
			if (temp !== null) {
				temp.before(rating);
				return;
			}
		}

		// Second
		for (let i = index - 1; i >= 0; i--) {
			const temp = sidebar.querySelector(order[i]);
			if (temp !== null) {
				temp.after(rating);
				return;
			}
		}

		// Third
		sidebar.append(rating);

	}

	addLink(url, text, className) {

		if (url === null || url === '') {
			return;
		}

		// Check if already added
		if (!this.linkAdded) {

			this.linkAdded = true;

			if (document.querySelector(`.${className}`)) {
				return;
			}

			// Create Button Element
			const button = this.helpers.createElement('a', {
				class: `micro-button track-event ${className}`,
				href: url
			});
			button.innerText = text;

			if (this.storage.get('open-same-tab') !== true) {
				button.setAttribute('target', '_blank');
			}

			const index = buttonLinkOrder.indexOf(`.${className}`);
			// First Attempt
			for (let i = index + 1; i < buttonLinkOrder.length; i++) {
				const temp = document.querySelector(buttonLinkOrder[i]);
				if (temp !== null) {
					temp.before(button);
					return;
				}
			}

			// Second Attempt
			for (let i = index - 1; i >= 0; i--) {
				const temp = document.querySelector(buttonLinkOrder[i]);
				if (temp !== null) {
					temp.after(button);
					return;
				}
			}

			// Third Attempt
			const buttons = document.querySelectorAll('.micro-button');
			const lastButton = buttons[buttons.length - 1];
			lastButton.after(button);
		}

	}

	_canPopulateSidebar() {

		return document.querySelector('.sidebar') !== null && this.data !== null;

	}

	_canLoadData() {

		// No data present and have not started to load already
		return this.data === null && this.loadState === LOAD_STATES['Uninitialized'];

	}

}
