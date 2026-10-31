/* eslint-disable */

import { LOAD_STATES } from './constants';
import { AnilistHelper } from './helpers/AnilistHelper';
import { MubiHelper} from './helpers/MubiHelper';
import { FilmAffinityHelper } from './helpers/FilmAffinityHelper';
import { LetterboxdPerson } from './letterboxd-person';
import { LetterboxdGeneral } from './letterboxd-general';
import { KinopoiskHelper } from './helpers/KinopoiskHelper';
import { SimklHelper } from './helpers/SimklHelper';
import { MyAnimeListHelper } from './helpers/MyAnimeListHelper';
import { DoubanHelper } from './helpers/DoubanHelper';
import { CriterionHelper } from './helpers/CriterionHelper';
import { MetacriticHelper } from './helpers/MetacriticHelpers';
import { RankingHelper } from './helpers/RankingHelper';
import { RottenTomatoesHelper } from './helpers/RottenTomatoesHelper';
import { SensCritiqueHelper } from './helpers/SensCritiqueHelper';
import { CinemascoreHelper } from './helpers/CinemascoreHelper';
import { CastHelper } from './helpers/CastHelper';
import { PlexHelper } from './helpers/PlexHelper';
import { FilmwebHelper } from './helpers/FilmwebHelper';

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
		imdbData: { state: 0, url: "", data: null, raw: null, data2: null, rating: "", num_ratings: "", highest: 0, votes: new Array(10), percents: new Array(10), isMiniSeries: false, isTVEpisode: false, mpaa: null },

		// TMDB
		tmdbID: '',
		tmdbTV: false,

		// Mojo
		mojoData: { state: 0, url: "", data: null, budget: "", boxOfficeUS: "", boxOfficeWW: "", mpaaRating: null, added: false },

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
			US_Title: null, Alt_Title: null, TV_Start: null, TV_End: null, AniDB_ID: null, AniList_ID: null, MAL_ID: null,
			Mubi_ID: null, Mubi_URL: null,
			FilmAffinity_ID: null, FilmAffinity_URL: null,
			SensCritique_ID: null, SensCritique_URL: null,
			Kinopoisk_ID: null,
			MDL_ID: null,
			StateOfTransmission: null,
			Plex_ID: null
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

		// They Shoot Pictures ranking
		tspdt: { state: 0, data: null, raw: null, found: false, ranking: null, listURL: null },
		theyShootPicturesHelper: null,

		// BFI Sight and Sound
		bfi: { state: 0, data: null, raw: null, found: false, ranking: null, listIndex: null },
		bfiHelper: null,

		// Allocine
		allocine: { state: 0, user: { data: null, raw: null, rating: null, num_ratings: 0, num_reviews: 0, highest: 0, votes: new Array(6), percents: new Array(6) }, critic: { data: null, raw: null, rating: null, num_ratings: 0 }, url: null, urlUser: null, urlCritic: null },
		allocineHelper: null,

		// Douban
		doubanHelper: null,

		// MyDramaList
		myDramaListHelper: null,

		// Criterion
		criterionHelper: null,

		// SIMKL
		simklHelper: null,

		// Does the Dog Die (ddd)
		ddd: { state: 0, data: null, id: null, url: null, added: false },
		doesTheDogDieHelper: null,

		// Filmarks
		filmarks: { state: LOAD_STATES['Uninitialized'], data: null, id: null, movie: null, url: null, rating: null, num_ratings: 0 },
		filmarksHelper: null,

		// Blu-ray.com
		bluray: { id: null, url: null },

		// RogerEbert.com
		ebert: { id: null, url: null },
		
		// Trakt.tv
		trakt: { id: null, url: null },

		// Plex Helper
		plexHelper: null,

		// Filmweb.pl Helper
		filmwebHelper: null,

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
			if (this.altTitleList == null && this.altTitleError == false && document.querySelector("div#tab-details") != null){
				try {
					// Collect Alternate Title List
					var altTitleList = document.querySelector('div.text-indentedlist p')
					if (altTitleList != null) {
						this.altTitleList = altTitleList.innerText.split(', ');
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

			// Init the PlexHandler
			if (this.plexHelper.loadState == LOAD_STATES['Uninitialized'] && document.querySelector('li.panel-sharing') != null){
				this.plexHelper.initialize();
			}

			if (this.pageState.filmWatched != null){
				// Add Cinema Score
				if (this.cinemascoreHelper.loadState == LOAD_STATES['Uninitialized'] && this.letterboxdTitle != null && this.letterboxdYear != null && document.querySelector('.sidebar') != null) {
					this.cinemascoreHelper.searchData(this.letterboxdTitle, [ this.letterboxdYear ], this.tmdbTV);
				}

				if (this.imdbID != "" && this.imdbData.state < 1) {
					// Call IMDb and Add to page when done
					if (letterboxd.storage.get('imdb-enabled') === true || letterboxd.storage.get('imdb-250-enabled') === true || letterboxd.storage.get('cast-extras-enabled') === true) {
						this.imdbData.state = 1;

						let options = letterboxd.helpers.getImdbQuery(this.imdbID);
						browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: 'https://api.graphql.imdb.com/', options: options }, (value) => {
							if (letterboxd.helpers.ValidateResponse("IMDb Ratings", value) == false){
								return;
							}

							if (value.response != null && value.response.data != null){
								this.imdbData.data = value.response.data;

								if (letterboxd.storage.get('imdb-enabled') === true){
									this.addIMDBScore();
								}
								
								if (letterboxd.storage.get('imdb-250-enabled') === true && this.rankingHelper.imdbData.loadState == LOAD_STATES['Uninitialized']){
									this.collectIMDBRank();
									this.rankingHelper.createRanking(this.rankingHelper.imdbData);
								}
								
								if (letterboxd.storage.get('cast-extras-enabled') === true) {
									this.castHelper.render(this.imdbData.data, this.loggedIn);
								}
							}
							this.imdbData.state = 2;
						});
					}

					// Add BoxOfficeMojo Link
					let mojoURL = 'https://www.boxofficemojo.com/title/' + this.imdbID + '/';
					if (letterboxd.storage.get('mojo-link-enabled') === true) {
						this.addLink(mojoURL, 'MOJO', 'mojo');
					}
					// Call BoxOfficeMojo
					if (letterboxd.storage.get('display-budget') === true && letterboxd.storage.get('use-mojo') === true){
						browser.runtime.sendMessage({ name: "GETDATA", url: mojoURL }, (value) => {
							this.mojoData.state = 1;
							if (letterboxd.helpers.ValidateResponse("BoxOfficeMojo", value) == false){
								this.mojoData.state = 3;
								return;
							}

							if (value.response != null){
								this.mojoData.data = letterboxd.helpers.parseHTML(value.response);
								this.addBoxOffice();

								// If the domestic date was found on Mojo, add it now
								if (this.filmDate.date != null && this.dateAdded == false)
									this.addDate(this.filmDate.date);

								this.mojoData.state = 2;
							}else{
								this.mojoData.state = 3;
							}
						});
					}
				}
				if (this.imdbID != '' || this.tmdbID != '') {
					// Call WikiData
					if (this.wikiData.state < 1) {
						var queryString = letterboxd.helpers.getWikiDataQuery(this.imdbID, this.tmdbID, this.letterboxdID, this.tmdbTV, 'MAIN', 'en');
						var queryStringDate = letterboxd.helpers.getWikiDataQuery(this.imdbID, this.tmdbID, this.letterboxdID, this.tmdbTV, 'DATE', 'en');

						this.wikiData.state = 1;
						browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: queryString.url, options: queryString.options }, (data) => {
							if (letterboxd.helpers.ValidateResponse("WikiData", data) == false){
								return;
							}

							var value = data.response;
							if (value != null && value.results != null && value.results.bindings != null && value.results.bindings.length > 0) {
								this.wiki = value.results.bindings[0];

								if (this.wiki != null){
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
									if (letterboxd.storage.get('display-budget') === true){
										if (this.wiki != null && this.wiki.Budget != null && this.wiki.Budget.value != null) {
											this.wikiData.budget.value = this.wiki.Budget.value;
											if (this.wiki.Budget_UnitLabel != null)
												this.wikiData.budget.currency = this.wiki.Budget_UnitLabel.value;
											if (this.wiki.Budget_TogetherWith != null)
												this.wikiData.budget.togetherWith = this.wiki.Budget_TogetherWith.value;

											var value = parseInt(letterboxd.helpers.cleanNumber(this.wikiData.budget.value));
											var value2 = parseInt(letterboxd.helpers.cleanNumber(this.mojoData.budget));
											if (this.mojoData.budget == "" || (value > value2) || this.wikiData.budget.togetherWith != null) {
												letterboxd.helpers.createDetailsRow("Budget", this.wikiData.budget.value, this.wikiData.budget.currency, this.wikiData.budget.togetherWith);
											}
										}
										if (this.wiki != null && this.wiki.Box_OfficeUS != null && this.wiki.Box_OfficeUS.value != null) {
											this.wikiData.boxOfficeUS.value = this.wiki.Box_OfficeUS.value;
											if (this.wiki.Box_OfficeUS_UnitLabel != null)
												this.wikiData.boxOfficeUS.currency = this.wiki.Box_OfficeUS_UnitLabel.value;

											var value = parseInt(letterboxd.helpers.cleanNumber(this.wikiData.boxOfficeUS.value));
											var value2 = parseInt(letterboxd.helpers.cleanNumber(this.mojoData.boxOfficeUS));
											if (this.mojoData.boxOfficeUS == "" || (value > value2)) {
												letterboxd.helpers.createDetailsRow("Box Office (US)", this.wikiData.boxOfficeUS.value, this.wikiData.boxOfficeUS.currency);
											}
										}
										if (this.wiki != null && this.wiki.Box_OfficeWW != null && this.wiki.Box_OfficeWW.value != null) {
											this.wikiData.boxOfficeWW.value = this.wiki.Box_OfficeWW.value;
											if (this.wiki.Box_OfficeWW_UnitLabel != null)
												this.wikiData.boxOfficeWW.currency = this.wiki.Box_OfficeWW_UnitLabel.value;

											var value = parseInt(letterboxd.helpers.cleanNumber(this.wikiData.boxOfficeWW.value));
											var value2 = parseInt(letterboxd.helpers.cleanNumber(this.mojoData.boxOfficeWW));
											if (this.mojoData.boxOfficeWW == "" || (value > value2)) {
												letterboxd.helpers.createDetailsRow("Box Office (WW)", this.wikiData.boxOfficeWW.value, this.wikiData.boxOfficeWW.currency);
											}
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
									if (this.wiki != null && this.wiki.Metacritic_ID != null && this.wiki.Metacritic_ID.value != null && letterboxd.storage.get('metacritic-enabled') === true) {
										this.wikiData.metaURL = "https://www.metacritic.com/" + this.wiki.Metacritic_ID.value;
									}

									// Get and add Rotten Tomatoes
									if (
										this.wiki != null && 
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
									if (this.wiki != null && this.wiki.Mubi_ID != null && this.wiki.Mubi_ID.value != null) {
										var url = "https://api.mubi.com/v3/films/" + this.wiki.Mubi_ID.value;

										this.wikiData.Mubi_ID = this.wiki.Mubi_ID.value;
										this.wikiData.Mubi_URL = url;
									}

									// Get the SensCritique ID to use for later
									if (this.wiki != null && this.wiki.SensCritique_ID != null && this.wiki.SensCritique_ID.value != null) {
										this.wikiData.SensCritique_ID = this.wiki.SensCritique_ID.value;
									}

									// Get the Allocine ID to use for later
									if (this.wiki != null && this.wiki.Allocine_Film_ID != null && this.wiki.Allocine_Film_ID.value != null) {
										this.wikiData.Allocine_Film_ID = this.wiki.Allocine_Film_ID.value;
									}
									if (this.wiki != null && this.wiki.Allocine_TV_ID != null && this.wiki.Allocine_TV_ID.value != null) {
										this.wikiData.Allocine_TV_ID = this.wiki.Allocine_TV_ID.value;
									}

									// Get the Douban ID to use for later
									if (this.wiki != null && this.wiki.Douban_ID != null && this.wiki.Douban_ID.value != null) {
										this.wikiData.Douban_ID = this.wiki.Douban_ID.value;
										if (letterboxd.storage.get('douban-enabled') === true) {
											this.doubanHelper.getData(this.wiki.Douban_ID.value);
										}
									}

									// Get and add FilmAffinity
									if (letterboxd.storage.get('filmaff-enabled') === true) {
										if (this.wiki != null && this.wiki.FilmAffinity_ID != null && this.wiki.FilmAffinity_ID.value != null) {
											this.filmAffinityHelper.getData(this.wiki.FilmAffinity_ID.value);
										}
									}

									// Get MAL data
									if (this.wiki != null && this.wiki.MAL_ID != null && this.wiki.MAL_ID.value != null && letterboxd.storage.get('mal-enabled') === true) {
										this.wikiData.MAL_ID = this.wiki.MAL_ID.value;
										this.myAnimeListHelper.getData(this.wiki.MAL_ID.value);
									}

									// Get AniList data
									if (this.wiki !== null && this.wiki.Anilist_ID && this.wiki.Anilist_ID.value && letterboxd.storage.get('al-enabled') === true) {
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
									this.filmarks.id = letterboxd.helpers.parseWikiDataResult(this.wiki, "Filmarks_ID", this.filmarks.id);

									// Get the DDD ID to use for later
									this.ddd.id = letterboxd.helpers.parseWikiDataResult(this.wiki, "DDD_ID", this.ddd.id);

									// Get Criterion data
									if (this.wiki != null && this.wiki.Criterion_ID != null && this.wiki.Criterion_ID.value != null) {
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
									if (this.wiki != null && this.wiki.MDL_ID != null && this.wiki.MDL_ID.value != null && letterboxd.storage.get('mdl-enabled') === true) {
										this.wikiData.MDL_ID = this.wiki.MDL_ID.value;
										this.myDramaListHelper.getData(this.wiki.MDL_ID.value);
									}

									// Get Kinopoisk data
									if (this.wiki != null && this.wiki.Kinopoisk_ID != null && letterboxd.storage.get('kinopoisk-enabled') === true){
										this.kinopoiskHelper.getData(this.wiki.Kinopoisk_ID.value);
									}

									// Get Blu-ray.com ID
									if (this.wiki && this.wiki.Bluray_ID && letterboxd.storage.get('bluray-link-enabled') === true){
										this.bluray.id = this.wiki.Bluray_ID.value;
										this.bluray.url = 'https://www.blu-ray.com/_/' + this.bluray.id;
										this.addLink(this.bluray.url, 'Blu-Ray.com', 'bluray');
									}

									// Get RogerEbert.com ID
									if (this.wiki && this.wiki.Ebert_ID && letterboxd.storage.get('ebert-link-enabled') === true){
										this.ebert.id = this.wiki.Ebert_ID.value;
										this.ebert.url = 'https://www.rogerebert.com/reviews/' + this.ebert.id;
										this.addLink(this.ebert.url, 'Ebert', 'ebert');
									}

									// Get Plex ID
									if (this.wiki && this.wiki.Plex_ID){
										this.wikiData.Plex_ID = this.wiki.Plex_ID.value;
									}
									
									// Get Filmweb.pl ID
									if (this.wiki && this.wiki.Filmweb_ID && letterboxd.storage.get('filmweb-enabled') === true && this.filmwebHelper.loadState == LOAD_STATES['Uninitialized']){
										this.filmwebHelper.getData(this.wiki.Filmweb_ID.value);
									}
									
									// Get Trakt ID
									if (this.wiki && this.wiki.Trakt_ID && letterboxd.storage.get('trakt-link-enabled') === true){
										this.trakt.id = this.wiki.Trakt_ID.value;
										this.trakt.url = `https://trakt.tv/${this.trakt.id}`;
										this.addLink(this.trakt.url, 'Trakt', 'trakt');
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
				if (letterboxd.storage.get('senscritique-enabled') === true && this.wikiData.state == 2 && this.sensHelper.loadState < 1) {
					if (this.wikiData.SensCritique_ID) {
						this.sensHelper.getData(this.wikiData.SensCritique_ID);
					} else {
						this.sensHelper.searchData(this.letterboxdTitle, this.letterboxdNativeTitle, this.letterboxdYear, this.letterboxdDirectors, this.tmdbTV);
					}
				}

				// Cinemascore alt titles and years
				if (this.cinemascoreHelper.loadState == LOAD_STATES['Failure'] && this.wikiData.state == 2 && this.wikiData.state_dates == 2) {

					// Create array of years
					const years = [ this.letterboxdYear ];
					if (this.wikiData.date.value != null) {
						const year = (new Date(this.wikiData.date.value)).getFullYear().toString();
						if (!years.includes(year)) {
							years.push(year);
						}
					}
					if (this.wikiData.date_origin.value != null) {
						const year = (new Date(this.wikiData.date_origin.value)).getFullYear().toString();
						if (!years.includes(year)) {
							years.push(year);
						}
					}

					if (this.wikiData.US_Title != null && this.wikiData.US_Title != this.letterboxdTitle) {
						// Use US title
						this.cinemascoreHelper.searchData(this.wikiData.US_Title, years, this.tmdbTV);
					}
					else if (this.wikiData.Alt_Title != null && this.wikiData.Alt_Title != this.letterboxdTitle) {
						// Use WikiData English label
						this.cinemascoreHelper.searchData(this.wikiData.Alt_Title, years, this.tmdbTV);
					}
					else if (years.length > 1) {
						// Use existing Letterboxd title, but with additional years from WikiData
						this.cinemascoreHelper.searchData(this.letterboxdTitle, years, this.tmdbTV);
					}
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
				if (letterboxd.storage.get('allocine-enabled') === true && this.allocine.state < 3 && this.wikiData.state == 2) {
					if (this.allocine.state == 0) {
						if (this.wikiData.Allocine_Film_ID != null) {
							// Already have ID from Wikidata
							this.initAllocine(this.wikiData.Allocine_Film_ID, "FILM");
						} else if (this.wikiData.Allocine_TV_ID != null) {
							// Already have ID from Wikidata
							this.initAllocine(this.wikiData.Allocine_TV_ID, "TV");
						} else {
							// No ID found in Wikidata
							this.allocine.state = 3;
						}
					}
					if (this.allocine.state == 1 && this.allocine.user.data != null && this.allocine.critic.data != null) {
						// Add to page
						this.addAllocine();
					}
				}
					
				// Add Filmarks
				if (this.filmarks.state == LOAD_STATES['Uninitialized'] && this.wikiData.state == 2 && letterboxd.storage.get('filmarks-enabled') === true ){
					if (this.filmarks.id != null && this.filmarks.id != ''){
						this.getFilmarks();
					}
					else if (this.letterboxdTitle != null && this.altTitleList != null){
						this.searchFilmarks();
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
				if (this.ddd.id != null && this.ddd.id != '' && this.ddd.state < 2){
					letterboxd.helpers.WriteConsoleLog('DEBUG', `DoesTheDogDie: ID found in WikiData.`);
					this.addDDD();
				}
				else if (this.ddd.state == 0 && letterboxd.storage.get('ddd-api-enabled') === true){
					// Call API
					this.initDDD();
				}
			}

			// Add Content Ratings
			if (this.wikiData.state == 2 && this.mojoData.state >= 2 && this.contentRatingAdded == false){
				if (letterboxd.storage.get('content-ratings') === null || letterboxd.storage.get('content-ratings') === 'none'){
					// Disabled, add nothing
					this.contentRatingAdded = true;
				}else{
					// Enabled, get rating from data
					this.contentRatingSystem = letterboxd.storage.get('content-ratings');
					this.contentRating = this.wikiData[this.contentRatingSystem];

					// Check for BoxOfficeMojo backup
					if (this.contentRatingSystem == 'mpaa' && this.contentRating == null && this.mojoData.mpaaRating != null){
						this.contentRating = this.mojoData.mpaaRating;
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
			
			// Load the Plex Watchlist Data here
			if (this.wikiData.state == LOAD_STATES['Success'] && this.plexHelper.loadState == LOAD_STATES['Pending']){
				// Always pass the id - if it's null, we still pass this so we can tell the user that we're unable to match the movie
				this.plexHelper.checkWatchlistStatus(this.wikiData.Plex_ID);
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

					this.imdbData.url = imdbLink + "/";

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

		collectIMDBRank(){
			let ratingsSummary = this.imdbData.data.title?.ratingsSummary ?? null;
			if (ratingsSummary != null){
				this.rankingHelper.imdbData.rank = ratingsSummary.topRanking?.rank ?? 0;
				this.rankingHelper.imdbData.index = this.rankingHelper.imdbData.rank;
			}
		},

		addIMDBScore() {
			if (document.querySelector('.imdb-ratings')) return;

			if (!document.querySelector('.sidebar')) return;

			// Get the score from the IMDb API response
			//**********************************************/
			let ratingsSummary = this.imdbData.data.title?.ratingsSummary ?? null;
			if (ratingsSummary != null){
				this.imdbData.rating = ratingsSummary.aggregateRating ?? 0;
				this.imdbData.num_ratings = ratingsSummary.voteCount ?? 0;
			}
			let histogramValues = this.imdbData.data.title?.aggregateRatingsBreakdown?.histogram?.histogramValues ?? [];
			if (histogramValues != null && histogramValues.length > 0){
				for (var ii = 0; ii < histogramValues.length; ii++) {
					var index = histogramValues[ii].rating - 1;
					var votes = histogramValues[ii].voteCount;
					var percent = ((votes / this.imdbData.num_ratings) * 100).toFixed(1);

					this.imdbData.percents[index] = percent;
					this.imdbData.votes[index] = votes;

					if (votes > this.imdbData.highest)
						this.imdbData.highest = votes;
				}
			}

			if (this.imdbData.rating == 0 || this.imdbData.num_ratings == 0 || histogramValues.length == 0) {
				return false;
			}

			// Add the score to the page
			//********************************************* */
			const logoSvg = letterboxd.helpers.createElement('span', {
				style: 'height: 16px; width: 32px; position: absolute; background-image: url("' + browser.runtime.getURL("images/imdb-logo.svg") + '");'
			});

			const imdbScoreSection = letterboxd.helpers.createChartSection(
				'imdb', 
				{
					href: this.imdbData.url,
					style: "position: absolute;",
					svg: logoSvg
				},
				'margin-bottom: 15px !important;',
			);
			
			imdbScoreSection.append(letterboxd.helpers.createHistogram(
				letterboxd.storage,
				"imdb", 
				this.imdbData.url, 
				this.imdbData.rating, 
				this.imdbData.num_ratings, 
				this.imdbData.votes, 
				this.imdbData.percents, 
				this.imdbData.highest
			));

			// Add the tooltip as text for mobile
			var score = imdbScoreSection.querySelector(".averagerating.tooltip");
			var tooltip = "";
			if (score != null) {
				tooltip = score.getAttribute('data-original-title');
				letterboxd.helpers.createDetailsText('imdb', imdbScoreSection, tooltip, this.pageState.isMobile);
			}

			// Append to the sidebar
			//*****************************************************************
			this.appendRating(imdbScoreSection, 'imdb-ratings');

			// Add the hover events
			//*****************************************************************
			letterboxd.helpers.addTooltipEvents(imdbScoreSection);
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
				'.anidb-button',
				'.filmarks-button',
				'.filmweb-button',
				'.criterion-button',
				'.mojo-button',
				'.wiki-button',
				'.ddd-button',
				'.bluray-button',
				'.ebert-button',
				'.plex-button',
				'.trakt-button'
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

		addBoxOffice() {
			//if (document.querySelector('.box-office') && document.querySelector('.budget')) return;
			if (this.mojoData.added == true) return;

			// First Grab the info
			//*****************************************************
			if (this.mojoData.data != null) {
				const summaryTable = this.mojoData.data.querySelectorAll('.mojo-performance-summary-table div');
				for (var ii = 0; ii < summaryTable.length; ii++) {
					var header = summaryTable[ii].querySelector('.a-size-small');
					var value = summaryTable[ii].querySelector('.money');
					if (header.innerHTML.includes("Domestic") && value != null) {
						this.mojoData.boxOfficeUS = value.innerText;;
					} else if (header.innerHTML.includes("Worldwide") && value != null) {
						this.mojoData.boxOfficeWW = value.innerText;
					}
				}

				// This is for formatting the date
				var options = { year: 'numeric', month: 'short', day: 'numeric' };
				// Budget
				const summaryValues = this.mojoData.data.querySelector('.a-section.a-spacing-none.mojo-summary-values.mojo-hidden-from-mobile');

				for (var ii = 0; ii < summaryValues.childNodes.length; ii++) {
					var node = summaryValues.childNodes[ii];
					var header = node.childNodes[0].innerText;
					var data = node.childNodes[1].innerText;

					if (header == "Budget") {
						this.mojoData.budget = data;
					} else if (header == "MPAA") {
						this.mojoData.mpaaRating = data;
					} else if (header == "Earliest Release Date" && data.includes("Domestic")) {
						this.filmDate.date = data.split("\n")[0];
						this.filmDate.date = this.filmDate.date.replace(",", "");
						this.filmDate.date = new Date(this.filmDate.date).toLocaleDateString("en-UK", options);
					}
				}

				// Quick Check for release dates
				if (this.filmDate.date == null || this.filmDate.date == "") {
					var a_Section = this.mojoData.data.querySelector('.a-section.mojo-h-scroll');
					if (a_Section != null && a_Section.childElementCount > 0 && a_Section.childNodes[0].innerText.includes("Domestic")) {
						var a_Section_Rows = a_Section.childNodes[2].rows;
						for (var ii = 1; ii < a_Section_Rows.length; ii++) {
							var header = a_Section_Rows[ii].childNodes[0].innerText;
							var date = a_Section_Rows[ii].childNodes[1].innerText;

							if (header == "Domestic") {
								this.filmDate.date = date.replace(",", "");
								this.filmDate.date = new Date(this.filmDate.date).toLocaleDateString("en-UK", options);
							}
						}
					}
					if (a_Section != null && a_Section.childElementCount > 0 && a_Section.childNodes[0].innerText.includes("By Release")) {
						var a_Section_Rows = a_Section.childNodes[1].rows;
						for (var ii = 1; ii < a_Section_Rows.length; ii++) {
							var group = a_Section_Rows[ii].childNodes[0].innerText;
							var date = a_Section_Rows[ii].childNodes[1].innerText;
							var markets = a_Section_Rows[ii].childNodes[2].innerText;

							if (group == "Original Release" && markets.includes("Domestic")) {
								this.filmDate.date = date.replace(",", "");
								this.filmDate.date = new Date(this.filmDate.date).toLocaleDateString("en-UK", options);
							}
						}
					}
				}
			}

			// Return if we have nothing
			if (this.mojoData.budget == "" && this.mojoData.boxOfficeWW == "" && this.mojoData.boxOfficeUS == "") {
				return;
			}

			// Add the budget
			//*****************************************************
			if (this.mojoData.budget != "" && !document.querySelector('.budget')) {
				letterboxd.helpers.createDetailsRow("Budget", this.mojoData.budget);
			}
			// Add the Box Office US
			//*****************************************************
			if (this.mojoData.boxOfficeUS != "") {// && !document.querySelector('.box-office-us')){
				letterboxd.helpers.createDetailsRow("Box Office (US)", this.mojoData.boxOfficeUS);
			}

			// Add the Box Office WW
			//*****************************************************
			if (this.mojoData.boxOfficeWW != "") {// && !document.querySelector('.box-office-ww')){
				// Don't add the WW box office if it's equal to the US
				if (parseInt(letterboxd.helpers.cleanNumber(this.mojoData.boxOfficeWW)) > parseInt(letterboxd.helpers.cleanNumber(this.mojoData.boxOfficeUS))) {
					letterboxd.helpers.createDetailsRow("Box Office (WW)", this.mojoData.boxOfficeWW);
				}
			}

			this.mojoData.added = true;
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

		initAllocine(id, type) {
			// Call the Allocine page
			this.allocine.state = 1;

			// Configure URL
			if (type == "FILM") {
				this.allocine.url = "https://www.allocine.fr/film/fichefilm_gen_cfilm=" + id + ".html";
				this.allocine.urlUser = "https://www.allocine.fr/film/fichefilm-" + id + "/critiques/spectateurs/";
				this.allocine.urlCritic = "https://www.allocine.fr/film/fichefilm-" + id + "/critiques/presse/";

			} else {
				this.allocine.url = "https://www.allocine.fr/series/ficheserie_gen_cserie=" + id + ".html";
				this.allocine.urlUser = "https://www.allocine.fr/series/ficheserie-" + id + "/critiques/";
				this.allocine.urlCritic = "https://www.allocine.fr/series/ficheserie-" + id + "/critiques/presse/";
			}

			// Make Calls
			browser.runtime.sendMessage({ name: "GETDATA", url: this.allocine.urlUser }, (value) => {
				if (letterboxd.helpers.ValidateResponse("AlloCine (user ratings)", value) == false){
					return;
				}

				try {
					this.allocine.user.raw = value.response;
					this.allocine.user.data = letterboxd.helpers.parseHTML(value.response);
				} catch (error) {
					console.error(error);
					this.allocine.state = 3; // Error
				}

			});
			browser.runtime.sendMessage({ name: "GETDATA", url: this.allocine.urlCritic }, (value) => {
				if (letterboxd.helpers.ValidateResponse("AlloCine (critic ratings)", value) == false){
					return;
				}

				try {
					this.allocine.critic.raw = value.response;
					this.allocine.critic.data = letterboxd.helpers.parseHTML(value.response);
				} catch (error) {
					console.error(error);
					this.allocine.state = 3; // Error
				}
			});
		},

		addAllocine() {
			if (document.querySelector('.allocine-ratings')) return;

			if (!document.querySelector('.sidebar')) return;

			this.allocine.state = 2;

			this.addLink(this.allocine.url, 'ALLO', 'allocine');

			// Collect Date from the AlloCine page
			//***************************************************************
			// Get User ratings
			// Rating
			if (this.allocine.user.data.querySelector(".big-note .note")) {
				this.allocine.user.rating = this.allocine.user.data.querySelector(".big-note .note").innerText;
				this.allocine.user.rating = Number(this.allocine.user.rating.replace(",", "."));
			}
			// Rating Count
			if (this.allocine.user.data.querySelector(".big-note .user-note-count")) {
				this.allocine.user.num_ratings = this.allocine.user.data.querySelector(".big-note .user-note-count").innerText;
				var regex = new RegExp("([0-9]+) notes*");
				if (this.allocine.user.num_ratings.match(regex)) {
					this.allocine.user.num_ratings = Number(this.allocine.user.num_ratings.match(regex)[1]);
				}
			}
			// Review Count
			if (this.allocine.user.data.querySelector(".reviews-users-by-note .titlebar-title")) {
				this.allocine.user.num_reviews = this.allocine.user.data.querySelector(".reviews-users-by-note .titlebar-title").innerText;
				var regex = new RegExp("([0-9 ]+) critique");
				if (this.allocine.user.num_reviews.match(regex)) {
					this.allocine.user.num_reviews = Number(letterboxd.helpers.cleanNumber(this.allocine.user.num_reviews.match(regex)[1]));
				}
			}
			// Review breakdown
			if (this.allocine.user.data.querySelector(".reviews-users-by-note .item")) {
				var histogramData = this.allocine.user.data.querySelectorAll(".reviews-users-by-note .item");
				for (var i = 0; i < histogramData.length; i++) {
					// Get the votes
					var votes = histogramData[i].querySelector(".item-unit .nb").innerText;
					var regex = new RegExp("([0-9]+) critique");
					if (votes.match(regex)) {
						votes = Number(votes.match(regex)[1]);
					}
					// Get the percent
					var percent = ((votes / this.allocine.user.num_reviews) * 100).toFixed(1);

					// Add to arrays
					this.allocine.user.votes[i] = votes;
					this.allocine.user.percents[i] = percent;

					// Set highest
					if (this.allocine.user.highest < votes)
						this.allocine.user.highest = votes;
				}

				this.allocine.user.votes.reverse();
				this.allocine.user.percents.reverse();
			}

			// Get critic ratings
			// Rating
			if (this.allocine.critic.data.querySelector(".big-note .note")) {
				this.allocine.critic.rating = this.allocine.critic.data.querySelector(".big-note .note").innerText;
				this.allocine.critic.rating = Number(this.allocine.critic.rating.replace(",", "."));
			} else {
				this.allocine.critic.rating = 0;
			}
			// Rating Count
			if (this.allocine.critic.data.querySelector(".big-note .user-note-count")) {
				this.allocine.critic.num_ratings = this.allocine.critic.data.querySelector(".big-note .user-note-count").innerText;
				var regex = new RegExp("([0-9]+) titre");
				if (this.allocine.critic.num_ratings.match(regex)) {
					this.allocine.critic.num_ratings = Number(this.allocine.critic.num_ratings.match(regex)[1]);
				}
			}


			// Do not display if there is no score or ratings
			if (this.allocine.user.num_ratings == 0 && this.allocine.critic.num_ratings == 0) return;

			// Add to Letterboxd
			//***************************************************************
			// Add the section to the page
			const section = letterboxd.helpers.createChartSection(
				'allocine', 
				{
					href: this.allocine.url,
					style: 'background-image: url("https://assets.allocine.fr/skin/img/allocine/sprite.a961a077.png");'
				},
				'height: 15px !important;'
			);

			// Create the Scores
			//***************************************************************
			if (letterboxd.storage.get('allocine-style') === "ratings") {
				// Ratings without graph
				//***************************************************************
				// Critic score
				if (letterboxd.storage.get('allocine-critic-enabled') === true) {
					const criticSpan = letterboxd.helpers.createElement('span', {
						class: 'allocine-critic-score allocine-ratings-style',
						style: 'position: relative; height: 60px;'
					});

					const criticLabel = letterboxd.helpers.createElement('span', {
						class: 'allocine-label'
					});
					criticLabel.innerText = "Critics";
					criticSpan.append(criticLabel);

					criticSpan.append(letterboxd.helpers.createAllocineCriticScore(letterboxd, "ratings-style", this.allocine.critic.rating, this.allocine.critic.num_ratings, null, this.allocine.urlCritic, this.pageState.isMobile));
					criticSpan.append(letterboxd.helpers.createDynamicStars('allocine-ratings', this.allocine.critic.rating));
					section.append(criticSpan);
				}

				// User score
				if (letterboxd.storage.get('allocine-users-enabled') === true) {
					const userSpan = letterboxd.helpers.createElement('span', {
						class: 'allocine-user-score allocine-ratings-style',
						style: 'position: relative; height: 60px;'
					});

					const userLabel = letterboxd.helpers.createElement('span', {
						class: 'allocine-label'
					});
					userLabel.innerText = "Users";
					userSpan.append(userLabel);

					userSpan.append(letterboxd.helpers.createAllocineCriticScore(letterboxd, "ratings-style", this.allocine.user.rating, this.allocine.user.num_ratings, this.allocine.user.num_reviews, this.allocine.urlUser, this.pageState.isMobile));
					userSpan.append(letterboxd.helpers.createDynamicStars('allocine-ratings', this.allocine.user.rating));
					section.append(userSpan);
				}

				// Add the tooltip as text for mobile
				// Critic Rating Tooltip
				var criticScore = section.querySelector(".allocine-critic-score .allocine-critic .tooltip");
				if (criticScore != null) {
					var tooltip = criticScore.getAttribute('data-original-title');
					letterboxd.helpers.createDetailsText('allocine', section, tooltip, this.pageState.isMobile);
				}

				// User Rating Tooltip
				var userScore = section.querySelector(".allocine-user-score .allocine-critic .tooltip");
				if (userScore != null) {
					var tooltip = userScore.getAttribute('data-original-title');
					letterboxd.helpers.createDetailsText('allocine', section, tooltip, this.pageState.isMobile);
				}

			} else {
				// Histogram Graph
				//***************************************************************

				// Add the div to hold the toggle buttons
				// Div to hold buttons
				const buttonDiv = letterboxd.helpers.createElement('div', {
					class: 'toggle-button-holder allocine-buttons'
				});
				section.append(buttonDiv);

				buttonDiv.append(letterboxd.helpers.createToggleButton("allocine-button allo-user", "USER", "allocine-user-score", true, false, this.pageState.isMobile));
				buttonDiv.append(letterboxd.helpers.createToggleButton("allocine-button allo-critic", "CRITIC", "allocine-critic-score", false, (this.allocine.critic.rating == 0), this.pageState.isMobile));
				if (letterboxd.storage.get('allocine-users-enabled') != true || letterboxd.storage.get('allocine-critic-enabled') != true) {
					buttonDiv.style['display'] = "none";
				}

				// User score - user toggle-score-display so I can reuse changeTomatoScore
				const userSpan = letterboxd.helpers.createElement('span', {
					class: 'allocine-user-score toggle-score-display',
					style: 'position: relative; display: block; margin-top: 5px;'
				});

				userSpan.append(letterboxd.helpers.createHistogram(
					letterboxd.storage, 
					"allocine", 
					this.allocine.urlUser,
					this.allocine.user.rating,
					this.allocine.user.num_reviews,
					this.allocine.user.votes,
					this.allocine.user.percents,
					this.allocine.user.highest
				));

				section.append(userSpan);

				if (letterboxd.storage.get('allocine-critic-enabled') === false) {
					userSpan.querySelector('.rating-histogram').style['margin-top'] = '15px';
				}

				// Critic score
				const criticSpan = letterboxd.helpers.createElement('span', {
					class: 'allocine-critic-score toggle-score-display',
					style: 'position: relative; display: block; height: 44px; display:none; margin-top: 5px;'
				});
				criticSpan.append(letterboxd.helpers.createAllocineCriticScore(letterboxd, "allocine", this.allocine.critic.rating, this.allocine.critic.num_ratings, null, this.allocine.urlCritic, this.pageState.isMobile));
				criticSpan.append(letterboxd.helpers.createDynamicStars('allocine-critic', this.allocine.critic.rating));
				section.append(criticSpan);

				// Add the tooltip as text for mobile
				// User Rating Tooltip
				var userScore = section.querySelector(".allocine-user-score .average-rating .tooltip");
				if (userScore != null) {
					var tooltip = userScore.getAttribute('data-original-title');
					letterboxd.helpers.createDetailsText('allocine', section.querySelector(".allocine-user-score"), tooltip, this.pageState.isMobile);
				}

				// Critic Rating Tooltip
				var criticScore = section.querySelector(".allocine-critic-score .allocine-critic .tooltip");
				if (criticScore != null) {
					var tooltip = criticScore.getAttribute('data-original-title');
					letterboxd.helpers.createDetailsText('allocine', section.querySelector(".allocine-critic-score"), tooltip, this.pageState.isMobile);
				}
			}

			// APPEND to the sidebar
			//************************************************************
			this.appendRating(section, 'allocine-ratings');

			// Add click event for score buttons
			//************************************************************
			//if (letterboxd.storage.get('allocine-style') === "histogram" && letterboxd.storage.get('allocine-critic-enabled') === true){
			if (section.querySelector('.toggle-button.allo-button')) {
				if (this.allocine.critic.rating != 0 && (letterboxd.storage.get('allocine-default-view') === 'critic' || letterboxd.storage.get('allocine-users-enabled') != true)) {
					section.querySelector(".toggle-button.allo-critic").click();
				}
			}

			// Add the hover events
			//*****************************************************************
			letterboxd.helpers.addTooltipEvents(section);
		},

		async initDDD(){
			this.ddd.state = 1;

			let apiKey = letterboxd.storage.get("ddd-apikey");

			if (apiKey == '') {
				letterboxd.helpers.WriteConsoleLog('LOG', 'No DDD API key, cannot search for ID using the DDD API.');
				this.ddd.state = 3
				return;
			}

			var options = {
				method: 'GET',
				headers: {
					'X-API-KEY': letterboxd.storage.get("ddd-apikey")
				}
			};

			// IMDB API Search
			if (this.imdbID != ''){
				let url = `https://www.doesthedogdie.com/api/v3/items?imdb=${this.imdbID}`

				const response = await new Promise((resolve, reject) => {
					browser.runtime.sendMessage({ name: "GETDATA", url: url, options: options, type: "JSON" }, (value) => {
						if (letterboxd.helpers.ValidateResponse("DoesTheDogDie API (IMDb search)", value) == false){
							if (value.status == 401){
								letterboxd.helpers.ShowErrorMessage('DoesTheDogDie returned a 401 Unauthorized response. Please enter a valid API key into the Letterboxd Extras settings.', 'ddd-key');
							}
							reject(new Error("Invalid response"));
							return;
						}
						resolve(value);
					});
				});

				let items = response.response;
				if (items != null && items.length > 0){
					let item = items[0];
					if (item.tmdbId > 0 && item.tmdbId != parseInt(this.tmdbID)){
						// uh oh, DDD has the wrong movie???
						// Found with https://letterboxd.com/film/the-hunt-2012/
					}else{
						this.ddd.data = item;
						this.ddd.state = 2;
					}
				}
			}

			// The TMDB search is weirdly quite slow, so lets not bother

			// Title Search
			if (this.ddd.state < 2){
				let title = (this.letterboxdNativeTitle != null) ? this.letterboxdNativeTitle : this.letterboxdTitle;
				let url = `https://www.doesthedogdie.com/api/v3/items?name=${title}`

				const response = await new Promise((resolve, reject) => {
					browser.runtime.sendMessage({ name: "GETDATA", url: url, options: options, type: "JSON" }, (value) => {
						if (letterboxd.helpers.ValidateResponse("DoesTheDogDie API (Title search)", value) == false){
							if (value.status == 401 || value.status == 403){
								letterboxd.helpers.ShowErrorMessage('DoesTheDogDie returned an Unauthorized response. Please enter a valid API key into the Letterboxd Extras settings.', 'ddd-key');
							}
							reject(new Error("Invalid response"));
							return;
						}
						resolve(value);
					});
				});
				
				let items = response.response;
				if (items != null && items.length > 0){
					for (var i = 0; i < items.length; i++){
						let item = items[i];
						let itemType = item.itemTypeName;
						let itemName = item.name;
						let itemYear = item.releaseYear;
						let itemTmdb = item.tmdbId;
						let itemImdb = item.imdbId;

						// Make sure the item type matches the letterboxd movie
						if ((this.tmdbTV == true && itemType != "TV Show") || (this.tmdbTV == false && itemType != "Movie")){
							continue;
						}

						// Try to match on the TMDB ID
						if (itemTmdb != null && itemTmdb == this.tmdbID){
							// This is an exact match, set and exit out
							this.ddd.data = item;
							this.ddd.state = 2;
							break;
						}
						else if (itemTmdb != null && itemTmdb > 0){
							// DDD item has a tmdb ID that does not match letterboxd, lets continue instead of matching on the name
							continue;
						}

						// Try to match on the name
						if (itemName == this.letterboxdTitle && itemYear == this.letterboxdYear ||
							(itemName == this.letterboxdTitle + " " + this.letterboxdYear && itemYear == this.letterboxdYear) ||
							(itemName == this.letterboxdNativeTitle && itemYear == this.letterboxdYear)
						){
							// Match based on name may not be accurate, don't exit so we can keep checking for a match based on TMDB if needed
							this.ddd.data = item;
							this.ddd.state = 2;
						}
					}
				}
			}
			

			if (this.ddd.state < 2 || this.ddd.data == null){
				letterboxd.helpers.WriteConsoleLog('LOG', 'Unable to locate DDD film page using the API.');
				this.ddd.state = 3;
			}else{
				// Add link to the page
				this.ddd.id = this.ddd.data.id;
				this.addDDD();
			}	
		},

		addDDD(){
			if (this.ddd.id != null){
				this.ddd.url = `https://www.doesthedogdie.com/media/${this.ddd.id}`;
				this.addLink(this.ddd.url, 'DOG', 'ddd');
			}

			this.ddd.state = 2;
		},

		getFilmarks() {
			this.filmarks.state = LOAD_STATES['Loading'];
			var apiURL = `https://markuapi.kabk.dev/${this.filmarks.id}`;
			
			letterboxd.helpers.WriteConsoleLog('DEBUG', `Filmarks: ID found in WikiData.`);
				
			// Make Calls
			browser.runtime.sendMessage({ name: "GETDATA", url: apiURL, type: "JSON" }, (value) => {
				if (letterboxd.helpers.ValidateResponse("Filmarks", value) == false){
					this.filmarks.state = LOAD_STATES['Failed'];
					return;
				}

				try {
					this.filmarks.data = value.response;
					this.filmarks.state = LOAD_STATES['Success'];
				} catch (error) {
					console.error(error);
					this.filmarks.state = LOAD_STATES['Failed'];
				}

				if (this.filmarks.state == LOAD_STATES['Success'] && this.filmarks.data != null){
					this.filmarks.movie = this.filmarks.data.data;
					this.addFilmarks();
				}
			});
		},

		searchFilmarks() {
			this.filmarks.state = LOAD_STATES['Loading'];
			
			letterboxd.helpers.WriteConsoleLog('DEBUG', `Filmarks: ID not found in WikiData, attempting search instead.`);

			var isAnime = (this.myAnimeListHelper.id != null || this.anilistHelper.id != null);
			var apiURL = 'https://markuapi.kabk.dev/search/';
			if (this.tmdbTV && isAnime){
				apiURL += `animes?limit=20&q=${encodeURIComponent(this.letterboxdTitle)}`;
			}else if (this.tmdbTV){
				apiURL += `dramas?limit=20&q=${encodeURIComponent(this.letterboxdTitle)}`;
			}else{
				apiURL += `movies?limit=20&q=${encodeURIComponent(this.letterboxdTitle)}`;
			}
				
			// Make Calls
			browser.runtime.sendMessage({ name: "GETDATA", url: apiURL, type: "JSON" }, (value) => {
				if (letterboxd.helpers.ValidateResponse("Filmarks", value) == false){
					return;
				}

				try {
					this.filmarks.data = value.response;
					this.filmarks.state = LOAD_STATES['Success'];
				} catch (error) {
					console.error(error);
					this.filmarks.state = LOAD_STATES['Failed'];
				}

				if (this.filmarks.state == LOAD_STATES['Success'] && this.filmarks.data != null){
					// See if we can match from the API
					if (this.filmarks.data.results != null){
						var items = [];
						if (this.filmarks.data.results.movies != null && this.filmarks.data.results.movies.length > 0){
							items = this.filmarks.data.results.movies;
						}
						else if (this.filmarks.data.results.dramas != null && this.filmarks.data.results.dramas.length > 0){
							items = this.filmarks.data.results.dramas;
						}
						else if (this.filmarks.data.results.animes != null && this.filmarks.data.results.animes.length > 0){
							items = this.filmarks.data.results.animes;
						}
							
						for (var i = 0; i < items.length; i++){
							var movie = items[i];

							// To hopefully get an accurate match, we will do the following:
							//	- See if the filmark title is exactly the same as the letterboxd title (display or native)
							//	- OR See if the filmark title is located in the array of alternative titles on letterboxed
							//	- AND if filmark year is within 3 years of the letterboxd year
							// This will likely not be 100%, but hopefully work decently?
							var filmarksTitle = movie.title;
							if (this.tmdbTV){
								var filmarksYear = parseInt(letterboxd.helpers.regexExtract(movie.release_date, /(\d{4})年/, 1, "0"));
							}else{
								var filmarksYear = parseInt(letterboxd.helpers.regexExtract(movie.screening_date, /(\d{4})年/, 1, "0"));
							}
								
							var letterboxdYear = 0;
							if (this.letterboxdYear != "")
								letterboxdYear = parseInt(this.letterboxdYear);

							if (filmarksTitle != null && filmarksTitle != '' && filmarksYear > 0 && letterboxdYear > 0){
								// If matches the year
								if (this.letterboxdYear >= filmarksYear - 3 && this.letterboxdYear <= filmarksYear + 3){
									// if matches the title
									if (filmarksTitle == this.letterboxdTitle || (this.letterboxdNativeTitle != null && filmarksTitle == this.letterboxdNativeTitle) || this.altTitleList.includes(filmarksTitle)){
										this.filmarks.movie = movie;
										break;
									}
								}
							}
						}
					}

					// Movie found, add to Letterboxd
					if (this.filmarks.movie != null){
						this.addFilmarks();
					}
				}
			});
		},

		addFilmarks() {
			if (document.querySelector('.filmarks-ratings')) return;

			if (!document.querySelector('.sidebar')) return;

			// Collect Date from the Filmark API
			//***************************************************************
			if (this.filmarks.movie != null) {
				// Rating
				if (this.filmarks.movie.rating != null && this.filmarks.movie.rating != "-")
					this.filmarks.rating = this.filmarks.movie.rating;

				// Review Count
				if (this.filmarks.movie.mark_count != null && this.filmarks.movie.mark_count != "-")
					this.filmarks.num_ratings = this.filmarks.movie.mark_count;

				// URL
				if (this.filmarks.movie.link != null)
					this.filmarks.url = this.filmarks.movie.link;
					
				this.addLink(this.filmarks.url, 'FILMARKS', 'filmarks');
			}else{
				letterboxd.helpers.WriteConsoleLog('LOG', 'Unable to find/match Filmarks page');
				return;
			}

			// Do not display if there is no score or ratings
			if (this.filmarks.rating == null && this.filmarks.num_ratings == 0) return;

			// Add to Letterboxd
			//***************************************************************
			// Add the section to the page
			const section = letterboxd.helpers.createElement('section', {
				class: 'extras-section ratings-histogram-chart filmarks-ratings ratings-extras'
			});

			// Add the Header
			const heading = letterboxd.helpers.createElement('h2', {
				class: 'section-heading section-heading-extras',
				style: 'height: 20px !important;'
			});
			section.append(heading);

			const logoHolder = letterboxd.helpers.createElement('a', {
				class: "logo-filmarks",
				href: this.filmarks.url,
				style: 'position: absolute; background-image: url("' + browser.runtime.getURL("images/filmarks-logo.svg") + '");'
			});
			heading.append(logoHolder);

			if (this.pageState.isMobile) {
				// Add the Show Details button			
				const showDetails = letterboxd.helpers.createShowDetailsButton("filmarks", "filmarks-score-details");
				section.append(showDetails);
			}

			// Score
			//***************************************************************
			const ratingSpan = letterboxd.helpers.createElement('span', {
				class: 'filmarks-score toggle-score-display',
				style: 'position: relative; display: block;'
			});
			ratingSpan.append(letterboxd.helpers.createAllocineCriticScore(letterboxd, "filmarks", this.filmarks.rating, this.filmarks.num_ratings, null, this.filmarks.url, this.pageState.isMobile));
			ratingSpan.append(letterboxd.helpers.createDynamicStars('filmarks', this.filmarks.rating));
			section.append(ratingSpan);

			// Add the tooltip as text for mobile
			// Critic Rating Tooltip
			var scoreSpan = section.querySelector(".filmarks-score .filmarks .tooltip");
			if (scoreSpan != null) {
				var tooltip = scoreSpan.getAttribute('data-original-title');
				letterboxd.helpers.createDetailsText('filmarks', section.querySelector(".filmarks-score"), tooltip, this.pageState.isMobile);
			}

			// APPEND to the sidebar
			//************************************************************
			this.appendRating(section, 'filmarks-ratings');

			// Add the hover events
			//*****************************************************************
			letterboxd.helpers.addTooltipEvents(section);
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

		getSensFilmQuery() {
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
				} else if (type == "filmweb") {
					href = `${url}?rate=${(ii + 1).toString()}`;
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

		createAllocineCriticScore(letterboxd, type, rating, count, reviewCount, url, isMobile) {
			// The span that holds the score
			var style = "display: inline-block; margin-right: 5px;";
			if (type == "ratings-style") {
				style = "display: block;"
			}

			var className = 'allocine-critic';
			if (type == "filmarks")
				className = 'filmarks';

			const scoreSpan = letterboxd.helpers.createElement('span', {
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

			const scoreElement = letterboxd.helpers.createElement('a', {
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

		getTextBetween(text, start, end) {
			var tempArray = text.split(start);
			if (tempArray.length >= 2) {
				tempArray = tempArray[1].split(end);

				return (tempArray[0]);
			} else {
				return ""
			}
		},

		parseHTML(html) {
			var parser = new DOMParser();
			return parser.parseFromString(html, "text/html");
		},

		getOriginalURL(html) {
			var output = "";
			var split = html.split('<meta property="og:url" content="');
			output = split[1].split('">')[0];
			return output;
		},

		fixURL(url) {
			// replace http with https
			if (url.includes("http://"))
				url = url.replace("http://", "https://");

			// Make sure it has https
			if (!url.startsWith("https://"))
				url = "https://" + url;

			// Make sure it was www
			if (!url.includes("www."))
				url = url.replace("https://", "https://www.");

			return url;
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

		cleanupInnerText(value) {
			var out = value.replaceAll("\n", "");
			out = out.trim();
			return out;
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

		getImdbQuery(id){
			// Cast photos and character names are only needed by Cast Extras
			var credits = '';
			if (letterboxd.storage.get('cast-extras-enabled') === true) {
				credits = `
							credits(first: 50) {
								edges {
									node {
										... on Cast {
											characters {
												name
											}
											name {
												nameText {
													text
												}
											}
										}
									}
								}
							}`;
			}

			var query = `
					query GetRatings { 
						title(id: "${id}") { 
							ratingsSummary { 
								aggregateRating 
								voteCount
								topRanking {
									rank
								}
							} 
							aggregateRatingsBreakdown {
								histogram { 
									histogramValues { 
										rating
										voteCount
									}
								}
							}
							${credits}
						}
					}
				`;
			var options = {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-imdb-client-name': 'imdb-web-next'
				},
				body: JSON.stringify({
					query,
					variables: {}
				})
			};

			return options;
		},

		getWikiDataQuery(imdbId, tmdbId, letterboxdId, isTV, queryType, lang) {
			/* WikiData Date Precision values:
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

			// Add the IDs to the query
			var sparqlQuery = '';

			if (letterboxdId != "")
				sparqlQuery += '  VALUES ?letterboxdID { "' + letterboxdId + '"}\n';

			if (imdbId != "")
				sparqlQuery += '  VALUES ?imdbID { "' + imdbId + '"}\n';

			if (tmdbId != "")
				sparqlQuery += '  VALUES ?tmdbID { "' + tmdbId + '"}\n';

			sparqlQuery += '\n';

			// Add the initial Letterboxd ID filter
			if (letterboxdId != "")
				sparqlQuery += '  { ?item p:P6127 ?letterboxdStatement. ?letterboxdStatement ps:P6127 ?letterboxdID. MINUS { ?letterboxdStatement wikibase:rank wikibase:DeprecatedRank. } }\n'

			// Add the IMDB if the ID is found
			if (imdbId != "")
				sparqlQuery += '  UNION { ?item p:P345 ?imdbStatement. ?imdbStatement ps:P345 ?imdbID. MINUS { ?imdbStatement wikibase:rank wikibase:DeprecatedRank. } }\n'

			// Add the TMDB TV if the ID is found and this is a TV show
			if (tmdbId != "" && isTV && queryType != "PERSON")
				sparqlQuery += '  UNION { ?item p:P4983 ?tmdbStatement. ?tmdbStatement ps:P4983 ?tmdbID. MINUS { ?tmdbStatement wikibase:rank wikibase:DeprecatedRank. } }\n'

			// Add the TMDB ID if found and NOT a TV show
			if (tmdbId != "" && isTV == false && queryType != "PERSON")
				sparqlQuery += '  UNION { ?item p:P4947 ?tmdbStatement. ?tmdbStatement ps:P4947 ?tmdbID. MINUS { ?tmdbStatement wikibase:rank wikibase:DeprecatedRank. } }\n'

			// Add the TMDB Person ID if person
			if (tmdbId != "" && queryType == "PERSON")
				sparqlQuery += '  { ?item p:P4985 ?tmdbStatement. ?tmdbStatement ps:P4985 ?tmdbID. MINUS { ?tmdbStatement wikibase:rank wikibase:DeprecatedRank. } }\n'

			// Wikipedia Language
			let wikipediaQuery = '';
			if (queryType == 'MAIN' || queryType == 'PERSON'){
				let browserLocale = window.navigator.language;
				if (browserLocale.length > 2){
					browserLocale = browserLocale.substring(0, 2);
				}
				
				if (browserLocale == '' || browserLocale == 'en' || letterboxd.storage.get('wiki-prefer-en') === true) {
					wikipediaQuery = '  OPTIONAL { ' +
									 '   ?Wikipedia schema:about ?item ;' +
									 '             schema:isPartOf <https://en.wikipedia.org/> .' +
									 '  }'
				} else {
					wikipediaQuery = `  OPTIONAL { ` +
									 `   ?${browserLocale}_link schema:about ?item ;` +
									 `             schema:isPartOf <https://${browserLocale}.wikipedia.org/> .` +
									 `  }` +
									 `  OPTIONAL { ` +
									 `   ?en_link schema:about ?item ;` +
									 `             schema:isPartOf <https://en.wikipedia.org/> .` +
									 `  }` +
									 `  BIND(COALESCE(?${browserLocale}_link, ?en_link) AS ?Wikipedia)`
				}
			}


			if (queryType == "DATE") {
				sparqlQuery = "SELECT DISTINCT ?Date ?Date_Country ?Date_Precision ?Date_Format ?Date_City_Country WHERE {\n" +
						"  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n" +
						"\n" +
						sparqlQuery +
						"\n" +
						"  OPTIONAL {\n" +
						"    ?item p:P577 ?Date_Statement.\n" +
						"    ?Date_Statement ps:P577 ?Date. \n" +
						"    ?Date_Statement psv:P577 [wikibase:timePrecision ?Date_Precision].\n" +
						"    OPTIONAL { ?Date_Statement pq:P437 ?Date_Format. }\n" +
						"    OPTIONAL { \n" +
						"      ?Date_Statement pq:P291 ?Date_Country.\n" +
						"      OPTIONAL {\n" +
						"        ?Date_Country wdt:P17 ?Date_City_Country.\n" +
						"        FILTER NOT EXISTS { ?Date_Country wdt:P31 wd:Q6256. }\n" +
						"      } \n" +
						"    }\n" +
						"    MINUS { ?Date_Statement wikibase:rank wikibase:DeprecatedRank. }\n" +
						"  }\n" +
						"} \n" +
						"GROUP BY ?Date ?Date_Precision ?Date_Country ?Date_Format ?Date_City_Country";

			} else if (queryType == "PERSON") {
				sparqlQuery = "SELECT DISTINCT ?itemLabel ?BirthName ?Date_Of_Birth ?Date_Of_Birth_Precision ?Date_Of_Death ?Date_Of_Death_Precision ?BirthCityLabel ?BirthCountry ?DeathCityLabel ?DeathCountry ?Wikipedia ?Years_Start ?Years_End ?IMDb_ID  WHERE {\n" +
						"  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],mul,en\". }\n" +
						"  \n" +
						"  ?item p:P4985 ?statement0.\n" +
						"  ?statement0 ps:P4985 \"" + tmdbId + "\".\n" +
						"  MINUS { ?statement0 wikibase:rank wikibase:DeprecatedRank. }\n" +
						"\n" +
						"  OPTIONAL { \n" +
						"    ?item wdt:P1477 ?BirthName.\n" +
						"    FILTER(LANG(?BirthName) = \"en\") .\n" +
						"  }\n" +
						"  OPTIONAL { ?item wdt:P345 ?IMDb_ID. }\n" +
						"  OPTIONAL { \n" +
						"    ?item p:P569 ?BirthEntry.\n" +
						"    ?BirthEntry ps:P569 ?Date_Of_Birth.\n" +
						"    ?BirthEntry psv:P569 [wikibase:timePrecision ?Date_Of_Birth_Precision]. \n" +
						"    ?BirthEntry a wikibase:BestRank\n" +
						"  }\n" +
						"  OPTIONAL { \n" +
						"    ?item p:P570 ?DeathEntry.\n" +
						"    ?DeathEntry ps:P570 ?Date_Of_Death.\n" +
						"    ?DeathEntry psv:P570 [wikibase:timePrecision ?Date_Of_Death_Precision].\n" +
						"    ?DeathEntry a wikibase:BestRank\n" +
						"  }\n" +
						"  OPTIONAL { ?item wdt:P2031 ?Years_Start. }\n" +
						"  OPTIONAL { ?item wdt:P2032 ?Years_End. }\n" +
						"  OPTIONAL { \n" +
						"    VALUES ?locationType {wd:Q532 wd:Q515 wd:Q3957 wd:Q1549591 wd:Q179872 wd:Q7830213 wd:Q2755753 wd:Q769603 wd:Q18663566 wd:Q486972}\n" +
						"    ?item p:P19 ?Entry.\n" +
						"    ?Entry ps:P19 ?BirthCity.  \n" +
						"    ?BirthCity wdt:P31/wdt:P279* ?locationType.\n" +
						"    OPTIONAL { \n" +
						"      ?BirthCity p:P17 ?Country.\n" +
						"      ?Country ps:P17 ?Country_Of_Birth.\n" +
						"      ?Country a wikibase:BestRank\n" +
						"      OPTIONAL { \n" +
						"        ?Country_Of_Birth wdt:P298 ?BirthCountry.\n" +
						"      }\n" +
						"    }\n" +
						"  }\n" +
						"  OPTIONAL { \n" +
						"    VALUES ?locationType2 {wd:Q532 wd:Q515 wd:Q3957 wd:Q1549591 wd:Q179872 wd:Q7830213 wd:Q2755753 wd:Q769603 wd:Q18663566 wd:Q486972}\n" +
						"    ?item p:P19 ?Entry.\n" +
						"    ?Entry ps:P19 ?BirthTemp.  \n" +
						"    ?BirthTemp wdt:P131 ?BirthCity.\n" +
						"    ?BirthCity wdt:P31/wdt:P279* ?locationType2.\n" +
						"    OPTIONAL { \n" +
						"      ?BirthCity p:P17 ?Country.\n" +
						"      ?Country ps:P17 ?Country_Of_Birth.\n" +
						"      ?Country a wikibase:BestRank\n" +
						"      OPTIONAL { \n" +
						"        ?Country_Of_Birth wdt:P298 ?BirthCountry.\n" +
						"      }\n" +
						"    }\n" +
						"  }\n" +
						"  OPTIONAL { \n" +
						"    VALUES ?locationType3 {wd:Q532 wd:Q515 wd:Q3957 wd:Q1549591 wd:Q179872 wd:Q7830213 wd:Q2755753 wd:Q769603 wd:Q18663566 wd:Q486972}\n" +
						"    ?item p:P20 ?Entry2.\n" +
						"    ?Entry2 ps:P20 ?DeathCity.\n" +
						"    ?DeathCity wdt:P31/wdt:P279* ?locationType3.\n" +
						"    OPTIONAL { \n" +
						"      ?DeathCity p:P17 ?Country2.\n" +
						"      ?Country2 ps:P17 ?Country_Of_Death.\n" +
						"      ?Country2 a wikibase:BestRank\n" +
						"      OPTIONAL { \n" +
						"        ?Country_Of_Death wdt:P298 ?DeathCountry.\n" +
						"      }\n" +
						"    }\n" +
						"  }\n" +
						"  OPTIONAL { \n" +
						"    VALUES ?locationType4 {wd:Q532 wd:Q515 wd:Q3957 wd:Q1549591 wd:Q179872 wd:Q7830213 wd:Q2755753 wd:Q769603 wd:Q18663566 wd:Q486972}\n" +
						"    ?item p:P20 ?Entry2.\n" +
						"    ?Entry2 ps:P20 ?DeathTemp.  \n" +
						"    ?DeathTemp wdt:P131 ?DeathCity.\n" +
						"    ?DeathCity wdt:P31/wdt:P279* ?locationType4.\n" +
						"    OPTIONAL { \n" +
						"      ?DeathCity p:P17 ?Country2.\n" +
						"      ?Country2 ps:P17 ?Country_Of_Death.\n" +
						"      ?Country2 a wikibase:BestRank\n" +
						"      OPTIONAL { \n" +
						"        ?Country_Of_Death wdt:P298 ?DeathCountry.\n" +
						"      }\n" +
						"    }\n" +
						"  }\n" +
						wikipediaQuery +
						"}";

			}else if (queryType == "LOSTFILMS"){
				var sparqlQuery = "SELECT ?letterboxdID WHERE {\n" +
						"  VALUES ?filmtype {wd:Q11424 wd:Q24862 wd:Q20667187 wd:Q226730 wd:Q506240 wd:Q336144} .\n" +
						"  ?item wdt:P31 ?filmtype.\n" +
						"  ?item wdt:P12020 wd:Q122238711.\n" +
						"  ?item wdt:P6127 ?letterboxdID.\n" +
						"}";
			} else {
				sparqlQuery = "SELECT DISTINCT ?item ?itemLabel ?Rotten_Tomatoes_ID ?Metacritic_ID ?Anilist_ID ?MAL_ID ?Mubi_ID ?FilmAffinity_ID ?SensCritique_ID ?Allocine_Film_ID ?Allocine_TV_ID ?Douban_ID ?Kinopoisk_ID ?DDD_ID ?Filmarks_ID ?MDL_ID ?Criterion_ID ?Criterion_Spine_ID ?Bluray_ID ?Ebert_ID ?Country_Of_Origin ?MPAA_film_ratingLabel ?BBFC_ratingLabel ?FSK_ratingLabel ?CNC_rating ?EIRIN_ratingLabel ?KMRB_ratingLabel ?ACB_ratingLabel ?ClassInd_ratingLabel ?Budget ?Budget_UnitLabel ?Budget_TogetherWith ?Box_OfficeUS ?Box_OfficeUS_UnitLabel ?Box_OfficeWW ?Box_OfficeWW_UnitLabel ?US_Title ?TV_Start ?TV_Start_Precision ?TV_End ?TV_End_Precision ?Wikipedia ?StateOfTransmission ?Plex_ID ?Filmweb_ID ?Trakt_ID WHERE {\n" +
					"  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n" +
					"\n" +
					sparqlQuery +
					"\n" +
					"  OPTIONAL { ?item wdt:P1258 ?Rotten_Tomatoes_ID. }\n" +
					"  OPTIONAL { ?item wdt:P1712 ?Metacritic_ID. }\n" +
					"  OPTIONAL { ?item wdt:P8729 ?Anilist_ID. }\n" +
					"  OPTIONAL { ?item wdt:P4086 ?MAL_ID. }\n" +
					"  OPTIONAL { ?item wdt:P7299 ?Mubi_ID. }\n" +
					"  OPTIONAL { ?item wdt:P480 ?FilmAffinity_ID. }\n" +
					"  OPTIONAL { ?item wdt:P10100 ?SensCritique_ID. }\n" +
					"  OPTIONAL { ?item wdt:P1265 ?Allocine_Film_ID }\n" +
					"  OPTIONAL { ?item wdt:P1267 ?Allocine_TV_ID }\n" +
					"  OPTIONAL { ?item wdt:P4529 ?Douban_ID }\n" +
					"  OPTIONAL { ?item wdt:P2603 ?Kinopoisk_ID }\n" +
					"  OPTIONAL { ?item wdt:P13888 ?DDD_ID }\n" +
					"  OPTIONAL { ?item wdt:P13904 ?Filmarks_ID }\n" +
					"  OPTIONAL { ?item wdt:P3868 ?MDL_ID }\n" +
					"  OPTIONAL { ?item wdt:P9584 ?Criterion_ID }\n" +
					"  OPTIONAL { ?item wdt:P12279 ?Criterion_Spine_ID }\n" +
        			"  OPTIONAL { ?item wdt:P13992 ?Bluray_ID }\n" +
        			"  OPTIONAL { ?item wdt:P6932 ?Ebert_ID }\n" +
					"  OPTIONAL { ?item wdt:P495 ?Country_Of_Origin. }\n" +
					"  OPTIONAL { ?item wdt:P1657 ?MPAA_film_rating. }\n" +
					"  OPTIONAL { ?item wdt:P2629 ?BBFC_rating. }\n" +
					"  OPTIONAL { ?item wdt:P1981 ?FSK_rating. }\n" +
					"  OPTIONAL { ?item wdt:P2758 ?CNC_rating. }\n" +
					"  OPTIONAL { ?item wdt:P2756 ?EIRIN_rating. }\n" +
					"  OPTIONAL { ?item wdt:P3818 ?KMRB_rating. }\n" +
					"  OPTIONAL { ?item wdt:P3156 ?ACB_rating. }\n" +
					"  OPTIONAL { ?item wdt:P3216 ?ClassInd_rating. }\n" +
					"  OPTIONAL { ?item wdt:P12020 ?StateOfTransmission. }\n" +
        			"  OPTIONAL { ?item wdt:P11460 ?Plex_ID. }\n" +
        			"  OPTIONAL { ?item wdt:P5032 ?Filmweb_ID. }\n" +
        			"  OPTIONAL { ?item wdt:P8013 ?Trakt_ID. }\n" +
					"  OPTIONAL {\n" +
					"    ?item p:P2130 ?Budget_Entry.\n" +
					"    ?Budget_Entry ps:P2130 ?Budget.\n" +
					"    OPTIONAL {\n" +
					"      ?Budget_Entry psv:P2130 ?valuenode.\n" +
					"      ?valuenode wikibase:quantityUnit ?Budget_Unit.\n" +
					"      ?Budget_Unit p:P498 [ps:P498 ?Budget_UnitLabel].\n" +
					"    }\n" +
					"    OPTIONAL {\n" +
					"      ?Budget_Entry pq:P1706 ?TogetherWith.\n" +
					"      ?TogetherWith wdt:P6127 ?Budget_TogetherWith\n" +
					"    }\n" +
					"    MINUS { ?Budget_Entry wikibase:rank wikibase:DeprecatedRank. }\n" +
					"  }\n" +
					"  OPTIONAL {\n" +
					"    ?item p:P2142 ?Box_Office_Entry.\n" +
					"    ?Box_Office_Entry ps:P2142 ?Box_OfficeUS;\n" +
					"      pq:P3005 wd:Q30.\n" +
					"    OPTIONAL {\n" +
					"      ?Box_Office_Entry psv:P2142 ?valuenode2.\n" +
					"      ?valuenode2 wikibase:quantityUnit ?Box_Office_Unit.\n" +
					"      ?Box_Office_Unit p:P498 [ps:P498 ?Box_OfficeUS_UnitLabel].\n" +
					"    }\n" +
					"    MINUS { ?Box_Office_Entry wikibase:rank wikibase:DeprecatedRank. }\n" +
					"  }\n" +
					"  OPTIONAL {\n" +
					"    ?item p:P2142 ?Box_Office_Entry.\n" +
					"    ?Box_Office_Entry ps:P2142 ?Box_OfficeUS;\n" +
					"      pq:P3005 wd:Q2017699.\n" +
					"    OPTIONAL {\n" +
					"      ?Box_Office_Entry psv:P2142 ?valuenode2.\n" +
					"      ?valuenode2 wikibase:quantityUnit ?Box_Office_Unit.\n" +
					"      ?Box_Office_Unit p:P498 [ps:P498 ?Box_OfficeUS_UnitLabel].\n" +
					"    }\n" +
					"    MINUS { ?Box_Office_Entry wikibase:rank wikibase:DeprecatedRank. }\n" +
					"  }\n" +
					"  OPTIONAL {\n" +
					"    ?item p:P2142 ?Box_Office_EntryWW.\n" +
					"    ?Box_Office_EntryWW ps:P2142 ?Box_OfficeWW;\n" +
					"      pq:P3005 wd:Q13780930.\n" +
					"    OPTIONAL {\n" +
					"      ?Box_Office_EntryWW psv:P2142 ?valuenode3.\n" +
					"      ?valuenode3 wikibase:quantityUnit ?Box_OfficeWW_Unit.\n" +
					"      ?Box_OfficeWW_Unit p:P498 [ps:P498 ?Box_OfficeWW_UnitLabel].\n" +
					"    }\n" +
					"    MINUS { ?Box_Office_EntryWW wikibase:rank wikibase:DeprecatedRank. }\n" +
					"  }\n" +
					"  OPTIONAL {\n" +
					"    ?item p:P1476 ?Title_Entry.\n" +
					"    ?Title_Entry ps:P1476 ?US_Title;\n" +
					"      pq:P3005 wd:Q30.\n" +
					"  }\n" +
					"  OPTIONAL { \n" +
					"    ?item p:P580 ?TV_Start_entry.\n" +
					"    ?TV_Start_entry ps:P580 ?TV_Start.\n" +
					"    ?TV_Start_entry psv:P580 [wikibase:timePrecision ?TV_Start_Precision].\n" +
					"    MINUS { ?TV_Start_entry wikibase:rank wikibase:DeprecatedRank. }\n" +
					"  }\n" +
					"  OPTIONAL { \n" +
					"    ?item p:P582 ?TV_End_entry.\n" +
					"    ?TV_End_entry ps:P582 ?TV_End.\n" +
					"    ?TV_End_entry psv:P582 [wikibase:timePrecision ?TV_End_Precision].\n" +
					"    MINUS { ?TV_End_entry wikibase:rank wikibase:DeprecatedRank. }\n" +
					"  }\n" +
					wikipediaQuery +
					"}";
			}

			return {
				url: 'https://query.wikidata.org/bigdata/namespace/wdq/sparql',
				options: {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Accept': 'application/sparql-results+json'
					},
					body: 'query=' + encodeURIComponent(sparqlQuery) + '&format=json'
				}
			};
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

		regexExtract(input, regexPattern, captureGroup, defaultValue) {
			if (input != null){
				const found = input.match(regexPattern);
				if (found){
					return found[captureGroup];
				}
			}

			return defaultValue;
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
	{ class: SimklHelper, target: letterboxd.overview, property: 'simklHelper', args: []},
	{ class: MyAnimeListHelper, target: letterboxd.overview, property: 'myAnimeListHelper', args: [letterboxd.overview.ratingsSuffix] },
	{ class: CriterionHelper, target: letterboxd.overview, property: 'criterionHelper', args: [] },
	{ class: MetacriticHelper, target: letterboxd.overview, property: 'metaHelper', args: [] },
	{ class: RankingHelper, target: letterboxd.overview, property: 'rankingHelper', args: [] },
	{ class: PlexHelper, target: letterboxd.overview, property: 'plexHelper', args: [] },
	{ class: FilmwebHelper, target: letterboxd.overview, property: 'filmwebHelper', args: [] },
	{ class: RottenTomatoesHelper, target: letterboxd.overview, property: 'tomatoHelper', args: [] },
	{ class: SensCritiqueHelper, target: letterboxd.overview, property: 'sensHelper', args: [] },
	{ class: CinemascoreHelper, target: letterboxd.overview, property: 'cinemascoreHelper', args: [] },
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
