import { LOAD_STATES } from './constants';

export class LetterboxdPerson {

	constructor(storage, helpers) {

		this.extensionStorage = storage;
		this.extensionHelpers = helpers;

		this.running = false;
		this.isMobile = null;
		this.tmdbID = null;
		this.wiki = null;
		this.letterboxdName = null;
		this.buttonUpdated = false;
		this.loggedIn = null;

		this.lostFilms = {
			loadState: LOAD_STATES['Uninitialized'],
			filterAdded: false,
			enabled: false,
			lostFilmCount: 0,
			visibleCount: 0,
			totalCount: 0,
			watchedUpdated: false
		};

		const styleElement = document.createElement('style');
		document.head.appendChild(styleElement);

		this.styleSheet = styleElement.sheet;
		this.lostFilmRuleIndex = 0;

		this.styleSheet.insertRule(`.extras-lost-film{ display: revert !important; }`, this.lostFilmRuleIndex);
	}

	stopRunning() {
		this.running = false;
	}

	async init() {

		this.running = true;

		// Get logged in status
		if (this.loggedIn == null){
			this.loggedIn = document.documentElement.innerHTML.includes('person.loggedIn = true');
			this.extensionHelpers.WriteConsoleLog('DEBUG', `Found Logged in status: ${this.loggedIn}`);
		}

		// Get the person's name from the page
		if (this.letterboxdName === null && document.querySelector('h1.title-1') !== null) {
			this.getName();
		}

		// Get the TMDB id and call wikidata
		if (this.letterboxdName !== null && this.tmdbID === null && document.querySelector('.bio') !== null) {
			// Get the TMDB ID
			const body = document.querySelector('body');
			if (body.hasAttribute('data-tmdb-id')) {
				this.tmdbID = body.getAttribute('data-tmdb-id');
			}

			this.callWikiData();
		}

		// Update the TMDB button
		if (this.buttonUpdated == false && document.querySelector('.micro-button:not(.extras-button)')){
			this.updateTmdbButton();
		}

		// Add the filter
		if (this.lostFilms.filterAdded === false && document.querySelector('.js-film-filters') !== null && this.extensionStorage.localInitilized === true) {
			this.lostFilms.filterAdded = true;
			this.addLostFilmFilter();
		}

		// Call WikiData for lost films
		if (this.lostFilms.loadState === LOAD_STATES['Uninitialized'] && document.querySelector('.poster-grid') !== null && this.extensionStorage.localInitilized === true) {
			this.callWikiDataLostFilms();
		}

		// Update the page for lost films
		if (this.lostFilms.loadState === LOAD_STATES['Pending'] && this.loggedIn != null) {
			if (this.loggedIn) {
				// If the user is logged in, make sure the progress count exists
				if (document.querySelector('.progress-count')) {
					this.processLostFilms();
				}

			} else {
				// If not logged in, we can just do it
				this.processLostFilms();
			}
		}

		// Stop
		return this.stopRunning();
	}

	updateTmdbButton() {
		const tmdbButton = document.querySelector('.micro-button:not(.extras-button)');
		if (tmdbButton != null){
			if (this.extensionStorage.get('open-same-tab') == true) {
				tmdbButton.setAttribute("target", "");
			}
			this.buttonUpdated = true;
		}
	}

