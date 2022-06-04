/* global GM_xmlhttpRequest */
// ==UserScript==
// @name         Letterboxd Extras
// @namespace    https://github.com/duncanlang
// @version      1.0.0
// @description  Adds a few additional features to Letterboxd.
// @author       Duncan Lang
// @match        https://letterboxd.com/*
// @connect      https://www.imdb.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==


// setTimeout(function(){ debugger; }, 5000);  - used to freeze the inspector

(function() { // eslint-disable-line wrap-iife

	'use strict'; // eslint-disable-line strict
	
	/* eslint-disable */
	GM_addStyle(`
		.imdb-score {
			border-radius:20px;
			color:#789;
			display:block;
			font-family:Graphik-Light-Web,sans-serif;
			font-size:20px;
			font-weight:400;
			height:33px;
			line-height:40px;
			margin-left:1px;
			text-align:center;
			width:33px;			
		}
		.tomato-score {
			border-radius:20px;
			color:#789;
			display:block;
			font-family:Graphik-Light-Web,sans-serif;
			font-size:20px;
			font-weight:400;
			height:33px;
			line-height:40px;
			margin-left:1px;
			text-align:left;
			width:33px;			
		}
		.meta-score, .meta-score:hover, .meta-score-user, .meta-score-user:hover, .cinema-grade, .cinema-grade:hover {
			color: white;
			display: block;
			font-family: Arial,Helvetica,sans-serif;
			font-size: 16px;
			font-weight: bold !important;
			width: 30px;
			height: 30px;
			line-height: 30px;
			margin-left: 1px;
			margin-top: 5px;
			text-align: center;
			border-radius: 3px;
			vertical-align: top;
		}
		.meta-score-user, .meta-score-user:hover {
			border-radius: 100px;
			/*margin-left: 10px;*/
		}
		.cinema-grade, .cinema-grade:hover {
			font-size:20px;
		}
		.cinema-grade, .cinema-grade:hover{
			background: rgb(143,118,60);
			background: linear-gradient(24deg, rgba(143,118,60,1) 0%, rgba(234,189,45,1) 100%); 
			font-family: Times-New-Roman;
			border-radius: 0px;
		}
		.icon-tomato, .icon-popcorn, .icon-meta, .text-meta, .logo-tomatoes, .icon-rym, .meta-must-see, .logo-mal, .logo-anilist {
			background-position-x: left;
			background-position-y: top;
			background-repeat: no-repeat;
			background-attachment: scroll;
			background-size: contain;
			background-origin: padding-box;
			background-clip: border-box;
			width: 16px;
			height: 16px;
			display: inline-block;
			margin-right: 5px;
			opacity: 100%;
		}
		.icon-tomato {
			background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-empty.cd930dab34a.svg");
		}
		.icon-popcorn {
			background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/icons/audience/aud_score-empty.eb667b7a1c7.svg");
		}
		.meta-must-see{
			width: 30px;
			height: 30px;
			padding: 0px;
			background-image: url("https://www.metacritic.com/images/icons/mc-mustsee.svg");
		}
		.imdb-ratings, .tomato-ratings, .meta-ratings, .cinemascore, .mal-ratings, .al-ratings{
			margin-top: 15px !important;
		}
		.tomato-ratings .section-heading, .meta-ratings .section-heading, .cinemascore .section-heading{
			margin-bottom: 0px !important; 
		}
		.logo-tomatoes:hover, .logo-imdb:hover, .logo-meta-link:hover, .logo-rym.header:hover, .logo-mal:hover{
			opacity: 50%;
		}
		.logo-meta-link{
			opacity: 100%;
		}
		.logo-mal{
			width: 100px;
		}
		.text-rym{
			display: inline-block;
			height: 20px;
			width: auto;
			color: rgb(185, 111, 0);
			font-size: 15px;
			font-weight: bold;
			letter-spacing: 0;
			vertical-align: super;
		}
		.rating-star-extra, .rating-star-mal, .rating-star-al{
			background: transparent !important;
			overflow: visible !important;
			text-indent: -0.5px !important;
			line-height: 0.6 !important;
			font-size: 12.5px !important;
			color: gold;
			letter-spacing: -0.5px;
		}
		.rating-star-mal{
			color: #2e51a2;
		}
		.rating-star-al{
			color: #3db4f2;
		}
		.twipsy-extra-in{
			opacity: 1 !important;
			-webkit-transition: opacity 0.25s ease-out;
			transition: opacity 0.25s ease-out;
		}
		.twipsy-extra{
			opacity: 0 !important;
		}
		.twipsy-extra-out{
			opacity: 0 !important;
			-webkit-transition: opacity 0.10s linear;
			transition: opacity 0.10s linear;
		}
		.rt-button{
			display: inline;
			font-size: 9px;
			width: 48%;
			text-align: center;
			color: #9ab;
			border-radius: 3px;
			background-color: #283038;
			padding: 1px;
			padding-left: 3px;
			padding-right: 3px;
		}
		.rt-button.selected{
			color: #def;
		}
		.rt-button:not(.selected):not(.disabled):hover{
			color: #def;
			cursor: pointer;
		}
		.rt-button.disabled{
			color: #626d77;
			background-color: transparent;
			border: 1px solid #283038;
			padding-top: 0px;
			padding-bottom: 0px;
		}
		.rt-bar{
			display: inline-block;
			height: 5px;
			border-radius: 5px;
		}
		.rt-bar.outline{
			width: 70px;
			margin: 1px;
			border: 1px solid #283038;
			vertical-align: middle;
		}
		.rt-bar.fill{
			background-color: #678;
			vertical-align: top;
		}
		.show-details{
			font-size: 9px !important;
			top: 10px !important;
		}
		.show-details:hover{
			cursor: pointer;
		}

		.meta-score-details{
			width: 180px;
			margin-left: 5px;
			margin-bottom: 10px;
		}
		.meta-bar{
			display: inline-block;
			height: 3px;
			border-radius: 5px;
		}
		.meta-bar.outline{
			width: 70px;
			margin: 1px;
			border: 1px solid #283038;
			vertical-align: middle;
		}
		.meta-bar.fill{
			background-color: #678;
			vertical-align: top;
		}
		.micro-button{
			margin-right: 3px;
		}
	`);
	/* eslint-enable */

	const letterboxd = {

		overview: {

			lastLocation: window.location.pathname,

			running: false,

			// Letterboxd
			letterboxdYear: null,
			letterboxdTitle: null,

			// IMDb
			imdbID: "",
			imdbData: {state: 0, url: "", data: null, raw: null, state2 : 0, data2: null, rating: "", num_ratings: "", highest: 0, votes: new Array(10), percents: new Array(10), isMiniSeries: false, isTVEpisode: false, mpaa: null, meta: null},

			// TMDB
			tmdbID: '',
			tmdbTV: false,

			// Mojo
			mojoData: {url: "", data: null, budget: "", boxOfficeUS: "", boxOfficeWW: ""},

			// Cinemascore
			cinemascore: {state: 0, data: null, result: null},
			cinemascoreAlt: false,

			// Omdb
			omdbData: {state: 0, data: null},

			// WikiData
			wiki: null,
			wikiData: {state: 0, tomatoURL: null, metaURL: "", 
				budget: {value: null, currency: null}, 
				boxOfficeUS: {value: null, currency: null}, 
				boxOfficeWW: {value: null, currency: null},
				mpaa: null, date: null, date_origin: null, rating: null, US_Title: null, Alt_Title: null, TV_Start: null, TV_End: null, AniDB_ID: null, AniList_ID: null, MAL_ID: null},

			// Rotten Tomatoes
			tomatoData: {state: 0, data: null, raw: null, criticAll: null, criticTop: null, audienceAll: null, audienceVerified: null},

			// Metacritic
			metaData: {state: 0, data: null, raw: null, mustSee: false, critic: {rating: "tbd", num_ratings: 0, positive: 0, mixed: 0, negative: 0, highest: 0}, user:  {rating: "tbd", num_ratings: 0, positive: 0, mixed: 0, negative: 0, highest: 0}},

			// MPAA rating
			mpaaRating: null,

			// Date
			filmDate: null,

			// MAL
			mal: {state: 0, id: null,  url: null, data: null, statistics: null, highest: 0},

			// AniList
			al: {state: 0, id: null,  url: null, data: null, highest: 0, num_ratings: 0},

			linksAdded: [],
			
			rtAdded: false,
			metaAdded: false,
			dateAdded: false, 
			ratingAdded: false,

			stopRunning() {
				this.running = false;
			},

			async init() {
				if (this.running) return;

				this.running = true;

				if (document.querySelector(".number")){
					this.letterboxdYear = document.querySelectorAll(".number a")[0].innerText;
					this.letterboxdTitle = document.querySelector(".headline-1.js-widont.prettify").innerText;
				}

				// Add Cinema Score
				if (this.cinemascore.data == null && document.querySelector(".headline-1.js-widont.prettify") && this.cinemascore.state < 1){
					this.initCinema(null);
				}

				// First Get the IMDb link
				if (this.imdbID == "" && document.querySelector('.micro-button') != null){
					// Gets the IMDb link and ID, and also TMDB id
					this.getIMDbLink();
					this.moveLinks();
				}

				if (this.imdbID != "" && this.imdbData.state < 1){
					// Call IMDb and Add to page when done
					this.imdbData.state = 1;
					letterboxd.helpers.getData(this.imdbData.url).then((value) => {
						this.imdbData.raw = value.response;
						this.imdbData.data = letterboxd.helpers.parseHTML(this.imdbData.raw);
				
						if (this.imdbData.data != null){
							if (this.imdbData.raw.includes('(TV Mini Series)'))
								this.imdbData.isMiniSeries = true;
							if (this.imdbData.raw.includes('(TV Episode)'))
								this.imdbData.isTVEpisode = true;
	
							this.addIMDBScore();
							this.imdbData.state = 2;
						}
					});
					
					// Call the IMDb main show page
					letterboxd.helpers.getData(this.imdbData.url.replace('/ratings','')).then((value) => {
						this.imdbData.data2 = letterboxd.helpers.parseHTML(value.response);
				
						if (this.imdbData.data2 != null){	
							this.getIMDBAdditional();
						}
						this.imdbData.state2 = 1;
					});

					// Call BoxOfficeMojo
					var mojoURL = 'https://www.boxofficemojo.com/title/' + this.imdbID;
					this.addLink(mojoURL);
					letterboxd.helpers.getData(mojoURL).then((value) => {
						this.mojoData.data = letterboxd.helpers.parseHTML(value.response);
						this.addBoxOffice();

						// If MPAA rating found on Mojo, add it now
						if (this.mpaaRating != null)
							this.addRating();

						// If the domestic date was found on Mojo, add it now
						if (this.filmDate != null && this.dateAdded == false)
							this.addDate(this.filmDate);
					});
				}
				if (this.imdbID != '' || this.tmdbID != ''){
					// Call WikiData
					if (this.wikiData.state < 1){
						if (this.imdbID != '') // IMDb should be most reliable
							var queryString = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=' + letterboxd.helpers.getWikiDataQuery(this.imdbID, 'IMDB');
						else if (this.tmdbID != '' && this.tmdbTV == true)
							var queryString = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=' + letterboxd.helpers.getWikiDataQuery(this.tmdbID, 'TMDBTV');
						else if (this.tmdbID != '') // Every page should have a TMDB ID
							var queryString = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=' + letterboxd.helpers.getWikiDataQuery(this.tmdbID, 'TMDB');

						this.wikiData.state = 1;
						letterboxd.helpers.getWikiData(queryString).then((value) =>{
							if (value != null && value.results != null && value.results.bindings != null && value.results.bindings.length > 0){
								// Loop and find the best result
								if (value.results.bindings.length > 1){
									var results = [];
									for (var i = 0; i < value.results.bindings.length; i++){
										var result = value.results.bindings[i];
										var entry = {id: i, score: 0};

										if (result.TV_Start != null && !result.TV_Start.value.includes("-01-01T")){
											entry.score++;
										}
										if (result.TV_End != null && !result.TV_End.value.includes("-01-01T")){
											entry.score++;
										}
										if (result.Publication_Date != null && !result.Publication_Date.value.includes("-01-01T")){
											entry.score++;
										}
										if (result.Publication_Date_Origin != null && !result.Publication_Date_Origin.value.includes("-01-01T")){
											entry.score++;
										}
										if (result.Publication_Date_Backup != null && !result.Publication_Date_Backup.value.includes("-01-01T")){
											entry.score++;
										}
										results.push(entry);
									}
									results.sort((a, b) => {
										return b.score - a.score;
									});
									this.wiki = value.results.bindings[results[0].id];
								}
								
								if (this.wiki == null){
									this.wiki = value.results.bindings[0];
								}
								
								// Box Office and Budget
								if (this.wiki != null && this.wiki.Budget != null && this.wiki.Budget.value != null){
									this.wikiData.budget.value = this.wiki.Budget.value;
									if (this.wiki.Budget_UnitLabel != null)
										this.wikiData.budget.currency = this.wiki.Budget_UnitLabel.value;

									var value = parseInt(letterboxd.helpers.cleanNumber(this.wikiData.budget.value));
									var value2 = parseInt(letterboxd.helpers.cleanNumber(this.mojoData.budget));
									if (this.mojoData.budget == "" || (value > value2)){
										letterboxd.helpers.createDetailsRow("Budget",this.wikiData.budget.value, this.wikiData.budget.currency);
									}
								}
								if (this.wiki != null && this.wiki.Box_OfficeUS != null && this.wiki.Box_OfficeUS.value != null){
									this.wikiData.boxOfficeUS.value = this.wiki.Box_OfficeUS.value;
									if (this.wiki.Box_OfficeUS_UnitLabel != null)
										this.wikiData.boxOfficeUS.currency = this.wiki.Box_OfficeUS_UnitLabel.value;

									var value = parseInt(letterboxd.helpers.cleanNumber(this.wikiData.boxOfficeUS.value));
									var value2 = parseInt(letterboxd.helpers.cleanNumber(this.mojoData.boxOfficeUS));
									if (this.mojoData.boxOfficeUS == "" || (value > value2)){
										letterboxd.helpers.createDetailsRow("Box Office (US)",this.wikiData.boxOfficeUS.value, this.wikiData.boxOfficeUS.currency);
									}
								}
								if (this.wiki != null && this.wiki.Box_OfficeWW != null && this.wiki.Box_OfficeWW.value != null){
									this.wikiData.boxOfficeWW.value = this.wiki.Box_OfficeWW.value;
									if (this.wiki.Box_OfficeWW_UnitLabel != null)
										this.wikiData.boxOfficeWW.currency = this.wiki.Box_OfficeWW_UnitLabel.value;

									var value = parseInt(letterboxd.helpers.cleanNumber(this.wikiData.boxOfficeWW.value));
									var value2 = parseInt(letterboxd.helpers.cleanNumber(this.mojoData.boxOfficeWW));
									if (this.mojoData.boxOfficeWW == "" || (value > value2)){
										letterboxd.helpers.createDetailsRow("Box Office (WW)",this.wikiData.boxOfficeWW.value, this.wikiData.boxOfficeWW.currency);
									}
								}

								// Get TV dates
								var options = { year: 'numeric', month: 'short', day: 'numeric' };
								if (this.wiki.TV_Start != null){
									this.wikiData.TV_Start = new Date(this.wiki.TV_Start.value.replace("Z","")).toLocaleDateString("en-UK", options);
									this.filmDate = this.wikiData.TV_Start;
									var dateString = this.wikiData.TV_Start + " - ";
									if (this.wiki.TV_End != null){
										this.wikiData.TV_End = new Date(this.wiki.TV_End.value.replace("Z","")).toLocaleDateString("en-UK", options);
										dateString += this.wikiData.TV_End;
									}
									this.addDate(dateString);
								}else{								
									// Get Date
									if (this.wiki != null && this.wiki.Publication_Date != null){
										this.wikiData.date = new Date(this.wiki.Publication_Date.value.replace("Z","")).toLocaleDateString("en-UK", options);
									}
									if (this.wiki != null && this.wiki.Publication_Date_Origin != null){
										this.wikiData.date_origin = new Date(this.wiki.Publication_Date_Origin.value.replace("Z","")).toLocaleDateString("en-UK", options);
									}

									// Add the date to letterboxd
									// Prefer Country of Origin Date
									if (this.wikiData.date_origin != null){
										if (this.filmDate != null && this.wikiData.date_origin.startsWith('1 Jan')){
											// do nothing
										}else{
											this.filmDate = this.wikiData.date_origin;
											this.addDate(this.filmDate);
										}

									// Then US Date
									}else if (this.wikiData.date != null){
										if (this.filmDate != null && this.wikiData.date.startsWith('1 Jan')){
											// do nothing
										}else{
											this.filmDate = this.wikiData.date;
											this.addDate(this.filmDate);
										}

									// Then Backup date (first date without country qualifier)
									}else if (this.wiki != null && this.wiki.Publication_Date_Backup != null){
										var date = new Date(this.wiki.Publication_Date_Backup.value.replace("Z","")).toLocaleDateString("en-UK", options);
										this.wikiData.date = date;
										if (this.filmDate != null && this.wikiData.date.startsWith('1 Jan')){
											// do nothing
										}else{
											this.filmDate = date;
											this.addDate(this.filmDate);
										}
									}
								}
				
								// Add Rating
								if (this.wiki != null && this.wiki.MPAA_film_ratingLabel != null){
									this.mpaaRating = letterboxd.helpers.determineMPAARating(this.wiki.MPAA_film_ratingLabel.value);
									this.addRating();	
								}

								// Get US Title and attempt Cinemascore
								if (this.wiki.US_Title != null && this.wiki.US_Title != "")
									this.wikiData.US_Title = this.wiki.US_Title.value;
									
								if (this.wiki.itemLabel != null && this.wiki.itemLabel != "")
									this.wikiData.Alt_Title = this.wiki.itemLabel.value;

								// Get and add Metacritic
								if (this.wiki != null && this.wiki.Metacritic_ID != null && this.wiki.Metacritic_ID.value != null){
									this.wikiData.metaURL = "https://www.metacritic.com/" + this.wiki.Metacritic_ID.value;
									this.addLink(this.wikiData.metaURL);

									if (this.metaData.data == null && this.metaAdded == false && this.metaData.state < 1){
										try{
											this.metaData.state = 1;
											letterboxd.helpers.getData(this.wikiData.metaURL).then((value) =>{
												var meta = value.response;
												if (meta != ""){
													this.metaData.raw = meta;
													this.metaData.data = letterboxd.helpers.parseHTML(meta);
													this.wikiData.metaURL = value.url;

													this.addMeta();
													this.metaData.state = 2;
												}
											});
										}catch{
											console.log("Unable to parse Metacritic URL");
											this.metaAdded = true; // so it doesn't keep calling
											this.metaData.state = 3;
										}
									}
								}else if (this.metaData.state < 1){
									this.metaData.state = 3;
								}

								// Get and add Rotten Tomatoes
								if (this.wiki != null && this.wiki.Rotten_Tomatoes_ID != null && this.wiki.Rotten_Tomatoes_ID.value != null){
									var url = "https://www.rottentomatoes.com/" + this.wiki.Rotten_Tomatoes_ID.value;
									if (url.includes('/tv/'))
										url += "/s01"

									this.wikiData.tomatoURL = url;
									this.initTomato();
								}

								// Get MAL data
								if (this.wiki != null && this.wiki.MAL_ID != null && this.wiki.MAL_ID.value != null){
									this.wikiData.MAL_ID = this.wiki.MAL_ID.value;
									this.mal.id = this.wiki.MAL_ID.value;

									var url = 'https://api.jikan.moe/v4/anime/' + this.mal.id;
									this.mal.url = url;

									if (this.mal.data == null && this.mal.state < 1){
										try{
											this.mal.state = 1;
											letterboxd.helpers.getData(url).then((value) =>{
												var mal = value.response;
												if (mal != ""){
													this.mal.data = JSON.parse(mal);

													if (this.mal.data.data != null){
														this.mal.data = this.mal.data.data;
														this.mal.url = this.mal.data.url;
													}else{
														this.mal.state = 3;
													}
												}
											});
											
											letterboxd.helpers.getData(url + "/statistics").then((value) =>{
												var mal = value.response;
												if (mal != ""){
													this.mal.statistics = JSON.parse(mal);
													
													if (this.mal.statistics.data != null){
														this.mal.statistics = this.mal.statistics.data;
													}else{
														this.mal.state = 3;
													}
												}
											});
										}catch{
											console.log("Unable to parse MAL URL");
											this.mal.state = 3;
										}
									}
								}

								// Get AniList data
								if (this.wiki != null && this.wiki.Anilist_ID != null && this.wiki.Anilist_ID.value != null){
									this.wikiData.Anilist_ID = this.wiki.Anilist_ID.value;
									this.al.id = this.wiki.Anilist_ID.value;

									var url = 'https://graphql.anilist.co';
									var query = `
									query ($id: Int) {
										Media(id: $id, type: ANIME) {
										  averageScore
										  meanScore
										  popularity
										  stats {
											scoreDistribution {
											  score
											  amount
											}
										  }
										  siteUrl
										}
									  }
									`;

									if (this.al.data == null && this.al.state < 1){
										try{
											this.al.state = 1;
											letterboxd.helpers.getALData(url, query, this.al.id).then((value) =>{
												var al = value.response;
												if (al != ""){
													this.al.data = JSON.parse(al).data.Media;

													if (this.al.data != null){
														this.al.url = this.al.data.siteUrl;
														this.addLink(this.al.data.siteUrl);
	
														this.al.state = 2;
														this.addAL();
													}else{
														this.al.state = 3;
													}
												}
											});
										}catch{
											console.log("Unable to parse AniList URL");
											this.al.state = 3;
										}
									}
								}

								this.wikiData.state = 2;
							}
						});
					}
				}

				// Add MAL
				if (this.mal.data != null && this.mal.statistics != null && this.mal.state < 2){
					this.mal.state = 2;
					this.addLink(this.mal.url);
					this.addMAL();
				}

				// Cinemascore alt titles and years
				if (this.cinemascore.data != null && this.wikiData.state == 2 && this.cinemascoreAlt == false && this.cinemascore.state != 2){
					this.cinemascoreAlt = true;
					if (this.wikiData.TV_Start == null){
						var alt_Title = true;
						if ((this.wikiData.date != null && new Date(this.wikiData.date).getFullYear() != this.letterboxdYear) || (this.wikiData.date_origin != null && new Date(this.wikiData.date_origin).getFullYear() != this.letterboxdYear)){
							if (this.verifyCinema(this.cinemascore.data, letterboxd.helpers.cinemascoreTitle(null), "all")){
								alt_Title = false;
								this.addCinema();
							}
						}
	
						if (alt_Title){
							if (this.wikiData.US_Title != null && this.wikiData.US_Title != this.letterboxdTitle){
								this.initCinema(this.wikiData.US_Title);
							}
							if (this.wikiData.Alt_Title != null && this.wikiData.Alt_Title != this.letterboxdTitle){
								this.initCinema(this.wikiData.Alt_Title);
							}
						}
					}
				}

				// Add the IMDb backup info here
				if (this.imdbData.state2 == 1 && this.wikiData.state == 2){
					this.imdbData.state2 = 2;

					// MPAA / Parental Guidence
					if (this.mpaaRating == null && this.imdbData.mpaa != null){
						this.mpaaRating = this.imdbData.mpaa;
						this.addRating();
					}

					// Metascore
					if (this.metaData.state == 3 && this.imdbData.meta != null){
						this.metaData.state = 2;
						this.addMeta();
					}
				}

				// Call OMDb for backup
				if (this.wikiData.state == 2 && this.imdbData.state2 == 2 && (this.tomatoData.state == 3 || this.metaData.state == 3 || ((this.dateAdded == false || this.filmDate.startsWith("1 Jan")) && this.wikiData.TV_Start == null))){

					var queryString = "https://www.omdbapi.com/?apikey=afd82b43&i=" + this.imdbID + "&plot=short&r=json&tomatoes=true";
					if (this.omdbData.state < 1){
						this.omdbData.state = 1;

						letterboxd.helpers.getOMDbData(queryString).then((value) => {
							this.omdbData.data = value;
							this.omdbData.state = 2;
	
							// Check if OMDb response is valid
							if (this.omdbData.data != null && this.omdbData.data.Response == "True"){			
								// Add full release date
								if (this.omdbData.data.Released != null && this.omdbData.data.Released != "N/A" && (this.wiki == null || this.wiki.Publication_Date == null) && (this.dateAdded == false || this.filmDate.startsWith("1 Jan"))){
									this.filmDate = this.omdbData.data.Released;
									this.addDate(this.filmDate);

									if(this.cinemascore.state < 2){
										this.initCinema(null);
									}
								}
			
								// Add Rating
								if (this.omdbData.data.Rated != null && this.omdbData.data.Rated != "N/A" && (this.wiki == null || this.wiki.MPAA_film_ratingLabel == null) && this.ratingAdded == false){
									this.mpaaRating = this.omdbData.data.Rated;
									this.addRating();	
								}
		
								// Add Metacritic
								if (this.omdbData.data.Metascore != null && this.omdbData.data.Metascore != "N/A" && (this.wiki == null || this.wiki.Metacritic_ID == null || this.wiki.Metacritic_ID.value == null) && this.metaAdded == false){
									this.addMeta();
								}
		
								// Get Rotten Tomatoes data
								if (this.omdbData.data.tomatoURL != null && this.omdbData.data.tomatoURL != "" && this.omdbData.data.tomatoURL != "N/A" && (this.wiki == null || this.wiki.Rotten_Tomatoes_ID == null || this.wiki.Rotten_Tomatoes_ID.value == null) && this.rtAdded == false){
									this.omdbData.data.tomatoURL = letterboxd.helpers.fixURL(this.omdbData.data.tomatoURL);
									this.wikiData.tomatoURL = this.omdbData.data.tomatoURL;
									this.initTomato();
								}
							}
						});
					}				
				}

				// Stop
				return this.stopRunning();
			},

			getIMDbLink(){
				// Get the two links (imdb and tmdb)
				const links = document.querySelectorAll('.micro-button.track-event');

				var imdbLink = "";
				var tmdbLink = "";

				// Loop and find IMDB
				for(var i = 0; i < links.length; i++){
					if (links[i].innerHTML === "IMDb"){
						// Grab the imdb page
						imdbLink = links[i].href;
						if (!imdbLink.includes("https") && imdbLink.includes('http'))
							imdbLink = imdbLink.replace("http","https");
						if (imdbLink.includes("maindetails"))
							imdbLink = imdbLink.replace("maindetails","ratings");

						this.imdbData.url = imdbLink;

					}else if (links[i].innerHTML === "TMDb"){
						// Grab the tmdb link
						tmdbLink = links[i].href;
					}
				}

				// Separate out the ID
				if (imdbLink != ""){
					this.imdbID = imdbLink.match(/(imdb.com\/title\/)(tt[0-9]+)(\/)/)[2];
				}

				// Separate the TMDB ID
				if (tmdbLink != ""){
					if (tmdbLink.includes('/tv/')){
						this.tmdbTV = true;
					}
					this.tmdbID = tmdbLink.match(/(themoviedb.org\/(?:tv|movie)\/)([0-9]+)($|\/)/)[2];
				}
			},

			addIMDBScore(){
				if (document.querySelector('.imdb-ratings')) return;

				if (!document.querySelector('.sidebar')) return;

				// No Ratings - return
				if (this.imdbData.data.querySelector('.sectionHeading').innerHTML.includes('No Ratings Available')) return


				// Get the score
				if (this.imdbData.data.querySelector('.ratingTable.Selected .bigcell')){
					this.imdbData.rating = this.imdbData.data.querySelector('.ratingTable.Selected .bigcell').innerText;
				}else{
					this.imdbData.rating = this.imdbData.data.querySelector('.ipl-rating-star__rating').innerText;
				}
				
				// Get the number of ratings
				var tempArray = this.imdbData.data.querySelectorAll('.allText');
				for (var ii = 0; ii < tempArray.length; ii++){
					if (tempArray[ii].innerHTML.includes('IMDb users have given a')){
						this.imdbData.num_ratings = letterboxd.helpers.getTextBetween(tempArray[ii].innerText,'\n                ','\nIMDb users');
						break;
					}
				}

				// Get the votes
				var tables = this.imdbData.data.querySelectorAll('table')
				var tableRows = tables[0].rows;

				var k = 0
				for (var ii = 1; ii < tableRows.length; ii++){
					var votes = tableRows[ii].cells[2].children[0].children[0].innerText;
					votes = votes.replaceAll(',','');
					votes = votes.replaceAll(/\s/g,'');
					votes = votes.replaceAll('.','');
					votes = parseInt(votes);

					if (votes > 0){
						var percent = letterboxd.helpers.getTextBetween(tableRows[ii].cells[1].children[1].children[0].innerHTML,'&nbsp;\n','\n');
						percent = parseFloat(percent)
					}else{
						percent = parseFloat(0);
					}

					this.imdbData.percents[k] = percent;
					this.imdbData.votes[k] = votes;

					if (votes > this.imdbData.highest)
						this.imdbData.highest = votes;

					k++;
				}

				this.imdbData.percents[k] = this.imdbData.percents.reverse();
				this.imdbData.votes[k] = this.imdbData.votes.reverse();

				// Actually add the score ****************
				
				// Add the section to the page
				const imdbScoreSection = letterboxd.helpers.createElement('section', {
					class: 'section ratings-histogram-chart imdb-ratings'
				});				

				// Add the Header
				const imdbHeading = letterboxd.helpers.createElement('h2', {
					class: 'section-heading',
					style: 'height: 16px;'
				});
				imdbScoreSection.append(imdbHeading);

				const imdbLogoHolder = letterboxd.helpers.createElement('a', {
					class: "logo-imdb",
					href: this.imdbData.url,
					style: "position: absolute;"
				});
				imdbLogoHolder.innerHTML = '<svg id="home_img" class="ipc-logo" xmlns="http://www.w3.org/2000/svg" width="32" height="16" viewBox="0 0 64 32" version="1.1"><g fill="#F5C518"><rect x="0" y="0" width="100%" height="100%" rx="4"></rect></g><g transform="translate(8.000000, 7.000000)" fill="#000000" fill-rule="nonzero"><polygon points="0 18 5 18 5 0 0 0"></polygon><path d="M15.6725178,0 L14.5534833,8.40846934 L13.8582008,3.83502426 C13.65661,2.37009263 13.4632474,1.09175121 13.278113,0 L7,0 L7,18 L11.2416347,18 L11.2580911,6.11380679 L13.0436094,18 L16.0633571,18 L17.7583653,5.8517865 L17.7707076,18 L22,18 L22,0 L15.6725178,0 Z"></path><path d="M24,18 L24,0 L31.8045586,0 C33.5693522,0 35,1.41994415 35,3.17660424 L35,14.8233958 C35,16.5777858 33.5716617,18 31.8045586,18 L24,18 Z M29.8322479,3.2395236 C29.6339219,3.13233348 29.2545158,3.08072342 28.7026524,3.08072342 L28.7026524,14.8914865 C29.4312846,14.8914865 29.8796736,14.7604764 30.0478195,14.4865461 C30.2159654,14.2165858 30.3021941,13.486105 30.3021941,12.2871637 L30.3021941,5.3078959 C30.3021941,4.49404499 30.272014,3.97397442 30.2159654,3.74371416 C30.1599168,3.5134539 30.0348852,3.34671372 29.8322479,3.2395236 Z"></path><path d="M44.4299079,4.50685823 L44.749518,4.50685823 C46.5447098,4.50685823 48,5.91267586 48,7.64486762 L48,14.8619906 C48,16.5950653 46.5451816,18 44.749518,18 L44.4299079,18 C43.3314617,18 42.3602746,17.4736618 41.7718697,16.6682739 L41.4838962,17.7687785 L37,17.7687785 L37,0 L41.7843263,0 L41.7843263,5.78053556 C42.4024982,5.01015739 43.3551514,4.50685823 44.4299079,4.50685823 Z M43.4055679,13.2842155 L43.4055679,9.01907814 C43.4055679,8.31433946 43.3603268,7.85185468 43.2660746,7.63896485 C43.1718224,7.42607505 42.7955881,7.2893916 42.5316822,7.2893916 C42.267776,7.2893916 41.8607934,7.40047379 41.7816216,7.58767002 L41.7816216,9.01907814 L41.7816216,13.4207851 L41.7816216,14.8074788 C41.8721037,15.0130276 42.2602358,15.1274059 42.5316822,15.1274059 C42.8031285,15.1274059 43.1982131,15.0166981 43.281155,14.8074788 C43.3640968,14.5982595 43.4055679,14.0880581 43.4055679,13.2842155 Z"></path></g></svg>'
				imdbHeading.append(imdbLogoHolder);

				// The span that holds the score
				const imdbScoreSpan = letterboxd.helpers.createElement('span', {
					['itemprop']: 'aggregateRating',
					['itemscope']: '',
					['itemtype']: 'http://schema.org/AggregateRating',
					class: 'average-rating',
					style: 'left: 188px; position:absolute;'
				});
				imdbScoreSection.append(imdbScoreSpan);
				
				// The element that is the score itself
				const imdbScore = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight imdb-score tooltip-extra',
					href: this.imdbData.url.replace('ratings','reviews'),
					['data-original-title']: 'Weighted average of ' + this.imdbData.rating + '/10 based on ' + this.imdbData.num_ratings + ' ratings'
				});
				imdbScore.innerText = this.imdbData.rating;
				imdbScoreSpan.append(imdbScore);


				// Add the bars for the rating
				const histogram = letterboxd.helpers.createElement('div', {
					class: 'rating-histogram clear rating-histogram-exploded'
				});
				imdbScoreSection.append(histogram);
				const ul = letterboxd.helpers.createElement('ul', {
				});
				histogram.append(ul);

				for (var ii = 0; ii < 10; ii++){	
					var left = (ii * 16).toString() + "px;";
					const il = letterboxd.helpers.createElement('li', {
						class: 'rating-histogram-bar',
						style: "width: 15px; left: " + left
					});
					ul.append(il);

					var url = this.imdbData.url.replace('/ratings','') + '/reviews?ratingFilter=' + (ii + 1).toString();
					const a = letterboxd.helpers.createElement('a', {
						class: 'ir tooltip imdb tooltip-extra',
						href: url,
						['data-original-title']: this.imdbData.votes[ii].toLocaleString() + " " + (ii + 1).toString() + '/10 ratings (' + this.imdbData.percents[ii].toString() + '%)'
					});
					il.append(a);

					var max = 44.0;
					var min = 1;
					var percent = this.imdbData.votes[ii] / this.imdbData.highest;
					var height = (max * percent);

					if (height < min)
						height = min;

					height = height.toString() + "px;";

					const i = letterboxd.helpers.createElement('i', {
						style: 'height: ' + height
					});
					a.append(i);
				}

				// Add the stars for visual
				const span1Star = letterboxd.helpers.createElement('span', {
					class: 'rating-green rating-green-tiny rating-1'
				});
				const span1StarInner = letterboxd.helpers.createElement('span', {
					class: 'rating rated-2 rating-star-extra'
				});
				span1StarInner.innerText = "★";
				span1Star.append(span1StarInner);

				const span5Star = letterboxd.helpers.createElement('span', {
					class: 'rating-green rating-green-tiny rating-5'
				});
				const span5StarInner = letterboxd.helpers.createElement('span', {
					class: 'rating rated-10 rating-star-extra'
				});
				span5StarInner.innerText = "★★★★★";
				span5Star.append(span5StarInner);

				ul.before(span1Star);
				ul.after(span5Star);

				// Append to the sidebar
				//*****************************************************************
				this.appendRating(imdbScoreSection, 'imdb-ratings');

				
				// Add the hover events
				//*****************************************************************
				$(".tooltip-extra").on("mouseover", ShowTwipsy);
				$(".tooltip-extra").on("mouseout", HideTwipsy);
			},

			getIMDBAdditional(){
				// First see if it has a parental rating
				var details = this.imdbData.data2.querySelectorAll('.ipc-inline-list.ipc-inline-list--show-dividers.sc-8c396aa2-0.kqWovI.baseAlt li');
				if (details != null){
					for (var i = 0; i < details.length; i++){
						var a = details[i].querySelector('a');
						if (a != null){
							if (a.getAttribute('href').includes('parentalguide')){
								this.imdbData.mpaa = a.innerText.trim();
								break;
							}
						}
					}
				}

				// Next grab the metascore if it has it
				var meta = this.imdbData.data2.querySelector('.score-meta');
				if (meta != null){
					this.imdbData.meta = meta.innerText.trim();
				}

				// We will not add anything yet, we will wait until we are sure WikiData is missing them
			},

			initTomato(){
				if (this.wikiData.tomatoURL != null && this.wikiData.tomatoURL != ""){
					this.addLink(this.wikiData.tomatoURL);
	
					if (this.tomatoData.data == null && this.rtAdded == false && this.tomatoData.state < 1){
						try{
							this.tomatoData.state = 1;
							letterboxd.helpers.getData(this.wikiData.tomatoURL).then((value) =>{
								var tomato = value.response;
								if (tomato != ""){
									this.tomatoData.raw = tomato;
									this.tomatoData.data = letterboxd.helpers.parseHTML(tomato);
									this.wikiData.tomatoURL = value.url;
									
									this.addTomato();
									this.tomatoData.state = 2;
								}
							});
						}catch{
							console.log("Unable to parse Rotten Tomatoes URL");
							this.rtAdded = true; // so it doesn't keep calling
							this.tomatoData.state = 3;
						}
					}else if (this.tomatoData.state < 1){
						this.tomatoData.state = 3;
					}
				}
			},

			addTomato(){				
				if (document.querySelector('.tomato-ratings')) return;

				if (!document.querySelector('.sidebar')) return;

				if (this.tomatoData.raw.includes('404 - Not Found')) return;

				// Lets grab all the potentially useful information first 
				//***************************************************************
				this.tomatoData.criticAll = {percent: "--", state: "", rating: "", num_ratings: "0", likedCount: "0", notLikedCount: "0"};
				this.tomatoData.criticTop = {percent: "--", state: "", rating: "", num_ratings: "0", likedCount: "0", notLikedCount: "0"};
				this.tomatoData.audienceAll = {percent: "--", state: "", rating: "", num_ratings: "0", likedCount: "0", notLikedCount: "0"};
				this.tomatoData.audienceVerified = {percent: "--", state: "", rating: "", num_ratings: "0", likedCount: "0", notLikedCount: "0"};

				// Different collected for Movies vs TV
				if (!this.wikiData.tomatoURL.includes('/tv/')){
					// MOVIES
					var scoredetails = JSON.parse(this.tomatoData.data.querySelector('#score-details-json').innerHTML);
					// Critic All
					if (scoredetails.modal.tomatometerScoreAll.score != null){
						this.tomatoData.criticAll.percent 					= scoredetails.modal.tomatometerScoreAll.score.toString();
						this.tomatoData.criticAll.state 					= scoredetails.modal.tomatometerScoreAll.tomatometerState;
						this.tomatoData.criticAll.rating 					= scoredetails.modal.tomatometerScoreAll.averageRating;
					}
					if (scoredetails.modal.tomatometerScoreAll.ratingCount != null){
						this.tomatoData.criticAll.num_ratings 				= scoredetails.modal.tomatometerScoreAll.ratingCount.toString();
						this.tomatoData.criticAll.likedCount 				= scoredetails.modal.tomatometerScoreAll.likedCount.toString();
						this.tomatoData.criticAll.notLikedCount 			= scoredetails.modal.tomatometerScoreAll.notLikedCount.toString();
					}
					// Critic Top
					if (scoredetails.modal.tomatometerScoreTop.score != null){
						this.tomatoData.criticTop.percent 				= scoredetails.modal.tomatometerScoreTop.score.toString();
						this.tomatoData.criticTop.state 				= scoredetails.modal.tomatometerScoreTop.tomatometerState;
						this.tomatoData.criticTop.rating 				= scoredetails.modal.tomatometerScoreTop.averageRating;

						var score = scoredetails.modal.tomatometerScoreTop.score;
						var state = scoredetails.modal.tomatometerScoreTop.tomatometerState;
						if (score < 60 && state.includes("fresh")){
							this.tomatoData.criticTop.state = "rotten";
						}else if(score >= 60 && state == "rotten"){
							this.tomatoData.criticTop.state = "fresh";
						}
					}
					if (scoredetails.modal.tomatometerScoreTop.ratingCount != null){
						this.tomatoData.criticTop.num_ratings 			= scoredetails.modal.tomatometerScoreTop.ratingCount.toString();
						this.tomatoData.criticTop.likedCount 			= scoredetails.modal.tomatometerScoreTop.likedCount.toString();
						this.tomatoData.criticTop.notLikedCount 		= scoredetails.modal.tomatometerScoreTop.notLikedCount.toString();
					}
					
					// Audience All	
					if (scoredetails.modal.audienceScoreAll.score != null){
						this.tomatoData.audienceAll.percent 				= scoredetails.modal.audienceScoreAll.score.toString();
						this.tomatoData.audienceAll.state 					= scoredetails.modal.audienceScoreAll.audienceClass;
						this.tomatoData.audienceAll.rating 					= scoredetails.modal.audienceScoreAll.averageRating;
					}
					if (scoredetails.modal.audienceScoreAll.ratingCount != null){
						this.tomatoData.audienceAll.num_ratings 			= scoredetails.modal.audienceScoreAll.ratingCount.toString();
						this.tomatoData.audienceAll.likedCount 				= scoredetails.modal.audienceScoreAll.likedCount.toString();
						this.tomatoData.audienceAll.notLikedCount 			= scoredetails.modal.audienceScoreAll.notLikedCount.toString();
						// Sometimes, the audience ratings are odd, so lets just combine the liked/notliked as that seems more accurate
						this.tomatoData.audienceAll.num_ratings = (scoredetails.modal.audienceScoreAll.likedCount + scoredetails.modal.audienceScoreAll.notLikedCount).toString();
					}

					// Audience Verified
					if (scoredetails.modal.audienceScoreVerified.score != null){
						this.tomatoData.audienceVerified.percent 		= scoredetails.modal.audienceScoreVerified.score.toString();
						this.tomatoData.audienceVerified.state 			= scoredetails.modal.audienceScoreVerified.audienceClass;
						this.tomatoData.audienceVerified.rating 		= scoredetails.modal.audienceScoreVerified.averageRating;
					}
					if (scoredetails.modal.audienceScoreVerified.ratingCount != null){
						this.tomatoData.audienceVerified.num_ratings 	= scoredetails.modal.audienceScoreVerified.ratingCount.toString();
						this.tomatoData.audienceVerified.likedCount 	= scoredetails.modal.audienceScoreVerified.likedCount.toString();
						this.tomatoData.audienceVerified.notLikedCount 	= scoredetails.modal.audienceScoreVerified.notLikedCount.toString();
						
						// Sometimes, the audience ratings are odd, so lets just combine the liked/notliked as that seems more accurate
					this.tomatoData.audienceVerified.num_ratings = (scoredetails.modal.audienceScoreVerified.likedCount + scoredetails.modal.audienceScoreVerified.notLikedCount).toString();
					}

				}else{
					// TV MINI SERIES
					var scoreInfo = JSON.parse(letterboxd.helpers.getTextBetween(this.tomatoData.raw, ".scoreInfo = ",";"));
					
					// Critic All
					if (scoreInfo.tomatometerAllCritics.score != null){
						this.tomatoData.criticAll.percent 					= scoreInfo.tomatometerAllCritics.score.toString();
						this.tomatoData.criticAll.state 					= scoreInfo.tomatometerAllCritics.state;
						this.tomatoData.criticAll.rating 					= scoreInfo.tomatometerAllCritics.averageRating;
						this.tomatoData.criticAll.likedCount 				= scoreInfo.tomatometerAllCritics.likedCount.toString();
						this.tomatoData.criticAll.notLikedCount 			= scoreInfo.tomatometerAllCritics.notLikedCount.toString();

						if (scoreInfo.tomatometerAllCritics.ratingCount != null){
							this.tomatoData.criticAll.num_ratings 			= scoreInfo.tomatometerAllCritics.ratingCount.toString();
						}else if (scoreInfo.tomatometerAllCritics.reviewCount != null){
							this.tomatoData.criticAll.num_ratings 			= scoreInfo.tomatometerAllCritics.reviewCount.toString();
						}
					}
					// Critic Top
					if (scoreInfo.tomatometerTopCritics.score != null){
						this.tomatoData.criticTop.percent 				= scoreInfo.tomatometerTopCritics.score.toString();
						this.tomatoData.criticTop.state 				= scoreInfo.tomatometerTopCritics.state;
						this.tomatoData.criticTop.rating 				= scoreInfo.tomatometerTopCritics.averageRating;
						this.tomatoData.criticTop.likedCount 			= scoreInfo.tomatometerTopCritics.likedCount.toString();
						this.tomatoData.criticTop.notLikedCount 		= scoreInfo.tomatometerTopCritics.notLikedCount.toString();
						
						if (scoreInfo.tomatometerTopCritics.ratingCount != null){
							this.tomatoData.criticTop.num_ratings 			= scoreInfo.tomatometerTopCritics.ratingCount.toString();
						}else if (scoreInfo.tomatometerTopCritics.reviewCount != null){
							this.tomatoData.criticTop.num_ratings 			= scoreInfo.tomatometerTopCritics.reviewCount.toString();
						}
					}
					
					// Audience All	
					if (scoreInfo.audienceAll != null && scoreInfo.audienceAll.score != null){
						this.tomatoData.audienceAll.percent 				= scoreInfo.audienceAll.score.toString();
						this.tomatoData.audienceAll.state 					= scoreInfo.audienceAll.state;
						this.tomatoData.audienceAll.rating 					= scoreInfo.audienceAll.averageRating;
						//this.tomatoData.audienceAll.num_ratings 			= scoreInfo.audienceAll.ratingCount.toString();
						this.tomatoData.audienceAll.likedCount 				= scoreInfo.audienceAll.likedCount.toString();
						this.tomatoData.audienceAll.notLikedCount 			= scoreInfo.audienceAll.notLikedCount.toString();
						// Sometimes, the audience ratings are odd, so lets just combine the liked/notliked as that seems more accurate
						this.tomatoData.audienceAll.num_ratings = (scoreInfo.audienceAll.likedCount + scoreInfo.audienceAll.notLikedCount).toString();
					}
					
					// Audience Verified - shouldn't ever be a thing for TV, but what the heck
					if (scoreInfo.audienceAll != null && scoreInfo.audienceVerified != null){
						this.tomatoData.audienceVerified.percent 		= scoreInfo.audienceVerified.score.toString();
						this.tomatoData.audienceVerified.state 			= scoreInfo.audienceVerified.state;
						this.tomatoData.audienceVerified.rating 		= scoreInfo.audienceVerified.averageRating;
						//this.tomatoData.audienceVerified.num_ratings 	= scoreInfo.audienceVerified.ratingCount.toString();
						this.tomatoData.audienceVerified.likedCount 	= scoreInfo.audienceVerified.likedCount.toString();
						this.tomatoData.audienceVerified.notLikedCount 	= scoreInfo.audienceVerified.notLikedCount.toString();
						
						// Sometimes, the audience ratings are odd, so lets just combine the liked/notliked as that seems more accurate
						this.tomatoData.audienceVerified.num_ratings = (scoreInfo.audienceVerified.likedCount + scoreInfo.audienceVerified.notLikedCount).toString();
					}
				}

				// Return if no scores what so ever
				//if (this.tomatoData.audienceAll.percent == "--" && this.tomatoData.criticAll.percent == "--") return;
				if (this.tomatoData.audienceAll.num_ratings == 0 && this.tomatoData.criticAll.num_ratings == 0) return;

				// Now display all this on the page
				//***************************************************************
				// Add the section to the page
				const section = letterboxd.helpers.createElement('section', {
					class: 'section ratings-histogram-chart tomato-ratings'
				});				

				// Add the Header - 
				const heading = letterboxd.helpers.createElement('h2', {
					class: 'section-heading',
					style: 'height: 20px;'
				});
				section.append(heading);

				const logo = letterboxd.helpers.createElement('a', {
					class: 'logo-tomatoes',
					href: this.wikiData.tomatoURL,
					style: 'height: 20px; width: 75px; background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/rtlogo.9b892cff3fd.png");'
				});
				heading.append(logo);	

				// Add the Show Details button			
				const showDetails = letterboxd.helpers.createElement('a', {
					class: 'all-link more-link show-details rt-show-details',
					['target']: 'rt-score-details'
				});
				showDetails.innerText = "Show Details";
				section.append(showDetails);

				// CRITIC SCORE /  TOMATOMETER
				//************************************************************
				// The span that holds the score
				const criticSpan = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block; padding-right: 10px;'
				});
				section.append(criticSpan);


				// Add toggle buttons
				const buttonDiv = letterboxd.helpers.createElement('div', {
					style: 'display: block; margin-right: 10px;'
				});
				criticSpan.append(buttonDiv);
				// All button
				const allButton = letterboxd.helpers.createElement('span', {
					class: 'rt-button critic-all selected',
					['target']: 'score-critic-all'
				});
				if (this.tomatoData.criticAll.percent == "--"){
					//allButton.className += " disabled";
				}
				allButton.innerText = "ALL";
				buttonDiv.append(allButton);
				// Top button
				const topButton = letterboxd.helpers.createElement('span', {
					class: 'rt-button critic-top',
					['target']: 'score-critic-top'
				});
				if (this.tomatoData.criticTop.percent == "--"){
					topButton.className += " disabled";
				}
				topButton.innerText = "TOP";
				buttonDiv.append(topButton);

				// Add scores
				criticSpan.append(letterboxd.helpers.createTomatoScore("critic-all","Critic",this.wikiData.tomatoURL,this.tomatoData.criticAll,"block"));
				criticSpan.append(letterboxd.helpers.createTomatoScore("critic-top","Top Critic",this.wikiData.tomatoURL,this.tomatoData.criticTop,"none"));

				// AUDIENCE SCORE
				//************************************************************
				// The span that holds the score
				const audienceSpan = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block; padding-right: 10px;'
				});
				section.append(audienceSpan);


				// Add toggle buttons
				const buttonDiv2 = letterboxd.helpers.createElement('div', {
					style: 'display: block; margin-right: 10px;'
				});
				audienceSpan.append(buttonDiv2);
				// All button
				const allButton2 = letterboxd.helpers.createElement('span', {
					class: 'rt-button audience-all selected',
					['target']: 'score-audience-all'
				});
				if (this.tomatoData.audienceAll.percent == "--"){
					//allButton2.className += " disabled";
				}
				allButton2.innerText = "ALL";
				buttonDiv2.append(allButton2);
				// Verified button
				const verifiedButton2 = letterboxd.helpers.createElement('span', {
					class: 'rt-button audience-verified',
					['target']: 'score-audience-verified'
				});
				if (this.tomatoData.audienceVerified.percent == "--"){
					verifiedButton2.className += " disabled";
				}
				verifiedButton2.innerText = "VERIFIED";
				buttonDiv2.append(verifiedButton2);

				// Add scores
				audienceSpan.append(letterboxd.helpers.createTomatoScore("audience-all","Audience",this.wikiData.tomatoURL,this.tomatoData.audienceAll,"block"));
				audienceSpan.append(letterboxd.helpers.createTomatoScore("audience-verified","Verified Audience",this.wikiData.tomatoURL,this.tomatoData.audienceVerified,"none"));


				// APPEND to the sidebar
				//************************************************************
				this.appendRating(section, 'tomato-ratings');
				
				// Add click event for score buttons
				//************************************************************
				$(".rt-button:not(.disabled)").on('click', changeTomatoScore);
				if (this.tomatoData.criticTop.percent != "--" && letterboxd.storage.get('critic-default') === 'top'){
					$(".rt-button.critic-top").click();
				}
				if (this.tomatoData.audienceVerified.percent != "--" && letterboxd.storage.get('audience-default') === 'verified'){
					$(".rt-button.audience-verified").click();
				}
				
				//Add click for Show details button
				//************************************************************
				$(".rt-show-details").on('click', function(event){
					toggleDetails(event, letterboxd);
				});
				if (letterboxd.storage.get('rt-default-view') === 'show' || (letterboxd.storage.get('rt-default-view') === 'remember' && letterboxd.storage.get('rt-score-details') === 'show')){
					$(".rt-show-details").click();
				}
				
				// Add the Events for the hover
				//************************************************************
				$(".tooltip.display-rating.-highlight.tomato-score").on("mouseover", ShowTwipsy);
				$(".tooltip.display-rating.-highlight.tomato-score").on("mouseout", HideTwipsy);


				this.rtAdded = true;
			},

			addMeta(){				
				if (document.querySelector('.meta-ratings')) return;

				if (!document.querySelector('.sidebar')) return;

				// First, lets grab all the useful information
				//***************************************************************
				if (this.metaData.data != null){
					// Scores
					var criticScore = this.metaData.data.querySelector('.ms_wrapper .metascore_w');
					var criticScore2 = this.metaData.data.querySelector('.c-siteReviewScore:not(.c-siteReviewScore_user) span');
					if (criticScore != null){
						// Standard page with score
						this.metaData.critic.rating = criticScore.innerText;
					}else if(criticScore2 != null){
						// Non-standard page (parasite)
						this.metaData.critic.rating = criticScore2.innerText;
					}else{
						// TV episodes with no Metascore
						this.metaData.critic.rating = "N/A";
					}

					var userScore = this.metaData.data.querySelector('.us_wrapper .metascore_w');
					var userScore2 = this.metaData.data.querySelector('.c-siteReviewScore_user span');
					if (userScore != null){
						// Standard page with score
						this.metaData.user.rating = userScore.innerText;
					}else if(userScore2 != null){
						// Non-standard page (parasite)
						this.metaData.user.rating = userScore2.innerText;
					}else{
						// TV episodes with no Metascore
						this.metaData.critic.rating = "N/A";
					}

					// Grab the 'must see'
					if (this.metaData.data.querySelector('.must-see.product')){
						this.metaData.mustSee = true;
					}

					// Grab the rating counts
					var ratings = this.metaData.data.querySelectorAll('.reviews .fxdcol');
					for(var i = 0; i < ratings.length; i++){
						var positive = ratings[i].querySelector('.chart.positive .count.fr');
						var mixed = ratings[i].querySelector('.chart.mixed .count.fr');
						var negative = ratings[i].querySelector('.chart.negative .count.fr');
						
						positive = parseInt(letterboxd.helpers.cleanNumber(positive.innerText));
						mixed = parseInt(letterboxd.helpers.cleanNumber(mixed.innerText));
						negative = parseInt(letterboxd.helpers.cleanNumber(negative.innerText));
						var count = positive + mixed + negative;

						var data;
						if (ratings[i].querySelector('.section_title a').innerText.includes("Metascore")){
							data = this.metaData.critic;
						}else{
							data = this.metaData.user;
						}

						data.positive = positive;
						data.mixed = mixed;
						data.negative = negative;
						data.num_ratings = count;
						data.highest = letterboxd.helpers.getMetaHighest(data);
					}
					// Grab rating counts for non-standard pages (parasite)
					if (ratings.length == 0 && criticScore2 != null){
						var positive = criticScore2.parentNode.parentNode.parentNode.parentNode.querySelector('.c-EntertainmentProductScoreGraph_scoreGraphPositive');
						var mixed = criticScore2.parentNode.parentNode.parentNode.parentNode.querySelector('.c-EntertainmentProductScoreGraph_scoreGraphNeutral');
						var negative = criticScore2.parentNode.parentNode.parentNode.parentNode.querySelector('.c-EntertainmentProductScoreGraph_scoreGraphNegative');
						// Positive
						if (positive != null)
							positive = parseInt(letterboxd.helpers.cleanNumber(positive.childNodes[0].innerText)); 
						else
							positive = 0;
						// Mixed
						if (mixed != null)
							mixed = parseInt(letterboxd.helpers.cleanNumber(mixed.childNodes[0].innerText));
						else
							mixed = 0;
						// Negative
						if (negative != null)
							negative = parseInt(letterboxd.helpers.cleanNumber(negative.childNodes[0].innerText));
						else
							negative = 0;
							
						var count = positive + mixed + negative;

						this.metaData.critic.positive = positive;
						this.metaData.critic.mixed = mixed;
						this.metaData.critic.negative = negative;
						this.metaData.critic.num_ratings = count;
						this.metaData.critic.highest = letterboxd.helpers.getMetaHighest(this.metaData.critic);

					}
					if (ratings.length == 0 && userScore2 != null){
						var positive = userScore2.parentNode.parentNode.parentNode.parentNode.querySelector('.c-EntertainmentProductScoreGraph_scoreGraphPositive');
						var mixed = userScore2.parentNode.parentNode.parentNode.parentNode.querySelector('.c-EntertainmentProductScoreGraph_scoreGraphNeutral');
						var negative = userScore2.parentNode.parentNode.parentNode.parentNode.querySelector('.c-EntertainmentProductScoreGraph_scoreGraphNegative');
						// Positive
						if (positive != null)
							positive = parseInt(letterboxd.helpers.cleanNumber(positive.childNodes[0].innerText)); 
						else
							positive = 0;
						// Mixed
						if (mixed != null)
							mixed = parseInt(letterboxd.helpers.cleanNumber(mixed.childNodes[0].innerText));
						else
							mixed = 0;
						// Negative
						if (negative != null)
							negative = parseInt(letterboxd.helpers.cleanNumber(negative.childNodes[0].innerText));
						else
							negative = 0;
							
						var count = positive + mixed + negative;

						this.metaData.user.positive = positive;
						this.metaData.user.mixed = mixed;
						this.metaData.user.negative = negative;
						this.metaData.user.num_ratings = count;
						this.metaData.user.highest = letterboxd.helpers.getMetaHighest(this.metaData.user);
					}
				}else{
					if (this.imdbData.meta != null){
						this.metaData.critic.rating = this.imdbData.meta;
					}else if (this.omdbData.data.Metascore != null){
						this.metaData.critic.rating = this.omdbData.data.Metascore;
					}
					this.metaData.critic.num_ratings = -1; // This prevents the 'return' from below, and also from the tooltip from being added
				}

				// Return if no scores what so ever
				if (this.metaData.critic.num_ratings == 0 && this.metaData.user.num_ratings == 0) return;

				// Now lets add it to the page
				//***************************************************************
				// Add the section to the page
				const section = letterboxd.helpers.createElement('section', {
					class: 'section ratings-histogram-chart meta-ratings'
				});				

				// Add the Header
				const heading = letterboxd.helpers.createElement('h2', {
					class: 'section-heading',
					style: 'height: 20px;'
				});
				section.append(heading);


				if (this.metaData.data != null){
					var elementClass = "logo-meta-link";
				}else{
					var elementClass = "logo-meta";
				}

				const logoHolder = letterboxd.helpers.createElement('a', {
					class: elementClass,
					style: 'width: 100%;'
				});
				if (this.wikiData.metaURL != null && this.wikiData.metaURL != ""){
					logoHolder.setAttribute('href', this.wikiData.metaURL);
				}
				heading.append(logoHolder);

				const metaLogo  = letterboxd.helpers.createElement('span', {
					class: 'icon-meta',
					style: 'height: 20px; width: 20px; background-image: url("https://www.metacritic.com/images/icons/metacritic-icon.svg");'
				});
				logoHolder.append(metaLogo);
				
				const metaText  = letterboxd.helpers.createElement('span', {
					class: 'text-meta',
					style: 'height: 20px; width: 100px; background-image: url("https://www.metacritic.com/images/icons/metacritic-wordmark.svg");',
				});
				logoHolder.append(metaText);

				// Add the Show Details button
				if (this.metaData.data != null){	
					const showDetails = letterboxd.helpers.createElement('a', {
						class: 'all-link more-link show-details meta-show-details',
						['target']: 'meta-score-details'
					});
					showDetails.innerText = "Show Details";
					section.append(showDetails);
				}
				
				// Critic score
				//***************************************************************
				var url = "";
				if (this.wikiData.metaURL != null && this.wikiData.metaURL != "")
					url = this.wikiData.metaURL + "/critic-reviews";
				section.append(letterboxd.helpers.createMetaScore("critic","Critic",url,this.metaData.critic,this.metaData.mustSee));				
				
				// User score
				//***************************************************************
				if (this.metaData.data != null){
					section.append(letterboxd.helpers.createMetaScore("user","User",this.wikiData.metaURL + "/user-reviews",this.metaData.user,this.metaData.mustSee));
				}

				// Add Must see if applicable
				if (this.metaData.mustSee == true){
					const mustSeeSpan = letterboxd.helpers.createElement('span', {
						class: 'meta-must-see tooltip display-rating -highlight',
						style: 'margin-top: 5px;',
						['data-original-title']: 'Metacritic Must-See'
					});
					section.append(mustSeeSpan);
				}

				// APPEND to the sidebar
				//************************************************************
				this.appendRating(section, 'meta-ratings');
				
				//Add click for Show details button
				//************************************************************
				$(".meta-show-details").on('click', function(event){
					toggleDetails(event, letterboxd);
				});
				if (letterboxd.storage.get('meta-default-view') === 'show' || (letterboxd.storage.get('meta-default-view') === 'remember' && letterboxd.storage.get('meta-score-details') === 'show')){
					$(".meta-show-details").click();
				}

				// Add Hover events
				//************************************************************
				if (this.metaData.critic.num_ratings > 0 || this.metaData.critic.rating == "tbd" || this.metaData.critic.rating == "N/A"){
					$(".tooltip.display-rating.-highlight.meta-score").on("mouseover", ShowTwipsy);
					$(".tooltip.display-rating.-highlight.meta-score").on("mouseout", HideTwipsy);
				}
				if (this.metaData.user.num_ratings > 0 || this.metaData.user.rating == "tbd" || this.metaData.critic.rating == "N/A"){
					$(".tooltip.display-rating.-highlight.meta-score-user").on("mouseover", ShowTwipsy);
					$(".tooltip.display-rating.-highlight.meta-score-user").on("mouseout", HideTwipsy);
				}
				if (this.metaData.mustSee){
					$(".tooltip.display-rating.-highlight.meta-must-see").on("mouseover", ShowTwipsy);
					$(".tooltip.display-rating.-highlight.meta-must-see").on("mouseout", HideTwipsy);
				}

				this.metaAdded = true;

			},

			addLink(url){
				// Check if already added
				if (!this.linksAdded.includes(url)){
					this.linksAdded.push(url);

					var text = "";
					var className = "";
					if (url.includes("rottentomatoes")){
						text = "RT";
						className = "tomato-button";
					}else if (url.includes("metacritic")){
						text = "META";
						className = "meta-button";
					}else if (url.includes("boxofficemojo")){
						text = "MOJO";
						className = "mojo-button";
					}else if (url.includes("anilist")){
						text = "AL";
						className = "al-button";
					}else if (url.includes("myanimelist")){
						text = "MAL";
						className = "mal-button";
					}else if (url.includes("anidb")){
						text = "ANIDB";
						className = "anidb-button";
					}

					if (document.querySelector('.' + className)){
						return;
					}

					// Create Button Element
					var button = letterboxd.helpers.createElement('a', {
						class: 'micro-button track-event ' + className,
						href: url
					});
					button.innerText = text;

					// Determine Placement
					var order = [
						'.tomato-button',
						'.meta-button',
						'.mal-button',
						'.al-button',
						'.anidb-button',
						'.mojo-button'
					];
	
					var index = order.indexOf('.' + className);	
					// First Attempt
					for (var i = index + 1; i < order.length; i++){
						var temp = document.querySelector(order[i]);
						if (temp != null){
							temp.before(button);
							//button.after('\n')
							return;
						}
					}
	
					// Second Attempt
					for (var i = index - 1; i >= 0; i--){
						var temp = document.querySelector(order[i]);
						if (temp != null){
							temp.after(button);
							//button.before('\n')
							return;
						}
					}
	
					// Third Attempt
					var buttons = document.querySelectorAll('.micro-button');
					var lastButton = buttons[buttons.length-1];
					lastButton.after(button);
					//lastButton.after("\n");
				}
			},
			
			addLinks(){
				if (!document.querySelector('.text-link.text-footer')) return;

				// Add Rotten Tomatoes
				if (this.wikiData.tomatoURL != null){
					if (!document.querySelector('.tomato-button') && this.wikiData.tomatoURL != ""){
						var button = letterboxd.helpers.createElement('a', {
							class: 'micro-button track-event tomato-button',
							href: this.wikiData.tomatoURL,
							style: "margin-right: 4px;"
						});
						button.innerText = "RT";

						if (document.querySelector('.meta-button')){
							document.querySelector('.meta-button').before(button);
						}else if (document.querySelector('.mojo-button')){
							document.querySelector('.mojo-button').before(button);
						}else{
							document.querySelector('.report-link.has-icon.icon-report.tooltip.tooltip-close-on-click.cboxElement').before(button);
						}
					}
				}
				// Add Metacritic
				if (this.wikiData.metaURL != null){
					if (!document.querySelector('.meta-button') && this.wikiData.metaURL != ""){
						var button = letterboxd.helpers.createElement('a', {
							class: 'micro-button track-event meta-button',
							href: this.wikiData.metaURL,
							style: "margin-right: 4px;"
						});
						button.innerText = "META";

						if (document.querySelector('.tomato-button')){
							document.querySelector('.tomato-button').after(button);
						}else if (document.querySelector('.mojo-button')){
							document.querySelector('.mojo-button').before(button);
						}else{
							document.querySelector('.report-link.has-icon.icon-report.tooltip.tooltip-close-on-click.cboxElement').before(button);
						}
					}
				}
				// Add Mojo
				if (!document.querySelector('.mojo-button') && this.imdbID != ""){
					var button = letterboxd.helpers.createElement('a', {
						class: 'micro-button track-event mojo-button',
						href: 'https://www.boxofficemojo.com/title/' + this.imdbID
					});
					button.innerText = "Mojo";

					if (document.querySelector('.mojo-button')){
						document.querySelector('.mojo-button').after(button);
					}else if (document.querySelector('.rt-button')){
						document.querySelector('.rt-button').after(button);
					}else{
						document.querySelector('.report-link.has-icon.icon-report.tooltip.tooltip-close-on-click.cboxElement').before(button);
					}
				}
			},

			moveLinks(){
				const footer = document.querySelector('.text-link.text-footer');
				const buttons = document.querySelectorAll('.micro-button.track-event');

				const newHolder = letterboxd.helpers.createElement('div', {});
				footer.after(newHolder);
				const text = letterboxd.helpers.createElement('span', {},{
					['font-size']: '12px',
					['color']: '#89a'
				});
				text.innerText = "More at ";
				newHolder.append(text);

				buttons.forEach(button => {
					newHolder.append(button);
				});
				
				var report = footer.querySelector('.report-link');
				footer.innerText = footer.innerText.replace('More at','');
				footer.append(report);

			},

			addDate(date){
				const year = document.querySelector('.number');

				if (year != null){
					year.setAttribute("data-original-title", date);
					if (this.dateAdded == false){
						year.setAttribute("class", year.getAttribute("class") + " number-tooltip")
						
						$(".number-tooltip").on("mouseover", ShowTwipsy);
						$(".number-tooltip").on("mouseout", HideTwipsy);

						this.dateAdded = true;
					}
				}
			},

			addBoxOffice(){
				if (document.querySelector('.box-office') && document.querySelector('.budget')) return;

				// First Grab the info
				//*****************************************************
				if (this.mojoData.data != null){
					const summaryTable = this.mojoData.data.querySelectorAll('.mojo-performance-summary-table div');
					for (var ii = 0; ii < summaryTable.length; ii++){
						var header = summaryTable[ii].querySelector('.a-size-small');
						var value = summaryTable[ii].querySelector('.money');
						if (header.innerHTML.includes("Domestic") && value != null){
							this.mojoData.boxOfficeUS = value.innerText;;
						}else if (header.innerHTML.includes("Worldwide") && value != null){
							this.mojoData.boxOfficeWW = value.innerText;
						}
					}

					// This is for formatting the date
					var options = { year: 'numeric', month: 'short', day: 'numeric' };
					// Budget
					const summaryValues = this.mojoData.data.querySelector('.a-section.a-spacing-none.mojo-summary-values.mojo-hidden-from-mobile');

					for (var ii = 0; ii < summaryValues.childNodes.length; ii++){
						var node = summaryValues.childNodes[ii];
						var header = node.childNodes[0].innerText;
						var data = node.childNodes[1].innerText;
						
						if (header == "Budget"){
							this.mojoData.budget = data;
						}else if (header == "MPAA"){
							this.mpaaRating = data;
						}else if (header == "Earliest Release Date" && data.includes("Domestic")){
							this.filmDate = data.split("\n")[0];
							this.filmDate = this.filmDate.replace(",","");
							this.filmDate = new Date(this.filmDate).toLocaleDateString("en-UK", options);
						}
					}

					// Quick Check for release dates
					if (this.filmDate == null || this.filmDate == ""){
						var a_Section = this.mojoData.data.querySelector('.a-section.mojo-h-scroll');
						if (a_Section != null && a_Section.childElementCount > 0 && a_Section.childNodes[0].innerText.includes("Domestic")){
							var a_Section_Rows = a_Section.childNodes[2].rows;
							for (var ii = 1; ii < a_Section_Rows.length; ii++){
								var header = a_Section_Rows[ii].childNodes[0].innerText;
								var date = a_Section_Rows[ii].childNodes[1].innerText;
								
								if (header == "Domestic"){
									this.filmDate = date.replace(",","");
									this.filmDate = new Date(this.filmDate).toLocaleDateString("en-UK", options);
								}
							}
						}
						if (a_Section != null && a_Section.childElementCount > 0 && a_Section.childNodes[0].innerText.includes("By Release")){
							var a_Section_Rows = a_Section.childNodes[1].rows;
							for (var ii = 1; ii < a_Section_Rows.length; ii++){
								var group = a_Section_Rows[ii].childNodes[0].innerText;
								var date = a_Section_Rows[ii].childNodes[1].innerText;
								var markets = a_Section_Rows[ii].childNodes[2].innerText;
								
								if (group == "Original Release" && markets.includes("Domestic")){
									this.filmDate = date.replace(",","");
									this.filmDate = new Date(this.filmDate).toLocaleDateString("en-UK", options);
								}
							}
						}
					}	
				}

				// Return if we have nothing
				if (this.mojoData.budget == "" && this.mojoData.boxOfficeWW == "" && this.mojoData.boxOfficeUS == ""){
					return;
				}

				// Add the budget
				//*****************************************************
				if (this.mojoData.budget != "" && !document.querySelector('.budget')){
					letterboxd.helpers.createDetailsRow("Budget", this.mojoData.budget);
				}
				// Add the Box Office US
				//*****************************************************
				if (this.mojoData.boxOfficeUS != "" && !document.querySelector('.box-office-us')){
					letterboxd.helpers.createDetailsRow("Box Office (US)", this.mojoData.boxOfficeUS);
				}

				// Add the Box Office WW
				//*****************************************************
				if (this.mojoData.boxOfficeWW != "" && !document.querySelector('.box-office-ww')){
					letterboxd.helpers.createDetailsRow("Box Office (WW)", this.mojoData.boxOfficeWW);
				}
			},

			addRating(){
				if (document.querySelector('.rated')) return;

				const year = document.querySelector('.number');

				const small = letterboxd.helpers.createElement('small', {
					class: 'number rated'
				});
				year.after(small);
				
				const p = letterboxd.helpers.createElement('p', {
				});
				p.innerText = this.mpaaRating;
				small.append(p);

				this.ratingAdded = true;

			},

			initCinema(title){
				if (this.letterboxdYear != null && parseInt(this.letterboxdYear) < 1978){
					// Cinemascore founded in 1978, so don't bother for anything prior
					return;
				}

				title = letterboxd.helpers.cinemascoreTitle(title, this.letterboxdYear);

				// First Attempt - 'The' at end, no accents
				//****************************************************************
				// Encode title
				title = letterboxd.helpers.getValidASCIIString(title);
				var encoded = letterboxd.helpers.encodeASCII(title);

				// Create the URL and send the request
				var url = "https://api.cinemascore.com/guest/search/title/" + encoded;
				this.cinemascore.state = 1;

				letterboxd.helpers.getOMDbData(url).then((value) => {
					// Check if found
					if (this.cinemascore.data == null){
						this.cinemascore.data = value;
					}else{
						this.cinemascore.data = [].concat(this.cinemascore.data, value);
					}

					if (this.verifyCinema(value, title, 'all')){
						this.addCinema();

					}else{
						// Replace Ampersand (and)
						//****************************************************************
						if (this.cinemascore.state < 2 && title.includes("&")){
							var temp = title.replace('&','and');
							this.getCinema(letterboxd.helpers.getValidASCIIString(temp), 'all');
						}

						// Search After Hyphen (-)
						//****************************************************************
						if (this.cinemascore.state < 2 && title.includes(" - ")){
							var temp = title.split(" - ");
							if (temp[1].toUpperCase().includes("THE MOVIE")){
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp[0]), 'begin');
							}else{
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp[1]), 'end');
							}
						}
						
						// Search After Colon (:)
						//****************************************************************
						if (this.cinemascore.state < 2 && title.includes(": ")){
							var temp = title.split(": ");
							if (temp[1].toUpperCase().includes("THE MOVIE")){
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp[0]), 'begin');
							}else{
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp[1]), 'end');
							}
						}
						
						// Replace Numbers with Roman Numerals
						//****************************************************************
						const res = /( [0-9]+)/g;
						if (this.cinemascore.state < 2 && res.test(title)){
							var num = title.substring(title.search(res),title.length).trim();
							var roman = letterboxd.helpers.romanize(parseInt(num));
							var temp = title.replace(res, " " + roman);

							this.getCinema(letterboxd.helpers.getValidASCIIString(temp), 'all');
						}
						
						// Search before roman numerals
						//****************************************************************
						var romanExp = new RegExp(/\b(M{1,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|C?D|D?C{1,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|X?L|L?X{1,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|I?V|V?I{1,3}))\b/);
						if (this.cinemascore.state < 2 && title.match(romanExp)){
							var match = title.match(romanExp)[0];
							var temp = title.split(match);
							temp = temp[0].trim();

							if (temp != ""){
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp), 'begin');
							}
						}
					}
				});
			},

			getCinema(title, titleType){
				var encoded = letterboxd.helpers.encodeASCII(title);
				var url = "https://api.cinemascore.com/guest/search/title/" + encoded;
				letterboxd.helpers.getOMDbData(url).then((value) => {
					if (this.cinemascore.data == null){
						this.cinemascore.data = value;
					}else{
						this.cinemascore.data = [].concat(this.cinemascore.data, value);
					}

					if (this.verifyCinema(value, title, titleType)){
						this.addCinema();
					}
				});
			},

			verifyCinema(data, title, titleType){
				if (this.cinemascore.state < 2 && data != null && data.length > 0 && data[0].GRADE != ""){
					const year = document.querySelector('.number').childNodes[0].innerHTML;

					var years = [year,"","",""];

					if (this.omdbData.data != null && this.omdbData.data.Year != null && this.omdbData.data.Year != "N/A"){
						years[1] = this.omdbData.data.Year;
					}else if (this.omdbData.data != null){
						years[1] = (new Date(this.omdbData.data.Released)).getFullYear().toString();
					}
					if (this.wikiData.date != null){
						years[2] = (new Date(this.wikiData.date)).getFullYear().toString();
					}
					if (this.wikiData.date_origin != null){
						years[3] = (new Date(this.wikiData.date_origin)).getFullYear().toString();
					}

					var result = null;
					// Get the correct score
					for (var ii = 0; ii < data.length; ii++){
						// Check to see if the year cinemascore uses is one of the years we have
						if (data[ii].YEAR != null && years.includes(data[ii].YEAR)){
							var found = false;
							
							if (titleType == "all"){
								var withYear = title.toUpperCase() + ' (' + data[ii].YEAR + ')';
								// If Exact
								if (data[ii].TITLE == title.toUpperCase() || data[ii].TITLE == withYear){
									found = true;
								}else{
									// If not, make sure it starts with the exact title
									var reg = new RegExp('^(' + title + '){1}( |,|\\.|:|-|$)','i')
									found = data[ii].TITLE.match(reg);
								}

							}else if (titleType == "end"){
								// Make sure it ends with the searched title
								var reg = new RegExp('(' + title + '){1}$','i')
								found = data[ii].TITLE.match(reg);
							}else if (titleType == "begin"){
								// Make sure it begins with the searched title
								var reg = new RegExp('^(' + title + '){1}( |,|\\.|:|-|$)','i')
								found = data[ii].TITLE.match(reg);
							}

							if (found){
								result = data[ii];
								break;
							}
						}
					}

					if (result != null){
						this.cinemascore.result = result;
						return true;
					}
				}
				return false;
			},

			addCinema(){
				if (document.querySelector('.cinemascore')) return;

				if (this.cinemascore.result != null && this.cinemascore.state < 2){
					this.cinemascore.state = 2;

					// Add the section to the page
					const section = letterboxd.helpers.createElement('section', {
						class: 'section ratings-histogram-chart cinemascore'
					});				

					// Add the Header
					const heading = letterboxd.helpers.createElement('h2', {
						class: 'section-heading',
						style: 'height: 13px;'
					});
					section.append(heading);
					const headerTitle = letterboxd.helpers.createElement('a', {
						href: 'https://www.cinemascore.com/'
					});
					headerTitle.innerText = "CinemaScore"
					heading.append(headerTitle);

					
					// The span that holds the score
					const span = letterboxd.helpers.createElement('span', {
						style: 'display: inline-block;'
					});
					section.append(span);

					// The element that is the score itself
					const scoreText = letterboxd.helpers.createElement('a', {
						class: 'tooltip display-rating -highlight cinema-grade',
					});
					scoreText.innerText = this.cinemascore.result.GRADE;
					span.append(scoreText);
					

					// APPEND to the sidebar
					//************************************************************
					this.appendRating(section,'cinemascore');
				}
			},

			addMAL(){
				if (document.querySelector('.mal-ratings')) return;

				if (!document.querySelector('.sidebar')) return;

				// Init
				this.mal.score = "N/A";
				this.mal.scored_by = 0;

				if (this.mal.data.score != null) 
					this.mal.score = this.mal.data.score;
				if (this.mal.data.scored_by != null) 
					this.mal.scored_by = this.mal.data.scored_by;

				// Return if there are no ratings
				if (this.mal.scored_by == 0)
					return;

				// Create and Add				
				// Add the section to the page
				const scoreSection = letterboxd.helpers.createElement('section', {
					class: 'section ratings-histogram-chart mal-ratings'
				});				

				// Add the Header
				const heading = letterboxd.helpers.createElement('h2', {
					class: 'section-heading',
					style: 'height: 16px;'
				});
				scoreSection.append(heading);

				const logoHolder = letterboxd.helpers.createElement('a', {
					class: "logo-mal",
					href: this.mal.data.url + '/stats',
					style: 'position: absolute; background-image: url("' + browser.runtime.getURL("images/mal-logo.png") + '");'
				});
				heading.append(logoHolder);

				// The span that holds the score
				const scoreSpan = letterboxd.helpers.createElement('span', {
					['itemprop']: 'aggregateRating',
					['itemscope']: '',
					['itemtype']: 'http://schema.org/AggregateRating',
					class: 'average-rating',
					style: 'left: 188px; position:absolute;'
				});
				scoreSection.append(scoreSpan);

				
				// Create the tooltip text
				var tooltip = "No score yet ( " + this.mal.scored_by.toLocaleString() + " ratings)";
				if (this.al.score != "N/A")
					tooltip = 'Weighted average of ' + this.mal.score + '/10 based on ' + this.mal.scored_by.toLocaleString() + ' ratings';
				
				// The element that is the score itself
				const score = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight imdb-score tooltip-extra',
					href: this.mal.data.url + '/reviews',
					['data-original-title']: tooltip
				});
				score.innerText = this.mal.score.toFixed(2);
				scoreSpan.append(score);


				// Add the bars for the rating
				const histogram = letterboxd.helpers.createElement('div', {
					class: 'rating-histogram clear rating-histogram-exploded'
				});
				scoreSection.append(histogram);
				const ul = letterboxd.helpers.createElement('ul', {
				});
				histogram.append(ul);

				// Loop first and determine highest votes
				for (var ii = 0; ii < 10; ii++){
					if (this.mal.statistics.scores[ii].votes > this.mal.highest)
						this.mal.highest = this.mal.statistics.scores[ii].votes;
				}

				for (var ii = 0; ii < 10; ii++){	
					var left = (ii * 16).toString() + "px;";
					const il = letterboxd.helpers.createElement('li', {
						class: 'rating-histogram-bar',
						style: "width: 15px; left: " + left
					});
					ul.append(il);

					const a = letterboxd.helpers.createElement('a', {
						class: 'ir tooltip imdb tooltip-extra',
						['data-original-title']: this.mal.statistics.scores[ii].votes.toLocaleString() + " " + (ii + 1).toString() + '/10 ratings (' + this.mal.statistics.scores[ii].percentage.toString() + '%)'
					});
					il.append(a);

					var max = 44.0;
					var min = 1;
					var percent = this.mal.statistics.scores[ii].votes / this.mal.highest;
					var height = (max * percent);

					if (height < min)
						height = min;

					height = height.toString() + "px;";

					const i = letterboxd.helpers.createElement('i', {
						style: 'height: ' + height
					});
					a.append(i);
				}

				// Add the stars for visual
				const span1Star = letterboxd.helpers.createElement('span', {
					class: 'rating-green rating-green-tiny rating-1'
				});
				const span1StarInner = letterboxd.helpers.createElement('span', {
					class: 'rating rated-2 rating-star-mal'
				});
				span1StarInner.innerText = "★";
				span1Star.append(span1StarInner);

				const span5Star = letterboxd.helpers.createElement('span', {
					class: 'rating-green rating-green-tiny rating-5'
				});
				const span5StarInner = letterboxd.helpers.createElement('span', {
					class: 'rating rated-10 rating-star-mal'
				});
				span5StarInner.innerText = "★★★★★";
				span5Star.append(span5StarInner);

				ul.before(span1Star);
				ul.after(span5Star);

				// Append to the sidebar
				//*****************************************************************
				this.appendRating(scoreSection, 'mal-ratings');

				
				// Add the hover events
				//*****************************************************************
				$(".tooltip-extra").on("mouseover", ShowTwipsy);
				$(".tooltip-extra").on("mouseout", HideTwipsy);
			},

			addAL(){
				if (document.querySelector('.al-ratings')) return;

				if (!document.querySelector('.sidebar')) return;

				if (this.al.data == null) return;

				// Init
				this.al.score = "N/A";
				if (this.al.data.averageScore != null)
					this.al.score = this.al.data.averageScore;

				this.al.num_ratings = 0;
				// Loop first and determine highest votes and total
				if (this.al.data.stats.scoreDistribution.length == 10){
					for (var ii = 0; ii < 10; ii++){
						var amount = this.al.data.stats.scoreDistribution[ii].amount;
						if (amount > this.al.highest)
							this.al.highest = amount;
						
						this.al.num_ratings += amount;
					}
				}

				// Return if there are no ratings
				if (this.al.num_ratings == 0)
					return;

				
				// Create and Add
				// Add the section to the page
				const scoreSection = letterboxd.helpers.createElement('section', {
					class: 'section ratings-histogram-chart al-ratings'
				});				

				// Add the Header
				const heading = letterboxd.helpers.createElement('h2', {
					class: 'section-heading',
					style: 'height: 16px;'
				});
				scoreSection.append(heading);

				const logoHolder = letterboxd.helpers.createElement('a', {
					class: 'logo-holder-anilist',
					style: 'width: 100%;',
					href: this.al.data.siteUrl + '/stats'
				});
				heading.append(logoHolder);

				const logo = letterboxd.helpers.createElement('span', {
					class: 'logo-anilist',
					style: 'height: 20px; width: 20px; background-image: url("https://graphql.anilist.co/img/icons/icon.svg");'
				});
				logoHolder.append(logo);
				
				const logoText  = letterboxd.helpers.createElement('span', {
					class: 'text-anilist',
					style: 'vertical-align: super;'
				});
				logoText.innerText = "AniList"
				logoHolder.append(logoText);


				// The span that holds the score
				const scoreSpan = letterboxd.helpers.createElement('span', {
					['itemprop']: 'aggregateRating',
					['itemscope']: '',
					['itemtype']: 'http://schema.org/AggregateRating',
					class: 'average-rating',
					style: 'left: 188px; position:absolute;'
				});
				scoreSection.append(scoreSpan);
				

				// Create the tooltip text
				var tooltip = "No score yet ( " + this.al.num_ratings.toLocaleString() + " ratings)";
				if (this.al.score != "N/A")
					tooltip = 'Weighted average of ' + this.al.score + '/100 based on ' + this.al.num_ratings.toLocaleString() + ' ratings';

				// The element that is the score itself
				const score = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight imdb-score tooltip-extra',
					href: this.al.data.siteUrl + '/reviews',
					['data-original-title']: tooltip
				});
				score.innerText = this.al.score + "%";
				scoreSpan.append(score);

				// Add the bars for the rating
				const histogram = letterboxd.helpers.createElement('div', {
					class: 'rating-histogram clear rating-histogram-exploded'
				});
				scoreSection.append(histogram);
				const ul = letterboxd.helpers.createElement('ul', {
				});
				histogram.append(ul);

				for (var ii = 0; ii < 10; ii++){	
					var left = (ii * 16).toString() + "px;";
					const il = letterboxd.helpers.createElement('li', {
						class: 'rating-histogram-bar',
						style: "width: 15px; left: " + left
					});
					ul.append(il);

					var amount = this.al.data.stats.scoreDistribution[ii].amount;
					var percent = (amount / this.al.num_ratings * 100).toFixed(1);

					const a = letterboxd.helpers.createElement('a', {
						class: 'ir tooltip imdb tooltip-extra',
						['data-original-title']: amount.toLocaleString() + " " + ((ii + 1) * 10).toString() + '/100 ratings (' + percent.toString() + '%)'
					});
					il.append(a);

					var max = 44.0;
					var min = 1;
					percent = amount / this.al.highest;
					var height = (max * percent);

					if (height < min)
						height = min;

					height = height.toString() + "px;";

					const i = letterboxd.helpers.createElement('i', {
						style: 'height: ' + height
					});
					a.append(i);
				}

				// Add the stars for visual
				const span1Star = letterboxd.helpers.createElement('span', {
					class: 'rating-green rating-green-tiny rating-1'
				});
				const span1StarInner = letterboxd.helpers.createElement('span', {
					class: 'rating rated-2 rating-star-al'
				});
				span1StarInner.innerText = "★";
				span1Star.append(span1StarInner);

				const span5Star = letterboxd.helpers.createElement('span', {
					class: 'rating-green rating-green-tiny rating-5'
				});
				const span5StarInner = letterboxd.helpers.createElement('span', {
					class: 'rating rated-10 rating-star-al'
				});
				span5StarInner.innerText = "★★★★★";
				span5Star.append(span5StarInner);

				ul.before(span1Star);
				ul.after(span5Star);

				// Append to the sidebar
				//*****************************************************************
				this.appendRating(scoreSection, 'al-ratings');

				
				// Add the hover events
				//*****************************************************************
				$(".tooltip-extra").on("mouseover", ShowTwipsy);
				$(".tooltip-extra").on("mouseout", HideTwipsy);
			},

			appendRating(rating, className){
				var order = [
					'.imdb-ratings',
					'.mal-ratings',
					'.al-ratings',
					'.tomato-ratings',
					'.meta-ratings',
					'.anidb-ratings',
					'.cinemascore'
				];

				var index = order.indexOf('.' + className);
				var sidebar = document.querySelector('.sidebar');

				// First
				for (var i = index + 1; i < order.length; i++){
					var temp = sidebar.querySelector(order[i]);
					if (temp != null){
						temp.before(rating);
						return;
					}
				}

				// Second
				for (var i = index - 1; i >= 0; i--){
					var temp = sidebar.querySelector(order[i]);
					if (temp != null){
						temp.after(rating);
						return;
					}
				}

				// Third
				sidebar.append(rating);
			}
		},

		helpers: {
			async getData(link) {
				if (letterboxd.storage.get('console-log') === true)
					console.log("Letterboxd-extras | Calling: " + link);

				try {
					const res = await letterboxd.helpers.request({
						url: link,
						method: 'GET'
					});
					return {response: res.response, url: res.responseURL};
				} catch (err) {
					console.error(err);
				}
				return null;
			},

			async getALData(link, query, al_id) {
				if (letterboxd.storage.get('console-log') === true)
					console.log("Letterboxd-extras | Calling: " + link);

				try {
					const res = await letterboxd.helpers.request({
						url: link,
						method: 'POST',
						headers: {
							'content-type': 'application/json',
							accept: 'application/json'
						},
						data: JSON.stringify({
							query,
							variables: { id: al_id }
						})
					});
					return {response: res.response, url: res.responseURL};
				} catch (err) {
					console.error(err);
				}
				return null;
			},

			request(options) {
				return new Promise((resolve, reject) => {
					options.onload = res => resolve(res);
					options.onerror = err => reject(err);
					options.ontimeout = err => reject(err);
					GM_xmlhttpRequest(options); // eslint-disable-line new-cap
				});
			},

			async getOMDbData(link) {  
				if (letterboxd.storage.get('console-log') === true)
					console.log("Letterboxd-extras | Calling: " + link);

				var ajaxOptions = {
					url: link,
					type : 'GET'
				}

				return $.when($.ajax(ajaxOptions))
				.then(function (results) {
					return results;
				});
			},

			async getWikiData(link) {	
				if (letterboxd.storage.get('console-log') === true)
					console.log("Letterboxd-extras | Calling: " + link);

				var ajaxOptions = {
					url: link,
					type : 'GET'
				}

				var output =  $.when($.ajax(ajaxOptions))
				.then(function (results) {
					return results;
				});
				
				return output;
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

			createTomatoScore(type, display, url, data, visibility){	
				const scoreDiv = letterboxd.helpers.createElement('div', {
					class: 'rt-score-div score-' + type,
					style: 'display: ' + visibility + ';'
				});
				
				var image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-empty.cd930dab34a.svg';
				if (data.state == "certified-fresh"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/certified_fresh.75211285dbb.svg';
				}else if (data.state == "fresh"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-fresh.149b5e8adc3.svg';
				}else if (data.state == "rotten"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-rotten.f1ef4f02ce3.svg';
				}else if (data.state == "upright"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/audience/aud_score-fresh.6c24d79faaf.svg';
				}else if (data.state == "spilled"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/audience/aud_score-rotten.f419e4046b7.svg';
				}else if(type == "Critic"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-empty.cd930dab34a.svg';
				}else{
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/audience/aud_score-empty.eb667b7a1c7.svg';
				}

				const imageSpan = letterboxd.helpers.createElement('span', {
					class: 'icon-popcorn',
					style: 'background-image: url("' + image + '");'
				});
				scoreDiv.append(imageSpan);

				var scoreTotal = "";
				if (type.includes("critic")){
					scoreTotal = "10";
				}else{
					scoreTotal = "5";
				}				
				// The element that is the score itself
				var hover = 'Average of ' + data.rating + '/' + scoreTotal + ' based on ' + parseInt(data.num_ratings).toLocaleString() + ' ' + display + ' rating';
				if (data.percent == "--")
					hover = data.num_ratings + " " + display + " rating";
				else
					data.percent += "%";

				if (data.num_ratings != 1)
					hover += "s";

				if (type.includes("audience-verified"))
					url += "/reviews?type=verified_audience"
				else if (type.includes("audience"))
					url += "/reviews?type=user"
				else if (type.includes("critic-top"))
					url += "/reviews?type=top_critics"
				else
					url += "/reviews"

				const score = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight tomato-score',
					href: url,
					style: 'display: inline-block; width: 50px',
					['data-original-title']: hover
				});
				score.innerText = data.percent;
				scoreDiv.append(score);

				// Add the liked/notliked bars
				const chartSpan = letterboxd.helpers.createElement('span', {
					class: 'rt-score-details',
					style: 'display: none; width: 140px; margin-left: 5px; margin-bottom: 10px;'
				});
				chartSpan.append(this.createTomatoBarCount("Fresh", parseInt(data.likedCount), parseInt(data.num_ratings)));
				chartSpan.append(this.createTomatoBarCount("Rotten", parseInt(data.notLikedCount), parseInt(data.num_ratings)));
				
				scoreDiv.append(chartSpan);

				return scoreDiv;
			},

			createTomatoBarCount(type, count, total){
				// Span that holds it all
				const span = letterboxd.helpers.createElement('span', {
					style: 'display: block; width: 140px;'
				});
				// Text label (ie, 'Fresh")
				const label = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block; font-size: 8px; width: 30px;'
				});
				label.innerText = type;
				span.append(label);
				
				// Span that holds the bar
				const barSpan = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block;'
				});
				// Bar outline
				const backBar = letterboxd.helpers.createElement('span', {
					class: 'rt-bar outline'
				});
				// Bar that displays the percentage
				var width = (Math.round((count / total) * 100));
				width = 'width: ' + width.toString() + '%;'
				const frontBar = letterboxd.helpers.createElement('span', {
					class: 'rt-bar fill',
					style: width
				});
				backBar.append(frontBar);
				barSpan.append(backBar);
				span.append(barSpan);

				// Text that shows the num of ratings
				const countText = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block; font-size: 9px; width: 25px; margin-left: 5px;'
				});
				countText.innerText = count.toLocaleString();
				span.append(countText);

				return span;
			},

			getMetaHighest(data){
				var ratings = [data.positive, data.mixed, data.negative];
				var highest = 0;
			
				for (var i = 0; i < ratings.length; i++){
					if (ratings[i] > highest)
						highest = ratings[i];
				}

				return highest;
			},

			createMetaScore(type, display, url, data, mustSee){
				// The span that holds the score
				var style = "";
				if (type == "critic" || mustSee)
					style = " margin-right: 10px;"
				const span = letterboxd.helpers.createElement('span', {
					style: style
				});
				
				var colour = letterboxd.helpers.determineMetaColour(data.rating, (type == "user"));
				var className = 'meta-score';
				if (type == "user")
					className += "-user"
				// The element that is the score itself
				const text = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight ' + className,
					style: 'background-color: ' + colour + '; display: inline-block;'
				});

				// Add the hoverover text and href
				if (data.num_ratings > 0 && data.rating == "tbd"){
					var hover = 'No score yet (' + data.num_ratings.toLocaleString() + ' ' + display + ' review';
					if (data.num_ratings == 1)
						hover += ")";
					else
						hover += "s)";

					text.setAttribute('data-original-title',hover);
					text.setAttribute('href',url);
				}else if (data.num_ratings > 0){
					var totalScore = "/100";
					if (type == "user")
						totalScore = "/10";
					var hover = "Weighted average of " + data.rating + totalScore + " based on " + data.num_ratings.toLocaleString() + ' ' + display + ' review';
					if (data.num_ratings != 1)
						hover += "s"
					
					text.setAttribute('data-original-title',hover);
					text.setAttribute('href',url);
				}else if (url != ""){
					if (data.rating == "N/A"){
						text.setAttribute('data-original-title','No score available');
					}else{
						text.setAttribute('data-original-title','No score yet');
					}
				}

				text.innerText = data.rating;
				span.append(text);

				// Add the positive/mixed/negative bars
				const chartSpan = letterboxd.helpers.createElement('span', {
					class: 'meta-score-details',
					style: 'display: none'
				});
				chartSpan.append(letterboxd.helpers.createMetaBarCount("Positive", data.positive, data.highest, letterboxd.helpers.determineMetaColour(100,false)));
				chartSpan.append(letterboxd.helpers.createMetaBarCount("Mixed", data.mixed, data.highest, letterboxd.helpers.determineMetaColour(50,false)));
				chartSpan.append(letterboxd.helpers.createMetaBarCount("Negative",data.negative, data.highest, letterboxd.helpers.determineMetaColour(0,false)));
				span.append(chartSpan);

				return span;
			},

			createMetaBarCount(type, count, total, color){
				// Span that holds it all
				const span = letterboxd.helpers.createElement('span', {
					style: 'display: block; width: 160px;'
				});
				// Text label (ie, 'Fresh")
				const label = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block; font-size: 8px; width: 40px;'
				});
				label.innerText = type;
				span.append(label);
				
				// Span that holds the bar
				const barSpan = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block;'
				});
				// Bar outline
				const backBar = letterboxd.helpers.createElement('span', {
					class: 'meta-bar outline'
				});
				// Bar that displays the percentage
				var style = (Math.round((count / total) * 100));
				style = 'width: ' + style.toString() + '%; background-color:' + color + ';';
				const frontBar = letterboxd.helpers.createElement('span', {
					class: 'meta-bar fill',
					style: style
				});
				backBar.append(frontBar);
				barSpan.append(backBar);
				span.append(barSpan);

				// Text that shows the num of ratings
				const countText = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block; font-size: 9px; width: 25px; margin-left: 5px;'
				});
				countText.innerText = count.toLocaleString();
				span.append(countText);

				return span;
			},

			createDetailsRow(headerText, value, currency){
				// Determine className
				var className = "";
				switch(headerText){
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
				if (!value.startsWith("$") && value != ""){
					value = Number(value).toLocaleString('en-US', {style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 2 })

					switch(currency){
						case "DER": // Manually handle Reichsmark (no valid ISO 4217 code)
							value = value.replace('DER','').trim();
							value += " ℛℳ";
							break;
					}
				}
				
				// Replace value if already added
				if (document.querySelector('.' + className + '') != null){
					var p = document.querySelector('.' + className + ' p');
					p.innerText = value;

				// Otherwise add new
				}else{
					// Create the Elements
					//********************************************
					// Create the row header element				
					const header = letterboxd.helpers.createElement('h3', {
						class: className + ' header'
					});
				
					// Span
					const span = letterboxd.helpers.createElement('span', {});
					span.innerText = headerText;
					header.append(span);
					
					// Create the list element
					const sluglist = letterboxd.helpers.createElement('div', {
						class: 'text-indentedlist ' + className + ' detail'
					});

					// Text holder
					const p = letterboxd.helpers.createElement('p', {});
					p.innerText = value;
					sluglist.append(p);

					// Append to the Tab Details
					//********************************************
					// Get the details tab
					const tabDetails = document.querySelector('#tab-details');

					// Append the Header
					// If budget
					if (className == "budget" && tabDetails.querySelector('.box-office-us.header')){
						tabDetails.querySelector('.box-office-us.header').before(header);
					}else if (className == "budget" && tabDetails.querySelector('.box-office-ww.header')){
						tabDetails.querySelector('.box-office-ww.header').before(header);
					// If box office US
					}else if (className == "box-office-us" && tabDetails.querySelector('.budget.detail')){
						tabDetails.querySelector('.budget.detail').after(header);
					}else if (className == "box-office-us" && tabDetails.querySelector('.box-office-ww.header')){
						tabDetails.querySelector('.box-office-ww.header').before(header);
					// If box office WW
					}else if (className == "box-office-ww" && tabDetails.querySelector('.box-office-us.detail')){
						tabDetails.querySelector('.box-office-us.detail').after(header);
					}else if (className == "box-office-ww" && tabDetails.querySelector('.budget.detail')){
						tabDetails.querySelector('.budget.detail').after(header);
					// else
					}else{
						tabDetails.append(header);
					}

					// Append the sluglist
					header.after(sluglist);
				}
			},

			getTextBetween(text, start, end){
				var tempArray = text.split(start);
				tempArray = tempArray[1].split(end);

				return (tempArray[0]);
			},

			parseHTML(html){
				var parser = new DOMParser();
				return parser.parseFromString(html, "text/html");
			},

			getOriginalURL(html){
				var output = "";
				var split = html.split('<meta property="og:url" content="');
				output = split[1].split('">')[0];
				return output;
			},

			fixURL(url){
				// replace http with https
				if (url.includes("http://"))
					url = url.replace("http://","https://");

				// Make sure it has https
				if (!url.startsWith("https://"))
					url = "https://" + url;
					
				// Make sure it was www
				if (!url.includes("www."))
					url = url.replace("https://","https://www.");

				return url;
			},

			getValidASCIIString(input){
				var output = '';

				for(var i = 0; i < input.length; i++){
					if (input.codePointAt(i) >= 256){
						break;
					}else{
						output += input[i];
					}
				}

				return output;
			},

			encodeASCII(text){
				return btoa(unescape(encodeURIComponent(text)));
			},

			romanize(num){
				if (isNaN(num))
					return NaN;

				var digits = String(+num).split(""),
					key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
						"","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
						"","I","II","III","IV","V","VI","VII","VIII","IX"],
					roman = "",
					i = 3;
				while (i--)
					roman = (key[+digits.pop() + (i * 10)] || "") + roman;
				return Array(+digits.join("") + 1).join("M") + roman;
			},

			determineMetaColour(metascore, user){
				var output = "#ccc"; //grey tba
				if (metascore != "tbd" && metascore != "N/A" ){
					var score = parseFloat(metascore);
					if (user == true) score = score * 10;

					if (score >= 61){
						output = "#66CC33" // Green
					}else if(score >= 40){
						output = "#FFCC33"; // Yellow
					}else{
						output = "#FF0000"; // Red
					}
				}
				return output;
			},

			determineMPAARating(value){
				var output = "";
				// ugh this sucks
				switch(value){
					case "Q18665330":
						output = "G"
						break;
					case "Q18665334":
						output = "PG"
						break;
					case "Q18665339":
						output = "PG-13"
						break;
					case "Q18665344":
						output = "R"
						break;
					case "Q18665349":
						output = "NC-17"
						break;
					case "Q47274658":
						output = "X"
						break;
					case "Q29841070":
						output = "M"
						break;
					case "Q29841078":
						output = "GP"
						break;
					case "Q50321114":
						output = "M/PG"
						break;
					default:
						output = value;
						break;
				}
				return output;
			},

			cinemascoreTitle(title, year){
				var output = "";

				if (title == null || title == ""){
					title = document.querySelector(".headline-1.js-widont.prettify").innerText;
				}
				// Get the Movie Title and clean it up a bit
				if (title.startsWith('The ')){
					title = title.replace("The ","");
					title = title + ", The";
				}else if (title.startsWith('A ')){
					title = title.replace("A ","");
					title = title + ", A";
				}
				// Normalize (ie, remove accents/diacritics)
				title = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

				// I don't like doing it this way, but there is no other way for certain movies where cinemascore has incorrect data
				switch(title){
					case "Harry Potter and the Order of the Phoenix":
						output = "Harry Potter and Order of the Phoenix";
						break;
					case "Ocean's Eleven":
						if (year == "2001")
							output = "Ocean's 11";
						break;
					default:
						output = title;
						break;
				}
				return output;
			},

			cleanupInnerText(value){
				var out = value.replaceAll("\n","");
				out = out.trim();
				return out;
			},

			cleanNumber(value){
				value = value.replaceAll(',','');
				value = value.replaceAll('.','');
				value = value.replaceAll(' ','');
				value = value.replaceAll('$','');

				return value;
			},
			
			getWikiDataQuery(id, idType){
				switch(idType.toUpperCase()){
					case "IMDB":
						idType = "P345";
						break;
					case "TMDBTV":
						idType = "P4983";
						break;
					case "TMDB":
						idType = "P4947";
						break;
					case "LETTERBOXD":
						idType = "P6127";
						break;
				}
				var sparqlQuery = "SELECT DISTINCT ?item ?itemLabel ?Rotten_Tomatoes_ID ?Metacritic_ID ?Anilist_ID ?MAL_ID ?MPAA_film_ratingLabel ?Budget ?Budget_UnitLabel ?Box_OfficeUS ?Box_OfficeUS_UnitLabel ?Box_OfficeWW ?Box_OfficeWW_UnitLabel ?Publication_Date ?Publication_Date_Backup ?Publication_Date_Origin ?US_Title ?TV_Start ?TV_End WHERE {\n" +
				"  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n" +
				"  {\n" +
				"    SELECT DISTINCT ?item WHERE {\n" +
				"      ?item p:" + idType + " ?statement0.\n" +
				"      ?statement0 ps:" + idType + " \"" + id + "\".\n" +
				"    }\n" +
				"    LIMIT 10\n" +
				"  }\n" +
				"  OPTIONAL { ?item wdt:P1258 ?Rotten_Tomatoes_ID. }\n" +
				"  OPTIONAL { ?item wdt:P1712 ?Metacritic_ID. }\n" +
				"  OPTIONAL { ?item wdt:P8729 ?Anilist_ID. }\n" +
				"  OPTIONAL { ?item wdt:P4086 ?MAL_ID. }\n" +
				"  OPTIONAL { ?item wdt:P1657 ?MPAA_film_rating. }\n" +
				"  OPTIONAL {\n" +
				"    ?item p:P2130 ?Budget_Entry.\n" +
				"    ?Budget_Entry ps:P2130 ?Budget.\n" +
				"    OPTIONAL {\n" +
				"      ?Budget_Entry psv:P2130 ?valuenode.\n" +
				"      ?valuenode wikibase:quantityUnit ?Budget_Unit.\n" +
				"      ?Budget_Unit p:P498 [ps:P498 ?Budget_UnitLabel].\n" +
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
				"    ?item p:P577 ?Publication_Date_entry.\n" +
				"    ?Publication_Date_entry ps:P577 ?Publication_Date;\n" +
				"      pq:P291 wd:Q30.\n" +
				"    MINUS { ?Publication_Date_entry wikibase:rank wikibase:DeprecatedRank. }\n" +
				"  }\n" +
				"  OPTIONAL {\n" +
				"    ?item p:P577 ?Publication_Date_Backup_entry.\n" +
				"    ?Publication_Date_Backup_entry ps:P577 ?Publication_Date_Backup.\n" +
				"    FILTER NOT EXISTS { ?Publication_Date_Backup_entry pq:P291 [] }\n" +
				"    MINUS { ?Publication_Date_Backup_entry wikibase:rank wikibase:DeprecatedRank. }\n" +
				"  }\n" +
				"  OPTIONAL {\n" +
				"    ?item wdt:P495 ?Country_Of_Origin.\n" +
				"    OPTIONAL {\n" +
				"      ?item p:P577 ?Date_Origin_entry.\n" +
				"      ?Date_Origin_entry ps:P577 ?Publication_Date_Origin;\n" +
				"        pq:P291 ?Country_Of_Origin.\n" +
				"      MINUS { ?Date_Origin_entry wikibase:rank wikibase:DeprecatedRank. }\n" +
				"    }\n" +
				"  }\n" +
				"  OPTIONAL {\n" +
				"    ?item p:P1476 ?Title_Entry.\n" +
				"    ?Title_Entry ps:P1476 ?US_Title;\n" +
				"      pq:P3005 wd:Q30.\n" +
				"  }\n" +
				"  OPTIONAL { ?item wdt:P580 ?TV_Start. }\n" +
				"  OPTIONAL { ?item wdt:P582 ?TV_End. }\n" +
				"}";
				
				return sparqlQuery;
			}
		},

		storage: {
			data: {},
			async init() {
				this.data = await browser.storage.local.get().then(function (storedSettings) {
					return storedSettings;
				});
			},
			get(key) {
				return this.data[key];
			},
			set(key, value) {
				this.data[key] = value;
				browser.storage.local.set(this.data);
			}
		}
	};

	letterboxd.storage.init();

	const observer = new MutationObserver(() => {

		if (window.location.hostname === 'letterboxd.com') {
			if (window.location.pathname.startsWith('/film/') && !window.location.pathname.includes("ratings")) {
				letterboxd.overview.init();
			}
		}
	});

	observer.observe(document, { childList: true, subtree: true });
})();

