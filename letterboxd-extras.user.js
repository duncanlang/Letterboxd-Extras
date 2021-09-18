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
		.meta-score, .meta-score:hover, .cinema-grade, .cinema-grade:hover {
			color: white;
			display:block;
			font-family: Arial,Helvetica,sans-serif;
			font-size:20px;
			font-weight: bold !important;
			width:30px;
			height:30px;
			line-height:30px;
			margin-left:1px;
			margin-top:5px;
			text-align:center;
			border-radius: 3px;
		}
		.cinema-grade, .cinema-grade:hover{
			background: rgb(143,118,60);
			background: linear-gradient(24deg, rgba(143,118,60,1) 0%, rgba(234,189,45,1) 100%); 
			font-family: Times-New-Roman;
			border-radius: 0px;
		}
		.icon-tomato, .icon-popcorn, .icon-meta, .text-meta, .logo-tomatoes {
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
		.logo-tomatoes:hover, .logo-imdb:hover{
			opacity: 50%;
		}
	`);
	/* eslint-enable */

	const letterboxd = {

		overview: {

			lastLocation: window.location.pathname,

			running: false,

			imdbID: "",
			imdbInfo: ['','',''],
			imdbVotes: [0,0,0,0,0,0,0,0,0,0],
			imdbPercents: [0,0,0,0,0,0,0,0,0,0],
			imdbHighest: 0,
			imdbData: null,

			omdbData: null,

			tomatoData: null,

			mojoData: null,

			cinemascore: null,

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

				// First Get the IMDb link
				this.getIMDbLink();

				// ADD IMDb Score
				if (this.imdbInfo[0] != ""){
					if (this.imdbData == null)
						this.imdbData = letterboxd.helpers.parseHTML(await letterboxd.helpers.getIMDBData(this.imdbInfo[0]));
					
					if (this.imdbData != null){

						// Add the everything to the page
						this.addIMDBScore();
					}

					// Get BoxOfficeMojo data
					if (this.mojoData == null){
						this.mojoData = letterboxd.helpers.parseHTML(await letterboxd.helpers.getIMDBData('https://www.boxofficemojo.com/title/' + this.imdbID)); 
						this.addBoxOffice();
					}	
				}

				// Call OMDb
				if (this.imdbID != ""){
					var queryString = "https://www.omdbapi.com/?apikey=afd82b43&i=" + this.imdbID + "&plot=short&r=json&tomatoes=true";
					if (this.omdbData == null){
						this.omdbData = await letterboxd.helpers.getOMDbData(queryString);
					}				
	
					// Check if OMDb response is valid
					if (this.omdbData != null && this.omdbData.Response == "True"){
						// Add links
						this.addLinks();	

						// Add full release date
						if (this.omdbData.Released != null && this.omdbData.Released != "N/A")
							this.addDate();
	
						// Add Rating
						if (this.omdbData.Rated != null && this.omdbData.Rated != "N/A")
							this.addRating();	


						// Add Metacritic
						if (this.omdbData.Metascore != null && this.omdbData.Metascore != "N/A"){
							this.addMeta();
						}

						// Get Rotten Tomatoes data
						if (this.omdbData.tomatoURL != null && this.omdbData.tomatoURL != "" && this.omdbData.tomatoURL != "N/A"){
							this.omdbData.tomatoURL = letterboxd.helpers.fixURL(this.omdbData.tomatoURL);

							if (this.tomatoData == null){
								try{
									var tomato = await letterboxd.helpers.getOMDbData(this.omdbData.tomatoURL);
	
									if (tomato != "")
										this.tomatoData = letterboxd.helpers.parseHTML(tomato);
								}catch{

								}
							}
	
							// Rotten Tomatoes
							if (this.tomatoData != null){
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

						this.imdbInfo[0] = imdbLink;
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
				if (this.imdbData.querySelector('.sectionHeading').innerHTML.includes('No Ratings Available')) return


				// Get the score
				this.imdbInfo[1] = this.imdbData.querySelector('.ipl-rating-star__rating').innerHTML;
				
				// Get the number of ratings
				var tempArray = this.imdbData.querySelectorAll('.allText');
				for (var ii = 0; ii < tempArray.length; ii++){
					if (tempArray[ii].innerHTML.includes('IMDb users have given a')){
						this.imdbInfo[2] = letterboxd.helpers.getTextBetween(tempArray[ii].innerText,'\n                ','\nIMDb users');
						break;
					}
				}

				// Get the votes
				var tables = this.imdbData.querySelectorAll('table')
				var tableRows = tables[0].rows;

				var k = 0
				for (var ii = 1; ii < tableRows.length; ii++){
					var votes = tableRows[ii].cells[2].children[0].children[0].innerText;
					votes = parseInt(votes.replaceAll(',',''));

					if (votes > 0){
						var percent = letterboxd.helpers.getTextBetween(tableRows[ii].cells[1].children[1].children[0].innerHTML,'&nbsp;\n','\n');
						percent = parseFloat(percent)
					}else{
						percent = parseFloat(0);
					}

					this.imdbPercents[k] = percent;
					this.imdbVotes[k] = votes;

					if (votes > this.imdbHighest)
						this.imdbHighest = votes;

					k++;
				}

				this.imdbPercents = this.imdbPercents.reverse();
				this.imdbVotes = this.imdbVotes.reverse();

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
					href: this.imdbInfo[0],
					style: "position: absolute;"
				});
				imdbLogoHolder.innerHTML = '<svg id="home_img" class="ipc-logo" xmlns="http://www.w3.org/2000/svg" width="32" height="16" viewBox="0 0 64 32" version="1.1"><g fill="#F5C518"><rect x="0" y="0" width="100%" height="100%" rx="4"></rect></g><g transform="translate(8.000000, 7.000000)" fill="#000000" fill-rule="nonzero"><polygon points="0 18 5 18 5 0 0 0"></polygon><path d="M15.6725178,0 L14.5534833,8.40846934 L13.8582008,3.83502426 C13.65661,2.37009263 13.4632474,1.09175121 13.278113,0 L7,0 L7,18 L11.2416347,18 L11.2580911,6.11380679 L13.0436094,18 L16.0633571,18 L17.7583653,5.8517865 L17.7707076,18 L22,18 L22,0 L15.6725178,0 Z"></path><path d="M24,18 L24,0 L31.8045586,0 C33.5693522,0 35,1.41994415 35,3.17660424 L35,14.8233958 C35,16.5777858 33.5716617,18 31.8045586,18 L24,18 Z M29.8322479,3.2395236 C29.6339219,3.13233348 29.2545158,3.08072342 28.7026524,3.08072342 L28.7026524,14.8914865 C29.4312846,14.8914865 29.8796736,14.7604764 30.0478195,14.4865461 C30.2159654,14.2165858 30.3021941,13.486105 30.3021941,12.2871637 L30.3021941,5.3078959 C30.3021941,4.49404499 30.272014,3.97397442 30.2159654,3.74371416 C30.1599168,3.5134539 30.0348852,3.34671372 29.8322479,3.2395236 Z"></path><path d="M44.4299079,4.50685823 L44.749518,4.50685823 C46.5447098,4.50685823 48,5.91267586 48,7.64486762 L48,14.8619906 C48,16.5950653 46.5451816,18 44.749518,18 L44.4299079,18 C43.3314617,18 42.3602746,17.4736618 41.7718697,16.6682739 L41.4838962,17.7687785 L37,17.7687785 L37,0 L41.7843263,0 L41.7843263,5.78053556 C42.4024982,5.01015739 43.3551514,4.50685823 44.4299079,4.50685823 Z M43.4055679,13.2842155 L43.4055679,9.01907814 C43.4055679,8.31433946 43.3603268,7.85185468 43.2660746,7.63896485 C43.1718224,7.42607505 42.7955881,7.2893916 42.5316822,7.2893916 C42.267776,7.2893916 41.8607934,7.40047379 41.7816216,7.58767002 L41.7816216,9.01907814 L41.7816216,13.4207851 L41.7816216,14.8074788 C41.8721037,15.0130276 42.2602358,15.1274059 42.5316822,15.1274059 C42.8031285,15.1274059 43.1982131,15.0166981 43.281155,14.8074788 C43.3640968,14.5982595 43.4055679,14.0880581 43.4055679,13.2842155 Z"></path></g></svg>'
				imdbHeading.append(imdbLogoHolder);

				/*
				const imdbTitle = letterboxd.helpers.createElement('a', {
					class: '',
					href: this.imdbInfo[0],
					title: "",
					style: "position: absolute; left: 40px;"
				});
				imdbTitle.innerHTML = "Ratings"
				imdbHeading.append(imdbTitle);
				*/


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
					class: 'tooltip display-rating -highlight imdb-score',
					href: this.imdbInfo[0],
					['data-original-title']: 'Weighted average of ' + this.imdbInfo[1] + ' based on ' + this.imdbInfo[2] + ' ratings'
				});

				imdbScore.innerText = this.imdbInfo[1];
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
						class: 'ir tooltip imdb',
						['data-original-title']: this.imdbVotes[ii].toLocaleString() + " " + (ii + 1).toString() + '/10 ratings (' + this.imdbPercents[ii].toString() + '%)'
					});
					il.append(a);

					var max = 44.0;
					var min = 1; //1.2277427490542245;
					var percent = this.imdbVotes[ii] / this.imdbHighest;
					var height = (max * percent);

					if (height < min)
						height = min;

					height = height.toString() + "px;";

					const i = letterboxd.helpers.createElement('i', {
						style: 'height: ' + height
					});
					a.append(i);
				}

				// Append to the sidebar
				//*****************************************************************
				if (document.querySelector('.cinemascore')){
					document.querySelector('.cinemascore').before(imdbScoreSection);
				}else{
					document.querySelector('.sidebar').append(imdbScoreSection);
				}

				
				// Add the hover events
				//*****************************************************************
				$(".tooltip.display-rating.-highlight.imdb-score").on("mouseover", ShowTwipsy);
				$(".tooltip.display-rating.-highlight.imdb-score").on("mouseout", HideTwipsy);
				
				$(".ir.tooltip.imdb").on("mouseover", ShowTwipsy);
				$(".ir.tooltip.imdb").on("mouseout", HideTwipsy);
			},

			addTomato(){				
				if (document.querySelector('.tomato-ratings')) return;

				if (!document.querySelector('.sidebar')) return;


				// Lets grab all the potentially useful information first
				//***************************************************************
				var scoreboard = this.tomatoData.querySelector(".scoreboard");
				// Percentages
				var criticPercent = scoreboard.getAttribute("tomatometerscore");
				var audiencePercent = scoreboard.getAttribute("audiencescore");
				// States
				var criticState = scoreboard.getAttribute("tomatometerstate");
				var audienceState = scoreboard.getAttribute("audiencestate");

				// Details Score board
				var scoredetails = JSON.parse(this.tomatoData.querySelector('#score-details-json').innerHTML);
				// Ratings
				var criticRating = scoredetails.modal.tomatometerScoreAll.averageRating;
				var audienceRating = scoredetails.modal.audienceScoreAll.averageRating;
				// Num of reviews
				var criticReviews = scoredetails.modal.tomatometerScoreAll.reviewCount.toLocaleString();
				var audienceReviews = scoredetails.modal.audienceScoreAll.ratingCount.toLocaleString();

				if (criticPercent == null || criticPercent == "")
					criticPercent = "--";
				else
					criticPercent += "%";
					
				if (audiencePercent == null || audiencePercent == "")
					audiencePercent = "--";
				else
					audiencePercent += "%";

				// No scores
				if (criticPercent == '--' && audiencePercent == '--') return


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
					href: this.omdbData.tomatoURL,
					style: 'height: 20px; width: 75px; background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/rtlogo.9b892cff3fd.png");'
				});
				heading.append(logo);
				/*
				const title = letterboxd.helpers.createElement('a', {
					class: '',
					href: this.omdbData.tomatoURL,
					title: ""
				});
				title.innerHTML = "Rotten Tomatoes"
				heading.append(title);
				*/

				// CRITIC SCORE /  TOMATOMETER
				//************************************************************
				// The span that holds the score
				const criticSpan = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block; padding-right: 10px;'
				});
				section.append(criticSpan);

				// Load the image from rotten tomatoes
				var image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-empty.cd930dab34a.svg';
				if (criticState == "certified-fresh"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/certified_fresh.75211285dbb.svg';
				}else if (criticState == "fresh"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-fresh.149b5e8adc3.svg';
				}else if (criticState == "rotten"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-rotten.f1ef4f02ce3.svg';
				}				
				const criticImage = letterboxd.helpers.createElement('span', {
					class: 'icon-tomato',
					style: 'background-image: url("' + image + '");'
				});
				criticSpan.append(criticImage);
				
				// The element that is the score itself
				var hover = 'Average of ' + criticRating + '/10 based on ' + criticReviews + ' ratings';
				if (criticPercent == "--")
					hover = "0 Critic Reviews";

				const criticScore = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight tomato-score',
					href: this.omdbData.tomatoURL,
					style: 'display: inline;',
					['data-original-title']: hover
				});

				criticScore.innerText = criticPercent;
				criticSpan.append(criticScore);

				
				// AUDIENCE SCORE
				//************************************************************
				// The span that holds the score
				const audienceSpan = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block;'
				});
				section.append(audienceSpan);

				// Load the image from rottent tomators
				if (audienceState == "upright"){
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/audience/aud_score-fresh.6c24d79faaf.svg';
				}else{ // Spilled
					image = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/audience/aud_score-rotten.f419e4046b7.svg';
				}				
				const audienceImage = letterboxd.helpers.createElement('span', {
					class: 'icon-popcorn',
					style: 'background-image: url("' + image + '");'
				});
				audienceSpan.append(audienceImage);
				
				// The element that is the score itself
				var hover = 'Average of ' + audienceRating + '/5 based on ' + audienceReviews + ' ratings';
				if (audiencePercent == "--")
					hover = "0 Critic Reviews";

				const audienceScore = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight tomato-score',
					href: this.omdbData.tomatoURL,
					style: 'display: inline',
					['data-original-title']: hover
				});

				audienceScore.innerText = audiencePercent;
				audienceSpan.append(audienceScore);
				

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
				
				// Add the Events for the hover
				//************************************************************
				$(".tooltip.display-rating.-highlight.tomato-score").on("mouseover", ShowTwipsy);
				$(".tooltip.display-rating.-highlight.tomato-score").on("mouseout", HideTwipsy);
			},

			addMeta(){				
				if (document.querySelector('.meta-ratings')) return;

				if (!document.querySelector('.sidebar')) return;

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

				const metaLogo  = letterboxd.helpers.createElement('span', {
					class: 'icon-meta',
					style: 'height: 20px; width: 20px; background-image: url("https://www.metacritic.com/images/icons/metacritic-icon.svg");'
				});
				heading.append(metaLogo);
				
				const metaText  = letterboxd.helpers.createElement('span', {
					class: 'text-meta',
					style: 'height: 20px; width: 100px; background-image: url("https://www.metacritic.com/images/icons/metacritic-wordmark.svg");'
				});
				heading.append(metaText);
				
				// The span that holds the score
				const span = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block;'
				});
				section.append(span);
				
				var colour = "#6c3";
				var score = parseInt(this.omdbData.Metascore);
				if (score < 40) // Red
					colour = "#f00";
				else if (score <= 61) // Yellow
					colour = "#fc3";

				// The element that is the score itself
				const scoreText = letterboxd.helpers.createElement('a', {
					class: 'tooltip display-rating -highlight meta-score',
					//href: this.omdbData.tomatoURL,
					style: 'background-color: ' + colour + ';'//,
					//['data-original-title']: 'Average of ' + audienceRating + '/5 based on ' + audienceReviews + ' ratings'
				});

				scoreText.innerText = this.omdbData.Metascore;
				span.append(scoreText);
				

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

			},
			
			addLinks(){
				if (!document.querySelector('.text-link.text-footer')) return;

				// Add Rotten Tomatos
				if (this.omdbData.tomatoURL != "N/A"){
					if (!document.querySelector('.tomato-button') && this.omdbData != null && this.omdbData.tomatoURL != ""){
						var button = letterboxd.helpers.createElement('a', {
							class: 'micro-button track-event tomato-button',
							href: this.omdbData.tomatoURL,
							style: "margin-right: 4px;"
						});
						button.innerText = "RT";
						document.querySelector('.report-link.has-icon.icon-report.tooltip.tooltip-close-on-click.cboxElement').before(button);
					}
				}
				// Add Mojo
				if (!document.querySelector('.mojo-button') && this.imdbID != ""){
					var button = letterboxd.helpers.createElement('a', {
						class: 'micro-button track-event mojo-button',
						href: 'https://www.boxofficemojo.com/title/' + this.imdbID
					});
					button.innerText = "Mojo";
					document.querySelector('.report-link.has-icon.icon-report.tooltip.tooltip-close-on-click.cboxElement').before(button);
				}
			},

			addDate(){
				const year = document.querySelector('.number');

				if (year != null && !year.getAttribute('data-original-title')){
					year.setAttribute("data-original-title", this.omdbData.Released);
					
					$(".number").on("mouseover", ShowTwipsy);
					$(".number").on("mouseout", HideTwipsy);
				}
			},

			addBoxOffice(){
				if (document.querySelector('.box-office')) return;

				// First Grab the info
				//*****************************************************
				const summary = this.mojoData.querySelector('.a-section.a-spacing-none.mojo-performance-summary-table');
				const money = summary.querySelectorAll('.money');


				// Box office
				var boxOffice = "";
				if (money.length > 0)
					var boxOffice = money[money.length-1].innerHTML;


				// Budget
				const summaryTable = this.mojoData.querySelector('.a-section.a-spacing-none.mojo-summary-values.mojo-hidden-from-mobile');

				var budget = "";
				for (var ii = 0; ii < summaryTable.childNodes.length; ii++){
					if (summaryTable.childNodes[ii].innerHTML.includes("Budget")){
						budget = summaryTable.childNodes[ii].childNodes[1].childNodes[0].innerText;
						break;
					}
				}

				//*****************************************************
				// Get the details tab
				const tabDetails = document.querySelector('#tab-details');

				// Add the budget
				//*****************************************************
				if (budget != ""){
					// Create the row header element				
					const header = letterboxd.helpers.createElement('h3', {});
					tabDetails.append(header);
				
					const span = letterboxd.helpers.createElement('span', {});
					span.innerHTML = "Budget";
					header.append(span);
					
					// Create the list element
					const sluglist = letterboxd.helpers.createElement('div', {
						class: 'text-indentedlist box-office'
					});
					tabDetails.append(sluglist);
	
					// Text holder
					const p = letterboxd.helpers.createElement('p', {});
					p.innerText = budget;
					sluglist.append(p);	
				}

				// Add the Box Office
				//*****************************************************
				if (boxOffice != ""){
					// Create the row header element				
					const header = letterboxd.helpers.createElement('h3', {});
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
				p.innerText = this.omdbData.Rated;
				small.append(p);

			},

			addCinema(){
				if (document.querySelector('.cinemascore')) return;

				const year = document.querySelector('.number').childNodes[0].innerHTML;
				if (this.omdbData != null){
					var year2 = new Date(this.omdbData.Released);
					year2 = year2.getFullYear().toString();
				}else{
					var year2 = year;
				}

				var grade = "";
				// Get the correct score
				for (var ii = 0; ii < this.cinemascore.length; ii++){
					if (this.cinemascore[ii].YEAR != null && (this.cinemascore[ii].YEAR == year || this.cinemascore[ii].YEAR == year2)){
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
			}

		},

		helpers: {
			async getIMDBData(link) {

				try {
					const res = await letterboxd.helpers.request({
						url: link,
						method: 'GET'
					});
					return res.response;
				} catch (err) {
					console.error(err);
					return null;
				}
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
				var ajaxOptions = {
					url: link,
					type : 'GET'
				}

				return $.when($.ajax(ajaxOptions))
				.then(function (results) {
					return results;
				});

				/*
				var output = $.ajax({
						url: link,
						type: 'GET',
						success: function(e){
							return e;
						}
					}).then(function( results){
						return results;
					});

				return output;
				*/
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
			
			getTextBetween(text, start, end){
				var tempArray = text.split(start);
				tempArray = tempArray[1].split(end);

				return (tempArray[0]);
			},

			parseHTML(html){
				var parser = new DOMParser();
				return parser.parseFromString(html, "text/html");
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
	if (document.querySelector('.twipsy.fade.above.in')){
		var temp = document.querySelector('.twipsy.fade.above.in');
		temp.parentNode.removeChild(temp);
	}

	const twipsy = document.createElement('div');
	twipsy.className = 'twipsy fade above in';

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
}

function HideTwipsy(event){
	if (document.querySelector('.twipsy.fade.above.in')){
		var twipsy = document.querySelector('.twipsy.fade.above.in');
		twipsy.parentNode.removeChild(twipsy);
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