	getName() {
		const nameElement = document.querySelector('h1.title-1');
		let name = nameElement.innerText;
		if (name.includes('\n')) {
			const startIndex = name.indexOf('\n') + 1;
			name = name.substring(startIndex);
		}

		// Determine mobile
		if (this.isMobile === null) {
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
		browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: queryString.url, options: queryString.options }, data => {
			if (this.extensionHelpers.ValidateResponse('WikiData', data) === false) {
				return;
			}

			const value = data.response;
			if (value !== null && value.results !== null && value.results.bindings !== null && value.results.bindings.length > 0) {
				this.wiki = value.results.bindings[0];

				this.addWikiData();
				this.addIMDbButton();
				this.addWikiButton();
			}
		});
	}

	addLostFilmFilter() {
		// Check if already added?
		if (document.querySelector('.extras-lost-filter') !== null) {
			return;
		}

		// Create filter element
		const li = this.extensionHelpers.createElement('li', {
			class: `extras-lost-filter divider-line -inset`
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
			if (this.wiki.BirthName.value !== this.wiki.itemLabel.value && this.wiki.BirthName.value !== this.letterboxdName) {
				name = this.wiki.BirthName.value;
			}
		}

		if (this.wiki.Date_Of_Birth && this.wiki.Date_Of_Birth.value !== null && this.wiki.Date_Of_Birth_Precision.value >= 9) {
			birth = new Date(this.wiki.Date_Of_Birth.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(this.wiki.Date_Of_Birth_Precision.value));
			if (isAlive === true) {
				const age = this._calculateAge(new Date(this.wiki.Date_Of_Birth.value), new Date());
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
		if (this.wiki.Date_Of_Death && this.wiki.Date_Of_Death.value !== null && this.wiki.Date_Of_Death_Precision.value >= 9) {
			death = new Date(this.wiki.Date_Of_Death.value).toLocaleDateString('en-UK', this.extensionHelpers.getDateOptions(this.wiki.Date_Of_Death_Precision.value));

			const age = this._calculateAge(new Date(this.wiki.Date_Of_Birth.value), new Date(this.wiki.Date_Of_Death.value));
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
		if (empty === false) {
			if (this.isMobile) {
				if (document.querySelector('.sidebar .actions') !== null) {
					document.querySelector('.sidebar .actions').prepend(table);
				}

			} else if (document.querySelector('.bio') !== null) {
				document.querySelector('.bio').before(table);

			} else if (document.querySelector('.avatar.person-image') !== null) {
				document.querySelector('.avatar.person-image').after(table);

			}
		}
	}

	addWikiButton() {

		let url = this.wiki?.Wikipedia?.value ?? '';

		if (document.querySelector('.wiki-button')) return;
		if (this.extensionStorage.get('wiki-link-enabled') === false) return;
		if (url == '') return;

		// Create Button Element
		const button = this.extensionHelpers.createElement('a', {
			class: 'micro-button extras-button wiki-button',
			href: url
		});
		button.innerText = this.extensionHelpers.getWikiButtonLabel(url);
		
		if (this.extensionStorage.get('open-same-tab') != true) {
			button.setAttribute("target", "_blank");
		}

		// Add to Page
		document.querySelector('.micro-button:NOT(.extras-button)').after(button);
	}

	addIMDbButton() {
		
		let url = this.wiki?.IMDb_ID?.value ?? '';

		if (document.querySelector('.imdb-button')) return;
		if (url == '') return;

		url = `https://www.imdb.com/name/${url}`;

		// Create Button Element
		const button = this.extensionHelpers.createElement('a', {
			class: 'micro-button extras-button imdb-button',
			href: url
		});
		button.innerText = 'IMDB';
		
		if (this.extensionStorage.get('open-same-tab') != true) {
			button.setAttribute("target", "_blank");
		}

		// Add to Page
		document.querySelector('.micro-button:NOT(.extras-button)').before(button);

	}

	callWikiDataLostFilms() {

		this.lostFilms.loadState = LOAD_STATES['Loading'];
		const queryString = this.extensionHelpers.getWikiDataQuery('', '', '', this.tmdbTV, 'LOSTFILMS', 'en');

		// Check for cached list in the browser storage
		const timestamp = this.extensionStorage.localGet('lost-films-timestamp');
		this.lostFilms.list = this.extensionStorage.localGet('lost-films');

		const now = new Date();
		const maxTime = 7 * 60 * 60 * 24 * 1000; // one week
		if (timestamp === null || timestamp === undefined || (now - timestamp) > maxTime || this.lostFilms.list === null) {
			this.extensionHelpers.WriteConsoleLog('DEBUG', `Lost films - list is either not found or over a week old. Calling WikiData for new list...`);

			// Get new list - Call WikiData
			browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: queryString.url, options: queryString.options }, data => {
				if (this.extensionHelpers.ValidateResponse('WikiData', data) === false) {
					return;
				}

				const value = data.response;
				if (value !== null && value.results !== null && value.results.bindings !== null && value.results.bindings.length > 0) {
					this.extensionHelpers.WriteConsoleLog('DEBUG', `Lost films - Successfully retrieved list from WikiData.`);

					this.lostFilms.list = value.results.bindings.map(binding => binding.letterboxdID.value);
					this.lostFilms.loadState = LOAD_STATES['Pending'];

					// Save list to browser storage
					this.extensionStorage.localSet('lost-films', this.lostFilms.list);
					this.extensionStorage.localSet('lost-films-timestamp', new Date());
				}
			});
		} else {
			this.extensionHelpers.WriteConsoleLog('DEBUG', `Lost films - using cached list.`);
			
			// Use cached list in the browser storage
			this.lostFilms.list = this.extensionStorage.localGet('lost-films');
			this.lostFilms.loadState = LOAD_STATES['Pending'];

		}
	}

	processLostFilms() {

		this.lostFilms.loadState = LOAD_STATES['Success'];
		this.lostFilms.lostFilmCount = 0;
		this.lostFilms.visibleCount = 0;
		this.lostFilms.totalCount = 0;
		
		this.lostFilms.enabled = this.extensionStorage.localGet('hide-lost-films') === 'hide';

		// Check and set hidden
		const films = document.querySelectorAll('div.poster-grid ul li');
		for (let i = 0; i < films.length; i++) {

			const film = films[i];
			const filmID = film.querySelector('div').getAttribute('data-item-slug');

			if (this.lostFilms.list.includes(filmID)) {
				film.classList.add('extras-lost-film');
				this.lostFilms.lostFilmCount++;
			}

			this.lostFilms.totalCount++;
		}
		
		this.extensionHelpers.WriteConsoleLog('DEBUG', `Lost films - Total films found ${this.lostFilms.totalCount}, lost films found ${this.lostFilms.lostFilmCount}`);

		// Create custom heading if one does not already exist
		if (document.querySelector('.filtered-message') == null) {
			const extrasuiHeader = this.extensionHelpers.createElement('section', {
				class: 'ui-block-header filtered-message body-text -small message-text extras-filter-header'
			}, {
				display: 'none'
			});
			const extrasuiHeading = this.extensionHelpers.createElement('p', {
				class: 'ui-block-heading'
			});
			extrasuiHeader.append(extrasuiHeading);
			const removeLink = this.extensionHelpers.createElement('a', {
				class: 'js-film-filter-remover',
				href: '#'
			});
			removeLink.innerText = 'Remove filters';
			extrasuiHeading.append(removeLink);

			// Append to page
			document.querySelector('.poster-grid').before(extrasuiHeader);

			extrasuiHeader.addEventListener('click', () => {
				this.extensionStorage.localSet('hide-lost-films', 'show');
			});
		}

		// Set the new header and existing header based on current filter
		if (this.lostFilms.enabled) {
			document.querySelector('.extras-lost-filter .item').click();
		}
	}

	toggleLostFilms(event) {

		const filterButton = event.target.parentNode;

		// Update selected filter and visible counts based on current selection
		let posterDisplay = 'revert';
		if (filterButton.className.includes('smenu-subselected')) {
			// Unselect
			this.extensionStorage.localSet('hide-lost-films', 'show');
			this.lostFilms.enabled = false;
			filterButton.classList.remove('smenu-subselected');
			posterDisplay = 'revert';
			
			this.lostFilms.visibleCount = this.lostFilms.totalCount;
		} else {
			// Select
			this.extensionStorage.localSet('hide-lost-films', 'hide');
			this.lostFilms.enabled = true;
			filterButton.classList.add('smenu-subselected');
			posterDisplay = 'none';

			this.lostFilms.visibleCount = this.lostFilms.totalCount - this.lostFilms.lostFilmCount;

		}

		// Exit out if there are no lost films on the current page
		if (this.lostFilms.lostFilmCount == 0) return;

		// Toggle the visibility of the posters with a CSS rule
		this.styleSheet.deleteRule(this.lostFilmRuleIndex);
		this.styleSheet.insertRule(`.extras-lost-film{ display: ${posterDisplay} !important; }`, this.lostFilmRuleIndex);


		// Set text of the filter message header
		const filterContainer = document.querySelector('.filtered-message');
		const filterText = filterContainer.querySelector('.ui-block-heading');

		let prefix = 'There are ';
		let suffix = ' films ';
		if (this.lostFilms.visibleCount === 1) {
			prefix = 'There is ';
			suffix = ' film ';
		}

		suffix += this._getPersonRole(window.location.pathname.match(new RegExp(/\/([A-za-z\-]+)/))[1]);
		const removeLink = filterText.querySelector('.js-film-filter-remover');
		filterText.innerText = '';
		filterText.append(`${prefix + this.lostFilms.visibleCount + suffix} matching your filters. `);
		filterText.append(removeLink);
		filterText.append('.');

		if (this.lostFilms.enabled && this.lostFilms.lostFilmCount > 0) {
			filterContainer.style.display = 'block';

		} else if (filterContainer.className.includes('extras-filter-header')) {
			filterContainer.style.display = 'none';
		}


		// Update progress panel
		if (document.querySelector('.sidebar .actions .progress-panel') !== null) {
			const progressCounter = document.querySelector('.sidebar .actions .progress-panel .progress-status .progress-counter');
			const progressCount = progressCounter.querySelector('.progress-count');
			const jsProgress = progressCount.querySelector('.js-progress-count');

			// Get the original total
			let originalTotal = this.lostFilms.totalCount;
			const regex = new RegExp(/\/ (\d+)/);
			if (progressCounter.innerText.match(regex) !== null) {
				originalTotal = parseInt(progressCounter.innerText.match(regex)[1]) ?? this.lostFilms.totalCount;
			}

			const watchedCount = parseInt(jsProgress.innerText) ?? '0';

			// Remove it from the span, then clear the span
			progressCount.remove(jsProgress);
			progressCount.innerText = '';
			// Re-add the progress to the span
			progressCount.innerText += ` of ${this.lostFilms.visibleCount}`;
			progressCount.prepend(jsProgress);
			// Add the count to the counter
			progressCounter.innerHTML = '';
			if (originalTotal !== this.lostFilms.visibleCount) {
				progressCounter.append(` / ${originalTotal} total`);
			}

			progressCounter.prepend(progressCount);

			// Update the percentage
			const progressPercent = document.querySelector('.sidebar .actions .progress-panel .progress-status p .progress-percentage');
			const percentage = Math.floor(watchedCount / this.lostFilms.visibleCount * 100);
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
	}


	_getPersonRole(role) {
		switch (role) {
			case 'director':
			case 'co-director':
			case 'additional-directing':
				return 'by this director';

			case 'writer':
			case 'producer':
			case 'executive-producer':
				return `by this ${role.replace('-', ' ')}`;

			case 'actor':
				return `with this ${role.replace('-', ' ')}`;

			case 'original-writer':
				return 'by this writer';

			case 'editor':
				return 'edited by this editor';

			case 'cinematography':
				return 'shot by this cinematographer';

			case 'composer':
				return 'with music by this composer';

			default:
				return `with ${role.replace('-', ' ')} by this artist`;
		}
	}

}