function ShowTwipsy(event){
	//if (document.querySelector('.twipsy.fade.above.in')){
	if (document.querySelector('.twipsy-extra-out')){
		//var temp = document.querySelector('.twipsy.fade.above.in');
		var temp = document.querySelector('.twipsy-extra-out');
		temp.parentNode.removeChild(temp);
	}

	const twipsy = document.createElement('div');
	twipsy.className = 'twipsy above twipsy-extra';

	//twipsy.style = 'display: block; top: 824.4px; left: 1268.5px';

	const arrow = document.createElement('div');
	arrow.className = 'twipsy-arrow';
	arrow.style = 'left: 50%';
	twipsy.append(arrow);

	const inner = document.createElement('div');
	inner.className = 'twipsy-inner';
	inner.innerText = this.getAttribute("data-original-title");
	twipsy.append(inner);

	$("body").prepend(twipsy);

	var rect = getOffset(this);
	var top = rect.top - twipsy.clientHeight;
	var left = rect.left - (twipsy.clientWidth / 2) + (this.offsetWidth / 2); //(this.clientWidth / 2 );

	twipsy.style = 'display:block; top: ' + top.toString() + 'px; left: ' + left.toString() + 'px;';

    twipsy.className = twipsy.className.replace('twipsy-extra','twipsy-extra-in');
}

