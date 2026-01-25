import { LOAD_STATES } from "./constants";

export class LetterboxdPerson {

	constructor(storage, helpers) {

		this.extensionStorage = storage;
		this.extensionHelpers = helpers;

		this.running = false;
		this.isMobile = null;
		this.tmdbID = null;
		this.wiki = null;
		this.letterboxdName = null;

		this.lostFilms = {
			loadState: LOAD_STATES['Uninitialized'],
			filterAdded: false,
			enabled: false,
			lostFilmCount: 0,
			visibleCount: 0,
			watchedCount: 0,
			totalCount: 0,
			watchedUpdated: false
		};

	}

	stopRunning() {

		this.running = false;

	}

	async init() {

		this.running = true;

		// Get the person's name from the page
		if (this.letterboxdName === null && document.querySelector('h1.title-1') !== null) {

			this.getName();

		}

		// Get the TMDB id and call wikidata
		if (this.letterboxdName !== null && this.tmdbID === null && document.querySelector('.bio') !== null) {

			// Loop and find TMDB
			const body = document.querySelector('body');
			if (body.hasAttribute('data-tmdb-id')) {

				this.tmdbID = body.getAttribute('data-tmdb-id');

			}

			this.callWikiData();

		}

		// Add the filter
		if (this.lostFilms.filterAdded === false && document.querySelector('.js-film-filters') !== null && this.extensionStorage.localInitilized == true) {

			this.lostFilms.filterAdded = true;
			this.addLostFilmFilter();

		}

		// Call WikiData for lost films
		if (document.querySelector('.poster-grid') !== null && this.extensionStorage.localInitilized == true) {

			if (this.lostFilms.loadState === LOAD_STATES["Uninitialized"]) {

				this.callWikiDataLostFilms();

			}

			if (this.lostFilms.loadState === LOAD_STATES["Success"]) {

				// Collect films from the page and hide if set
				this.updateLostFilms();

			}

			if (this.lostFilms.loadState === LOAD_STATES["Failure"] && document.querySelector('.sidebar .actions .progress-panel .progress-status .progress-counter') !== null) {

				if (document.querySelector('div.poster-grid ul li div.film-poster[data-watched]') !== null && this.lostFilms.visibleCount == document.querySelectorAll('div.poster-grid ul li div.film-poster[data-watched]').length) {

					// The posters (and the watched status) sometimes load later, lets run it again once all posters have properly loaded as well as the progress panel
					this.updateLostFilms();
					this.lostFilms.loadState = LOAD_STATES['Reload'];

				}

			}

		}

		// Stop
		return this.stopRunning();

	}


	getName() {

		const nameElement = document.querySelector('h1.title-1');
		let name = nameElement.innerText;
		if (name.includes('\n')) {

			const startIndex = name.indexOf('\n') + 1;
			name = name.substring(startIndex);

		}

		// Determine mobile
		if (this.isMobile == null) {

			if (document.querySelector('html')) {

				const htmlEl = document.querySelector('html');
				if (htmlEl.getAttribute('class').includes('no-mobile')) {

					this.isMobile = false;

				} else {

					this.isMobile = true;

				}

			}

		}

		this.letterboxdName = name;

	}

