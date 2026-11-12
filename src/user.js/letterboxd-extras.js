/* eslint-disable */

import { LOAD_STATES } from './constants';
import { AnilistHelper } from './helpers/AnilistHelper';
import { MubiHelper } from './helpers/MubiHelper';
import { FilmAffinityHelper } from './helpers/FilmAffinityHelper';
import { LetterboxdPerson } from './letterboxd-person';
import { LetterboxdGeneral } from './letterboxd-general';
import { KinopoiskHelper } from './helpers/KinopoiskHelper';
import { SimklHelper } from './helpers/SimklHelper';
import { MyAnimeListHelper } from './helpers/MyAnimeListHelper';
import { DoubanHelper } from './helpers/DoubanHelper';
import { AllocineHelper } from './helpers/AllocineHelper';
import { SensCritiqueHelper } from './helpers/SensCritiqueHelper';
import { DoesTheDogDieHelper } from './helpers/DoesTheDogDieHelper';
import { FilmarksHelper } from './helpers/FilmarksHelper';
import { CinemascoreHelper } from './helpers/CinemascoreHelper';
import { BoxOfficeMojoHelper } from './helpers/BoxOfficeMojoHelper';
import { getWikiDataLocaleParams, getWikiDataRequest } from './helpers/WikiDataHelper';
import { CriterionHelper } from './helpers/CriterionHelper';
import { MetacriticHelper } from './helpers/MetacriticHelpers';
import { RankingHelper } from './helpers/RankingHelper';
import { RottenTomatoesHelper } from './helpers/RottenTomatoesHelper';
import { CastHelper } from './helpers/CastHelper';
import { IMDBHelper } from './helpers/IMDBHelper';

import styles from './styles/letterboxd-extras.css';

GM_addStyle(styles);

/* eslint-disable */