function HideTwipsy(event){
	if (document.querySelector('.twipsy-extra-in')){
		var twipsy = document.querySelector('.twipsy-extra-in');
		//twipsy.parentNode.removeChild(twipsy);
        twipsy.className = twipsy.className.replace("in","out");
        setTimeout(() => twipsy.style.visibility = "hidden", 100);
	}
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

function changeTomatoScore(event){
	// Get the target class stored in the 'target' attribute of the clicked button
	var target = '.' + event.target.getAttribute('target');
	var parent = event.target.parentNode.parentNode;
	// Grab the target score div and then the other non-target score div
	var targetNode = parent.querySelector('.rt-score-div' + target);
	var otherNode = parent.querySelector('div.rt-score-div:not(' + target + ')');

	// Hide the current visible score, display the current hidden score
	otherNode.style.display = 'none';
	targetNode.style.display = 'block';

	// Swap .selected class on the buttons
	var otherButton = event.target.parentNode.querySelector('.selected');
	event.target.className += " selected";
	otherButton.className = otherButton.className.replace(' selected','');
}


function toggleDetails(event, letterboxd){
	// Get the target class stored in the 'target' attribute of the clicked button
	var target = '.' + event.target.getAttribute('target');
	var elements = document.querySelectorAll(target);

	elements.forEach(element => {
		if (element.style.display == "none"){
			element.style.display = "inline-block";
		}else{
			element.style.display = "none";
		}		
	});

	if (event.target.innerText.includes("SHOW")){
		event.target.innerText = "HIDE DETAILS";
		letterboxd.storage.set(target.replace('.',''), "show");
	}else{
		event.target.innerText = "SHOW DETAILS";
		letterboxd.storage.set(target.replace('.',''), "hide");
	}
}