	callWikiData() {

		// Get the Query String
		let lang = null;
		try {

			lang = window.navigator.language.substring(0, 2);

		} catch (e) { }

		const queryString = this.extensionHelpers.getWikiDataQuery('', this.tmdbID, '', false, 'PERSON', lang);
		// Call WikiData
		browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: queryString }, data => {

			if (this.extensionHelpers.ValidateResponse('WikiData', data) == false) {

				return;

			}

			const value = data.response;
			if (value !== null && value.results !== null && value.results.bindings !== null && value.results.bindings.length > 0) {

				this.wiki = value.results.bindings[0];
				this.addWikiData();
				this.addIMDbButton();
				if (this.extensionStorage.get('wiki-link-enabled') === true) {

					this.addWikiButton();

				}

			}

		});

	}

	addLostFilmFilter() {

		// Check if already added?
		if (document.querySelector('.extras-lost-filter') !== null) {

			return;

		}

		// Set selected
		let className = '';
		if (this.extensionStorage.localGet('hide-lost-films') === 'hide') {

			className = ' smenu-subselected';
			this.lostFilms.enabled = true;

		}

		// Create filter element
		const li = this.extensionHelpers.createElement('li', {
			class: `extras-lost-filter divider-line -inset${className}`
		});
		const a = this.extensionHelpers.createElement('span', {
			class: 'item'
		});
		li.append(a);
		a.innerText = 'Hide lost films';
		const i = this.extensionHelpers.createElement('i', {
			class: 'ir s icon'
		});
		a.prepend(i);

		// Add to page
		const unreleasedFilter = document.querySelector('.js-film-filters ul');
		unreleasedFilter.append(li);

		// Add click event
		li.addEventListener('click', event => {

			this.toggleLostFilms(event);

		});

	}

	_calculateAge(start, end) {

		const ageDifMs = end - start;
		const ageDate = new Date(ageDifMs);
		return Math.abs(ageDate.getUTCFullYear() - 1970);

	}

	addWikiData() {

		if (document.querySelector('.extras-table')) return;

		// Collect basic info
		//* ****************************************
		const isAlive = this.wiki.Date_Of_Death == null || this.wiki.Date_Of_Death.value == null;

		// const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
		// const options2 = { year: 'numeric', timeZone: 'UTC' };

		// Birth name and date
		let name = null;
		let birth = null;
		let birthPlace = null;
		if (this.wiki.BirthName && this.wiki.BirthName.value !== null) {

			if (this.wiki.BirthName.value != this.wiki.itemLabel.value && this.wiki.BirthName.value != this.letterboxdName) {

				name = this.wiki.BirthName.value;

			}

		}

		if (this.wiki.Date_Of_Birth && this.wiki.Date_Of_Birth.value !== null) { // && this.wiki.Date_Of_Birth_Precision.value >= 9) {

			birth = new Date(this.wiki.Date_Of_Birth.value).toLocaleDateString('en-UK');
			if (isAlive == true) {

				const age = this.extensionHelpers.calculateAge(new Date(this.wiki.Date_Of_Birth.value), new Date());
				birth += ` (age ${age})`;

			}

			if (this.wiki.BirthCityLabel && this.wiki.BirthCityLabel.value !== null) {

				birthPlace = this.wiki.BirthCityLabel.value;
				if (this.wiki.BirthCountry && this.wiki.BirthCountry.value !== null) {

					birthPlace += `, ${this.wiki.BirthCountry.value}`;

				}

			}

		}

		// Death date
		let death = null;
		let deathPlace = null;
		if (this.wiki.Date_Of_Death && this.wiki.Date_Of_Death.value !== null) { // && this.wiki.Date_Of_Death_Precision.value >= 9) {

			death = new Date(this.wiki.Date_Of_Death.value).toLocaleDateString('en-UK');

			const age = this.extensionHelpers.calculateAge(new Date(this.wiki.Date_Of_Birth.value), new Date(this.wiki.Date_Of_Death.value));
			death += ` (aged ${age})`;

			if (this.wiki.DeathCityLabel && this.wiki.DeathCityLabel.value !== null) {

				deathPlace = this.wiki.DeathCityLabel.value;
				if (this.wiki.DeathCountry && this.wiki.DeathCountry.value !== null) {

					deathPlace += `, ${this.wiki.DeathCountry.value}`;

				}

			}

		}

		let yearsActive = null;

		// Years Active
		if (this.wiki.Years_Start && this.wiki.Years_Start.value !== null) {

			yearsActive = new Date(this.wiki.Years_Start.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(9));
			if (this.wiki.Years_End && this.wiki.Years_End.value !== null) {

				yearsActive += `–${new Date(this.wiki.Years_End.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(9))}`;

			} else if (this.wiki.Date_Of_Death && this.wiki.Date_Of_Death.value !== null && this.wiki.Date_Of_Death_Precision.value >= 9) {

				yearsActive += `–${new Date(this.wiki.Date_Of_Death.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(9))}`;

			} else {

				yearsActive += '–present';

			}

		}

		// Create Table
		//* ****************************************
		const table = document.createElement('table');
		if (this.isMobile) {

			table.setAttribute('class', 'extras-table mobile');

		} else {

			table.setAttribute('class', 'extras-table');

		}

		let empty = true;

		if (birth !== null) {

			if (name !== null) {

				this.extensionHelpers.createTableRow(table, 'Born', name, birth, birthPlace);

			} else {

				this.extensionHelpers.createTableRow(table, 'Born', birth, birthPlace);

			}

			empty = false;

		}

		if (death !== null) {

			if (deathPlace !== null) {

				this.extensionHelpers.createTableRow(table, 'Died', death, deathPlace);

			} else {

				this.extensionHelpers.createTableRow(table, 'Died', death, null);

			}

			empty = false;

		}

		if (yearsActive !== null) {

			this.extensionHelpers.createTableRow(table, 'Years active', yearsActive);
			empty = false;

		}

		// Add to page
		//* ****************************************
		if (empty == false) {

			if (this.isMobile) {

				if (document.querySelector('.progress-panel') !== null) {

					document.querySelector('.progress-panel').before(table);

				}

			} else if (document.querySelector('.bio') !== null) {

				document.querySelector('.bio').before(table);

			} else if (document.querySelector('.avatar.person-image') !== null) {

				document.querySelector('.avatar.person-image').after(table);

			}

		}

	}

	addWikiButton() {

		let url = '';

		if (document.querySelector('.wiki-button')) return;

		if (this.wiki.Wikipedia && this.wiki.Wikipedia.value !== null) {

			url = this.wiki.Wikipedia.value;

		} else if (this.wiki.WikipediaEN !== null && this.wiki.WikipediaEN.value !== null) {

			url = this.wiki.WikipediaEN.value;

		} else {

			return;

		}

		// Create Button Element
		const button = this.extensionHelpers.createElement('a', {
			class: 'micro-button wiki-button',
			href: url
		});
		button.innerText = 'WIKI';

		// Add to Page
		document.querySelector('.micro-button:NOT(.imdb-button)').after(button);

	}

	addIMDbButton() {

		if (document.querySelector('.imdb-button')) return;

		if (this.wiki.IMDb_ID && this.wiki.IMDb_ID.value !== null) {

			var url = this.wiki.IMDb_ID.value;

		} else {

			return;

		}

		url = `https://www.imdb.com/name/${url}`;

		// Create Button Element
		const button = this.extensionHelpers.createElement('a', {
			class: 'micro-button imdb-button',
			href: url
		});
		button.innerText = 'IMDB';

		// Add to Page
		document.querySelector('.micro-button').before(button);

	}

	callWikiDataLostFilms() {

		this.lostFilms.loadState = LOAD_STATES['Loading'];
		const queryString = this.extensionHelpers.getWikiDataQuery('', '', '', this.tmdbTV, 'LOSTFILMS', 'en');

		// Check for cached list in the browser storage
		const timestamp = this.extensionStorage.localGet('lost-films-timestamp');
		this.lostFilms.list = this.extensionStorage.localGet('lost-films');

		const now = new Date();
		const maxTime = 7 * 60 * 60 * 24 * 1000; // one week
		if (timestamp == null || (now - timestamp) > maxTime || this.lostFilms.list == null) {

			// Get new list - Call WikiData
			browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: queryString }, data => {

				if (this.extensionHelpers.ValidateResponse('WikiData', data) == false) {

					return;

				}

				const value = data.response;
				if (value !== null && value.results !== null && value.results.bindings !== null && value.results.bindings.length > 0) {

					this.lostFilms.list = value.results.bindings.map(binding => binding.letterboxdID.value);
					this.lostFilms.loadState = LOAD_STATES['Success'];

					// Save list to browser storage
					this.extensionStorage.localSet('lost-films', this.lostFilms.list);
					this.extensionStorage.localSet('lost-films-timestamp', new Date());

				}

			});

		} else {

			// Use cached list in the browser storage
			this.lostFilms.list = this.extensionStorage.localGet('lost-films');
			this.lostFilms.loadState = LOAD_STATES['Success'];

		}

	}

	updateLostFilms() {

		this.lostFilms.loadState = LOAD_STATES['Failure'];
		this.lostFilms.lostFilmCount = 0;
		this.lostFilms.visibleCount = 0;
		this.lostFilms.watchedCount = 0;
		this.lostFilms.totalCount = 0;

		const hide = this.extensionStorage.localGet('hide-lost-films');
		this.lostFilms.enabled = hide == 'hide';

		// Check and set hidden
		const films = document.querySelectorAll('div.poster-grid ul li');
		for (let i = 0; i < films.length; i++) {

			const film = films[i];
			const filmID = film.querySelector('div').getAttribute('data-item-slug');
			let filmWatched = film.querySelector('div.film-poster').getAttribute('data-watched');
			if (filmWatched == null) {

				filmWatched = '';

			}

			if (this.lostFilms.list.includes(filmID) && hide == 'hide') {

				film.className += ' extras-lost-film';
				this.lostFilms.lostFilmCount++;

			} else {

				this.lostFilms.visibleCount++;
				if (filmWatched.toLowerCase() == 'true') {

					this.lostFilms.watchedCount++;

				}

				if (film.className.includes('extras-lost-film')) {

					film.className = film.className.replace(' extras-lost-film', '');

				}

			}

			this.lostFilms.totalCount++;

		}

		// Update progress panel
		if (document.querySelector('.sidebar .actions .progress-panel') !== null) {

			const progressCounter = document.querySelector('.sidebar .actions .progress-panel .progress-status .progress-counter');
			const progressCount = progressCounter.querySelector('.progress-count');
			const jsProgress = progressCount.querySelector('.js-progress-count');

			// Get the original total
			let originalTotal = '';
			const regex = new RegExp(/\/ (\d+)/);
			if (progressCounter.innerText.match(regex) !== null) {

				originalTotal = progressCounter.innerText.match(regex)[1];

			} else {

				originalTotal = this.lostFilms.totalCount;

			}

			// Update the watched count
			jsProgress.innerText = this.lostFilms.watchedCount;
			// Remove it from the span, then clear the span
			progressCount.remove(jsProgress);
			progressCount.innerText = '';
			// Re-add the progress to the span
			progressCount.innerText += ` of ${this.lostFilms.visibleCount}`;
			progressCount.prepend(jsProgress);
			// Add the count to the counter
			progressCounter.innerHTML = '';
			if (originalTotal != this.lostFilms.visibleCount) {

				progressCounter.append(` / ${originalTotal} total`);

			}

			progressCounter.prepend(progressCount);

			// Update the percentage
			const progressPercent = document.querySelector('.sidebar .actions .progress-panel .progress-status p .progress-percentage');
			const percentage = Math.floor(this.lostFilms.watchedCount / this.lostFilms.visibleCount * 100);
			progressPercent.innerText = percentage;

			// Update the progress bar
			const progressContainer = document.querySelector('.progress-container');
			const progressBar = progressContainer.querySelector('.progress-bar');
			progressBar.style.width = `${percentage}%`;

			if (percentage === 100) {

				progressContainer.className = 'progress-container near-end';

			} else {

				progressContainer.className = 'progress-container near-zero';

			}

		}


		// Update ui heading
		let prefix = 'There are ';
		let suffix = ' films ';
		if (this.lostFilms.visibleCount == 1) {

			prefix = 'There is ';
			suffix = ' film ';

		}

		suffix += this.extensionHelpers.getPersonRole(window.location.pathname.match(new RegExp(/\/([A-za-z\-]+)/))[1]);

		const uiHeader = document.querySelector('.ui-block-header');
		let extrasuiHeader = document.querySelector('.extras-filter-header');
		let extrasuiHeading = null;
		if (extrasuiHeader !== null) {

			extrasuiHeading = extrasuiHeader.querySelector('.ui-block-heading');

		}

		// Create custom heading if one does not already exist
		if (extrasuiHeader == null) {

			extrasuiHeader = this.extensionHelpers.createElement('section', {
				class: 'ui-block-header filtered-message body-text -small message-text extras-filter-header'
			}, {
				display: 'none'
			});
			extrasuiHeading = this.extensionHelpers.createElement('p', {
				class: 'ui-block-heading'
			});
			extrasuiHeader.append(extrasuiHeading);
			const removeLink = this.extensionHelpers.createElement('a', {
				class: 'js-film-filter-remover',
				href: '#'
			});
			removeLink.innerText = 'Remove filters';
			extrasuiHeading.append(removeLink);

			// Append to page
			document.querySelector('.poster-grid').before(extrasuiHeader);

			extrasuiHeader.addEventListener('click', () => {

				this.extensionStorage.localSet('hide-lost-films', 'show');

			});

		}

		// Set text of the custom header
		const removeLink = extrasuiHeader.querySelector('.js-film-filter-remover');
		extrasuiHeading.innerText = '';
		extrasuiHeading.append(`${prefix + this.lostFilms.visibleCount + suffix} matching your filters. `);
		extrasuiHeading.append(removeLink);
		extrasuiHeading.append('.');

		// Set the new header and existing header based on current filter
		if (this.lostFilms.enabled && this.lostFilms.lostFilmCount > 0) {

			if (uiHeader !== null) {

				uiHeader.style.display = 'none';

			}

			extrasuiHeader.style.display = '';

		} else {

			if (uiHeader !== null) {

				uiHeader.style.display = '';

			}

			extrasuiHeader.style.display = 'none';

		}

	}

	toggleLostFilms(event) {

		const filter = event.target.parentNode;
		let enabled = 'show';

		if (filter.className.includes('smenu-subselected')) {

			filter.className = filter.className.replace(' smenu-subselected', '');

		} else {

			filter.className += ' smenu-subselected';
			enabled = 'hide';

		}

		this.extensionStorage.localSet('hide-lost-films', enabled);

		this.updateLostFilms();

	}

}