const letterboxd = {

	overview: {

		lastLocation: window.location.pathname,

		running: false,

		// Letterboxd
		letterboxdID: '',
		letterboxdYear: null,
		letterboxdTitle: null,
		letterboxdNativeTitle: null,
		letterboxdDirectors: [],
		linksMoved: false,
		scoreConverted: false,
		fansConverted: false,
		showDetailsAdded: false,
		titleError: false,
		directorsCollected: false,

		loggedIn: null,

		// Shared page state for the helper classes
		pageState: { 
			isMobile: null,
			hideRatings: null,
			hideReviews: null,
			filmWatched: null,
			ratingMoved: 0, // 0 is unmoved, 1 is moved but hideRatings was null, 2 is confirmed
			reviewsMoved: 0,
		 },

		idsCollected: false,
		altTitleList: null,
		altTitleError: false,

		// IMDb
		imdbID: "",
		imdbURL: "",
		imdbHelper: null,

		// TMDB
		tmdbID: '',
		tmdbTV: false,

		// Mojo
		mojoHelper: null,

		// Cinemascore
		cinemascoreHelper: null,

		// WikiData
		wiki: null,
		wiki_dates: null,
		wikiData: {
			state: 0, state_dates: 0, metaURL: "",
			budget: { value: null, currency: null, togetherWith: null },
			boxOfficeUS: { value: null, currency: null },
			boxOfficeWW: { value: null, currency: null },
			mpaa: null,
			bbfc: null,
			cnc: null,
			fsk: null,
			eirin: null,
			kmrb: null,
			acb: null,
			classind: null,
			countries: [],
			date: { value: null, precision: null },
			date_origin: { value: null, precision: null },
			US_Title: null, Alt_Title: null, TV_Start: null, TV_End: null, AniList_ID: null, MAL_ID: null,
			Mubi_ID: null, Mubi_URL: null,
			FilmAffinity_ID: null, FilmAffinity_URL: null,
			SensCritique_ID: null, SensCritique_URL: null,
			Kinopoisk_ID: null,
			DDD_ID: null,
			Filmarks_ID: null,
			MDL_ID: null,
			StateOfTransmission: null,
		},

		// Rotten Tomatoes
		tomatoHelper: null,

		// Metacritic
		metaHelper: null,

		mubiHelper: null,

		filmAffinityHelper: null,

		// Content ratings (MPA, BBFC, FSK, etc)
		contentRating: null,
		contentRatingSystem: null,
		contentRatingAdded: false,

		// Date
		filmDate: { date: null, precision: null },

		// MAL Helper
		myAnimeListHelper: null,

		// Anilist Helper
		anilistHelper: null,

		// SensCritique
		sensHelper: null,

		// Rankings (BFI, TSPDT, AFI, IMDb)
		rankingHelper: null,

		// Allocine
		allocineHelper: null,

		// Douban
		doubanHelper: null,

		// MyDramaList
		// myDramaListHelper: null,

		// Criterion
		criterionHelper: null,

		// SIMKL
		simklHelper: null,

		// Does the Dog Die (ddd)
		doesTheDogDieHelper: null,

		// Filmarks
		filmarksHelper: null,

		// Blu-ray.com
		bluray: { id: null, url: null },

		// RogerEbert.com
		ebert: { id: null, url: null },

		kinopoiskHelper: null,

		dateAdded: false,
		durationAdded: false,
		lostBadgeAdded: false,

		ratingsSuffix: [],

		stopRunning() {
			this.running = false;
		},

		async init() {
			if (letterboxd.storage.syncInitilized == false) return;
			if (this.running) return;

			this.running = true;

			// Get Letterboxd ID
			if (this.letterboxdID == '' && window.location.pathname.startsWith('/film/')) {
				var regex = /\/film\/([a-z\-\d\:_]+)\//
				this.letterboxdID = window.location.pathname.match(regex)[1];

				letterboxd.helpers.WriteConsoleLog('DEBUG', `Found Letterboxd ID ${this.letterboxdID}`);
			}

			// Append Rankings
			if (this.letterboxdID != '' && ((this.pageState.isMobile && document.querySelector('.sidebar')) || (this.pageState.isMobile == false && document.querySelector('.production-statistic')))) {
				if (this.rankingHelper.loadState == LOAD_STATES['Uninitialized']) {
					this.rankingHelper.loadRankings(this.letterboxdID);
				}
				if (this.rankingHelper.customLoadState == LOAD_STATES['Uninitialized']){
					this.rankingHelper.loadCustomRankings(this.letterboxdID);
				}
			}
							
			// Get logged in status
			if (this.loggedIn == null){
				this.loggedIn = document.documentElement.innerHTML.includes('person.loggedIn = true');
				
				letterboxd.helpers.WriteConsoleLog('DEBUG', `Found Logged in status: ${this.loggedIn}`);
			}

			if (this.loggedIn == null && letterboxd.storage.get('hide-ratings-enabled') === "unchanged" && letterboxd.storage.get('hide-reviews-enabled') === "false"){
				// Just in case, set these now if the relevant settings aren't enabled.
				// this is a backup just in case the site changes in the future in a way where the addon won't be able to set these normally
				this.loggedIn = false;
				this.pageState.filmWatched = false;
				this.pageState.hideRatings = false;
				this.pageState.hideReviews = false;
			}

			// Determine mobile
			if (this.pageState.isMobile == null && document.querySelector("html") && document.querySelector("html").hasAttribute('class')) {
				const htmlEl = document.querySelector("html");
				if (htmlEl.getAttribute("class").includes("no-mobile")) {
					this.pageState.isMobile = false;
				} else {
					// TODO: Have Helpers accessed shared state passed through on initialization
					// after storage and page type is parsed.
					this.pageState.isMobile = true;
				}

				letterboxd.helpers.WriteConsoleLog('DEBUG', `Found mobile status ${this.pageState.isMobile}`);
			}

			// Determine watch status and hide status
			if (this.pageState.filmWatched == null && this.loggedIn != null){
				if (this.loggedIn == false){
					// If not logged in, only base the hiding on the addon settings
					this.pageState.filmWatched = false;
					this.pageState.hideRatings = letterboxd.storage.get('hide-ratings-enabled') !== "unchanged";
					this.pageState.hideReviews = letterboxd.storage.get('hide-reviews-enabled') !== "false";
					
					letterboxd.helpers.WriteConsoleLog('DEBUG', `Found film watched status ${this.pageState.filmWatched}`);
					
				}else if (this.pageState.filmWatched == null && document.querySelector('#userpanel .-watch .watch-link-target')){
					// If logged in, we need to check the watched status against the addon settings
					let found = false;

					const watchLink = document.querySelector('#userpanel .-watch .watch-link-target');
					if (watchLink != null && watchLink.hasAttribute('data-is-watched')){
						this.pageState.filmWatched = watchLink.getAttribute('data-is-watched') == 'true';
						found = true;
					}

					if (found){
						// Determine if ratings should be hidden
						this.pageState.hideRatings = false;
						if (letterboxd.storage.get('hide-ratings-enabled') !== "unchanged"){
							this.pageState.hideRatings = true;

							if (letterboxd.storage.get('hide-ratings-unwatched') === true && this.pageState.filmWatched == true){
								this.pageState.hideRatings = false;
							}
						}
						
						// Determine if reviews should be hidden
						this.pageState.hideReviews = false;
						if (letterboxd.storage.get('hide-reviews-enabled') !== "unchanged"){
							this.pageState.hideReviews = true;

							if (letterboxd.storage.get('hide-reviews-unwatched') === true && this.pageState.filmWatched == true){
								this.pageState.hideReviews = false;
							}
						}
						
						letterboxd.helpers.WriteConsoleLog('DEBUG', `Found film watched status ${this.pageState.filmWatched}`);
					}
				}
			}

			// Move the existing ratings if necessary
			if (this.pageState.ratingMoved == 0 && document.querySelector('.sidebar .section.ratings-histogram-chart:not(.ratings-extras)') != null){
				if (letterboxd.storage.get('hide-ratings-enabled') === "all" && (this.pageState.hideRatings == null || this.pageState.hideRatings == true)){
					var sidebar = this.createRatingsHolder();
					var ratings = document.querySelector('.sidebar .section.ratings-histogram-chart:not(.ratings-extras)');
					sidebar.prepend(ratings);
				}
				if (this.pageState.hideRatings == null)
					this.pageState.ratingMoved = 1;
				else
					this.pageState.ratingMoved = 2;
			}

			if (this.pageState.ratingMoved == 1 && this.pageState.hideRatings != null){
				var ratingsHolder = document.querySelector('.extras-ratings-holder')
				var ratings = document.querySelector('.extras-ratings-holder .section.ratings-histogram-chart:not(.ratings-extras)')
				if (this.pageState.hideRatings == false && ratings != null){
					// Ratings were moved into the holder but shouldn't have been
					ratingsHolder.before(ratings);
					
					ratingsHolder.parentNode.removeChild(ratingsHolder);

					var button = document.querySelector('.sidebar .extras-show-more');
					if (button != null)
						button.parentNode.removeChild(button);
				}
				
				this.pageState.ratingMoved = 2;
			}

			// Hide Reviews
			if (this.pageState.reviewsMoved == 0 && document.querySelector('.film-recent-reviews') != null){
				if (letterboxd.storage.get('hide-reviews-enabled') === "all" && (this.pageState.hideReviews == null || this.pageState.hideReviews == true)){
					var reviews = document.querySelector('.film-recent-reviews');
					if (reviews != null){
						reviews.style.display = "None";
						this.createShowReviewsButton();
					}
				}
				if (this.pageState.hideReviews == null)
					this.pageState.reviewsMoved = 1;
				else
					this.pageState.reviewsMoved = 2;
			}

			if (this.pageState.reviewsMoved == 1 && this.pageState.hideReviews != null){
				var reviews = document.querySelector('.film-recent-reviews');
				if (this.pageState.hideReviews == false && reviews != null){
					// Reviews were hidden and shouldn't have been
					reviews.style.display = "Block";
					
					var button = document.querySelector('.extras-reviews-toggle');
					if (button != null)
						button.parentNode.removeChild(button);
				}
				
				this.pageState.reviewsMoved = 2;
			}

			// Get year and title
			if (document.querySelector("section.production-masthead") != null && this.letterboxdYear == null && this.titleError == false) {
				try {
					// Collect Year and Title
					this.letterboxdYear = document.querySelector(".releasedate a").innerText;
					this.letterboxdTitle = document.querySelector(".headline-1.primaryname span").innerText;

					// Collect native title
					let nativeTitle = document.querySelector('.originalname .quoted-creative-work-title')
					if (nativeTitle != null) {
						this.letterboxdNativeTitle = nativeTitle.innerText;
					}
					
					letterboxd.helpers.WriteConsoleLog('DEBUG', `Found film year: ${this.letterboxdYear}`);
					letterboxd.helpers.WriteConsoleLog('DEBUG', `Found film title: ${this.letterboxdTitle}`);
					if (this.letterboxdNativeTitle != null) {
						letterboxd.helpers.WriteConsoleLog('DEBUG', `Found film native title: ${this.letterboxdNativeTitle}`);
					}
				} catch (error) {
					this.titleError = true;
					letterboxd.helpers.WriteConsoleLog('ERROR', `There was an error when collecting the title and year! | Exception: ${error}`);
				}
			}

			// Get Alt Title List
			if (this.altTitleList == null && this.altTitleError == false && document.querySelector("#tab-panel-details") != null){
				try {
					// Collect Alternate Title List. The rows createDetailsRow adds share the class but are marked 'detail'.
					var altTitleList = document.querySelector('#tab-panel-details div.text-indentedlist:not(.detail) p')
					if (altTitleList != null) {
						// The panel is hidden until its tab is opened, so innerText would be empty
						this.altTitleList = altTitleList.textContent.trim().split(', ');
					}
				} catch (error) {
					this.altTitleError = true;
					letterboxd.helpers.WriteConsoleLog('ERROR', `There was an error when collecting the alternate titles! | Exception: ${error}`);
				}
			}

			// Replace 'Fans' with rating count
			if (this.fansConverted == false && document.querySelector(".ratings-histogram-chart:not(.ratings-extras) .rating-histogram") != null) {
				let section = document.querySelector(".ratings-histogram-chart:not(.ratings-extras)");

				let fansLink = section.querySelector("a.accessory");
				let score = section.querySelector("a.averagerating");
				let count = 0;

				if (score != null) {
					// Grab count and link from score element
					let regex = new RegExp(/(?:based on )([0-9,.]+)(?:[  ]rating)/);

					if (score.hasAttribute("data-original-title")) {
						count = score.getAttribute("data-original-title").match(regex)[1];
					} else if (score.hasAttribute("title")) {
						count = score.getAttribute("title").match(regex)[1];
					}
					count = letterboxd.helpers.cleanNumber(count);
					count = parseInt(count);

					var ratingsUrl = score.getAttribute("href");
				} else {
					// Collect the rating count by tallying the bar graph
					var ratingsUrl = "";
					let regex = new RegExp(/^([0-9,.]+)\b/);
					let histogramBars = section.querySelectorAll("a.barcolumn.tooltip");

					for (let i = 0; i < histogramBars.length; i++) {
						if (histogramBars[i].getAttribute("data-original-title") != null || histogramBars[i].getAttribute("title") != null) {
							var bar = histogramBars[i];
						} else {
							var bar = histogramBars[i].querySelector("a");
						}

						let tooltip = "";
						if (bar.hasAttribute("data-original-title")) {
							tooltip = bar.getAttribute("data-original-title");
						} else if (bar.hasAttribute("title")) {
							tooltip = bar.getAttribute("title");
						}
						if (tooltip.match(regex)) {
							tooltip = tooltip.match(regex)[1];
						}

						if (tooltip != "") {
							var regexMatch = tooltip.match(regex);
							if (regexMatch != null && regexMatch.length > 1) {
								count += parseInt(letterboxd.helpers.cleanNumber(regexMatch[1]));
							}

							if (ratingsUrl == "") {
								ratingsUrl = bar.getAttribute("href");
								if (ratingsUrl != null) {
									ratingsUrl = ratingsUrl.substring(0, ratingsUrl.indexOf("/rated"));
								} else {
									ratingsUrl = "";
								}
							}
						}
					}
				}
				count = count.toLocaleString();

				if (letterboxd.storage.get('replace-fans') === "replace" && fansLink != null) {
					// Replace the existing fans text with ratings
					fansLink.innerText = `${count} ratings`;
					fansLink.href = ratingsUrl;

				} else if (letterboxd.storage.get('replace-fans') === "both" && fansLink != null) {
					// Add the rating count next to the fans

					// Create the bullet point
					letterboxd.helpers.createSectionAccessory(section, '•', '', 'margin-left: 3px;');
					// Create the rating count link
					letterboxd.helpers.createSectionAccessory(section, count, ratingsUrl, 'margin-left: 3px;');

				} else if (fansLink == null) {
					// Fans element does not exist, create one for the ratings count
					letterboxd.helpers.createSectionAccessory(section, `${count} ratings`, ratingsUrl, '');
				}

				this.fansConverted = true;
			}

			// Convert to 10-point scale
			if (this.scoreConverted == false && letterboxd.storage.get('convert-ratings') === "10" && document.querySelector('section.ratings-histogram-chart:not(.ratings-extras) a.averagerating') != null) {
				let section = document.querySelector('section.ratings-histogram-chart:not(.ratings-extras)');
				let score = section.querySelector('a.averagerating');

				// Convert tooltip
				let tooltipAttribute = "";
				if (score.hasAttribute("data-original-title")) {
					tooltipAttribute = "data-original-title";
				} else if (score.hasAttribute("title")) {
					tooltipAttribute = "title";
				}

				if (tooltipAttribute != "") {
					var tooltip = score.getAttribute(tooltipAttribute);

					// Convert tooltip rating
					var regex = new RegExp(/Weighted average of ([1-5]{1}.[0-9]{1,2})/);
					var oldScore = tooltip.match(regex)[1];
					var newScore = (parseFloat(oldScore) * 2);
					var tooltipScore = newScore.toFixed(2).toString() + "/10";

					score.setAttribute(tooltipAttribute, tooltip.replace(oldScore, tooltipScore));

					// Convert main rating
					score.innerText = newScore.toFixed(1).toString();

					// Convert the histogram graph
					regex = new RegExp(/(?:[0-9,]+|No)(?: *| *)([★½]+|half-★) rating/);
					var histogramBars = section.querySelectorAll('a.barcolumn.tooltip');
					for (var i = 0; i < histogramBars.length; i++) {
						if (histogramBars[i].getAttribute(tooltipAttribute) != null) {
							var bar = histogramBars[i];
						} else {
							var bar = histogramBars[i].querySelector("a");
						}
						tooltip = bar.getAttribute(tooltipAttribute);

						oldScore = tooltip.match(regex)[1];
						newScore = (i + 1).toString() + "/10";

						bar.setAttribute(tooltipAttribute, tooltip.replace(oldScore, newScore));
					}
				}

				this.scoreConverted = true;
			} else if (this.scoreConverted == false && letterboxd.storage.get('convert-ratings') != "10" && document.querySelector('section.ratings-histogram-chart:not(.ratings-extras) a.averagerating') != null) {
				this.scoreConverted = true;
			}

			// Add Tooltip as details text for letterboxd rating
			if (this.showDetailsAdded == false && (this.scoreConverted == true) && document.querySelector('section.ratings-histogram-chart:not(.ratings-extras)') != null) {
				if (letterboxd.storage.get('tooltip-show-details') === true) {
					let section = document.querySelector('section.ratings-histogram-chart:not(.ratings-extras)');
					let score = section.querySelector('a.averagerating');
					let histogram = section.querySelector('div.rating-histogram');

					// Set the position on the div
					histogram.style['position'] = 'relative';
					histogram.style['margin-bottom'] = '10px';

					// Add the tooltip as text for mobile
					let tooltip = '';
					if (score != null && score.hasAttribute('data-original-title')) {
						tooltip = score.getAttribute('data-original-title');
					} else if (score != null && score.hasAttribute('title')) {
						tooltip = score.getAttribute('title');
					}

					const detailsSpan = letterboxd.helpers.createElement('span', {
						class: 'lb-score-details mobile-details-text'
					});

					const detailsText = letterboxd.helpers.createElement('p', {
					});
					detailsText.innerText = tooltip;
					detailsSpan.append(detailsText);
					section.append(detailsSpan);
				}

				this.showDetailsAdded = true;
			}

			// Get directors and producers
			if (this.directorsCollected == false && document.querySelector('#tab-panel-crew [href*="/director/"]')?.innerHTML != "" ) {
				// Collect all directors, and normalize their names
				this.letterboxdDirectors = Array.from(document.querySelectorAll('#tab-panel-crew [href*="/director/"]')).map(x => x.innerHTML.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

				// Also collect the producers and add to the same array
				var producers = Array.from(document.querySelectorAll('#tab-panel-crew [href*="/producer/"]')).map(x => x.innerHTML.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
				this.letterboxdDirectors = this.letterboxdDirectors.concat(producers);

				this.directorsCollected = true;
				letterboxd.helpers.WriteConsoleLog('DEBUG', `Found directors/producers: ${this.letterboxdDirectors.toString()}`);
			}

			// Cast Extras
			if (letterboxd.storage.get('cast-extras-enabled') === true && !this.castHelper.rendered && letterboxd.storage.localInitilized) {
				this.castHelper.render(this.imdbData.data, this.loggedIn);
			}

			// First Get the IMDb link 
			if (this.idsCollected == false && document.querySelector('.micro-button') != null) {
				if (this.loggedIn == false || document.querySelector('.block-flag-wrapper')) {
					// Gets the IMDb link and ID, and also TMDB id
					this.resolveExistingButtonLinks();
					if (this.linksMoved == false)
						this.moveLinks();

					if (this.pageState.isMobile && this.durationAdded == false) {
						this.addDurationMobile();
					}
				}
			}

			if (this.pageState.filmWatched != null){
				// Add Cinema Score
				if (this.letterboxdTitle != null && document.querySelector('.sidebar') != null) {
					this.cinemascoreHelper.getData({ title: this.letterboxdTitle, year: this.letterboxdYear });
				}
				this.cinemascoreHelper.updateReleaseYears([this.wikiData.date.value, this.wikiData.date_origin.value]);

				if (this.imdbID != "" && this.imdbHelper.loadState == LOAD_STATES['Uninitialized']) {
					// Call IMDb and Add to page when done
					if (letterboxd.storage.get('imdb-enabled') === true || letterboxd.storage.get('imdb-250-enabled') === true || letterboxd.storage.get('cast-extras-enabled') === true) {
						this.imdbHelper.getData({
							id: this.imdbID,
							url: this.imdbURL,
							onLoad: (imdb) => {
								// The same response feeds the Top 250 ranking and Cast Extras
								if (letterboxd.storage.get('imdb-250-enabled') === true && this.rankingHelper.imdbData.loadState == LOAD_STATES['Uninitialized']){
									const rank = imdb.getTopRanking();
									if (rank !== null) {
										this.rankingHelper.imdbData.rank = rank;
										this.rankingHelper.imdbData.index = rank;
									}
									this.rankingHelper.createRanking(this.rankingHelper.imdbData);
								}

								if (letterboxd.storage.get('cast-extras-enabled') === true) {
									this.castHelper.render(imdb.data, this.loggedIn);
								}
							}
						});

						// Call BoxOfficeMojo
						this.mojoHelper.getData({
							imdbID: this.imdbID,
							onLoad: (mojo) => {
								// Mojo's earliest domestic date wins; its release tables are only used if there is no date yet
								if (mojo.earliestDomesticDate != null) {
									this.filmDate.date = mojo.earliestDomesticDate;
								} else if ((this.filmDate.date == null || this.filmDate.date == "") && mojo.fallbackDomesticDate != null) {
									this.filmDate.date = mojo.fallbackDomesticDate;
								}

								// If the domestic date was found on Mojo, add it now
								if (this.filmDate.date != null && this.dateAdded == false)
									this.addDate(this.filmDate.date);
							}
						});
					}
				}
				if (this.imdbID != '' || this.tmdbID != '') {
					// Call WikiData
					if (this.wikiData.state < 1) {
						const wikiDataIds = { imdbId: this.imdbID, tmdbId: this.tmdbID, letterboxdId: this.letterboxdID, isTV: this.tmdbTV };
						var queryString = getWikiDataRequest({ ...wikiDataIds, queryType: 'MAIN', ...getWikiDataLocaleParams(letterboxd.storage) });
						var queryStringDate = getWikiDataRequest({ ...wikiDataIds, queryType: 'DATE' });

						this.wikiData.state = 1;
						browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: queryString.url, options: queryString.options }, (data) => {
							if (letterboxd.helpers.ValidateResponse("WikiData", data) == false){
								return;
							}

							var value = data.response;
							if (value != null && value.results != null && value.results.bindings != null && value.results.bindings.length > 0) {
								this.wiki = value.results.bindings[0];

								if (this.wiki != null) {
									// Add Wikipedia Link
									if (letterboxd.storage.get('wiki-link-enabled') === true) {
										this.addWikiButton();
									}

									// Collect the countries
									for (var i = 0; i < value.results.bindings.length; i++) {
										var result = value.results.bindings[i];
										if (result.Country_Of_Origin != null && result.Country_Of_Origin.value != "") {
											this.wikiData.countries.push(result.Country_Of_Origin.value);
										}
									}

									// Box Office and Budget
									if (this.wiki.Budget != null && this.wiki.Budget.value != null) {
										this.wikiData.budget.value = this.wiki.Budget.value;
										if (this.wiki.Budget_UnitLabel != null)
											this.wikiData.budget.currency = this.wiki.Budget_UnitLabel.value;
										if (this.wiki.Budget_TogetherWith != null)
											this.wikiData.budget.togetherWith = this.wiki.Budget_TogetherWith.value;

										var value = parseInt(letterboxd.helpers.cleanNumber(this.wikiData.budget.value));
										var value2 = parseInt(letterboxd.helpers.cleanNumber(this.mojoHelper.budget));
										if (this.mojoHelper.budget == "" || (value > value2) || this.wikiData.budget.togetherWith != null) {
											letterboxd.helpers.createDetailsRow("Budget", this.wikiData.budget.value, this.wikiData.budget.currency, this.wikiData.budget.togetherWith);
										}
									}
									if (this.wiki.Box_OfficeUS != null && this.wiki.Box_OfficeUS.value != null) {
										this.wikiData.boxOfficeUS.value = this.wiki.Box_OfficeUS.value;
										if (this.wiki.Box_OfficeUS_UnitLabel != null)
											this.wikiData.boxOfficeUS.currency = this.wiki.Box_OfficeUS_UnitLabel.value;

										var value = parseInt(letterboxd.helpers.cleanNumber(this.wikiData.boxOfficeUS.value));
										var value2 = parseInt(letterboxd.helpers.cleanNumber(this.mojoHelper.boxOfficeUS));
										if (this.mojoHelper.boxOfficeUS == "" || (value > value2)) {
											letterboxd.helpers.createDetailsRow("Box Office (US)", this.wikiData.boxOfficeUS.value, this.wikiData.boxOfficeUS.currency);
										}
									}
									if (this.wiki.Box_OfficeWW != null && this.wiki.Box_OfficeWW.value != null) {
										this.wikiData.boxOfficeWW.value = this.wiki.Box_OfficeWW.value;
										if (this.wiki.Box_OfficeWW_UnitLabel != null)
											this.wikiData.boxOfficeWW.currency = this.wiki.Box_OfficeWW_UnitLabel.value;

										var value = parseInt(letterboxd.helpers.cleanNumber(this.wikiData.boxOfficeWW.value));
										var value2 = parseInt(letterboxd.helpers.cleanNumber(this.mojoHelper.boxOfficeWW));
										if (this.mojoHelper.boxOfficeWW == "" || (value > value2)) {
											letterboxd.helpers.createDetailsRow("Box Office (WW)", this.wikiData.boxOfficeWW.value, this.wikiData.boxOfficeWW.currency);
										}
									}

									// Get TV dates
									var options = { year: 'numeric', month: 'short', day: 'numeric' };
									if (this.wiki.TV_Start != null) {
										this.wikiData.TV_Start = new Date(this.wiki.TV_Start.value.replace("Z", "")).toLocaleDateString("en-UK", options);
										this.filmDate.date = this.wikiData.TV_Start;
										this.filmDate.precision = "11";
										var dateString = this.wikiData.TV_Start + " - ";
										if (this.wiki.TV_End != null) {
											this.wikiData.TV_End = new Date(this.wiki.TV_End.value.replace("Z", "")).toLocaleDateString("en-UK", options);
											dateString += this.wikiData.TV_End;
										}
										this.addDate(dateString);
									}

									// Get US Title and attempt Cinemascore
									if (this.wiki.US_Title != null && this.wiki.US_Title != "")
										this.wikiData.US_Title = this.wiki.US_Title.value;

									if (this.wiki.itemLabel != null && this.wiki.itemLabel != "")
										this.wikiData.Alt_Title = this.wiki.itemLabel.value;

									// Get and add Metacritic
									if (this.wiki.Metacritic_ID != null && this.wiki.Metacritic_ID.value != null && letterboxd.storage.get('metacritic-enabled') === true) {
										this.wikiData.metaURL = "https://www.metacritic.com/" + this.wiki.Metacritic_ID.value;
									}

									// Get and add Rotten Tomatoes
									if (
										this.wiki.Rotten_Tomatoes_ID != null && 
										this.wiki.Rotten_Tomatoes_ID.value != null && 
										letterboxd.storage.get('tomato-enabled') === true
									) {
										var url = "https://www.rottentomatoes.com/" + this.wiki.Rotten_Tomatoes_ID.value;
										if (url.includes('/tv/') && !url.match(/s[0-9]{2}/i))
											url += "/s01"

										this.tomatoHelper.getData(url);
									}

									// Get the MUBI ID to use later
									if (this.wiki.Mubi_ID != null && this.wiki.Mubi_ID.value != null) {
										var url = "https://api.mubi.com/v3/films/" + this.wiki.Mubi_ID.value;

										this.wikiData.Mubi_ID = this.wiki.Mubi_ID.value;
										this.wikiData.Mubi_URL = url;
									}

									// Get the SensCritique ID to use for later
									if (this.wiki.SensCritique_ID != null && this.wiki.SensCritique_ID.value != null) {
										this.wikiData.SensCritique_ID = this.wiki.SensCritique_ID.value;
									}

									// Get the Allocine ID to use for later
									if (this.wiki.Allocine_Film_ID != null && this.wiki.Allocine_Film_ID.value != null) {
										this.wikiData.Allocine_Film_ID = this.wiki.Allocine_Film_ID.value;
									}
									if (this.wiki.Allocine_TV_ID != null && this.wiki.Allocine_TV_ID.value != null) {
										this.wikiData.Allocine_TV_ID = this.wiki.Allocine_TV_ID.value;
									}

									// Get the Douban ID to use for later
									if (this.wiki.Douban_ID != null && this.wiki.Douban_ID.value != null) {
										this.wikiData.Douban_ID = this.wiki.Douban_ID.value;
										if (letterboxd.storage.get('douban-enabled') === true) {
											this.doubanHelper.getData(this.wiki.Douban_ID.value);
										}
									}

									// Get and add FilmAffinity
									if (letterboxd.storage.get('filmaff-enabled') === true) {
										if (this.wiki.FilmAffinity_ID != null && this.wiki.FilmAffinity_ID.value != null) {
											this.filmAffinityHelper.getData(this.wiki.FilmAffinity_ID.value);
										}
									}

									// Get MAL data
									if (this.wiki.MAL_ID != null && this.wiki.MAL_ID.value != null && letterboxd.storage.get('mal-enabled') === true) {
										this.wikiData.MAL_ID = this.wiki.MAL_ID.value;
										this.myAnimeListHelper.getData(this.wiki.MAL_ID.value);
									}

									// Get AniList data
									if (this.wiki.Anilist_ID && this.wiki.Anilist_ID.value && letterboxd.storage.get('al-enabled') === true) {
										this.wikiData.Anilist_ID = this.wiki.Anilist_ID.value;
										this.anilistHelper.getData(this.wiki.Anilist_ID.value);
									}

									// Get Content Ratings (MPAA, BBFC, etc)
									this.wikiData.mpaa = letterboxd.helpers.parseWikiDataResult(this.wiki, "MPAA_film_ratingLabel", this.wikiData.mpaa);
									this.wikiData.bbfc = letterboxd.helpers.parseWikiDataResult(this.wiki, "BBFC_ratingLabel", this.wikiData.bbfc);
									this.wikiData.fsk = letterboxd.helpers.parseWikiDataResult(this.wiki, "FSK_ratingLabel", this.wikiData.fsk);
									this.wikiData.cnc = letterboxd.helpers.parseWikiDataResult(this.wiki, "CNC_rating", this.wikiData.cnc);
									this.wikiData.eirin = letterboxd.helpers.parseWikiDataResult(this.wiki, "EIRIN_ratingLabel", this.wikiData.eirin);
									this.wikiData.kmrb = letterboxd.helpers.parseWikiDataResult(this.wiki, "KMRB_ratingLabel", this.wikiData.kmrb);
									this.wikiData.acb = letterboxd.helpers.parseWikiDataResult(this.wiki, "ACB_ratingLabel", this.wikiData.acb);
									this.wikiData.classind = letterboxd.helpers.parseWikiDataResult(this.wiki, "ClassInd_ratingLabel", this.wikiData.classind);

									// Get the Filmarks ID to use for later
									this.wikiData.Filmarks_ID = letterboxd.helpers.parseWikiDataResult(this.wiki, "Filmarks_ID", this.wikiData.Filmarks_ID);

									// Get the DDD ID to use for later
									this.wikiData.DDD_ID = letterboxd.helpers.parseWikiDataResult(this.wiki, "DDD_ID", this.wikiData.DDD_ID);

									// Get Criterion data
									if (this.wiki.Criterion_ID != null && this.wiki.Criterion_ID.value != null) {
										if (this.wiki.Criterion_Spine_ID != null && this.wiki.Criterion_Spine_ID.value != null) {
											this.criterionHelper.getData({
												websiteID: this.wiki.Criterion_ID.value, 
												spineID: this.wiki.Criterion_Spine_ID.value
											});
										} else {
											this.criterionHelper.getData({ 
												websiteID: this.wiki.Criterion_ID.value
											});
										}
						
									}

									// Get MyDramaList data
									// TODO: 
									/* if (this.wiki.MDL_ID != null && this.wiki.MDL_ID.value != null && letterboxd.storage.get('mdl-enabled') === true) {
										this.wikiData.MDL_ID = this.wiki.MDL_ID.value;
										this.myDramaListHelper.getData(this.wiki.MDL_ID.value);
									} */

									// Get Kinopoisk data
									if (this.wiki.Kinopoisk_ID != null && letterboxd.storage.get('kinopoisk-enabled') === true){
										this.kinopoiskHelper.getData(this.wiki.Kinopoisk_ID.value);
									}

									// Get Blu-ray.com ID
									if (this.wiki.Bluray_ID && letterboxd.storage.get('bluray-link-enabled') === true){
										this.bluray.id = this.wiki.Bluray_ID.value;
										this.bluray.url = 'https://www.blu-ray.com/_/' + this.bluray.id;
										this.addLink(this.bluray.url, 'Blu-Ray.com', 'bluray');
									}

									// Get RogerEbert.com ID
									if (this.wiki.Ebert_ID && letterboxd.storage.get('ebert-link-enabled') === true){
										this.ebert.id = this.wiki.Ebert_ID.value;
										this.ebert.url = 'https://www.rogerebert.com/reviews/' + this.ebert.id;
										this.addLink(this.ebert.url, 'Ebert', 'ebert');
									}

									// Check for State of Transmission
									this.wikiData.StateOfTransmission = letterboxd.helpers.parseWikiDataResult(this.wiki, "StateOfTransmission", this.wikiData.StateOfTransmission);
									if (this.wikiData.StateOfTransmission != null && this.linksMoved && this.lostBadgeAdded == false){
										this.addLostFilmBadge();
									}
								}
							}else{
								letterboxd.helpers.WriteConsoleLog('LOG', `No WikiData results found.`);
							}

							// Create a hidden element to force the mutation observer to trigger
							const mutation = letterboxd.helpers.createElement('a', {
								class: 'extras-mutation-forcer',
								style: 'display: none;'
							});
							document.querySelector('body').append(mutation);

							this.wikiData.state = LOAD_STATES['Success'];
						});

						// Call WikiData a second time for dates
						browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: queryStringDate.url, options: queryStringDate.options }, (data) => {
							if (letterboxd.helpers.ValidateResponse("WikiData Dates", data) == false){
								return;
							}

							var value = data.response;
							if (value != null && value.results != null && value.results.bindings != null && value.results.bindings.length > 0) {
								this.wiki_dates = value.results.bindings;
							}else{
								letterboxd.helpers.WriteConsoleLog('LOG', `No WikiData date results found.`);
							}
							this.wikiData.state_dates = 1;
						});
					} else {
						if (this.wikiData.state == 2 && this.wikiData.state_dates == 1 && this.wiki != null && this.wiki_dates != null) {
							var dates = [];
							var dates_origin = [];
							for (var i = 0; i < this.wiki_dates.length; i++) {
								var date = { date: '', precision: '', country: '', city: '', format: '', score: 0 };
								if (this.wiki_dates[i].Date != null) {
									date.date = this.wiki_dates[i].Date.value;

									if (this.wiki_dates[i].Date_Precision != null && this.wiki_dates[i].Date_Precision.value != "")
										date.precision = this.wiki_dates[i].Date_Precision.value;
									if (this.wiki_dates[i].Date_Country != null && this.wiki_dates[i].Date_Country.value != "")
										date.country = this.wiki_dates[i].Date_Country.value;
									if (this.wiki_dates[i].Date_Format != null && this.wiki_dates[i].Date_Format.value != "")
										date.format = this.wiki_dates[i].Date_Format.value;

									if (this.wiki_dates[i].Date_City_Country != null && this.wiki_dates[i].Date_City_Country.value != "") {
										date.city = date.country
										date.country = this.wiki_dates[i].Date_City_Country.value;
										date.format = 'Q3491297';
									}

									// Check distribution format - if not limited release
									if (!date.format.endsWith('Q3491297')) {
										date.score += 1;
									}

									// Check precision, 2 for day, 1 for month
									if (Number(date.precision) > 9) {
										date.score += 1;
									}

									// Country of Origin date
									if (this.wikiData.countries.includes(date.country)) {
										var date_origin = { date: date.date, precision: date.precision, country: date.country, format: date.format, score: date.score };
										dates_origin.push(date_origin);
									}

									// USA
									if (date.country.endsWith('Q30')) {
										date.score += 2;
									} else if (date.country != '') {
										date.score += 1;
									}
									dates.push(date);
								}
							}

							// Sort arrays - highest score first, then by the earliest date
							dates.sort((a, b) => {
								return b.score - a.score || new Date(a.date).getTime() - new Date(b.date).getTime();
							});
							dates_origin.sort((a, b) => {
								return b.score - a.score || new Date(a.date).getTime() - new Date(b.date).getTime();
							});

							// Set dates
							var options = { yFear: 'numeric' };
							if (dates_origin.length > 0) {
								this.wikiData.date_origin = { value: dates_origin[0].date, precision: dates_origin[0].precision };

								this.wikiData.date_origin.value = new Date(this.wikiData.date_origin.value.replace("Z", "")).toLocaleDateString("en-UK", letterboxd.helpers.getDateOptions(this.wikiData.date_origin.precision));
								this.filmDate.date = this.wikiData.date_origin.value;
								this.addDate(this.filmDate.date);
							}

							if (dates.length > 0) {
								this.wikiData.date = { value: dates[0].date, precision: dates[0].precision };

								this.wikiData.date.value = new Date(this.wikiData.date.value.replace("Z", "")).toLocaleDateString("en-UK", letterboxd.helpers.getDateOptions(this.wikiData.date.precision));
								if (this.dateAdded == false) {
									this.filmDate.date = this.wikiData.date.value;
									this.addDate(this.filmDate.date);
								}
							}
							this.wikiData.state_dates = 2;
						}
					}
				}

				// Add Metacritic
				if (this.wikiData.metaURL != "" && this.wikiData.state == 2 && letterboxd.storage.get('metacritic-enabled') === true) {
					this.addLink(this.wikiData.metaURL, 'META', 'meta');

					if (this.metaHelper.data == null && this.metaHelper.ratingsAdded == false && this.metaHelper.state < 1) {
						try {
							this.metaHelper.state = 1;
							browser.runtime.sendMessage({ name: "GETDATA", url: this.wikiData.metaURL }, (value) => {
								if (letterboxd.helpers.ValidateResponse("Metacritic", value) == false){
									return;
								}
									
								var meta = value.response;
								if (meta != "") {
									this.metaHelper.raw = meta;
									this.metaHelper.data = letterboxd.helpers.parseHTML(meta);
									this.metaHelper.url = value.url;
									this.wikiData.metaURL = value.url;

									this.metaHelper.populateRatingsSidebar({ isTV: this.tmdbTV });
									this.metaHelper.state = 2;
								}
							});
						} catch {
							letterboxd.helpers.WriteConsoleLog('ERROR', `Unable to parse Metacritic URL`);
							this.metaHelper.ratingsAdded = true; // so it doesn't keep calling
							this.metaHelper.state = 3;
						}
					}
				} else if (this.metaHelper.state < 1 && this.wikiData.state == 2) {
					this.metaHelper.state = 3;
				}

				// Add Mubi
				if (letterboxd.storage.get('mubi-enabled') === true && this.wikiData.state == 2) {
					if (this.wikiData.Mubi_ID) {
						this.mubiHelper.getData(this.wikiData.Mubi_URL);
					} else {
						this.mubiHelper.searchData(this.letterboxdTitle, this.letterboxdYear, this.letterboxdDirectors);
					}
				}

				// Add Senscritique
				if (letterboxd.storage.get('senscritique-enabled') === true && this.wikiData.state == 2) {
					// Without a WikiData ID the helper searches by title, so wait until the title is known
					if ((this.wikiData.SensCritique_ID != null && this.wikiData.SensCritique_ID != "") || this.letterboxdTitle != null) {
						this.sensHelper.getData({
							id: this.wikiData.SensCritique_ID,
							title: this.letterboxdTitle,
							nativeTitle: this.letterboxdNativeTitle,
							year: this.letterboxdYear,
							directors: this.letterboxdDirectors,
							isTV: this.tmdbTV == true
						});
					}
				}

				// Cinemascore alt titles and years
				if (this.wikiData.state == 2) {
					this.cinemascoreHelper.searchAlternateTitles({
						releaseDates: [this.wikiData.date.value, this.wikiData.date_origin.value],
						usTitle: this.wikiData.US_Title,
						altTitle: this.wikiData.Alt_Title,
						isTV: this.wikiData.TV_Start != null
					});
				}

				// Add SIMKL
				if (letterboxd.storage.get('simkl-enabled') === true && (this.imdbID != "" || this.tmdbID != "")) {
					this.simklHelper.getData({
						imdbID: this.imdbID,
						tmdbID: this.tmdbID,
						tmdbTV: this.tmdbTV
					})
				}

				// Add Allocine
				if (letterboxd.storage.get('allocine-enabled') === true && this.wikiData.state == 2) {
					if (this.wikiData.Allocine_Film_ID != null) {
						this.allocineHelper.getData({ id: this.wikiData.Allocine_Film_ID, type: 'FILM' });
					} else if (this.wikiData.Allocine_TV_ID != null) {
						this.allocineHelper.getData({ id: this.wikiData.Allocine_TV_ID, type: 'TV' });
					}
				}
					
				// Add Filmarks
				if (this.wikiData.state == 2 && letterboxd.storage.get('filmarks-enabled') === true ){
					// Without a WikiData ID the helper searches by title, so wait until the title and alternative titles are known
					if ((this.wikiData.Filmarks_ID != null && this.wikiData.Filmarks_ID != '') || (this.letterboxdTitle != null && this.altTitleList != null)){
						this.filmarksHelper.getData({
							id: this.wikiData.Filmarks_ID,
							title: this.letterboxdTitle,
							nativeTitle: this.letterboxdNativeTitle,
							year: this.letterboxdYear,
							altTitles: this.altTitleList ?? [],
							isTV: this.tmdbTV,
							isAnime: this.myAnimeListHelper.id != null || this.anilistHelper.id != null
						});
					}
				}
			} 

			if (letterboxd.storage.get('convert-ratings') === "5") {
				this.ratingsSuffix = ['half-★', '★', '★½', '★★', '★★½', '★★★', '★★★½', '★★★★', '★★★★½', '★★★★★'];
			} else {
				this.ratingsSuffix = ['1/10', '2/10', '3/10', '4/10', '5/10', '6/10', '7/10', '8/10', '9/10', '10/10'];
			}

			// Add 'Does the dog die?' link
			if (this.idsCollected == true && (this.imdbID != '' || this.tmdbID != '') && this.wikiData.state == 2 && this.letterboxdTitle != null && document.querySelector('.micro-button') != null && this.linksMoved == true && letterboxd.storage.get('ddd-enabled') === true){
				this.doesTheDogDieHelper.getData({
					id: this.wikiData.DDD_ID,
					imdbID: this.imdbID,
					tmdbID: this.tmdbID,
					isTV: this.tmdbTV,
					title: this.letterboxdTitle,
					nativeTitle: this.letterboxdNativeTitle,
					year: this.letterboxdYear
				});
			}

			// Add Content Ratings
			if (this.wikiData.state == 2 && this.mojoHelper.isFinished() && this.contentRatingAdded == false){
				if (letterboxd.storage.get('content-ratings') === null || letterboxd.storage.get('content-ratings') === 'none'){
					// Disabled, add nothing
					this.contentRatingAdded = true;
				}else{
					// Enabled, get rating from data
					this.contentRatingSystem = letterboxd.storage.get('content-ratings');
					this.contentRating = this.wikiData[this.contentRatingSystem];

					// Check for BoxOfficeMojo backup
					if (this.contentRatingSystem == 'mpaa' && this.contentRating == null && this.mojoHelper.mpaaRating != null){
						this.contentRating = this.mojoHelper.mpaaRating;
					}

					// Add the rating if we have it
					if (this.contentRating != null && this.contentRating != ''){
						this.addRating();
					}
					else{
						letterboxd.helpers.WriteConsoleLog('LOG', `No ${this.contentRatingSystem} rating found`);
					}

					this.contentRatingAdded = true; // prevents this from running again regardless of the rating being added
				}
			}

			// Stop
			return this.stopRunning();
		},

		addWikiButton() {
			if (document.querySelector('.wiki-button')) return;

			if (this.wiki.Wikipedia != null && this.wiki.Wikipedia.value != null) {
				let url = this.wiki.Wikipedia.value;
				this.addLink(url, letterboxd.helpers.getWikiButtonLabel(url), 'wiki');
			}
		},

		resolveExistingButtonLinks() {
			// Get the two links (imdb and tmdb)
			const links = document.querySelectorAll('.micro-button.track-event');

			var imdbLink = "";
			var tmdbLink = "";

			// Loop and find IMDB
			for (var i = 0; i < links.length; i++) {
				if (links[i].innerHTML === "IMDb") {
					// Grab the imdb page
					imdbLink = links[i].href;
					if (!imdbLink.includes("https") && imdbLink.includes('http'))
						imdbLink = imdbLink.replace("http", "https");
					if (imdbLink.includes("maindetails"))
						imdbLink = imdbLink.replace("maindetails", "ratings");

					if (this.pageState.isMobile) {
						imdbLink = imdbLink.replace('www.', 'm.');
					}

					this.imdbURL = imdbLink + "/";

				} else if (links[i].innerHTML === "TMDB") {
					// Grab the tmdb link
					tmdbLink = links[i].href;
				}
			}

			// Separate out the ID
			if (imdbLink != "") {
				let match = imdbLink.match(/(imdb.com\/title\/)(tt[0-9]+)(\/)/);
				if (match && match.length > 2){
					this.imdbID = match[2]
				}
			}

			// Separate the TMDB ID
			if (tmdbLink != "") {
				if (tmdbLink.includes('/tv/')) {
					this.tmdbTV = true;
				}

				let match = tmdbLink.match(/(themoviedb.org\/(?:tv|movie)\/)([0-9]+)($|\/)/);
				if (match && match.length > 2){
					this.tmdbID = match[2];
				}

			}

			this.idsCollected = true;
		},

		addLink(url, text, prefix) {
			if (url === null || url === "") {
				return;
			}

			let className = `${prefix}-button`;

			if (document.querySelector('.' + className)) {
				return;
			}

			// Create Button Element
			const button = letterboxd.helpers.createElement('a', {
				class: `micro-button track-event extras-button ${className}`,
				href: url
			});
			button.innerText = text;

			if (letterboxd.storage.get('open-same-tab') != true) {
				button.setAttribute("target", "_blank");
			}

			// Determine Placement
			const order = [
				'.tomato-button',
				'.meta-button',
				'.sens-button',
				'.mubi-button',
				'.filmaff-button',
				'.simkl-button',
				'.kinopoisk-button',
				'.douban-button',
				'.allocine-button',
				'.mdl-button',
				'.mal-button',
				'.anilist-button',
				'.filmarks-button',
				'.criterion-button',
				'.mojo-button',
				'.wiki-button',
				'.ddd-button',
				'.bluray-button',
				'.ebert-button'
			];

			let index = order.indexOf('.' + className);
			// First Attempt
			for (let i = index + 1; i < order.length; i++) {
				var temp = document.querySelector(order[i]);
				if (temp != null) {
					temp.before(button);
					return;
				}
			}

			// Second Attempt
			for (let i = index - 1; i >= 0; i--) {
				var temp = document.querySelector(order[i]);
				if (temp != null) {
					temp.after(button);
					return;
				}
			}

			// Third Attempt
			let buttons = document.querySelectorAll('p.text-link.text-footer div a.micro-button');
			let lastButton = buttons[buttons.length - 1];
			lastButton.after(button);
		},

		moveLinks() {
			const footer = document.querySelector('.text-link.text-footer');
			const buttons = footer.querySelectorAll('.micro-button.track-event');

			if (buttons != null && buttons.length > 0) {
				// Create a new div to hold the buttons
				const newHolder = letterboxd.helpers.createElement('div', {}, {
					['margin-top']: '5px'
				});
					// Create the 'More at' text
				const text = letterboxd.helpers.createElement('span', {
					class: 'text-footer-extra'
				});
				if (this.pageState.isMobile == false) {
					text.style['margin-left'] = '10px';
				}
				text.innerText = "More at ";
				//newHolder.append(text);

				// Append each button to new div
				buttons.forEach(button => {
					newHolder.append(button);
					if (letterboxd.storage.get('open-same-tab') === true) {
						button.setAttribute("target", "");
					}
				});


				// Get the duration
				var regex = new RegExp(/([0-9.,]+)(.+)(mins|min)/);
				var duration = footer.innerText.match(regex);

				// Save badges (adult)
				var badges = footer.querySelectorAll('.badge');

				// Save the report button
				if (this.loggedIn) {
					var report = footer.querySelector('.block-flag-wrapper');
					report.style['margin-left'] = '5px';
				}

				// Clear the footer
				footer.innerText = "";

				// Readd the report button
				if (this.loggedIn) {
					footer.prepend(report);
				}

				// Add the duration
				var hours = 0;
				if (duration != null) {
					var totalMinutes = parseFloat(letterboxd.helpers.cleanNumber(duration[1]));
					const minutes = totalMinutes % 60;
					hours = Math.floor(totalMinutes / 60);
					var format = hours + "h " + minutes + "m";

					// Create the new duration text
					const durationSpan = letterboxd.helpers.createElement('span', {
						class: 'text-footer-extra duration-extra tooltip-extra'
					});
					durationSpan.innerText = duration[0];
					durationSpan.setAttribute('data-original-title', format);
					footer.prepend(durationSpan);
				}

				badges.forEach(badge => {
					badge.style['margin-right'] = '10px';
					footer.prepend(badge);
				});

				// Append the new div
				footer.append(text);
				footer.append(newHolder);

				if (hours > 0) {
					letterboxd.helpers.addTooltipEvents(footer);
				}
				this.linksMoved = true;

				// Add Lost film badge
				if (this.wikiData.StateOfTransmission != null && this.lostBadgeAdded == false){
					this.addLostFilmBadge();
				}
			}
		},

		addDurationMobile() {
			if (document.querySelector(".extras-duration")) return

			const durationElement = document.querySelector(".trailerdurationgroup .duration");

			if (durationElement != null) {
				var regex = new RegExp(/([0-9.,]+)(.+)(mins|min)/);
				var duration = durationElement.textContent.match(regex);

				var totalMinutes = parseFloat(letterboxd.helpers.cleanNumber(duration[1]));
				const minutes = totalMinutes % 60;
				var hours = Math.floor(totalMinutes / 60);
				var format = hours + "h " + minutes + "m";

				durationElement.textContent += " (" + format + ")";

				durationElement.className += " extras-duration";

			}
			this.durationAdded = true;
		},

		addDate(date) {
			const year = document.querySelector('.productioninfo .releasedate');

			if (year != null) {
				year.setAttribute("data-original-title", date);
				if (this.dateAdded == false) {
					year.setAttribute("class", year.getAttribute("class") + " number-tooltip tooltip-extra")

					letterboxd.helpers.addTooltipEvents(year.parentNode);

					this.dateAdded = true;
				}
			}
		},

		addRating() {
			if (document.querySelector('.extras-rating')) return;

			// Correct the rating label, if needed (convert to modern, remove redunant labelling, get CNC labels)
			this.contentRating = letterboxd.helpers.correctContentRating(this.contentRating);

			// Add to the page
			try {
				if (this.pageState.isMobile) {
					const intro = document.querySelector('.details .credits .introduction');

					const rating = letterboxd.helpers.createElement('span', {
						class: 'introduction extras-rating extras-rating-mobile'
					});
					rating.innerText = this.contentRating;
					intro.before(rating);

				} else {
					const year = document.querySelector('.releasedate');

					const small = letterboxd.helpers.createElement('span', {
						class: 'extras-rating'
					});
					year.after(small);

					const p = letterboxd.helpers.createElement('span', {
					});
					p.innerText = this.contentRating;
					small.append(p);
				}
			} catch (error) {
				letterboxd.helpers.WriteConsoleLog('ERROR', `There was an error when adding the content rating! | Exception: ${error}`);
			}

			this.ratingAdded = true;
		},

		appendRating(rating, className) {
			var order = letterboxd.storage.get('ratings-order');

			var index = order.indexOf(className);
			var sidebar = document.querySelector('.sidebar');

			if (this.pageState.hideRatings === true) {
				sidebar = document.querySelector('.extras-ratings-holder');

				if (sidebar == null) {
					sidebar = this.createRatingsHolder();
				}
			}

			// First
			for (var i = index + 1; i < order.length; i++) {
				var temp = sidebar.querySelector(`.${order[i]}`);
				if (temp != null) {
					temp.before(rating);
					return;
				}
			}

			// Second
			for (var i = index - 1; i >= 0; i--) {
				var temp = sidebar.querySelector(`.${order[i]}`);
				if (temp != null) {
					temp.after(rating);
					return;
				}
			}

			// Third
			sidebar.append(rating);
		},

		createRatingsHolder(){
			if (document.querySelector('.extras-ratings-holder') != null) 
				return document.querySelector('.extras-ratings-holder');
			
			var currentSidebar = document.querySelector('.sidebar');
			
			var sidebar = letterboxd.helpers.createElement('div', {
				class: 'extras-ratings-holder',
				style: 'display: none'
			});
			currentSidebar.append(sidebar)

			const moreButton = letterboxd.helpers.createElement('a', {
				class: 'text-slug extras-show-more'
			});
			moreButton.innerText = "Show ratings";
			currentSidebar.append(moreButton)

			moreButton.addEventListener('click', event => {
				toggleAllRatings(event, letterboxd);
			});

			return sidebar;
		},

		createShowReviewsButton(){
			var reviewsSection = document.querySelector('.film-recent-reviews ');

			const moreButton = letterboxd.helpers.createElement('a', {
				class: 'text-slug extras-reviews-toggle'
			});
			moreButton.innerText = "Show reviews";
			reviewsSection.after(moreButton)

			moreButton.addEventListener('click', event => {
				toggleReviews(event, letterboxd);
			});
		},

		addLostFilmBadge(){
			this.lostBadgeAdded = true;

			// Add if state is 'lost' (Q122238711)
			if (this.wikiData.StateOfTransmission.includes("Q122238711")){
				// Create badge
				const badge = letterboxd.helpers.createElement('span', {
					class: 'badge',
					style: 'margin-right: 10px;'
				});
				badge.innerText = "Lost";

				// Add to page
				let durationNode = document.querySelector('.duration-extra');
				let adultBadgeNode = document.querySelector('.badge.-adult')
				let footerNode = document.querySelector('.text-link.text-footer')

				if (durationNode != null){
					durationNode.before(badge);
				}
				else if (adultBadgeNode != null){
					adultBadgeNode.after(badge);
				}
				else if (footerNode != null){
					footerNode.prepend(badge);
				}
			}
		}
	},

	search: {
		running: false,

		redirected: false,

		stopRunning() {
			this.running = false;
		},

		async init() {
			this.running = true;

			var referrer = document.referrer.replace('https://letterboxd.com', '');

			if (!referrer.startsWith('/search/') && !window.location.href.includes('/films/') && this.redirected == false) {
				this.redirected = true;
				window.location.replace(window.location.href.replace('/search/', '/search/films/'));
			}

			// Stop
			return this.stopRunning();
		}
	},

	helpers: {
		WriteConsoleLog(type, log) {
			if (type == "DEBUG" && letterboxd.storage.get('console-log') != true) {
				return;
			}

			if (type == "ERROR"){
				console.error(`Letterboxd Extras | ${type} | ${log}`);
			}
			else{
				console.log(`Letterboxd Extras | ${type} | ${log}`);
			}
		},

		ShowErrorMessage(message, id) {
			let errorHolder = document.querySelector('.extras-error-holder');

			// Create the error holder
			if (errorHolder == null){
				const div = letterboxd.helpers.createElement('div', {
					class: 'extras-error-div'
				});

				// The main 'button'
				const button = letterboxd.helpers.createElement('div', {
					class: 'extras-error-button text-slug'
				});
				div.append(button);

				const label = letterboxd.helpers.createElement('span', {
					class: 'extras-error-label'
				});
				label.innerText = 'Extras Error - Click to view';
				button.append(label);
				
				const badge = letterboxd.helpers.createElement('div', {
					class: 'extras-error-badge'
				});
				badge.innerText = '!';
				button.append(badge);

				// The ul element that will contain the error text
				errorHolder = letterboxd.helpers.createElement('ul', {
					class: 'extras-error-holder'
				});
				div.append(errorHolder);

				document.querySelector('body').append(div);

				button.addEventListener('click', event => {
					toggleErrorMessage(event);
				});

				// Create the settings link
				const li = letterboxd.helpers.createElement('li', {
					class: 'extras-error-settings-link'
				});
				const a = letterboxd.helpers.createElement('a', {});
				a.href = browser.runtime.getURL('/options.html');
				a.target = '_blank';
				a.innerText = 'Go to settings';
				li.append(a);

				errorHolder.append(li);
			}

			if (id != '' && errorHolder.querySelector(`.extras-error-${id}`) != null)
				return;
			
			const li = letterboxd.helpers.createElement('li', {
				class: `extras-error-${id}`
			});
			const span = letterboxd.helpers.createElement('span', {});
			span.innerText = message;
			li.append(span);
			errorHolder.querySelector('.extras-error-settings-link').before(li);

		},

		ValidateResponse(name, value){
			// Standard fetch response validation with standardized debug messages
			// should catch any issues and prevent any catastrophic errors

			if ( value != null && value.url != null && value.status != null) {
				this.WriteConsoleLog('DEBUG', `Fetch made to URL: ${value.url} | Response status: ${value.status}`);
			}

			var output = true;
			if (value == null || value.status == null){
				// Something went really wrong with the fetch
				this.WriteConsoleLog('ERROR', `There was an error with the ${name} call. Error unknown`);
				output = false;
			} else if (value.status == 202 && (value.response == null || value.response == "")){
				this.WriteConsoleLog('ERROR', `There was an error with the ${name} call. Site returned a 202 without a body, this is likely some anti-bot measures.`);
				output = false;
			} else if (value.status > 299 || value.status == 0){
				// Something went wrong, check for errors in the response
				if (value.errors != null && value.errors.length > 0){
					this.WriteConsoleLog('ERROR', `There was an error with the ${name} call. Message: ${value.errors[0]}`);
					if (value.errors[0].startsWith('No permission found matching url')){
						letterboxd.helpers.ShowErrorMessage('Letterboxd Extras is missing some permissions required for your selected options. View the settings to grant the permissions.', 'permissions');
					}
				}else{
					this.WriteConsoleLog('ERROR', `There was an error with the ${name} call. Code: ${value.status}`);
				}
				output = false;
			}		

			return output;
		},

		createSectionAccessory(section, text, href, style) {
			let accessorySection = section.querySelector('div.section-accessories');

			// Create the accessory section, if needed
			if (accessorySection == null){
				const aside = letterboxd.helpers.createElement('aside', {
					class: 'aside'
				});

				accessorySection = letterboxd.helpers.createElement('div', {
					class: 'section-accessories'
				});
				aside.append(accessorySection);

				section.querySelector('.section-header .section-heading')?.after(aside);
			}

			// Now create the actual accessory
			const accessory = letterboxd.helpers.createElement('a', {
				class: 'accessory'
			});

			if (text != '')
				accessory.innerText = text;

			if (href != '')
				accessory.href = href;
			
			if (style)
				accessory.style = style

			// Finally, let's add the newly create accessory to the section
			accessorySection.prepend(accessory);
		},

		parseWikiDataResult(data, tagName, currentValue){
			// Get from the data if it exists
			if (data[tagName] != null){
				return data[tagName].value;
			}

			// Return empty if it's null
			if (currentValue == null)
				return '';

			// Otherwise, return the original value
			return currentValue;
		},

		addTooltipEvents(element) {
			// Add the mouseover and mouseout events to each .tooltip-extra that is a child of the provided element
			element.querySelectorAll('.tooltip-extra').forEach(item => {
				item.addEventListener('mouseover', ShowTwipsy);
				item.addEventListener('mouseout', HideTwipsy);
			});
		},

		createShowDetailsButton(name, target){
			// Add the Show Details button
			const showDetails = letterboxd.helpers.createElement('a', {
				class: 'all-link more-link show-details ' + name + '-show-details',
				['target']: target
			});
			showDetails.innerText = "SHOW DETAILS";

			// Add click event
			showDetails.addEventListener('click', event => { toggleDetails(event, letterboxd.storage); });

			return showDetails;
		},

		/* getSensFilmQuery() {
			var query = `
					query ($id: Int!) {
						product(id: $id) {
							title
							rating
							dateRelease
							dateReleaseOriginal
							dateReleaseUS
							stats {
								ratingCount
								recommendCount
							}
							url
						}
					}
				`;
			return query;
		} */

		loadSvg(svgText) {
			const parsed = new DOMParser().parseFromString(svgText, "image/svg+xml");

			if (parsed.querySelector("parsererror")) {
				return null;
			}

  			return document.importNode(parsed.documentElement, true);
		},

		createElement(tag, attrs, styles) {
			const element = document.createElement(tag);
			for (const aKey in attrs) {
				if (!Object.prototype.hasOwnProperty.call(attrs, aKey)) continue;
				element.setAttribute(aKey, attrs[aKey]);
			}
			for (const sKey in styles) {
				if (!Object.prototype.hasOwnProperty.call(styles, sKey)) continue;
				element.style[sKey] = styles[sKey];
			}
			return element;
		},

		createElementNS(tag, namespace, attrs, styles) {
			const element = document.createElementNS(namespace, tag);
			for (const aKey in attrs) {
				if (!Object.prototype.hasOwnProperty.call(attrs, aKey)) continue;
				element.setAttribute(aKey, attrs[aKey]);
			}
			for (const sKey in styles) {
				if (!Object.prototype.hasOwnProperty.call(styles, sKey)) continue;
				element.style[sKey] = styles[sKey];
			}
			return element;
		},

		changeTomatoScoreMobile(event) {
			// Get the parent node
			const parent = event.target.parentNode.parentNode;
			// Grab the target score div and then the other non-target score div
			const targetNode = parent.querySelector('.toggle-score-display.disabled:not(.mobile-details-text)');
			const otherNode = parent.querySelector('.toggle-score-display:not(.disabled):not(.mobile-details-text)');

			// Hide the current visible score, display the current hidden score
			otherNode.style.display = 'none';
			targetNode.style.display = 'block';

			// Changed the text of the button
			let text = '';
			const targetClass = targetNode.getAttribute('class');
			if (targetClass.includes('score-critic-all') || targetClass.includes('score-audience-all')) {
				text = 'ALL';
			} else if (targetClass.includes('score-critic-top')) {
				text = 'TOP';
			} else if (targetClass.includes('score-audience-verified')) {
				text = 'VERIFIED';
			}
			event.target.innerText = text;

			// Swap .disabled class on the scores
			otherNode.className += ' disabled';
			targetNode.className = targetNode.className.replace(' disabled', '');
		},

		changeTomatoScore(event) {
			// Get the target class stored in the 'target' attribute of the clicked button
			const target = `.${event.target.getAttribute('target')}`;
			let parent = event.target.parentNode.parentNode;
			// Grab the target score div and then the other non-target score div
			let targetNodes = parent.querySelectorAll(`.toggle-score-display${target}`);
			let otherNodes = parent.querySelectorAll(`.toggle-score-display:not(${target})`);

			// Hide the current visible score, display the current hidden score
			otherNodes.forEach(element => {
				element.style.display = 'none';
			});
			targetNodes.forEach(element => {
				element.style.display = 'block';
			});

			// Adjust the visibility of mobile-details-text
			if (target.includes('score-critic-') || target.includes('score-audience-')) {
				const bits = target.split('-');
				const baseTarget = `${bits[0]}-${bits[1]}`;
				parent = parent.parentNode; 

				targetNodes = parent.querySelectorAll(`.toggle-score-display${baseTarget}.mobile-details-text${target}`);
				otherNodes = parent.querySelectorAll(`.toggle-score-display${baseTarget}.mobile-details-text:not(${target})`);

						// Hide the current visible score, display the current hidden score
				otherNodes.forEach(element => {
					element.style.display = 'none';
				});
				targetNodes.forEach(element => {
					element.style.display = 'block';
				});
			}

			// Swap .selected class on the buttons
			const otherButton = event.target.parentNode.querySelector('.selected');
			event.target.className += ' selected';
			otherButton.className = otherButton.className.replace(' selected', '');

		},

		/**
	 		* Builds a toggle button that allows you to toggle between two different rating views.
	 		*
	 		* @param {Object} options
	 		* @param {string} type The class name of the button (which will reflect the button type)
	 		* @param {string} text The text in the toggle button
	 		* @param {string} target - The target class name of the element the button will modify.
	 		* @param {boolean} selected - If the button is selected by default.
	 		* @param {disabled} disabled - If the button is disabled by default.
	 		* @param {string} isMobile - An isMobile flag.
	 		* @returns {HTMLSpanElement}
	 		* @private
	 	*/
		createToggleButton(type, text, target, selected, disabled, isMobile) {
			if (target.includes(',')) {
				var targets = target.split(',');
				target = targets[0];
				var targetOther = targets[1];
			} else {
				var targetOther = "";
			}

			const button = letterboxd.helpers.createElement('span', {
				class: 'toggle-button ' + type,
				['target']: target,
				['targetOther']: targetOther
			});
			if (selected) { 
				button.className += " selected";
			}
			if (disabled) {
				button.className += " disabled";
			}
			if (isMobile) {
				button.className += " extras-mobile";
			}
			button.innerText = text;
				
			// Add click event
			if (disabled == false){
				if (isMobile && !type.includes('allo')){
					button.addEventListener('click', event => { letterboxd.helpers.changeTomatoScoreMobile(event); });
				} else if (disabled == false){
					button.addEventListener('click', event => { letterboxd.helpers.changeTomatoScore(event); });
				}
			}

			return button;
		},

		createDetailsRow(headerText, value, currency, togetherWith) {
			// Determine className
			let className = "";
			switch (headerText) {
				case "Budget":
					className = "budget";
					break;
				case "Box Office (US)":
					className = "box-office-us";
					break;
				case "Box Office (WW)":
					className = "box-office-ww";
					break;
			}

			// Determine Currency
			if (currency == null || currency == "")
				currency = "USD";

			// Set value to localeString
			if (!value.startsWith("$") && value != "") {
				value = Number(value).toLocaleString('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 2 })

				switch (currency) {
					case "DER": // Manually handle Reichsmark (no valid ISO 4217 code)
						value = value.replace('DER', '').trim();
						value += " ℛℳ";
						break;
				}
			}

			let sharedEl = null;
			if (togetherWith != null && togetherWith != "") {
				sharedEl = letterboxd.helpers.createElement('a', {
					href: `/film/${togetherWith}`
				});
				sharedEl.innerText = "(Shared)";
			}

			// Check if already added to the page
			if (document.querySelector(`.${className}`) != null) {
				// Replace the exising value
				const p = document.querySelector(`.${className} p`);
				p.innerText = value;

				// Add the shared togetherwith link
				if (sharedEl != null) {
					p.after(sharedEl);
				}

			} else {
				// Add new details row
				// Create the Elements
				//********************************************
				// Create the row header element				
				const header = letterboxd.helpers.createElement('h3', {
					class: `${className} header`
				});

				// Span
				const span = letterboxd.helpers.createElement('span', {});
				span.innerText = headerText;
				header.append(span);

				// Create the list element
				const detail = letterboxd.helpers.createElement('div', {
					class: `text-indentedlist ${className} detail`
				});

				// Text holder
				const p = letterboxd.helpers.createElement('p', {});
				p.innerText = value;
				detail.append(p);

				// Add the shared togetherwith link
				if (sharedEl != null) {
					detail.append(sharedEl);
				}

				// Append to the Tab Details
				//********************************************
				const order = [
					'budget',
					'box-office-us',
					'box-office-ww'
				];

				// Get the details tab
				const tabDetails = document.querySelector('#tab-panel-details');

				let index = order.indexOf(className);

				// First Attempt
				for (let i = index + 1; i < order.length; i++) {
					let tempHeader = document.querySelector(`.${order[i]}.header`);
					let tempDetail = document.querySelector(`.${order[i]}.detail`);

					if (tempHeader && tempDetail) {
						tempHeader.before(header);
						header.after(detail);
						return;
					}
				}

				// Second Attempt
				for (let i = index - 1; i >= 0; i--) {
					let tempHeader = document.querySelector(`.${order[i]}.header`);
					let tempDetail = document.querySelector(`.${order[i]}.detail`);

					if (tempHeader && tempDetail) {
						tempDetail.after(header);
						header.after(detail);
						return;
					}
				}

				// Third Attempt
				tabDetails.append(header);
				tabDetails.append(detail);
			}
		},

		createHistogram(storage, type, url, rating, count, votes, percents, highest) {

			// Create the initial structure for the graph
			const histogram = this.createElement('div', {
				class: 'rating-histogram rating-histogram-extras'
			});
			const layoutDiv = this.createElement('div', {
				class: 'layout'
			});
			histogram.append(layoutDiv);


			// Create the score
			//*********************************************/
			let convertRatings = (storage.get('convert-ratings') === '5');
			let convert10Point = (storage.get('convert-ratings') === '10');
			let suffix = '/10';
			let ratingTooltip = '';
			let ratingText = '';

			if (rating != "N/A") {
				// Convert the score if needed
				if (convertRatings === true) {
					if (type == "anilist") {
						rating = (Number(rating) / 20).toFixed(1);
					} else {
						rating = (Number(rating) / 2).toFixed(1);
					}
					suffix = "/5";
				} else if (type == "anilist") {
					suffix = "/100";
				} else if (type == "allocine") {
					if (convert10Point) {
						rating = (Number(rating) * 2).toFixed(1);
						suffix = "/10";
					} else {
						rating = Number(rating).toFixed(1);
						suffix = "/5";
					}
				} else {
					rating = Number(rating).toFixed(1);
					suffix = "/10";
				}

				// Create tooltip text
				ratingTooltip = 'Weighted average of ' + rating + suffix + ' based on ' + count.toLocaleString() + ' ratings'
			}
			
			if (rating == "N/A") {
				ratingText = "N/A";
			} else if (type === "anilist" && convertRatings == false) {
				ratingText = rating + "%";
			} else {
				ratingText = rating;
			}

			const scoreElement = this.createElement('a', {
				class: 'average-rating tooltip averagerating tooltip imdb-score tooltip-extra',
				href: url,
				['data-original-title']: ratingTooltip
			});
			scoreElement.innerText = ratingText;


			// Create the histogram bar graph
			//*********************************************/
			const table = this.createElement('table', {
				class: 'chart'
			});
			const tbody = this.createElement('tbody', {
				class: 'plot'
			});
			table.append(tbody);

			for (var ii = 0; ii < votes.length; ii++) {

				// Determine vote counts and percentages
				if (type === "mal") {
					var voteCount = votes[ii].votes;
					var percentage = votes[ii].percentage;
				} else if (type === "anilist") {
					var voteCount = votes[ii].amount;
					var percentage = (voteCount / count * 100).toFixed(1);
				} else {
					var voteCount = votes[ii];
					var percentage = percents[ii];
				}
				
				// Determine Suffixes
				let currentRatingsSuffix = letterboxd.overview.ratingsSuffix.map((x) => x);
				if (type === "anilist" && storage.get('convert-ratings') === false) {
					currentRatingsSuffix = ['10/100', '20/100', '30/100', '40/100', '50/100', '60/100', '70/100', '80/100', '90/100', '100/100'];
				} else if (type === "allocine") {
					currentRatingsSuffix = ['0-★', '★', '★★', '★★★', '★★★★', '★★★★★'];
				}


				// Determine rating type (rating vs review)
				let ratingType = "ratings";
				if (type == "allocine") {
					ratingType = "reviews";
				}

				let tooltip = `${voteCount.toLocaleString()} ${currentRatingsSuffix[ii]} ${ratingType} (${percentage.toString()}%)`
				let href = '';

				// IMDb reviews link
				if (type == "imdb") {
					href = url.replace('/ratings/', '/reviews/?rating=' + (ii + 1).toString());
				} else if (type == "allocine") {
					href = url + "star-" + ii;
				} else {
					href = url;
				}
				
				// Now create the actual element
				let percent = voteCount / highest;
				const tr = this.createElement('tr', {
					class: 'column',
					style: `--value: ${percent};`
				});

				const td = this.createElement('td', {
					class: 'cell'
				});
				tr.append(td);

				const a = this.createElement('a', {
					class: `barcolumn tooltip ${type} tooltip-extra`,
					['data-original-title']: tooltip,
					href: href
				});
				td.append(a);
				
				const spanBar = this.createElement('span', {
					class: 'bar'
				});
				a.append(spanBar);
				
				const spanFill = this.createElement('span', {
					class: 'fill'
				});
				spanBar.append(spanFill);

				// Add to the graph
				tbody.append(tr);
			}

			// Create the stars
			//*********************************************/
			const svgStart = this.createLetterboxd1Stars(type);
			const svgEnd = this.createLetterboxd5Stars(type);


			// Finalize the element in the correct order
			//*********************************************/
			layoutDiv.append(svgStart);
			layoutDiv.append(table);
			layoutDiv.append(svgEnd);
			layoutDiv.append(scoreElement);

			return histogram;
		},

		createLetterboxd1Stars(type){
			// Create the ★
			const svg = this.createElementNS('svg', 'http://www.w3.org/2000/svg', {
				class: `glyph stars -start -rating stars-extra stars-${type}`,
				role: 'graphics-symbol',
				width: '9',
				height: '9',
				viewBox: '0 0 9 9',
				['aria-label']: '★'
			});
			svg.append(this.createLetterboxdStarPath(0));

			return svg;
		},

		createLetterboxd5Stars(type){
			// Create the ★★★★★
			const svg = this.createElementNS('svg', 'http://www.w3.org/2000/svg', {
				class: `glyph stars -end -rating stars-extra stars-${type}`,
				role: 'graphics-symbol',
				width: '49',
				height: '9',
				viewBox: '0 0 49 9',
				['aria-label']: '★★★★★'
			});
			for (var ii = 0; ii < 5; ii++){
				svg.append(this.createLetterboxdStarPath(ii));
			}

			return svg;
		},

		createLetterboxdStarPath(ii){
			const path = this.createElementNS('path', 'http://www.w3.org/2000/svg', {
				transform: `translate(${ii * 10}, 0)`,
				['fill-rule']: 'evenodd',
				d: 'M5.065.45c-.22-.61-.95-.59-1.14 0l-.75 2.57H.705c-.73 0-.96.62-.37 1.07l1.99 1.53-.76 2.49c-.22.73.34 1.16.93.71l2-1.53 2 1.53c.59.45 1.15.02.93-.71l-.76-2.49 1.99-1.53c.59-.45.39-1.07-.33-1.07h-2.48z'
			});

			return path;
		},

		createAllocineCriticScore(type, rating, count, reviewCount, url, isMobile) {
			// The span that holds the score
			var style = "display: inline-block; margin-right: 5px;";
			if (type == "ratings-style") {
				style = "display: block;"
			}

			var className = 'allocine-critic';
			if (type == "filmarks")
				className = 'filmarks';

			const scoreSpan = this.createElement('span', {
				class: className,
				style: style
			});

			var convert10Point = (letterboxd.storage.get('convert-ratings') === "10");
			var suffix = "/10";
			var tooltip = "";
			if (rating == 0) {
				tooltip = "0 ratings";
			} else {
				// Convert the score if needed
				if (convert10Point) {
					rating = Number(rating) * 2;
					suffix = "/10";
				} else {
					suffix = "/5";
				}
				// Create tooltip text
				tooltip = 'Weighted average of ' + rating + suffix + ' based on ' + count.toLocaleString() + ' ratings'
				if (reviewCount != null)
					tooltip += " (" + reviewCount.toLocaleString() + " reviews)";
			}

			// The element that is the score itself
			style = '';
			if (type == "ratings-style") {
				style = 'line-height: 28px; width: 100%; margin-left: 0px !important;';
			}

			const scoreElement = this.createElement('a', {
				class: 'tooltip display-rating -highlight allocine-critic-score tooltip-extra',
				style: style,
				href: url,
				['data-original-title']: tooltip
			});

			if (rating == "0") {
				scoreElement.innerText = "--";
			} else {
				scoreElement.innerText = rating.toFixed(1);
			}

			scoreSpan.append(scoreElement);

			return scoreSpan;
		},

		createDynamicStars(type, rating) {
			var holder = letterboxd.helpers.createElement('div', {
				class: `dynamic-star-holder ${type}-stars`
			});

			// Create the background stars
			const svgBacking = this.createElementNS('svg', 'http://www.w3.org/2000/svg', {
				class: `glyph stars -end -rating stars-extra stars-background`,
				role: 'graphics-symbol',
				width: '49',
				height: '9',
				viewBox: '0 0 49 9'
			},{
				position: 'absolute',
			});
			for (var ii = 0; ii < 5; ii++){
				svgBacking.append(this.createLetterboxdStarPath(ii));
			}
			holder.append(svgBacking);

			rating = letterboxd.helpers.roundHalf(rating);

			// Star front
			// determine width
			let totalWidth = 49;
			let rounded = (Math.round(rating * 2) / 2).toFixed(1); // round to the nearest .5
			let percent = rounded / 5
			let width = totalWidth * percent;

			//let starWidth = totalWidth / 5;
			//var width = starWidth * Math.floor(rating) + Math.floor(rating);
			//if (rating > Math.floor(rating)) {
			//	width += starWidth / 2;
			//}

			const div = this.createElement('div', {
			},{
				height: '9',
				position: 'absolute',
				overflow: 'hidden',
				width: `${width}px`
			});

			const svgFront = this.createElementNS('svg', 'http://www.w3.org/2000/svg', {
				class: `glyph stars -end -rating stars-extra stars-${type}`,
				role: 'graphics-symbol',
				width: totalWidth,
				height: '9',
				viewBox: '0 0 49 9'
			},{
				display: 'block',
			});
			for (var ii = 0; ii < 5; ii++){
				svgFront.append(this.createLetterboxdStarPath(ii));
			}
			div.append(svgFront);

			holder.append(div);

			return holder;
		},

		createDetailsText(type, section, tooltip, isMobile) {
			const detailsSpan = letterboxd.helpers.createElement('span', {
				class: type + '-score-details mobile-details-text'
			});
			if (letterboxd.storage.get('tooltip-show-details') != true) {
				detailsSpan.style['display'] = 'none';
			}

			const detailsText = letterboxd.helpers.createElement('p', {
			});
			detailsText.innerText = tooltip;
			detailsSpan.append(detailsText);

			if (isMobile || letterboxd.storage.get('tooltip-show-details') === true) {
				section.append(detailsSpan);
			}
		},

		roundHalf(num) {
			return Math.round(num * 2) / 2;
		},

		parseHTML(html) {
			var parser = new DOMParser();
			return parser.parseFromString(html, "text/html");
		},

		createChartSectionElement(sectionID) {
			return this.createElement('section', {
				class: `extras-section ratings-histogram-chart ${sectionID}-ratings ratings-extras`
			});
		},

		createChartSectionHeader(headerStyle) {

			const headerProps = {
				class: 'section-heading section-heading-extras',
				...(headerStyle ? {style: headerStyle} : {} )
			}

			const heading = this.createElement('h2', headerProps);
			return heading;

		},

		createChartSectionLogoHolder(sectionID, logoProps) {

			const logoHolder = letterboxd.helpers.createElement('a', {
				class: `logo-${sectionID}`,
				href: logoProps.href,
				style: logoProps.style
			});

			if (logoProps.svg){
				logoHolder.append(logoProps.svg);
			}

			return logoHolder;

		},

		createChartSection(sectionID, logoProps, headerStyle) {

			const chartSection = this.createChartSectionElement(sectionID);
			const heading = this.createChartSectionHeader(headerStyle);
			chartSection.append(heading);

			const logoHolder = this.createChartSectionLogoHolder(sectionID, logoProps);
			heading.append(logoHolder);

			if (letterboxd.overview.pageState.isMobile) {
				// Add the Show Details button
				const showDetails = letterboxd.helpers.createShowDetailsButton(sectionID, `${sectionID}-score-details`);
				chartSection.append(showDetails);
			}

			return chartSection;

		},

		cleanNumber(value) {
			value = value.replaceAll(',', '');
			value = value.replaceAll('.', '');
			value = value.replaceAll(' ', '');
			value = value.replaceAll('$', '');
			value = value.replaceAll(' ', '');

			return value;
		},

		correctContentRating(rating) {
			// Adjust CNC (france) ratings to a readable format (cannot use wikidata label because they are too long)
			switch (rating) {
				case "http://www.wikidata.org/entity/Q23817729":
					rating = "TP";
					break;
				case "http://www.wikidata.org/entity/Q23817740":
					rating = "12";
					break;
				case "http://www.wikidata.org/entity/Q23817741":
					rating = "16";
					break;
				case "http://www.wikidata.org/entity/Q23817742":
					rating = "18";
					break;
				case "http://www.wikidata.org/entity/Q23926014":
				case "http://www.wikidata.org/entity/Q23925995":
					rating = "X";
					break;
				case "http://www.wikidata.org/entity/Q23837002":
					rating = "P";
					break;
				case "http://www.wikidata.org/entity/Q23817739":
					rating = "!";
					break;
			}

			// Adukst KMRB (South Korea)
			if (letterboxd.contentRatingSystem == 'kmrb'){
				switch (rating) {
					case "Adults only":
						rating = "18";
						break;
					case "Restricted":
						rating = "19";
						break;
				}
			}

			// Remove redundant labels
			rating = rating.replace('certificate', ''); 
			rating = rating.replace('FSK', '');

			// Convert to modern equivalent, if enabled
			if (letterboxd.storage.get('mpa-convert') === true) {
				if (this.contentRatingSystem == 'mpa'){
					switch (rating) {
						case "GP":
						case "M":
						case "M/PG":
							rating = "PG";
							break;
						case "X":
							rating = "NC-17";
							break;
					}
				}
				else if (this.contentRatingSystem == 'bbfc'){
					switch (rating) {
						case "Uc":
							rating = "U";
							break;
						case "E":
							rating = "U";
							break;
						case "A":
							rating = "PG";
							break;
						case "AA":
							rating = "15";
							break;
						case "X":
							rating = "18";
							break;
						case "H":
							rating = "18";
							break;
					}
				}
			}

			return rating;
		},

		createTableRow(table, label, value1, value2, value3) {
			var row = table.insertRow();

			var cell1 = row.insertCell();
			cell1.setAttribute('class', 'extras-header');
			var cell2 = row.insertCell();
			cell2.setAttribute('class', 'extras-value');

			// Add label cell
			cell1.appendChild(document.createTextNode(label));

			// Add value cells
			var div1 = this.createElement("div", { class: 'extras-table-value' })
			div1.innerText = value1;
			cell2.appendChild(div1);

			if (value2 != null) {
				var div2 = this.createElement("div", { class: 'extras-table-value' })
				div2.innerText = value2;
				cell2.appendChild(div2);
			}

			if (value3 != null) {
				var div3 = this.createElement("div", { class: 'extras-table-value' })
				div3.innerText = value3;
				cell2.appendChild(div3);
			}
		},

		getDateOptions(precision) {
			/* Using the WikiData Date Precision values:
				0 - billion years
				1 - hundred million years
				6 - millennium
				7 - century
				8 - decade
				9 - year
				10 - month
				11 - day
				12 - hour
				13 - minute
				14 - second
				*/

			if (precision == 9) {
				return { year: 'numeric', timeZone: 'UTC' }
			} else if (precision == 10) {
				return { year: 'numeric', month: 'short', timeZone: 'UTC' };
			} else {
				return { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
			}
		},

		getWikiButtonLabel(url){

			let browserLocale = window.navigator.language;
			if (browserLocale.length > 2){
				browserLocale = browserLocale.substring(0, 2);
			}

			let regex = new RegExp(/https:\/\/([a-z]+)\.wikipedia\.org/);
			let found = url.match(regex);

			if (found){
				// In my extremely biased opinion, english is the default
				// So we don't need to show the language if the user's locale is english, or the user has enabled prefer english
				if (browserLocale == 'en' || letterboxd.storage.get('wiki-prefer-en') === true){
					return 'WIKI';
				}

				return `${found[1]} WIKI`;
			}

			return 'WIKI';
		}
	},

	storage: {
		data: {},
		localData: {},

		syncInitilized: false,
		localInitilized: false,

		async init() {
			this.data = await browser.storage.sync.get('options').then(function (storedSettings) {
				return storedSettings.options;
			});
			this.syncInitilized = true;
		},

		async initLocal() {
			this.localData = await browser.storage.local.get('options').then(function (storedSettings) {
				return storedSettings.options;
			});
			this.localInitilized = true;
		},

		// Sync
		get(key) {
			return this.data[key];
		},
		set(key, value) {
			this.data[key] = value;
			browser.storage.sync.set(this.data);
		},

		// Local
		localGet(key) {
			return this.localData[key];
		},
		localSet(key, value) {
			this.localData[key] = value;
			return browser.storage.local.set({ options: this.localData });
		}
	}
};

const defaultArgs = [letterboxd.storage, letterboxd.helpers, letterboxd.overview.pageState];

// Initialize helpers and modules
const moduleConfigs = [
	{ class: LetterboxdPerson, target: letterboxd, property: 'person', args: [letterboxd.wiki] },
	{ class: LetterboxdGeneral, target: letterboxd, property: 'general', args: [] },
	{ class: AnilistHelper, target: letterboxd.overview, property: 'anilistHelper', args: [letterboxd.overview.ratingsSuffix] },
	{ class: MubiHelper, target: letterboxd.overview, property: 'mubiHelper', args: [] },
	{ class: FilmAffinityHelper, target: letterboxd.overview, property: 'filmAffinityHelper', args: [] },
	{ class: KinopoiskHelper, target: letterboxd.overview, property: 'kinopoiskHelper', args: [] },
	{ class: DoubanHelper, target: letterboxd.overview, property: 'doubanHelper', args: [] },
	{ class: AllocineHelper, target: letterboxd.overview, property: 'allocineHelper', args: [] },
	{ class: SensCritiqueHelper, target: letterboxd.overview, property: 'sensHelper', args: [] },
	{ class: DoesTheDogDieHelper, target: letterboxd.overview, property: 'doesTheDogDieHelper', args: [] },
	{ class: FilmarksHelper, target: letterboxd.overview, property: 'filmarksHelper', args: [] },
	{ class: CinemascoreHelper, target: letterboxd.overview, property: 'cinemascoreHelper', args: [] },
	{ class: BoxOfficeMojoHelper, target: letterboxd.overview, property: 'mojoHelper', args: [] },
	{ class: SimklHelper, target: letterboxd.overview, property: 'simklHelper', args: []},
	{ class: MyAnimeListHelper, target: letterboxd.overview, property: 'myAnimeListHelper', args: [letterboxd.overview.ratingsSuffix] },
	{ class: CriterionHelper, target: letterboxd.overview, property: 'criterionHelper', args: [] },
	{ class: MetacriticHelper, target: letterboxd.overview, property: 'metaHelper', args: [] },
	{ class: RankingHelper, target: letterboxd.overview, property: 'rankingHelper', args: [] },
	{ class: RottenTomatoesHelper, target: letterboxd.overview, property: 'tomatoHelper', args: [] },
	{ class: IMDBHelper, target: letterboxd.overview, property: 'imdbHelper', args: [] },
	{ class: CastHelper, target: letterboxd.overview, property: 'castHelper', args: [] },
];

moduleConfigs.forEach(config => {
	if (typeof config.class !== 'undefined') {
		config.target[config.property] = new config.class(...defaultArgs, ...config.args);
	}
});

letterboxd.storage.init();
letterboxd.storage.initLocal();

const observer = new MutationObserver(() => {

	if (window.location.hostname === 'letterboxd.com') {
		if (window.location.pathname.startsWith('/film/') && 
			!window.location.pathname.includes("/ratings/") && 
			!window.location.pathname.includes("/members/") && 
			!window.location.pathname.includes("/fans/") && 
			!window.location.pathname.includes("/likes/") && 
			!window.location.pathname.includes("/reviews/") && 
			!window.location.pathname.includes("/lists/")) {
			letterboxd.overview.init();
		}
		else if (window.location.pathname.startsWith('/search/')) {
			if (letterboxd.storage.get('search-redirect') === true) {
				letterboxd.search.init();
			}
		} else if (window.location.pathname.startsWith('/actor/') ||
				window.location.pathname.startsWith('/director/') ||
				window.location.pathname.startsWith('/writer/') ||
				window.location.pathname.startsWith('/producer/') ||
				window.location.pathname.startsWith('/executive-producer/') ||
				window.location.pathname.startsWith('/additional-directing/') ||
				window.location.pathname.startsWith('/original-writer/') ||
				window.location.pathname.startsWith('/casting/') ||
				window.location.pathname.startsWith('/editor/') ||
				window.location.pathname.startsWith('/cinematography/') ||
				window.location.pathname.startsWith('/additional-photography/') ||
				window.location.pathname.startsWith('/production-design/') ||
				window.location.pathname.startsWith('/art-direction/') ||
				window.location.pathname.startsWith('/set-decoration/') ||
				window.location.pathname.startsWith('/special-effects/') ||
				window.location.pathname.startsWith('/visual-effects/') ||
				window.location.pathname.startsWith('/stunts/') ||
				window.location.pathname.startsWith('/composer/') ||
				window.location.pathname.startsWith('/sound/') ||
				window.location.pathname.startsWith('/costume-design/') ||
				window.location.pathname.startsWith('/makeup/') ||
				window.location.pathname.startsWith('/hairstyling/') ||
				window.location.pathname.startsWith('/choreography/')
		) {
			letterboxd.person.init();
		}
		else {
			letterboxd.general.init();
		}
	}
});

observer.observe(document, { childList: true, subtree: true });
