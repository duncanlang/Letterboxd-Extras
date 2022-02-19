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
			text-align:center;
			width:33px;			
		}
		.meta-score, .meta-score:hover, .meta-score-user, .meta-score-user:hover, .cinema-grade, .cinema-grade:hover {
			color: white;
			display:block;
			font-family: Arial,Helvetica,sans-serif;
			font-size:16px;
			font-weight: bold !important;
			width:30px;
			height:30px;
			line-height:30px;
			margin-left:1px;
			margin-top:5px;
			text-align:center;
			border-radius: 3px;
		}
		.meta-score-user, .meta-score-user:hover {
			border-radius: 100px;
			margin-left: 10px;
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
		.icon-tomato, .icon-popcorn, .icon-meta, .text-meta, .logo-tomatoes, .icon-rym {
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
			padding-right: 5px;
			opacity: 100%;
		}
		.icon-tomato {
			background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-empty.cd930dab34a.svg");
		}
		.icon-popcorn {
			background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/icons/audience/aud_score-empty.eb667b7a1c7.svg");
		}
		.imdb-ratings, .tomato-ratings, .meta-ratings, .cinemascore{
			margin-top: 15px !important;
		}
		.tomato-ratings .section-heading, .meta-ratings .section-heading, .cinemascore .section-heading{
			margin-bottom: 0px !important; 
		}
		.logo-tomatoes:hover, .logo-imdb:hover, .logo-meta-link:hover, .logo-rym.header:hover{
			opacity: 50%;
		}
		.logo-meta-link{
			opacity: 100%;
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
		.rating-star-extra{
			background: transparent !important;
			overflow: visible !important;
			text-indent: 0 !important;
			line-height: 0.5 !important;
			font-size: 12.5px !important;
			color: gold;
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
			padding: 0px;
		}
		.rt-bar{
			display: inline-block;
			height: 7px;
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
		.rt-show-details{
			font-size: 9px !important;
			top: 10px !important;
		}
		.rt-show-details:hover{
			cursor: pointer;
		}
	`);
	/* eslint-enable */

	const letterboxd = {

		overview: {

			lastLocation: window.location.pathname,

			running: false,

			imdbID: "",
			imdbData: {url: "", data: null, raw: null, rating: "", num_ratings: "", highest: 0, votes: new Array(10), percents: new Array(10), isMiniSeries: false},

			omdbData: null,

			mojoData: null,

			cinemascore: null,

			// WikiData
			wiki: null,
			wikiData: {tomatoURL: null, metaURL: "", budget: null, boxOffice: null, mpaa: null, date: null, rating: null},

			// Rotten Tomatoes
			tomatoData: {data: null, raw: null, criticAll: null, criticTop: null, audienceAll: null, audienceVerified: null},

			// Metacritic
			metaData: null,

			// MPAA rating
			mpaaRating: null,

			// Date
			filmDate: null,

			// RateYourMusic
			rymData: {url: null, data: null, highest: 0, error: false},
			
			rtAdded: false,
			metaAdded: false,
			dateAdded: false, 
			ratingAdded: false,

			tooltipsAdded: false,

			starRatings: ['half-★','★','★½','★★','★★½','★★★','★★★½','★★★★','★★★★½','★★★★★'],

			stopRunning() {
				this.running = false;
			},

			async init() {
				if (this.running) return;

				this.running = true;

				// Add Cinema Score
				if (this.cinemascore == null && document.querySelector(".headline-1.js-widont.prettify")){
					// Get the Movie Title and clean it up a bit
					var title = document.querySelector(".headline-1.js-widont.prettify").innerHTML;
					if (title.startsWith('The ')){
						title = title.replace("The ","");
						title = title + ", The";
					}else if (title.startsWith('A ')){
						title = title.replace("A ","");
						title = title + ", A";
					}
					// Normalize (ie, remove accents/diacritics)
					title = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
	
	
					// First Attempt - 'The' at end, no accents
					//****************************************************************
					// Encode title
					var encoded = letterboxd.helpers.encodeASCII(title);
	
					// Create the URL and send the request
					var url = "https://api.cinemascore.com/guest/search/title/" + encoded;
					this.cinemascore = await letterboxd.helpers.getOMDbData(url);
	
					// Second Attempt - after hyphen
					//****************************************************************
					if (this.cinemascore != null && this.cinemascore.length > 0 && this.cinemascore[0].GRADE == "" && title.includes(" - ")){
						var temp = title.split(" - ");
						var encoded = btoa(temp[1]);
						url = "https://api.cinemascore.com/guest/search/title/" + encoded;
						this.cinemascore = await letterboxd.helpers.getOMDbData(url);
					}
						
					// Third Attempt - after colon
					//****************************************************************
					if (this.cinemascore != null && this.cinemascore.length > 0 && this.cinemascore[0].GRADE == "" && title.includes(": ")){
						var temp = title.split(": ");
						var encoded = btoa(temp[1]);
						url = "https://api.cinemascore.com/guest/search/title/" + encoded;
						this.cinemascore = await letterboxd.helpers.getOMDbData(url);
					}

					// Fourth Attempt - roman numerals
					//****************************************************************
					const res = /( [0-9]+)/g;
					if (this.cinemascore != null && this.cinemascore.length > 0 && this.cinemascore[0].GRADE == "" && res.test(title)){
						var num = title.substring(title.search(res),title.length).trim();
						var roman = letterboxd.helpers.romanize(parseInt(num));
						title = title.replace(res, " " + roman);
						var encoded = btoa(title);
						url = "https://api.cinemascore.com/guest/search/title/" + encoded;
						this.cinemascore = await letterboxd.helpers.getOMDbData(url);
					}
				}
				if (!document.querySelector('.cinemascore')){
					if (this.cinemascore != null && this.cinemascore.length > 0 && this.cinemascore[0].GRADE != ""){
						this.addCinema();
					}
				}

				// Add RateYourMusic
				// So it turns out they don't like site scraping and will ban IPs
				/*
				if (this.rymData.url == null && document.querySelector(".headline-1")){
					var title = document.querySelector(".headline-1").innerText;
					var rymUrl = title.toLowerCase();
					rymUrl = rymUrl.replaceAll(new RegExp(String.fromCharCode(160), "g"), '_');
					rymUrl = rymUrl.replaceAll(' ', '_');
					rymUrl = rymUrl.replaceAll(':', '_');
					rymUrl = rymUrl.replaceAll("'", '');
					// TODO: try to use original name if available

					rymUrl = "https://rateyourmusic.com/film/" + rymUrl;
					// one attempt for now
					var found = false;
					let ii = 0;
					do {
						await this.getRYM(rymUrl);

						if (this.rymData.raw.includes("ERROR 404") || this.rymData.raw.includes("IP blocked") ){
							found = true;
							this.rymData.error = true;
						}else if(this.verifyRYM()){
							found = true;
						}else{
							ii++;
							rymUrl += "_f" + ii;
						}
					} while (found == false);

					// Now lets add
					if (this.rymData.data != null && this.rymData.error == false){
						this.addRYM();
					}
				}
				*/

				// First Get the IMDb link
				this.getIMDbLink();

				// ADD IMDb Score
				if (this.imdbData.url != ""){
					if (this.imdbData.data == null)
					{
						this.imdbData.raw = await letterboxd.helpers.getIMDBData(this.imdbData.url);
						this.imdbData.data = letterboxd.helpers.parseHTML(this.imdbData.raw);
					}
					
					if (this.imdbData.data != null){
						if (this.imdbData.raw.includes("TV Mini Series"))
							this.imdbData.isMiniSeries = true;

						this.addIMDBScore();
					}

					// Get BoxOfficeMojo data
					if (this.mojoData == null){
						this.mojoData = letterboxd.helpers.parseHTML(await letterboxd.helpers.getIMDBData('https://www.boxofficemojo.com/title/' + this.imdbID)); 
						this.addBoxOffice();

						// If MPAA rating found on Mojo, add it now
						if (this.mpaaRating != null)
							this.addRating();

						// If the domestic date was found on Mojo, add it now
						if (this.filmDate != null && this.dateAdded == false)
							this.addDate();
					}	
				}

				// Call WikiData
				if (this.imdbID != ""){
					var queryString = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=SELECT+DISTINCT+?item+?itemLabel+?Rotten_Tomatoes_ID+?Metacritic_ID+?MPAA_film_rating+?MPAA_film_ratingLabel+?Budget+?Box_Office+?Publication_Date+?Publication_Date_Backup+WHERE+{+SERVICE+wikibase:label+{+bd:serviceParam+wikibase:language+"[AUTO_LANGUAGE]".+}+{+SELECT+DISTINCT+?item+WHERE+{+?item+p:P345+?statement0.+?statement0+ps:P345+"' + this.imdbID + '".+}+LIMIT+100+}+OPTIONAL+{+?item+wdt:P1258+?Rotten_Tomatoes_ID.+}+OPTIONAL+{+?item+wdt:P1712+?Metacritic_ID.+}+OPTIONAL+{+?item+wdt:P1657+?MPAA_film_rating.+}+OPTIONAL+{+?item+wdt:P2130+?Budget.+}+OPTIONAL+{+?item+wdt:P2142+?Box_Office.+}+OPTIONAL+{+?item+p:P577+?Publication_Date_entry.+?Publication_Date_entry+ps:P577+?Publication_Date.+?Publication_Date_entry+pq:P291+wd:Q30.}OPTIONAL{?item+wdt:P577+?Publication_Date_Backup.}}';
					if (this.wiki == null){
						var temp = await letterboxd.helpers.getWikiData(queryString);
						if (temp != null && temp.results != null && temp.results.bindings != null && temp.results.bindings.length > 0){
							this.wiki = temp.results.bindings[0];
						}
					}	
					
					// Add links
					this.addLinks();	

					// Box Office and Budget
					if (this.wiki != null && this.wiki.Budget != null && this.wiki.Budget.value != null)
						this.wikiData.budget = this.wiki.Budget.value;
					if (this.wiki != null && this.wiki.Box_Office != null && this.wiki.Box_Office.value != null)
						this.wikiData.boxOffice = this.wiki.Box_Office.value;

					this.addBoxOffice();
				
					// Add full release date
					var options = { year: 'numeric', month: 'short', day: 'numeric' };
					if (this.wiki != null && this.wiki.Publication_Date != null && this.dateAdded == false){
						this.filmDate = new Date(this.wiki.Publication_Date.value.replace("Z","")).toLocaleDateString("en-UK", options);
						this.addDate();
					}else if (this.wiki != null && this.wiki.Publication_Date_Backup != null && this.dateAdded == false){
						this.filmDate = new Date(this.wiki.Publication_Date_Backup.value.replace("Z","")).toLocaleDateString("en-UK", options);
						this.addDate();
					}
	
					// Add Rating
					if (this.wiki != null && this.wiki.MPAA_film_ratingLabel != null){
						this.mpaaRating = letterboxd.helpers.determineMPAARating(this.wiki.MPAA_film_ratingLabel.value);
						this.addRating();	
					}

					// Get and add Metacritic
					if (this.wiki != null && this.wiki.Metacritic_ID != null && this.wiki.Metacritic_ID.value != null){
						this.wikiData.metaURL = "https://www.metacritic.com/" + this.wiki.Metacritic_ID.value;

						if (this.metaData == null && this.metaAdded == false){
							try{
								var response = await letterboxd.helpers.getData(this.wikiData.metaURL);
								var meta = response.response;

								if (meta != ""){
									this.metaData = letterboxd.helpers.parseHTML(meta);
									//this.wikiData.metaURL = letterboxd.helpers.getOriginalURL(meta);
									this.wikiData.metaURL = response.url;
								}
							}catch{
								console.log("Unable to parse Metacritic URL");
								this.metaAdded = true; // so it doesn't keep calling
							}
						}

						// Metacritic
						if (this.metaData != null){
							// Add the everything to the page
							this.addMeta();
						}
					}

					// Get and add Rotten Tomatoes
					if (this.wiki != null && this.wiki.Rotten_Tomatoes_ID != null && this.wiki.Rotten_Tomatoes_ID.value != null){
						var url = "https://www.rottentomatoes.com/" + this.wiki.Rotten_Tomatoes_ID.value;
						if (this.imdbData.isMiniSeries == true)
							url += "/s01"

						this.wikiData.tomatoURL = url;

						if (this.tomatoData.data == null && this.rtAdded == false){
							try{
								var response = await letterboxd.helpers.getData(this.wikiData.tomatoURL);
								var tomato = response.response;

								if (tomato != ""){
									this.tomatoData.raw = tomato;
									this.tomatoData.data = letterboxd.helpers.parseHTML(tomato);
									this.wikiData.tomatoURL = response.url;
								}
							}catch{
								console.log("Unable to parse Rotten Tomatoes URL");
								this.rtAdded = true; // so it doesn't keep calling
							}
						}

						// Rotten Tomatoes
						if (this.tomatoData.data != null){
							// Add the everything to the page
							this.addTomato();
						}
					}

				}

				// Call OMDb for backup
				if (this.imdbID != "" && (this.rtAdded == false || this.metaAdded == false || (this.dateAdded == false || this.filmDate.startsWith("1 Jan")) || this.ratingAdded == false)){
					var queryString = "https://www.omdbapi.com/?apikey=afd82b43&i=" + this.imdbID + "&plot=short&r=json&tomatoes=true";
					if (this.omdbData == null){
						//this.omdbData = await letterboxd.helpers.getOMDbData(queryString);
						this.omdbData = (await letterboxd.helpers.getData(queryString)).response;
					}				
	
					// Check if OMDb response is valid
					if (this.omdbData != null && this.omdbData.Response == "True"){
						// Add links
						this.addLinks();	

						// Add full release date
						if (this.omdbData.Released != null && this.omdbData.Released != "N/A" && (this.wiki == null || this.wiki.Publication_Date == null) && (this.dateAdded == false || this.filmDate.startsWith("1 Jan"))){
							this.filmDate = this.omdbData.Released;
							this.addDate();
						}
	
						// Add Rating
						if (this.omdbData.Rated != null && this.omdbData.Rated != "N/A" && (this.wiki == null || this.wiki.MPAA_film_ratingLabel == null) && this.ratingAdded == false){
							this.mpaaRating = this.omdbData.Rated;
							this.addRating();	
						}

						// Add Metacritic
						if (this.omdbData.Metascore != null && this.omdbData.Metascore != "N/A" && (this.wiki == null || this.wiki.Metacritic_ID == null || this.wiki.Metacritic_ID.value == null) && this.metaAdded == false){
							this.addMeta();
						}

						// Get Rotten Tomatoes data
						if (this.omdbData.tomatoURL != null && this.omdbData.tomatoURL != "" && this.omdbData.tomatoURL != "N/A" && (this.wiki == null || this.wiki.Rotten_Tomatoes_ID == null || this.wiki.Rotten_Tomatoes_ID.value == null) && this.rtAdded == false){
							this.omdbData.tomatoURL = letterboxd.helpers.fixURL(this.omdbData.tomatoURL);
							this.wikiData.tomatoURL = this.omdbData.tomatoURL;

							if (this.tomatoData.data == null){
								try{
									/*
									var tomato = await letterboxd.helpers.getOMDbData(this.wikiData.tomatoURL);
	
									if (tomato != "")
										this.tomatoData.data = letterboxd.helpers.parseHTML(tomato);
										*/
									var response = await letterboxd.helpers.getData(this.wikiData.tomatoURL);
									var tomato = response.response;

									if (tomato != ""){
										this.tomatoData.raw = tomato;
										this.tomatoData.data = letterboxd.helpers.parseHTML(tomato);
										this.wikiData.tomatoURL = response.url;
									}
								}catch{

								}
							}
	
							// Rotten Tomatoes
							if (this.tomatoData.data != null){
								// Add the everything to the page
								this.addTomato();
							}
							
						}
					}				
				}

				// Stop
				return this.stopRunning();
			},

			getIMDbLink(){
				// Get the two links (imdb and tmdb)
				const links = document.querySelectorAll('.micro-button.track-event');

				var imdbLink = "";

				// Loop and find IMDB
				for(var i = 0; i < links.length; i++){
					if (links[i].innerHTML === "IMDb"){
						// Grab the imdb page
						imdbLink = links[i].href;
						if (!imdbLink.includes("https") && imdbLink.includes('http'))
							imdbLink = imdbLink.replace("http","https");
						if (imdbLink.includes("maindetails"))
							imdbLink = imdbLink.replace("maindetails","ratings");

						//this.imdbInfo[0] = imdbLink;
						this.imdbData.url = imdbLink;
					}
				}

				// Separate out the ID
				this.imdbID = imdbLink.replace("https://www.imdb.com/title/","");
				this.imdbID = this.imdbID.replace("/ratings","");
				this.imdbID = this.imdbID.replace("/","");
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
					style: 'height: 20px;'
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
					href: this.imdbData.url,
					['data-original-title']: 'Weighted average of ' + this.imdbData.rating + ' based on ' + this.imdbData.num_ratings + ' ratings'
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

					const a = letterboxd.helpers.createElement('a', {
						class: 'ir tooltip imdb tooltip-extra',
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
				if (document.querySelector('.rateyourmusic')){
					document.querySelector('.rateyourmusic').before(imdbScoreSection);
				}else if (document.querySelector('.cinemascore')){
					document.querySelector('.cinemascore').before(imdbScoreSection);
				}else{
					document.querySelector('.sidebar').append(imdbScoreSection);
				}

				
				// Add the hover events
				//*****************************************************************
				$(".tooltip-extra").on("mouseover", ShowTwipsy);
				$(".tooltip-extra").on("mouseout", HideTwipsy);
			},

			addTomato(){				
				if (document.querySelector('.tomato-ratings')) return;

				if (!document.querySelector('.sidebar')) return;

				if (this.tomatoData.raw.includes('404 - Not Found')) return;

				// Lets grab all the potentially useful information first 
				//***************************************************************
				this.tomatoData.criticAll = {percent: "", state: "", rating: "", num_ratings: "", likedCount: "", notLikedCount: ""};
				this.tomatoData.criticTop = {percent: "", state: "", rating: "", num_ratings: "", likedCount: "", notLikedCount: ""};
				this.tomatoData.audienceAll = {percent: "", state: "", rating: "", num_ratings: "", likedCount: "", notLikedCount: ""};
				this.tomatoData.audienceVerified = {percent: "", state: "", rating: "", num_ratings: "", likedCount: "", notLikedCount: ""};

				// Different collected for Movies vs TV
				if (this.imdbData.isMiniSeries == false){
					// MOVIES
					var scoredetails = JSON.parse(this.tomatoData.data.querySelector('#score-details-json').innerHTML);
					// Critic All
					this.tomatoData.criticAll.percent 					= scoredetails.modal.tomatometerScoreAll.score.toString();
					this.tomatoData.criticAll.state 					= scoredetails.modal.tomatometerScoreAll.tomatometerState;
					this.tomatoData.criticAll.rating 					= scoredetails.modal.tomatometerScoreAll.averageRating;
					this.tomatoData.criticAll.num_ratings 				= scoredetails.modal.tomatometerScoreAll.ratingCount.toString();
					this.tomatoData.criticAll.likedCount 				= scoredetails.modal.tomatometerScoreAll.likedCount.toString();
					this.tomatoData.criticAll.notLikedCount 			= scoredetails.modal.tomatometerScoreAll.notLikedCount.toString();
					// Critic Top
					if (scoredetails.modal.tomatometerScoreTop.score != null){
						this.tomatoData.criticTop.percent 				= scoredetails.modal.tomatometerScoreTop.score.toString();
						this.tomatoData.criticTop.state 				= scoredetails.modal.tomatometerScoreTop.tomatometerState;
						this.tomatoData.criticTop.rating 				= scoredetails.modal.tomatometerScoreTop.averageRating;
						this.tomatoData.criticTop.num_ratings 			= scoredetails.modal.tomatometerScoreTop.ratingCount.toString();
						this.tomatoData.criticTop.likedCount 			= scoredetails.modal.tomatometerScoreTop.likedCount.toString();
						this.tomatoData.criticTop.notLikedCount 		= scoredetails.modal.tomatometerScoreTop.notLikedCount.toString();

						var score = scoredetails.modal.tomatometerScoreTop.score;
						var state = scoredetails.modal.tomatometerScoreTop.tomatometerState;
						if (score < 60 && state.includes("fresh")){
							this.tomatoData.criticTop.state = "rotten";
						}else if(score >= 60 && state == "rotten"){
							this.tomatoData.criticTop.state = "fresh";
						}
					}
					
					// Audience All	
					this.tomatoData.audienceAll.percent 				= scoredetails.modal.audienceScoreAll.score.toString();
					this.tomatoData.audienceAll.state 					= scoredetails.modal.audienceScoreAll.audienceClass;
					this.tomatoData.audienceAll.rating 					= scoredetails.modal.audienceScoreAll.averageRating;
					this.tomatoData.audienceAll.num_ratings 			= scoredetails.modal.audienceScoreAll.ratingCount.toString();
					this.tomatoData.audienceAll.likedCount 				= scoredetails.modal.audienceScoreAll.likedCount.toString();
					this.tomatoData.audienceAll.notLikedCount 			= scoredetails.modal.audienceScoreAll.notLikedCount.toString();
					// Sometimes, the audience ratings are odd, so lets just combine the liked/notliked as that seems more accurate
					this.tomatoData.audienceAll.num_ratings = (scoredetails.modal.audienceScoreAll.likedCount + scoredetails.modal.audienceScoreAll.notLikedCount).toString();

					// Audience Verified
					if (scoredetails.modal.audienceScoreVerified.score != null){
						this.tomatoData.audienceVerified.percent 		= scoredetails.modal.audienceScoreVerified.score.toString();
						this.tomatoData.audienceVerified.state 			= scoredetails.modal.audienceScoreVerified.audienceClass;
						this.tomatoData.audienceVerified.rating 		= scoredetails.modal.audienceScoreVerified.averageRating;
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
					this.tomatoData.criticAll.percent 					= scoreInfo.tomatometerAllCritics.score.toString();
					this.tomatoData.criticAll.state 					= scoreInfo.tomatometerAllCritics.state;
					this.tomatoData.criticAll.rating 					= scoreInfo.tomatometerAllCritics.averageRating;
					this.tomatoData.criticAll.num_ratings 				= scoreInfo.tomatometerAllCritics.ratingCount.toString();
					this.tomatoData.criticAll.likedCount 				= scoreInfo.tomatometerAllCritics.likedCount.toString();
					this.tomatoData.criticAll.notLikedCount 			= scoreInfo.tomatometerAllCritics.notLikedCount.toString();
					// Critic Top
					if (scoreInfo.tomatometerTopCritics.score != null){
						this.tomatoData.criticTop.percent 				= scoreInfo.tomatometerTopCritics.score.toString();
						this.tomatoData.criticTop.state 				= scoreInfo.tomatometerTopCritics.state;
						this.tomatoData.criticTop.rating 				= scoreInfo.tomatometerTopCritics.averageRating;
						this.tomatoData.criticTop.num_ratings 			= scoreInfo.tomatometerTopCritics.ratingCount.toString();
						this.tomatoData.criticTop.likedCount 			= scoreInfo.tomatometerTopCritics.likedCount.toString();
						this.tomatoData.criticTop.notLikedCount 		= scoreInfo.tomatometerTopCritics.notLikedCount.toString();
					}
					
					// Audience All	
					this.tomatoData.audienceAll.percent 				= scoreInfo.audienceAll.score.toString();
					this.tomatoData.audienceAll.state 					= scoreInfo.audienceAll.state;
					this.tomatoData.audienceAll.rating 					= scoreInfo.audienceAll.averageRating;
					this.tomatoData.audienceAll.num_ratings 			= scoreInfo.audienceAll.ratingCount.toString();
					this.tomatoData.audienceAll.likedCount 				= scoreInfo.audienceAll.likedCount.toString();
					this.tomatoData.audienceAll.notLikedCount 			= scoreInfo.audienceAll.notLikedCount.toString();
					// Sometimes, the audience ratings are odd, so lets just combine the liked/notliked as that seems more accurate
					this.tomatoData.audienceAll.num_ratings = (scoreInfo.audienceAll.likedCount + scoreInfo.audienceAll.notLikedCount).toString();
					
					// Audience Verified - shouldn't ever be a thing for TV, but what the heck
					if (scoreInfo.audienceVerified != null){
						this.tomatoData.audienceVerified.percent 		= scoreInfo.audienceVerified.score.toString();
						this.tomatoData.audienceVerified.state 			= scoreInfo.audienceVerified.state;
						this.tomatoData.audienceVerified.rating 		= scoreInfo.audienceVerified.averageRating;
						this.tomatoData.audienceVerified.num_ratings 	= scoreInfo.audienceVerified.ratingCount.toString();
						this.tomatoData.audienceVerified.likedCount 	= scoreInfo.audienceVerified.likedCount.toString();
						this.tomatoData.audienceVerified.notLikedCount 	= scoreInfo.audienceVerified.notLikedCount.toString();
						
						// Sometimes, the audience ratings are odd, so lets just combine the liked/notliked as that seems more accurate
						this.tomatoData.audienceVerified.num_ratings = (scoreInfo.audienceVerified.likedCount + scoreInfo.audienceVerified.notLikedCount).toString();
					}
				}

				// Return if no scores what so ever
				if (this.tomatoData.audienceAll.percent == "" && this.tomatoData.criticAll.percent == "") return;

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
					class: 'all-link more-link rt-show-details',
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
				if (this.tomatoData.criticAll.percent == ""){
					allButton.className += " disabled";
				}
				allButton.innerText = "ALL";
				buttonDiv.append(allButton);
				// Top button
				const topButton = letterboxd.helpers.createElement('span', {
					class: 'rt-button critic-top',
					['target']: 'score-critic-top'
				});
				if (this.tomatoData.criticAll.percent == ""){
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
				if (this.tomatoData.audienceAll.percent == ""){
					allButton2.className += " disabled";
				}
				allButton2.innerText = "ALL";
				buttonDiv2.append(allButton2);
				// Verified button
				const verifiedButton2 = letterboxd.helpers.createElement('span', {
					class: 'rt-button audience-verified',
					['target']: 'score-audience-verified'
				});
				if (this.tomatoData.audienceVerified.percent == ""){
					verifiedButton2.className += " disabled";
				}
				verifiedButton2.innerText = "VERIFIED";
				buttonDiv2.append(verifiedButton2);

				// Add scores
				audienceSpan.append(letterboxd.helpers.createTomatoScore("audience-all","Audience",this.wikiData.tomatoURL,this.tomatoData.audienceAll,"block"));
				audienceSpan.append(letterboxd.helpers.createTomatoScore("audience-verified","Verified Audience",this.wikiData.tomatoURL,this.tomatoData.audienceVerified,"none"));


				// APPEND
				//************************************************************
				if (document.querySelector('.meta-ratings')){
					document.querySelector('.meta-ratings').before(section);
				}else if (document.querySelector('.cinemascore')){
					document.querySelector('.cinemascore').before(section);
				}else if(document.querySelector('.imdb-ratings')){
					document.querySelector('.imdb-ratings').after(section);
				}else{
					document.querySelector('.sidebar').append(section);
				}
				
				// Add click event for score buttons
				//************************************************************
				$(".rt-button:not(.disabled)").on('click', changeTomatoScore);
				
				//Add click for Show details button
				//************************************************************
				$(".rt-show-details").on('click', toggleDetails);
				
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
				if (this.metaData != null){
					var criticScore = "";
					var userScore = "";
					if (this.metaData.querySelector('.metascore_w.larger.movie')){
						criticScore = this.metaData.querySelector('.metascore_w.larger.movie').innerHTML;
						userScore = this.metaData.querySelector('.metascore_w.user.larger.movie').innerHTML;
					}else if(this.metaData.querySelector('.metascore_w.larger.tvshow')){
						criticScore = this.metaData.querySelector('.metascore_w.larger.tvshow').innerHTML;
						userScore = this.metaData.querySelector('.metascore_w.user.larger.tvshow').innerHTML;
					}
	
					var counts = this.metaData.querySelectorAll('.based_on');
					if (counts.length > 0){
						var criticCount = counts[0].innerText;
						criticCount = criticCount.replace("based","Based");
					}else{
						var criticCount = "";
					}
					if (counts.length > 1){
						var userCount = counts[1].innerHTML;
						userCount = userCount.replace("based","Based");
						userCount = userCount.replace("Ratings","User Ratings");
					}else{
						var userCount = "";
					}
				}else{
					var criticScore = this.omdbData.Metascore;
				}

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


				if (this.metaData != null){
					var elementClass = "logo-meta-link";
				}else{
					var elementClass = "logo-meta";
				}

				const logoHolder = letterboxd.helpers.createElement('a', {
					class: elementClass,
					style: 'width: 100%;',
					href: this.wikiData.metaURL
				});
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
				
				// Critic score
				//***************************************************************
				// The span that holds the score
				const spanCritic = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block;'
				});
				section.append(spanCritic);
				
				var colour = letterboxd.helpers.determineMetaColour(criticScore, false);
				// The element that is the score itself
				const criticText = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight meta-score',
					href: this.wikiData.metaURL + "/critic-reviews",
					style: 'background-color: ' + colour + ';',
					['data-original-title']: criticCount
				});
				if (criticCount != ""){
					criticText.setAttribute('data-original-title',criticCount)
				}

				criticText.innerText = criticScore;
				spanCritic.append(criticText);
				
				
				// User score
				//***************************************************************
				if (this.metaData != null){
					// The span that holds the score
					const spanUser = letterboxd.helpers.createElement('span', {
						style: 'display: inline-block;'
					});
					section.append(spanUser);
					
					var colour = letterboxd.helpers.determineMetaColour(userScore, true);
					// The element that is the score itself
					const userText = letterboxd.helpers.createElement('a', {
						class: 'tooltip display-rating -highlight meta-score-user',
						href: this.wikiData.metaURL + "/user-reviews",
						style: 'background-color: ' + colour + ';'
					});
					if (userCount != ""){
						userText.setAttribute('data-original-title',userCount)
					}

					userText.innerText = userScore;
					spanUser.append(userText);
				}

				// APPEND
				//************************************************************
				if (document.querySelector('.cinemascore')){
					document.querySelector('.cinemascore').before(section);
				}else if (document.querySelector('.tomato-ratings')){
					document.querySelector('.tomato-ratings').after(section);
				}else if(document.querySelector('.imdb-ratings')){
					document.querySelector('.imdb-ratings').after(section);
				}else{
					document.querySelector('.sidebar').append(section);
				}

				// Add Hover events
				//************************************************************
				if (criticCount != ""){
					$(".tooltip.display-rating.-highlight.meta-score").on("mouseover", ShowTwipsy);
					$(".tooltip.display-rating.-highlight.meta-score").on("mouseout", HideTwipsy);
				}
				if (userCount != ""){
					$(".tooltip.display-rating.-highlight.meta-score-user").on("mouseover", ShowTwipsy);
					$(".tooltip.display-rating.-highlight.meta-score-user").on("mouseout", HideTwipsy);
				}

				this.metaAdded = true;

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

			addDate(){
				const year = document.querySelector('.number');

				if (year != null){
					year.setAttribute("data-original-title", this.filmDate);
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
				const summary = this.mojoData.querySelector('.a-section.a-spacing-none.mojo-performance-summary-table');
				const money = summary.querySelectorAll('.money');


				// Box office
				var boxOffice = "";
				if (money.length > 0)
					var boxOffice = money[money.length-1].innerHTML;

				// This is for formatting the date
				var options = { year: 'numeric', month: 'short', day: 'numeric' };
				// Budget
				const summaryTable = this.mojoData.querySelector('.a-section.a-spacing-none.mojo-summary-values.mojo-hidden-from-mobile');

				var budget = "";
				for (var ii = 0; ii < summaryTable.childNodes.length; ii++){
					var node = summaryTable.childNodes[ii];
					var header = node.childNodes[0].innerText;
					var data = node.childNodes[1].innerText;
					
					if (header == "Budget"){
						budget = data;
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
					var a_Section = this.mojoData.querySelector('.a-section.mojo-h-scroll');
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

				// Use WikiData if available
				if (boxOffice == "" && this.wikiData.boxOffice != null)
					boxOffice = this.wikiData.boxOffice;
					
				if (budget == "" && this.wikiData.budget != null)
					budget = this.wikiData.budget;

				// Fix the values if necessary
				if (!boxOffice.startsWith("$") && boxOffice != ""){
					boxOffice = Number(boxOffice).toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })
					boxOffice = boxOffice.replace("US","");
				}
				if (!budget.startsWith("$") && budget != ""){
					budget = Number(budget).toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })
					budget = budget.replace("US","");
				}

				//*****************************************************
				// Get the details tab
				const tabDetails = document.querySelector('#tab-details');

				// Add the budget
				//*****************************************************
				if (budget != "" && !document.querySelector('.budget')){
					// Create the row header element				
					const header = letterboxd.helpers.createElement('h3', {});

					if(tabDetails.querySelector('.box-office-header')){
						tabDetails.querySelector('.box-office-header').before(header);
					}else{
						tabDetails.append(header);
					}
				
					const span = letterboxd.helpers.createElement('span', {});
					span.innerHTML = "Budget";
					header.append(span);
					
					// Create the list element
					const sluglist = letterboxd.helpers.createElement('div', {
						class: 'text-indentedlist budget'
					});
					header.after(sluglist);
	
					// Text holder
					const p = letterboxd.helpers.createElement('p', {});
					p.innerText = budget;
					sluglist.append(p);	
				}

				// Add the Box Office
				//*****************************************************
				if (boxOffice != "" && !document.querySelector('.box-office')){
					// Create the row header element				
					const header = letterboxd.helpers.createElement('h3', {
						class: 'box-office-header'
					});
					tabDetails.append(header);
				
					const span = letterboxd.helpers.createElement('span', {});
					span.innerText = "Box Office";
					header.append(span);
					
					// Create the list element
					const sluglist = letterboxd.helpers.createElement('div', {
						class: 'text-indentedlist box-office'
					});
					tabDetails.append(sluglist);
	
					// Text holder
					const p = letterboxd.helpers.createElement('p', {});
					p.innerText = boxOffice;
					sluglist.append(p);
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

			addCinema(){
				if (document.querySelector('.cinemascore')) return;

				const year = document.querySelector('.number').childNodes[0].innerHTML;

				var years = [year,"",""];

				if (this.omdbData != null){
					years[1] = (new Date(this.omdbData.Released)).getFullYear().toString();
				}
				if (this.filmDate != null){
					years[2] = (new Date(this.filmDate)).getFullYear().toString();
				}

				var grade = "";
				// Get the correct score
				for (var ii = 0; ii < this.cinemascore.length; ii++){
					if (this.cinemascore[ii].YEAR != null && years.includes(this.cinemascore[ii].YEAR)){
						grade = this.cinemascore[ii].GRADE;
						break;
					}
				}

				if (grade != ""){
					// Add the section to the page
					const section = letterboxd.helpers.createElement('section', {
						class: 'section ratings-histogram-chart cinemascore'
					});				

					// Add the Header
					const heading = letterboxd.helpers.createElement('h2', {
						class: 'section-heading',
						style: 'height: 20px;'
					});
					section.append(heading);
					const title = letterboxd.helpers.createElement('a', {
						href: 'https://www.cinemascore.com/'
					});
					title.innerText = "CinemaScore"
					heading.append(title);

					
					// The span that holds the score
					const span = letterboxd.helpers.createElement('span', {
						style: 'display: inline-block;'
					});
					section.append(span);

					// The element that is the score itself
					const scoreText = letterboxd.helpers.createElement('a', {
						class: 'tooltip display-rating -highlight cinema-grade',
					});
					scoreText.innerText = grade;
					span.append(scoreText);
					

					// APPEND
					//************************************************************
					document.querySelector('.sidebar').append(section);
				}
			},

			async getRYM(url){
				this.rymData.raw = await letterboxd.helpers.getIMDBData(url);
				this.rymData.data = letterboxd.helpers.parseHTML(this.rymData.raw);
				// do a check here to make sure we have the right movie (ie, check director)
				// for now, just return
				this.rymData.url = url;
				// if incorrect, we'll set the url blank
				//this.rymData.url = "";
			},

			addRYM(){
				if (document.querySelector('.rateyourmusic')) return;

				// First, lets grab all the data on the page
				//***************************************************************
				this.rymData.rating = letterboxd.helpers.cleanupInnerText(this.rymData.data.querySelector('.avg_rating').innerText);
				this.rymData.num_rating = letterboxd.helpers.cleanupInnerText(this.rymData.data.querySelector('.num_ratings span').innerText);

				// Get the rating breakdown for the graph
				var rows = JSON.parse(letterboxd.helpers.getTextBetween(this.rymData.raw,"data.addRows(",");"));
				this.rymData.graph = Array(rows.length);
				for(var i = 0; i < rows.length; i++){
					var value = rows[i][1];
					this.rymData.graph[i] = value;

					if (this.rymData.highest < parseInt(value)){
						this.rymData.highest = parseInt(value);
					}
				}

				// Now lets add to the page
				//***************************************************************
				// Add the section to the page
				const section = letterboxd.helpers.createElement('section', {
					class: 'section ratings-histogram-chart rateyourmusic'
				});				

				// Add the Header // browser.runtime.getURL("beasts/frog.jpg")
				const heading = letterboxd.helpers.createElement('h2', {
					class: 'section-heading',
					style: 'height: 20px;'
				});
				section.append(heading);
				
				const logoHolder = letterboxd.helpers.createElement('a', {
					class: 'logo-rym header',
					style: 'width: 100%;',
					href: this.rymData.url
				});
				heading.append(logoHolder);

				const rymLogo  = letterboxd.helpers.createElement('span', {
					class: 'logo-rym icon-rym',
					style: 'height: 20px; width: 20px; background-image: url(" ' + browser.runtime.getURL("images/rym.png") + '");'
				});
				logoHolder.append(rymLogo);
				
				const rymText  = letterboxd.helpers.createElement('span', {
					class: 'logo-rym text-rym'
				});
				rymText.innerText = "RYM"
				logoHolder.append(rymText);
				

				// The span that holds the score
				const scoreSpan = letterboxd.helpers.createElement('span', {
					['itemprop']: 'aggregateRating',
					['itemscope']: '',
					['itemtype']: 'http://schema.org/AggregateRating',
					class: 'average-rating',
					style: 'left: 188px; position:absolute;'
				});
				section.append(scoreSpan);
				
				// The element that is the score itself
				const rating = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight rateyourmusic tooltip-extra-unadded',
					href: this.rymData.url,
					['data-original-title']: 'Weighted average of ' + this.rymData.rating + ' based on ' + this.rymData.num_rating + ' ratings'
				});
				rating.innerText = Math.round(parseFloat(this.rymData.rating) * 10) / 10;
				scoreSpan.append(rating);


				// Add the bars for the rating
				const histogram = letterboxd.helpers.createElement('div', {
					class: 'rating-histogram clear rating-histogram-exploded'
				});
				section.append(histogram);
				const ul = letterboxd.helpers.createElement('ul', {
				});
				histogram.append(ul);

				var ratingFloat = parseFloat(this.rymData.num_rating.replace(",","").replace(".",""));
				for (var ii = 0; ii < 10; ii++){	
					var left = (ii * 16).toString() + "px;";
					const il = letterboxd.helpers.createElement('li', {
						class: 'rating-histogram-bar',
						style: "width: 15px; left: " + left
					});
					ul.append(il);

					var value = parseFloat(this.rymData.graph[ii]);
					const a = letterboxd.helpers.createElement('a', {
						class: 'ir tooltip tooltip-extra-unadded',
						['data-original-title']: this.rymData.graph[ii].toLocaleString() + " " + this.starRatings[ii] + ' ratings (' + Math.round(value / ratingFloat * 100) + '%)'
					});
					il.append(a);

					var max = 44.0;
					var min = 1;
					var percent = this.rymData.graph[ii] / this.rymData.highest;
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
					class: 'rating rated-2 rating-star-extra rating-star-rym'
				});
				span1StarInner.innerText = "★";
				span1Star.append(span1StarInner);

				const span5Star = letterboxd.helpers.createElement('span', {
					class: 'rating-green rating-green-tiny rating-5'
				});
				const span5StarInner = letterboxd.helpers.createElement('span', {
					class: 'rating rated-10 rating-star-extra rating-star-rym'
				});
				span5StarInner.innerText = "★★★★★";
				span5Star.append(span5StarInner);

				ul.before(span1Star);
				ul.after(span5Star);
				

				// Append to the sidebar
				//*****************************************************************
				if(document.querySelector('.imdb-score')){
					document.querySelector('.imdb-score').after(section);
				}else if (document.querySelector('.cinemascore')){
					document.querySelector('.cinemascore').before(section);
				}else{
					document.querySelector('.sidebar').append(section);
				}
			},

			verifyRYM(){
				if (this.rymData.data != null && !this.rymData.raw.includes("ERROR 404")){
					var rymDirectors = this.rymData.data.querySelectorAll(".film_info .film_artist");
					var directors = document.querySelector("#tab-crew div").querySelectorAll(".text-slug");
					var out = false;

					rymDirectors.forEach(director => {
						if (director.innerText == directors[0].innerText){
							this.rymData.error = false;
							out = true;
						}
					});
					return out;
				}else{
					this.rymData.error = true;
				}
				return false;
			}
		},

		helpers: {
			async getIMDBData(link) {
				console.log("calling " + link);
				try {
					const res = await letterboxd.helpers.request({
						url: link,
						method: 'GET'
					});
					return res.response;
				} catch (err) {
					console.error(err);
				}
				return null;
			},

			async getData(link) {
				console.log("calling " + link);
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

			request(options) {
				return new Promise((resolve, reject) => {
					options.onload = res => resolve(res);
					options.onerror = err => reject(err);
					options.ontimeout = err => reject(err);
					GM_xmlhttpRequest(options); // eslint-disable-line new-cap
				});
			},

			async getOMDbData(link) {  
				console.log("calling " + link);
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
				var hover = 'Average of ' + data.rating + '/' + scoreTotal + ' based on ' + parseInt(data.num_ratings).toLocaleString() + ' ' + display + ' ratings';
				if (data.percent == "--")
					hover = data.num_ratings + "" + display + " Reviews";
				else
					data.percent += "%";

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

			encodeASCII(text){
				return btoa(text);
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
				if (metascore != "tbd"){
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
						break;
				}
				return output;
			},

			cleanupInnerText(value){
				var out = value.replaceAll("\n","");
				out = out.trim();
				return out;
			}
		}
	};

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


function toggleDetails(event){
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
	}else{
		event.target.innerText = "SHOW DETAILS";
	}
}