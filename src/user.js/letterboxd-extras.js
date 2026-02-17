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

GM_addStyle(`
		.section-heading-extras{
			height: 13px !important;
		}
		.tomato-ratings .section-heading-extras,
		.meta-ratings .section-heading-extras{
			height: 20px !important; 
		}
		.sens-ratings .section-heading-extras{
			height: 15px !important;
		}
		.tomato-ratings .show-details,
		.meta-ratings .show-details,
		.sens-ratings .show-details{
			top: 10px !important;
		}
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
			display: inline-block;
			font-family: ProximaNova,sans-serif;
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
		.icon-tomato, .icon-popcorn, .icon-meta, .text-meta, .logo-tomatoes, .icon-rym, .meta-must-see, .logo-mal, .logo-anilist, .logo-sens, .logo-filmaff, .bfi-ranking a .icon, .logo-simkl, .logo-filmarks, .logo-kinopoisk, .logo-douban, .logo-mdl {
			background-position-x: left !important;
			background-position-y: top !important;
			background-repeat: no-repeat !important;
			background-attachment: scroll !important;
			background-size: contain !important;
			background-origin: padding-box !important;
			background-clip: border-box !important;
			width: 16px;
			height: 16px;
			display: inline-block;
			margin-right: 5px;
			opacity: 100%;
		}
		.logo-allocine{
			background-position: -396px -0px;
			background-repeat: no-repeat;
			display: inline-block;
			width: 120px;
			height: 34px;
			transform-origin: top left;
			transform: scale(.6);
		}
		.icon-tomato {
			background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-empty.cd930dab34a.svg");
		}
		.icon-popcorn {
			background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/icons/audience/aud_score-empty.eb667b7a1c7.svg");
		}

		.meta-must-see, .meta-must-watch{
			width: 30px;
			height: 30px;
			padding: 0px;
		}
		.meta-must-see{
			background-image: url("https://www.metacritic.com/a/neutron/images/logos/badge/must-see.png");
		}
		.meta-must-watch{
			background-image: url("https://www.metacritic.com/a/neutron/images/logos/badge/must-watch.png");
		}

		.ratings-extras{
			margin-top: 20px !important;
			padding-bottom: 0px !important;
		}
		
		.ratings-extras.extras-chart .section-heading-extras{
			margin-bottom: 15px !important;
		}

		.ratings-extras:not(.extras-chart) .section-heading-extras{
			margin-bottom: 0px !important; 
		}
		.rating-histogram-extras{
			margin-bottom: 10px !important;
		}

		.logo-tomatoes:hover, .logo-imdb:hover, .logo-meta-link:hover, .logo-rym.header:hover, .logo-mal:hover, .logo-sens:hover, .logo-mubi:hover, .logo-filmaff:hover, .logo-simkl:hover, .logo-allocine:hover, .logo-filmarks:hover, .logo-kinopoisk:hover, .logo-douban:hover{
			opacity: 50%;
		}
		.logo-meta-link{
			opacity: 100%;
		}
		.logo-mal{
			width: 100px;
		}
		.logo-mubi{
			width: 50px;
			height: 26px;
			display: block;
			margin-left: 2px;
		}
		.logo-kinopoisk{
			width: 80px;
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
		.rating-star-imdb{
			color: #2e51a2;
			filter: brightness(0) saturate(100%) invert(75%) sepia(25%) saturate(1440%) hue-rotate(359deg) brightness(106%) contrast(92%);
		}
		.rating-star-mal{
			color: #2e51a2;
			filter: brightness(0) saturate(100%) invert(30%) sepia(8%) saturate(7389%) hue-rotate(193deg) brightness(94%) contrast(95%);
		}
		.rating-star-anilist{
			color: #3db4f2;
			filter: brightness(0) saturate(100%) invert(67%) sepia(28%) saturate(3210%) hue-rotate(171deg) brightness(97%) contrast(95%);
		}
		.rating-star-allocine{
			color: #fecc00;
			filter: brightness(0) saturate(100%) invert(81%) sepia(51%) saturate(1681%) hue-rotate(357deg) brightness(98%) contrast(107%);;
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
			font-size: 10px;
			width: 48%;
			text-align: center;
			color: #9ab;
			border-radius: 3px;
			background-color: #283038;
			padding: 1px;
			padding-left: 3px;
			padding-right: 3px;
			-webkit-user-select: none; /* Safari */
			-ms-user-select: none; /* IE 10 and IE 11 */
			user-select: none; /* Standard syntax */
		}
		.rt-button.critic-all, .rt-button.audience-all, .rt-button.allo-user{
			border-top-right-radius: 0px;
			border-bottom-right-radius: 0px;
		}
		.rt-button.critic-top, .rt-button.audience-verified, .rt-button.allo-critic{
			border-top-left-radius: 0px;
			border-bottom-left-radius: 0px;
		}
		.rt-button.selected{
			color: #def;
			background-color: #456
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
		.rt-button.critic-toggle, .rt-button.audience-toggle{
			display: block;
			width: 50px;
			font-size: 11px;
			height: 17px;
			line-height: 18px;
			margin-top: 4px;
		}
		.allocine-buttons{
			display: block;
			margin-bottom: 5px;
		}
		.rt-button.allo-user, .rt-button.allo-critic{
			display: inline-block;
			width: 46%;
			margin-right: 0px;
		}
		.rt-button.allo-user.extras-mobile, .rt-button.allo-critic.extras-mobile{
			font-size: 11px;
			height: 17px;
			line-height: 18px;
			margin-top: 4px;
		}
		.allo-critic-stars{
			display: inline-block;
			width: 64px;
			height: 16px;
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
		.rt-bar.text-label{
			display: inline-block;
			font-size: 8px;
			width: 30px;
		}
		.rt-bar.text-count{
			display: inline-block;
			font-size: 9px;
			width: 25px;
			margin-left: 5px;
		}
		.rt-bar.text-label.extras-mobile{
			font-size: 9px;
		}
		.rt-bar.text-count.extras-mobile{
			font-size: 10px;
		}
		.show-details{
			font-size: 9px !important;
			-webkit-user-select: none; /* Safari */
			-ms-user-select: none; /* IE 10 and IE 11 */
			user-select: none; /* Standard syntax */
		}
		.show-details:hover{
			cursor: pointer;
		}
		.mobile-details-text{
			width: 100% !important;
			font-size: 10px;
		}

		.meta-score-details:not(.mobile-details-text){
			width: 180px;
			margin-left: 5px;
		}
		.meta-score-details:not(.mobile-details-text).short{
			width: 140px;
		}
		.meta-bar-label{
			font-size: 9px;
			display: inline-block;
			width: 40px;
		}
		.meta-bar-value{
			font-size: 10px;
			display: inline-block;
			width: 25px;
			margin-left: 5px;
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
			margin-bottom: 3px;
			height: 12px;
			line-height: 1;
			display: inline-block;
		}
		p.text-link .report-link{
			vertical-align: top !important;
		}
		.text-footer-extra{
			font-size: 12px;
			color: #89a;
		}
		.sens-score, .sens-score:hover{
			display: flex;
			flex-direction: row;
			border: 1px solid white;
			border-radius: 1px;
			color: white;
			font-size: 16px;
			font-weight: 600;
			font-family: "Sora", sans-serif;
			align-items: center;
			justify-content: center;
			height: 32px;
			width: 57px;
			margin-left: 1px;
			margin-top: 5px;
			text-decoration: none;
		}
		.sens-score.green, .sens-score.green:hover{
			border: 1px solid rgb(47, 196, 111);
			color: rgb(47, 196, 111);
		}
		.sens-score span{
			pointer-events: none;
		}
		.sens-score-icon{
			display: inline-block !important;
			width: 22px;
			height: 22px;
			scale: 0.8;
		}
		.sens-score-icon.green{
			filter: invert(72%) sepia(37%) saturate(821%) hue-rotate(89deg) brightness(83%) contrast(89%);
		}
		.sens-text{
			font-size: 14px;
			color: white;
			width: auto;
			display: inline-block;
			margin-left: 10px;
			margin-top: 10px;
			margin-bottom: 0px !important;
		}
		.sens-flex flex-container{
			display: flex;
			flex-direction: row;
		}
		.extras-service {
			display: flex;
			flex-direction: row;
			hidden: false !important;
		}
		.extras-table{
			width: 100%;
			margin-bottom: 10px;
			border: 1px solid hsla(0,0%,100%,.25);
			border-radius: 4px;
			padding-top: 3px;
			padding-left: 5px;
			padding-right: 5px;
			font-size: 95%;
			margin-top: 9px;
		}
		.extras-table .extras-header{
			font-weight: bold;
			width: 35%;
		}
		.extras-table .extras-value{
			width: 60%;
		}
		.extras-table .extras-header,
		.extras-table .extras-value{
			font-size: 12px !important;
		}
		.extras-table td{
			padding-bottom: 10px;
		}
		.mubi-score, .simkl-score, .kinopoisk-score, .douban-score {
			color: #FFF;
			font-size: 18px;
		}
		span.mubi-score{
			vertical-align: top;
			margin-left: 5px;
			margin-top: 1px;
		}
		.mubi-star{
			margin-left: 5px;
		}
		a.filmaff-score{
			display: flex;
			flex-direction: row;
			background: #4682B4;
			color: white;
			font-size: 16px;
			font-family: Arial, sans-serif;
			align-items: center;
			justify-content: center;
			height: 26px;
			width: 45px;
			margin-left: 1px;
			margin-top: 5px;
		}
		a.filmaff-score:hover{
			color: white;
			text-decoration: underline;
		}
		a.filmaff-score.extras-mobile{
			border-radius: 0.3em;
		}
		.extras-bullet:hover{
			color: #678;
		}
		.budget.detail p{
			display: inline-block;
		}
		.budget.detail a{
			display: inline-block;
			margin-left: 10px;
		}
		.extras-show-more{
			margin-top: 10px;
			width: 95%;
			text-align: center;
		}
		.extras-reviews-toggle{
			margin-bottom: 30px;
			width: 95%;
			text-align: center;
		}

		.extras-rating:NOT(.extras-rating-mobile){
			margin-left: 2px;
			margin-right: 3px;
		}
		.extras-rating-mobile{
			margin-right: 3px;
		}

		.bfi-ranking a .icon{
			height: 18px !important;
			width: 18px !important;
			top: -1px !important;
			pointer-events: none;
		}
		.extras-ranking-mobile{
			margin-left: -5px !important;
			margin-top: 10px !important;
			text-align: left !important;
		}
		.extras-ranking-mobile li a{
			font-size: 18px;
		}
		.film-stats-show-details{
			font-size: 10px;
			text-align: left;
			margin-left: 2px;
			margin-top: 10px;
			display: block;
		}
		.mobile-ranking-details{
			font-size: 10px;
			margin-left: 15px;
		}
		.logo-simkl{
			width: 50px;
		}
		.logo-filmarks{
			width: 80px;
			height: 20px;
		}
		.simkl-box{
			border: rgb(89 88 86/37%) 1px solid;
			border-radius: 6px;
			padding: 7px;
			padding-left: 12px;
			padding-right: 12px;
			margin-top: 3px;
			cursor: pointer;
		}
		.simkl-box:hover{
			background-color: rgba(255,255,255,.1);
		}
		.simkl-box span, .simkl-box p{
    		pointer-events:none;
		}
		.allocine-ratings .average-rating{
			top: -8px !important;
		}
		.extras-allo-star::before, .extras-allo-star::after{
			content: "\e066";
		}
		.allocine-ratings-style{
			display: inline-block;
			margin-right: 10px;
			margin-top: 5px;
			padding: 4px;
			border: #4c4c4c 1px solid;
			border-radius: .625rem;
		}
		.allocine-label{
			width: 100%;
			display: block;
			text-align: center; 
			font-size: 10px;
		}
			
		.kinopoisk-score {
			color: #bbbbbb !important;
		}
		.logo-douban {
			width: auto;
		}
		.text-douban {
			color: #01B636;
			font-weight: bold;
			font-size: 14px;
			vertical-align: super;
		}

		.extras-lost-film{
			display: none !important;
		}
		.extras-lost-filter span{
			cursor: pointer;
			-webkit-user-select: none; /* Safari */
			-ms-user-select: none; /* IE 10 and IE 11 */
			user-select: none; /* Standard syntax */
		}
		.extras-lost-filter span i {
    	pointer-events:none;
		}
		/* POSTER SPINE STYLING (default: column view, to left of poster) */
		section.poster-list.-p230.-single {
			position: relative;
		}
		.extras-spine-indicator {
			position: absolute;
			right: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: flex-start;
			padding-right: 6px;
			text-decoration: none;
			max-height: 15%;
		}
		.extras-spine-indicator:not(.mobile) {
			top: 8px;
		}
		.extras-spine-indicator.mobile {
			top: 80%;
		}
		.extras-spine-indicator .spine-logo {
			display: block;
			margin-bottom: 2px;
		}
		.extras-spine-indicator .spine-number {
			font-family: 'Graphik-Regular-Web', 'Helvetica Neue', Helvetica, Arial, sans-serif;
			font-size: 9px;
			color: #989898;
			text-decoration: none;
			line-height: 1;
		}
		.extras-spine-indicator:hover .criterion-logo-path {
			fill: #ffffff;
		}
		.extras-spine-indicator:hover .spine-number {
			color: #ffffff;
		}
		.extras-spine-indicator:hover {
			filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));
		}
		/* POSTER SPINE ROW VIEW */
		.extras-spine-indicator[data-view="row"] {
			flex-direction: row;
		}
		.extras-spine-indicator[data-view="row"] .spine-logo {
			margin-bottom: 0;
			margin-right: 2px;
		}
		/* POSTER SPINE LEFT/RIGHT VIEW */
		.extras-spine-indicator[data-view="left-right"] {
			left: 50%;
			right: auto;
			transform: translateX(-50%);
			flex-direction: row;
			justify-content: space-between;
		}
		.extras-spine-indicator[data-view="left-right"]:not(.mobile) {
			width: 123%;
		}
		.extras-spine-indicator[data-view="left-right"].mobile {
			width: 140%;
		}
		.extras-spine-indicator[data-view="left-right"] .spine-logo {
			margin-bottom: 0;
			margin-right: 2px;
		}
		.extras-spine-indicator[data-view="left-right"] .spine-number {
			writing-mode: vertical-rl;
			text-orientation: upright;
			padding-right: 5px;
		}
		.extras-spine-indicator[data-view="left-right"] .spine-number.spine-digits-1 {
			font-size: 15px;
		}
		.extras-spine-indicator[data-view="left-right"] .spine-number.spine-digits-2 {
			font-size: 11px;
		}
		@media (max-width: 1020px) {
			.extras-spine-indicator:not(.mobile) {
				right: auto;
				left: 100%;
				padding-right: 0;
				padding-left: 6px;
			}
			.extras-spine-indicator[data-view]:not(.mobile) {
				flex-direction: column;
				width: auto;
				right: auto;
				left: 100%;
				transform: none;
				padding-right: 0;
				padding-left: 6px;
				justify-content: flex-start;
			}
			.extras-spine-indicator[data-view]:not(.mobile) .spine-logo {
				margin-right: 0;
				margin-bottom: 2px;
			}
			.extras-spine-indicator[data-view]:not(.mobile) .spine-number {
				writing-mode: horizontal-tb;
				text-orientation: initial;
				padding-right: 0;
			}
			.extras-spine-indicator[data-view]:not(.mobile) .spine-number.spine-digits-1,
			.extras-spine-indicator[data-view]:not(.mobile) .spine-number.spine-digits-2 {
				font-size: 9px;
			}
		}
	`);

/* eslint-disable */

const letterboxd = {

	overview: {

		lastLocation: window.location.pathname,

		running: false,
		isMobile: null,

		// Letterboxd
		letterboxdID: '',
		letterboxdYear: null,
		letterboxdTitle: null,
		letterboxdNativeTitle: null,
		letterboxdDirectors: [],
		letterboxdDirectorsAlt: [],
		linksMoved: false,
		scoreConverted: false,
		fansConverted: false,
		showDetailsAdded: false,
		titleError: false,

		loggedIn: null,

		// Shared page state for the helper classes
		// Currently not replacing existing values to prevent unwanted errors
		pageState: { isMobile: null, hideRatings: null, filmWatched: null },

		filmWatched: null,
		hideRatings: null,
		hideReviews: null,
		ratingMoved: 0, // 0 is unmoved, 1 is moved but hideRatings was null, 2 is confirmed
		reviewsMoved: 0,

		idsCollected: false,
		altTitleList: null,
		altTitleError: false,

		// IMDb
		imdbID: "",
		imdbData: { state: 0, url: "", data: null, raw: null, state2: 0, data2: null, rating: "", num_ratings: "", highest: 0, votes: new Array(10), percents: new Array(10), isMiniSeries: false, isTVEpisode: false, mpaa: null, meta: null },

		// TMDB
		tmdbID: '',
		tmdbTV: false,

		// Mojo
		mojoData: { state: 0, url: "", data: null, budget: "", boxOfficeUS: "", boxOfficeWW: "", mpaaRating: null, added: false },

		// Cinemascore
		cinemascore: { state: 0, data: null, result: null },
		cinemascoreAlt: false,

		// Omdb
		omdbData: { state: 0, data: null },

		// WikiData
		wiki: null,
		wiki_dates: null,
		wikiData: {
			state: 0, state_dates: 0, tomatoURL: null, metaURL: "",
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
		},

		// Rotten Tomatoes
		tomatoData: { state: 0, data: null, raw: null, found: false, hideDetailButton: false, criticAll: null, criticTop: null, audienceAll: null, audienceVerified: null },
		tomatoHelper: null,

		// Metacritic
		metaData: { state: 0, data: null, raw: null, mustSee: false, critic: { rating: "N/A", num_ratings: 0, positive: 0, mixed: 0, negative: 0, highest: 0 }, user: { rating: "N/A", num_ratings: 0, positive: 0, mixed: 0, negative: 0, highest: 0 } },
		metaHelper: null,

		mubiHelper: null,

		filmAffinityHelper: null,

		// Content ratings (MPA, BBFC, FSK, etc)
		contentRating: null,
		contentRatingSystem: null,
		contentRatingAdded: false,

		// Date
		filmDate: { date: null, precision: null },

		// MAL - state replaced by MyAnimeListHelper
		// mal: { state: 0, id: null, url: null, data: null, statistics: null, highest: 0 },
		myAnimeListHelper: null,

		// Anilist Helper
		anilistHelper: null,

		// SensCritique
		sensCritique: { state: 0, id: null, url: null, data: null },
		sensHelper: null,

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
		filmarks: { state: 0, data: null, id: null, movie: null, url: null, rating: null, num_ratings: 0 },
		filmarksHelper: null,

		kinopoiskHelper: null,

		linksAdded: [],

		rtAdded: false,
		metaAdded: false,
		dateAdded: false,
		durationAdded: false,
		lostBadgeAdded: false,

		ratingsSuffix: [],

		stopRunning() {
			this.running = false;
		},

		async init() {
			if (this.running) return;

			this.running = true;

			// Get Letterboxd ID
			if (this.letterboxdID == '' && window.location.pathname.startsWith('/film/')) {
				var regex = /\/film\/(.+)\//
				this.letterboxdID = window.location.pathname.match(regex)[1];
			}
							
			// Get logged in status
			if (this.loggedIn == null){
				this.loggedIn = document.documentElement.innerHTML.includes('person.loggedIn = true');
			}

			if (this.loggedIn == null && letterboxd.storage.get('hide-ratings-enabled') === "unchanged" && letterboxd.storage.get('hide-reviews-enabled') === "false"){
				// Just in case, set these now if the relevant settings aren't enabled.
				// this is a backup just in case the site changes in the future in a way where the addon won't be able to set these normally
				this.loggedIn = false;
				this.filmWatched = this.pageState.filmWatched = false;
				this.hideRatings = this.pageState.hideRatings = false;
				this.hideReviews = false;
			}

			// Determine mobile
			if (this.isMobile == null) {
				if (document.querySelector("html")) {
					var htmlEl = document.querySelector("html");
					if (htmlEl.getAttribute("class").includes("no-mobile")) {
						this.isMobile = this.pageState.isMobile = false;
					} else {
						// TODO: Have Helpers accessed shared state passed through on initialization
						// after storage and page type is parsed.
						this.isMobile = this.pageState.isMobile = true;
					}
				}
			}

			// Determine watch status and hide status
			if (this.filmWatched == null && this.loggedIn != null && letterboxd.storage.syncInitilized == true){
				if (this.loggedIn == false){
					// If not logged in, only base the hiding on the addon settings
					this.filmWatched = this.pageState.filmWatched = false;
					this.hideRatings = this.pageState.hideRatings = letterboxd.storage.get('hide-ratings-enabled') !== "unchanged";
					this.hideReviews = letterboxd.storage.get('hide-reviews-enabled') !== "false";
				}else if (this.filmWatched == null){
					// If logged in, we need to check the watched status against the addon settings
					var found = false;

					if (this.isMobile && document.querySelector('.production-masthead') != null){
						// Mobile - for whatever reason, the poster seems to load in last so I'm instead checking the action strip
						var actionStrip = document.querySelector('a.actions-strip span.js-user-actions-menu-text span.prompt');
						if (actionStrip != null){
							this.filmWatched = actionStrip.innerText.includes("You’ve watched this");
							found = true;
						}
					}else{
						// Desktop - check if the poster has the attribute
						var filmPosterDiv = document.querySelector('#js-poster-col div.poster.film-poster');
						if (filmPosterDiv != null && filmPosterDiv.getAttribute('data-watched') != null && this.filmWatched == null){
							this.filmWatched = filmPosterDiv.getAttribute('data-watched') == 'true';
							found = true;
						}
					}

					if (found){
						// Determine if ratings should be hidden
						this.hideRatings = this.pageState.hideRatings = false;
						if (letterboxd.storage.get('hide-ratings-enabled') !== "unchanged"){
							this.hideRatings = this.pageState.hideRatings = true;

							if (letterboxd.storage.get('hide-ratings-unwatched') === true && this.filmWatched == true){
								this.hideRatings = this.pageState.hideRatings = false;
							}
						}
						
						// Determine if reviews should be hidden
						this.hideReviews = false;
						if (letterboxd.storage.get('hide-reviews-enabled') !== "unchanged"){
							this.hideReviews = true;

							if (letterboxd.storage.get('hide-reviews-unwatched') === true && this.filmWatched == true){
								this.hideReviews = false;
							}
						}
					}
				}
			}

			// Move the existing ratings if necessary
			if (this.ratingMoved == 0 && document.querySelector('.sidebar .section.ratings-histogram-chart:not(.ratings-extras)') != null){
				if (letterboxd.storage.get('hide-ratings-enabled') === "all" && (this.hideRatings == null || this.hideRatings == true)){
					var sidebar = this.createRatingsHolder();
					var ratings = document.querySelector('.sidebar .section.ratings-histogram-chart:not(.ratings-extras)');
					sidebar.prepend(ratings);
				}
				if (this.hideRatings == null)
					this.ratingMoved = 1;
				else
					this.ratingMoved = 2;
			}

			if (this.ratingMoved == 1 && this.hideRatings != null){
				var ratingsHolder = document.querySelector('.extras-ratings-holder')
				var ratings = document.querySelector('.extras-ratings-holder .section.ratings-histogram-chart:not(.ratings-extras)')
				if (this.hideRatings == false && ratings != null){
					// Ratings were moved into the holder but shouldn't have been
					ratingsHolder.before(ratings);
					
					ratingsHolder.parentNode.removeChild(ratingsHolder);

					var button = document.querySelector('.sidebar .extras-show-more');
					if (button != null)
						button.parentNode.removeChild(button);
				}
				
				this.ratingMoved = 2;
			}

			// Hide Reviews
			if (this.reviewsMoved == 0 && document.querySelector('.film-recent-reviews') != null){
				if (letterboxd.storage.get('hide-reviews-enabled') === "all" && (this.hideReviews == null || this.hideReviews == true)){
					var reviews = document.querySelector('.film-recent-reviews');
					if (reviews != null){
						reviews.style.display = "None";
						this.createShowReviewsButton();
					}
				}
				if (this.hideReviews == null)
					this.reviewsMoved = 1;
				else
					this.reviewsMoved = 2;
			}

			if (this.reviewsMoved == 1 && this.hideReviews != null){
				var reviews = document.querySelector('.film-recent-reviews');
				if (this.hideReviews == false && reviews != null){
					// Reviews were hidden and shouldn't have been
					reviews.style.display = "Block";
					
					var button = document.querySelector('.extras-reviews-toggle');
					if (button != null)
						button.parentNode.removeChild(button);
				}
				
				this.reviewsMoved = 2;
			}


			// Get year and title
			if (document.querySelector("section.production-masthead") != null && this.letterboxdYear == null && this.titleError == false) {
				try {
					// Collect Year and Title
					this.letterboxdYear = document.querySelector(".releasedate a").innerText;
					this.letterboxdTitle = document.querySelector(".headline-1.primaryname span").innerText;

					// Collect native title
					var nativeTitle = document.querySelector('.originalname .quoted-creative-work-title')
					if (nativeTitle != null) {
						this.letterboxdNativeTitle = nativeTitle.innerText;
					}
				} catch (error) {
					this.titleError = true;
					console.error('Letterboxd Extras | Error! There was an error when collecting the title and year!\nException:\n' + error);
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
					console.error('Letterboxd Extras | Error! There was an error when collecting the alternate titles!\nException:\n' + error);
				}
			}

			// Replace 'Fans' with rating count
			if (this.fansConverted == false && document.querySelector(".ratings-histogram-chart:not(.ratings-extras)") != null) {
				var section = document.querySelector(".ratings-histogram-chart:not(.ratings-extras)");

				var fansLink = section.querySelector("a.all-link.more-link");
				var score = section.querySelector(".average-rating .display-rating");
				var count = 0;
				if (score != null) {
					// Grab count and link from score element
					var regex = new RegExp(/(?:based on )([0-9,.]+)(?:[  ]ratings)/);

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
					regex = new RegExp(/^([0-9,.]+)\b/);
					var histogramBars = section.querySelectorAll(".rating-histogram .rating-histogram-bar");
					for (var i = 0; i < histogramBars.length; i++) {
						if (histogramBars[i].getAttribute("data-original-title") != null || histogramBars[i].getAttribute("title") != null) {
							var bar = histogramBars[i];
						} else {
							var bar = histogramBars[i].querySelector("a");
						}

						var tooltip = "";
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
					fansLink.innerText = count + " ratings";

				} else if (letterboxd.storage.get('replace-fans') === "both" && fansLink != null) {
					// Add the rating count next to the fans
					// Create the bullet point
					var right = fansLink.clientWidth + 5;
					const bullet = letterboxd.helpers.createElement('a', {
						class: 'all-link more-link extras-bullet',
						style: 'right: ' + right.toString() + 'px'
					});
					bullet.innerText = "•";
					fansLink.before(bullet);

					// Create the rating count link
					right += bullet.clientWidth + 5;
					const ratingCount = letterboxd.helpers.createElement('a', {
						class: 'all-link more-link',
						style: 'right: ' + right.toString() + 'px',
						href: ratingsUrl
					});
					ratingCount.innerText = count;
					bullet.before(ratingCount);

				} else if (fansLink == null) {
					// Fans element does not exist, create one for the ratings count
					const ratingCount = letterboxd.helpers.createElement('a', {
						class: 'all-link more-link',
						href: ratingsUrl
					});
					ratingCount.innerText = count + " ratings";
					section.querySelector(".rating-histogram-exploded").before(ratingCount);
				}

				this.fansConverted = true;
			}

			// Convert to 10-point scale
			if (this.scoreConverted == false && letterboxd.storage.get('convert-ratings') === "10" && document.querySelector(".ratings-histogram-chart:not(.ratings-extras) .average-rating") != null) {
				var section = document.querySelector(".ratings-histogram-chart:not(.ratings-extras)");

				// Convert tooltip
				var tooltipAttribute = "";
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
					var score = section.querySelector(".average-rating .display-rating");
					score.innerText = newScore.toFixed(1).toString();

					// Convert the histogram graph
					regex = new RegExp(/(?:\d+|No)(?: *| *)([★½]+|half-★) ratings/);
					var histogramBars = section.querySelectorAll(".rating-histogram .rating-histogram-bar");
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
			} else if (this.scoreConverted == false && letterboxd.storage.get('convert-ratings') != "10" && document.querySelector(".ratings-histogram-chart:not(.ratings-extras)") != null) {
				this.scoreConverted = true;
			}

			// Add Tooltip as details text for letterboxd rating
			if (this.showDetailsAdded == false && (this.scoreConverted == true) && document.querySelector(".ratings-histogram-chart:not(.ratings-extras)") != null) {
				if (letterboxd.storage.get('tooltip-show-details') === true) {
					var section = document.querySelector(".ratings-histogram-chart:not(.ratings-extras)");
					var histogram = section.querySelector('div');
					var score = section.querySelector(".average-rating .display-rating");

					// Set the position on the div
					histogram.style['position'] = 'relative';
					histogram.style['margin-bottom'] = '10px';

					// Add the tooltip as text for mobile
					var tooltip = "";
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
			if (document.querySelector("#tab-crew")) {
				this.letterboxdDirectors = Array.from(document.querySelectorAll('#tab-crew [href*="/director/"]')).map(x => x.innerText);
				this.letterboxdDirectorsAlt = Array.from(document.querySelectorAll('#tab-crew [href*="/director/"]')).map(x => x.innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
				var producers = Array.from(document.querySelectorAll('#tab-crew [href*="/producer/"]')).map(x => x.innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
				this.letterboxdDirectorsAlt = this.letterboxdDirectorsAlt.concat(producers);
			}

			// First Get the IMDb link 
			if (this.idsCollected == false && document.querySelector('.micro-button') != null && document.querySelector('.block-flag-wrapper')) {
				// Gets the IMDb link and ID, and also TMDB id
				this.resolveExistingButtonLinks();
				if (this.linksMoved == false)
					this.moveLinks();

				if (this.isMobile && this.durationAdded == false) {
					this.addDurationMobile();
				}

			}

			if (this.filmWatched != null){
				// Add Cinema Score
				if (this.cinemascore.data == null && this.letterboxdTitle != null && this.cinemascore.state < 1 && document.querySelector('.sidebar') != null) {
					this.initCinema(null);
				}

				if (this.imdbID != "" && this.imdbData.state < 1) {
					// Call IMDb and Add to page when done
					if (letterboxd.storage.get('imdb-enabled') === true) {
						this.imdbData.state = 1;
						browser.runtime.sendMessage({ name: "GETDATA", url: this.imdbData.url }, (value) => {
							if (letterboxd.helpers.ValidateResponse("IMDb Ratings", value) == false){
								return;
							}

							if (value.response != null){
								this.imdbData.raw = value.response;
								this.imdbData.data = letterboxd.helpers.parseHTML(this.imdbData.raw);

								if (this.imdbData.data != null) {
									if (this.imdbData.raw.includes('(TV Mini Series)'))
										this.imdbData.isMiniSeries = true;
									if (this.imdbData.raw.includes('(TV Episode)'))
										this.imdbData.isTVEpisode = true;

									this.addIMDBScore();
								}
							}
							this.imdbData.state = 2;
						});

						// Call the IMDb main show page
						browser.runtime.sendMessage({ name: "GETDATA", url: this.imdbData.url.replace('/ratings', '') }, (value) => {
							if (letterboxd.helpers.ValidateResponse("IMDb Additional", value) == false){
								return;
							}

							if (value.response != null){
								this.imdbData.data2 = letterboxd.helpers.parseHTML(value.response);

								if (this.imdbData.data2 != null) {
									this.getIMDBAdditional();
								}
							}
							this.imdbData.state2 = 1;
						});

						// Call BoxOfficeMojo
						var mojoURL = 'https://www.boxofficemojo.com/title/' + this.imdbID + '/';
						if (letterboxd.storage.get('mojo-link-enabled') === true) {
							this.addLink(mojoURL);
						}
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
						browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: queryString }, (data) => {
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

										this.wikiData.tomatoURL = url;
										this.initTomato();
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

									// Check for State of Transmission
									this.wikiData.StateOfTransmission = letterboxd.helpers.parseWikiDataResult(this.wiki, "StateOfTransmission", this.wikiData.StateOfTransmission);
									if (this.wikiData.StateOfTransmission != null && this.linksMoved && this.lostBadgeAdded == false){
										this.addLostFilmBadge();
									}
								}
							}else{
								console.log("Letterboxd Extras | No WikiData results found.");
							}

							this.wikiData.state = LOAD_STATES['Success'];
						});

						// Call WikiData a second time for dates
						browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: queryStringDate }, (data) => {
							if (letterboxd.helpers.ValidateResponse("WikiData Dates", data) == false){
								return;
							}

							var value = data.response;
							if (value != null && value.results != null && value.results.bindings != null && value.results.bindings.length > 0) {
								this.wiki_dates = value.results.bindings;
							}else{
								console.log("Letterboxd Extras | No WikiData date results found.");
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
					this.addLink(this.wikiData.metaURL);

					if (this.metaData.data == null && this.metaAdded == false && this.metaData.state < 1) {
						try {
							this.metaData.state = 1;
							browser.runtime.sendMessage({ name: "GETDATA", url: this.wikiData.metaURL }, (value) => {
								if (letterboxd.helpers.ValidateResponse("Metacritic", value) == false){
									return;
								}
									
								var meta = value.response;
								if (meta != "") {
									this.metaData.raw = meta;
									this.metaData.data = letterboxd.helpers.parseHTML(meta);
									this.wikiData.metaURL = value.url;

									this.addMeta();
									this.metaData.state = 2;
								}
							});
						} catch {
							console.error("Letterboxd Extras | Unable to parse Metacritic URL");
							this.metaAdded = true; // so it doesn't keep calling
							this.metaData.state = 3;
						}
					}
				} else if (this.metaData.state < 1 && this.wikiData.state == 2) {
					this.metaData.state = 3;
				}

				// Add Mubi
				if (letterboxd.storage.get('mubi-enabled') === true && this.wikiData.state == 2) {
					if (this.wikiData.Mubi_ID) {
						this.mubiHelper.getData(this.wikiData.Mubi_URL);
					} else {
						this.mubiHelper.searchData(this.letterboxdTitle, this.letterboxdYear, this.letterboxdDirectorsAlt);
					}
				}

				// Add Senscritique
				if (letterboxd.storage.get('senscritique-enabled') === true && this.wikiData.state == 2 && this.sensCritique.state < 1) {
					if (this.wikiData.SensCritique_ID != null && this.wikiData.SensCritique_ID != "") {
						// ID found in WikiData
						this.sensCritique.state = 1;

						var url = "https://apollo.senscritique.com/";
						var options = letterboxd.helpers.getSensIDQuery(this.wikiData.SensCritique_ID);

						browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: url, options: options }, (value) => {
							if (letterboxd.helpers.ValidateResponse("SensCritique API", value) == false){
								return;
							}

							this.sensCritique.state = 2;
							var sens = value.response;
							if (sens.data != null) {
								this.sensCritique.data = sens.data;
								this.addSensCritique();
							}
						});
					} else if (this.letterboxdTitle != null) {
						// No ID from Wikidata, search using the API instead
						this.searchSensCritique();
					}
				}

				// Cinemascore alt titles and years
				if (this.cinemascore.data != null && this.wikiData.state == 2 && this.cinemascoreAlt == false && this.cinemascore.state != 2) {
					this.cinemascoreAlt = true;
					if (this.wikiData.TV_Start == null) {
						var alt_Title = true;
						if ((this.wikiData.date.value != null && new Date(this.wikiData.date.value).getFullYear() != this.letterboxdYear) || (this.wikiData.date_origin.value != null && new Date(this.wikiData.date_origin.value).getFullYear() != this.letterboxdYear)) {
							if (this.verifyCinema(this.cinemascore.data, letterboxd.helpers.cinemascoreTitle(null), "all")) {
								alt_Title = false;
								this.addCinema();
							}
						}

						if (alt_Title) {
							if (this.wikiData.US_Title != null && this.wikiData.US_Title != this.letterboxdTitle) {
								this.initCinema(this.wikiData.US_Title);
							}
							if (this.wikiData.Alt_Title != null && this.wikiData.Alt_Title != this.letterboxdTitle) {
								this.initCinema(this.wikiData.Alt_Title);
							}
						}
					}
				}

				// Add the IMDb backup info here
				if (this.imdbData.state2 == 1 && this.wikiData.state == 2) {
					this.imdbData.state2 = 2;

					// Metascore
					if (this.metaData.state == 3 && this.imdbData.meta != null && letterboxd.storage.get("metacritic-enabled") === true) {
						this.metaData.state = 2;
						this.addMeta();
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
				if (this.filmarks.state == 0 && this.wikiData.state == 2 && letterboxd.storage.get('filmarks-enabled') === true ){
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

			// Add addtional rankings 
			if ((this.isMobile && document.querySelector('.sidebar')) || (this.isMobile == false && document.querySelector('.production-statistic'))) {
				// Add 'They Shoot Pictures, Don't They' ranking
				if (letterboxd.storage.get('tspdt-enabled') === true && this.letterboxdTitle != null && this.tspdt.state < 3 && this.letterboxdDirectors.length > 0) {
					// this.tspdt.state:
					// 0 = no call made
					// 1 = call made, not yet returned
					// 2 = call returned and data stored
					// 3 = data verified
					if (this.tspdt.state == 0) {
						this.initTSPDT();
						this.getTSPDTListURL();
					}
					if (this.tspdt.state == 2 && this.wikiData.state == 2 && this.tspdt.listURL != null) {
						this.verifyTSPDT();
					}
				}
				// Add 'BFI Sight and Sound' ranking
				if (letterboxd.storage.get('bfi-enabled') === true && this.letterboxdTitle != null && this.bfi.state < 3 && this.letterboxdDirectors.length > 0) {
					// this.bfi.state:
					// 0 = no call made
					// 1 = call made, not yet returned
					// 2 = call returned and data stored
					// 3 = data verified
					if (this.bfi.state == 0) {
						this.initBFI();
					}
					if (this.bfi.state == 2 && this.wikiData.state == 2) {
						this.verifyBFI();
					}
				}
			}

			// Add 'Does the dog die?' link
			if (this.idsCollected == true && (this.imdbID != '' || this.tmdbID != '') && this.wikiData.state == 2 && this.letterboxdTitle != null && document.querySelector('.micro-button') != null && this.linksMoved == true && letterboxd.storage.get('ddd-enabled') === true){
				if (this.ddd.id != null && this.ddd.id != ''){
					this.addDDD();
				}
				else if (this.ddd.state == 0){
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
						console.log("Letterboxd Extras | No " + this.contentRatingSystem + " rating found.");
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
				var url = this.wiki.Wikipedia.value;
			} else if (this.wiki.WikipediaEN != null && this.wiki.WikipediaEN.value != null) {
				var url = this.wiki.WikipediaEN.value;
			} else {
				return;
			}

			this.addLink(url);
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

					if (this.isMobile) {
						imdbLink = imdbLink.replace('www.', 'm.');
					}

					this.imdbData.url = imdbLink;

				} else if (links[i].innerHTML === "TMDB") {
					// Grab the tmdb link
					tmdbLink = links[i].href;
				}
			}

			// Separate out the ID
			if (imdbLink != "") {
				this.imdbID = imdbLink.match(/(imdb.com\/title\/)(tt[0-9]+)(\/)/)[2];
			}

			// Separate the TMDB ID
			if (tmdbLink != "") {
				if (tmdbLink.includes('/tv/')) {
					this.tmdbTV = true;
				}
				this.tmdbID = tmdbLink.match(/(themoviedb.org\/(?:tv|movie)\/)([0-9]+)($|\/)/)[2];
			}

			this.idsCollected = true;
		},

		addIMDBScore() {
			if (document.querySelector('.imdb-ratings')) return;

			if (!document.querySelector('.sidebar')) return;

			// Get the score from the IMDb page
			//**********************************************/
			const body = this.imdbData.data.querySelector('body');
			if (body.getAttribute("id") == "styleguide-v2") {
				if (this.getIMDBScoreV2() == false) {
					return;
				}
			} else {
				if (this.getIMDBScoreNew() == false) {
					return;
				}
			}

			// Add the score to the page
			//********************************************* */
			const imdbScoreSection = letterboxd.helpers.createChartSection(
				'imdb', 
				{
					href: this.imdbData.url,
					style: "position: absolute;",
					innerHTML: '<svg id="home_img" class="ipc-logo" xmlns="http://www.w3.org/2000/svg" width="32" height="16" viewBox="0 0 64 32" version="1.1"><g fill="#F5C518"><rect x="0" y="0" width="100%" height="100%" rx="4"></rect></g><g transform="translate(8.000000, 7.000000)" fill="#000000" fill-rule="nonzero"><polygon points="0 18 5 18 5 0 0 0"></polygon><path d="M15.6725178,0 L14.5534833,8.40846934 L13.8582008,3.83502426 C13.65661,2.37009263 13.4632474,1.09175121 13.278113,0 L7,0 L7,18 L11.2416347,18 L11.2580911,6.11380679 L13.0436094,18 L16.0633571,18 L17.7583653,5.8517865 L17.7707076,18 L22,18 L22,0 L15.6725178,0 Z"></path><path d="M24,18 L24,0 L31.8045586,0 C33.5693522,0 35,1.41994415 35,3.17660424 L35,14.8233958 C35,16.5777858 33.5716617,18 31.8045586,18 L24,18 Z M29.8322479,3.2395236 C29.6339219,3.13233348 29.2545158,3.08072342 28.7026524,3.08072342 L28.7026524,14.8914865 C29.4312846,14.8914865 29.8796736,14.7604764 30.0478195,14.4865461 C30.2159654,14.2165858 30.3021941,13.486105 30.3021941,12.2871637 L30.3021941,5.3078959 C30.3021941,4.49404499 30.272014,3.97397442 30.2159654,3.74371416 C30.1599168,3.5134539 30.0348852,3.34671372 29.8322479,3.2395236 Z"></path><path d="M44.4299079,4.50685823 L44.749518,4.50685823 C46.5447098,4.50685823 48,5.91267586 48,7.64486762 L48,14.8619906 C48,16.5950653 46.5451816,18 44.749518,18 L44.4299079,18 C43.3314617,18 42.3602746,17.4736618 41.7718697,16.6682739 L41.4838962,17.7687785 L37,17.7687785 L37,0 L41.7843263,0 L41.7843263,5.78053556 C42.4024982,5.01015739 43.3551514,4.50685823 44.4299079,4.50685823 Z M43.4055679,13.2842155 L43.4055679,9.01907814 C43.4055679,8.31433946 43.3603268,7.85185468 43.2660746,7.63896485 C43.1718224,7.42607505 42.7955881,7.2893916 42.5316822,7.2893916 C42.267776,7.2893916 41.8607934,7.40047379 41.7816216,7.58767002 L41.7816216,9.01907814 L41.7816216,13.4207851 L41.7816216,14.8074788 C41.8721037,15.0130276 42.2602358,15.1274059 42.5316822,15.1274059 C42.8031285,15.1274059 43.1982131,15.0166981 43.281155,14.8074788 C43.3640968,14.5982595 43.4055679,14.0880581 43.4055679,13.2842155 Z"></path></g></svg>'
				},
				'margin-bottom: 15px !important;',
			);

			if (this.isMobile) {
				imdbScoreSection.append(letterboxd.helpers.createShowDetailsButton("imdb", "imdb-score-details"));
			}

			imdbScoreSection.append(letterboxd.helpers.createHistogramScore(
				letterboxd.storage, 
				"imdb", 
				this.imdbData.rating, 
				this.imdbData.num_ratings, 
				this.imdbData.url.replace('ratings', 'reviews'), 
				this.isMobile
			));
			
			imdbScoreSection.append(letterboxd.helpers.createHistogramGraph(
				letterboxd.storage,
				"imdb", 
				this.imdbData.url, 
				this.imdbData.num_ratings, 
				this.imdbData.votes, 
				this.imdbData.percents, 
				this.imdbData.highest
			));

			// Add the tooltip as text for mobile
			var score = imdbScoreSection.querySelector(".average-rating .tooltip");
			var tooltip = "";
			if (score != null) {
				tooltip = score.getAttribute('data-original-title');
				letterboxd.helpers.createDetailsText('imdb', imdbScoreSection, tooltip, this.isMobile);
			}

			// Append to the sidebar
			//*****************************************************************
			this.appendRating(imdbScoreSection, 'imdb-ratings');

			// Add the hover events
			//*****************************************************************
			letterboxd.helpers.addTooltipEvents(imdbScoreSection);
		},

		getIMDBScoreV2() {
			// If IMDb loads the old 'styleguide-v2' page

			// No Ratings - return
			if (this.imdbData.data.querySelector('.sectionHeading').innerHTML.includes('No Ratings Available')) return false

			// Get the score
			if (this.imdbData.data.querySelector('.ratingTable.Selected .bigcell')) {
				this.imdbData.rating = this.imdbData.data.querySelector('.ratingTable.Selected .bigcell').innerText;
			} else {
				this.imdbData.rating = this.imdbData.data.querySelector('.ipl-rating-star__rating').innerText;
			}
			// Fix if comma is used as decimal
			if (typeof this.imdbData.rating == 'string' && this.imdbData.rating.includes(',')) {
				this.imdbData.rating = this.imdbData.rating.replace(',', '.');
			}

			// Get the number of ratings
			var tempArray = this.imdbData.data.querySelectorAll('.allText');
			for (var ii = 0; ii < tempArray.length; ii++) {
				if (tempArray[ii].innerHTML.includes('IMDb users have given a')) {
					this.imdbData.num_ratings = letterboxd.helpers.getTextBetween(tempArray[ii].innerText, '\n                ', '\nIMDb users');
					break;
				}
			}

			// Get the votes
			var tables = this.imdbData.data.querySelectorAll('table')
			var tableRows = tables[0].rows;

			var k = 0
			for (var ii = 1; ii < tableRows.length; ii++) {
				var votes = tableRows[ii].cells[2].children[0].children[0].innerText;
				votes = votes.replaceAll(',', '');
				votes = votes.replaceAll(/\s/g, '');
				votes = votes.replaceAll('.', '');
				votes = parseInt(votes);

				if (votes > 0) {
					var percent = letterboxd.helpers.getTextBetween(tableRows[ii].cells[1].children[1].children[0].innerHTML, '&nbsp;\n', '\n');
					percent = parseFloat(percent)
				} else {
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

			return true;
		},

		getIMDBScoreNew() {
			// If IMDb load the new design

			// No Ratings - return
			if (this.imdbData.data.querySelector('.sc-7b66e0e3-0 kcXuZM')) return false

			// Get the JSON data
			var scoreInfo = JSON.parse(letterboxd.helpers.getTextBetween(this.imdbData.raw, '<script id="__NEXT_DATA__" type="application/json">', "</script>"));

			var histogramData = scoreInfo.props.pageProps.contentData.histogramData;

			// Score
			this.imdbData.rating = histogramData.aggregateRating;

			// Rating Count
			this.imdbData.num_ratings = histogramData.totalVoteCount;

			// Get the votes
			var histogramValues = histogramData.histogramValues;

			for (var ii = 0; ii < histogramValues.length; ii++) {
				var index = histogramValues[ii].rating - 1;
				var votes = histogramValues[ii].voteCount;
				var percent = ((votes / this.imdbData.num_ratings) * 100).toFixed(1);

				this.imdbData.percents[index] = percent;
				this.imdbData.votes[index] = votes;

				if (votes > this.imdbData.highest)
					this.imdbData.highest = votes;
			}

			if (this.imdbData.rating == 0 || this.imdbData.num_ratings == 0 || histogramValues.length == 0) {
				return false;
			}

			return true;
		},

		getIMDBAdditional() {
			// First see if it has a parental rating
			var details = this.imdbData.data2.querySelectorAll('.ipc-inline-list.ipc-inline-list--show-dividers.sc-afe43def-4.kdXikI.baseAlt li');
			if (details != null) {
				for (var i = 0; i < details.length; i++) {
					var a = details[i].querySelector('a');
					if (a != null) {
						if (a.getAttribute('href').includes('parentalguide')) {
							this.imdbData.mpaa = a.innerText.trim();
							break;
						}
					}
				}
			}

			// Next grab the metascore if it has it
			var meta = this.imdbData.data2.querySelector('.metacritic-score-box');
			if (meta != null) {
				this.imdbData.meta = meta.innerText.trim();
			}

			// We will not add anything yet, we will wait until we are sure WikiData is missing them
		},

		initTomato() {
			if (this.wikiData.tomatoURL != null && this.wikiData.tomatoURL != "") {
				this.addLink(this.wikiData.tomatoURL);

				if (this.tomatoData.data == null && this.rtAdded == false && this.tomatoData.state < 1) {
					try {
						this.tomatoData.state = 1;
						browser.runtime.sendMessage({ name: "GETDATA", url: this.wikiData.tomatoURL }, (value) => {
							if (letterboxd.helpers.ValidateResponse("RottenTomatoes", value) == false){
								return;
							}
								
							var tomato = value.response;
							if (tomato != null) {
								this.tomatoData.raw = tomato;
								this.tomatoData.data = letterboxd.helpers.parseHTML(tomato);
								this.wikiData.tomatoURL = value.url;

								this.addTomato();
								this.tomatoData.state = 2;
							}
						});
					} catch {
						console.error("Letterboxd Extras | Unable to parse Rotten Tomatoes URL");
						this.rtAdded = true; // so it doesn't keep calling
						this.tomatoData.state = 3;
					}
				} else if (this.tomatoData.state < 1) {
					this.tomatoData.state = 3;
				}
			}
		},

		addTomato() {
			if (document.querySelector('.tomato-ratings')) return;

			if (!document.querySelector('.sidebar')) return;

			if (this.tomatoData.raw.includes('404 - Not Found')) return;

			// Lets grab all the potentially useful information first 
			//***************************************************************
			this.tomatoData.criticAll = { type: "CRITIC", percent: "--", state: "", rating: "", num_ratings: 0, likedCount: 0, notLikedCount: 0, url: "" };
			this.tomatoData.criticTop = { type: "CRITIC", percent: "--", state: "", rating: "", num_ratings: 0, likedCount: 0, notLikedCount: 0, url: "" };
			this.tomatoData.audienceAll = { type: "AUDIENCE", percent: "--", state: "", rating: "", num_ratings: 0, likedCount: 0, notLikedCount: 0, url: "" };
			this.tomatoData.audienceVerified = { type: "AUDIENCE", percent: "--", state: "", rating: "", num_ratings: 0, likedCount: 0, notLikedCount: 0, url: "" };

			if (this.tomatoData.data.querySelector('#media-scorecard-json') != null) {
				var scoredetails = JSON.parse(this.tomatoData.data.querySelector('#media-scorecard-json').innerHTML);
				this.collectTomatoScore(this.tomatoData.criticTop, scoredetails.overlay.criticsTop);
				this.collectTomatoScore(this.tomatoData.criticAll, scoredetails.overlay.criticsAll);
				this.collectTomatoScore(this.tomatoData.audienceVerified, scoredetails.overlay.audienceVerified);
				this.collectTomatoScore(this.tomatoData.audienceAll, scoredetails.overlay.audienceAll);
			} else {
				// Not found, return
				return;
			}

			// Return if no scores what so ever
			if (this.tomatoData.criticAll.num_ratings == 0 && this.tomatoData.audienceAll.num_ratings == 0) return;

			if (this.tomatoData.hideDetailButton == true && this.isMobile) {
				this.tomatoData.hideDetailButton = false;
			}

			// Now display all this on the page
			//***************************************************************
			// Add the section to the page
			const section = letterboxd.helpers.createElement('section', {
				class: 'section ratings-histogram-chart tomato-ratings ratings-extras'
			});

			// Add the Header - 
			const heading = letterboxd.helpers.createElement('h2', {
				class: 'section-heading section-heading-extras'
			});
			section.append(heading);

			const logo = letterboxd.helpers.createElement('a', {
				class: 'logo-tomatoes',
				href: this.wikiData.tomatoURL,
				style: 'height: 20px; width: 75px; background-image: url("https://www.rottentomatoes.com/assets/pizza-pie/images/rtlogo.9b892cff3fd.png");'
			});
			heading.append(logo);

			// Add the Show Details button
			var showDetails = null;
			if (this.tomatoData.hideDetailButton == false) {
				showDetails = letterboxd.helpers.createShowDetailsButton("rt", "rt-score-details")
				section.append(showDetails);
			}

			var createTooltip = (this.isMobile || letterboxd.storage.get('tooltip-show-details') === true);

			// CRITIC SCORE /  TOMATOMETER
			//************************************************************
			var criticAdded = false;
			if (letterboxd.storage.get('tomato-critic-enabled') === true) {
				// The span that holds the score
				const criticSpan = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block; padding-right: 10px;'
				});
				section.append(criticSpan);

				// Add the div to hold the toggle buttons
				// Div to hold buttons
				const buttonDiv = letterboxd.helpers.createElement('div', {
					style: 'display: block; margin-right: 10px;'
				});
				criticSpan.append(buttonDiv);

				if (this.isMobile) {
					// Add single toggle button
					buttonDiv.append(letterboxd.helpers.createTomatoButton("critic-toggle", "ALL", "score-critic-all,score-critic-top", true, (this.tomatoData.criticTop.percent == "--"), this.isMobile));

				} else {
					buttonDiv.append(letterboxd.helpers.createTomatoButton("critic-all", "ALL", "score-critic-all", true, false, this.isMobile));
					buttonDiv.append(letterboxd.helpers.createTomatoButton("critic-top", "TOP", "score-critic-top", false, (this.tomatoData.criticTop.percent == "--"), this.isMobile));
				}

				// Add scores
				criticSpan.append(letterboxd.helpers.createTomatoScore("critic-all", "Critic", this.wikiData.tomatoURL, this.tomatoData.criticAll, "block", this.isMobile, createTooltip));
				criticSpan.append(letterboxd.helpers.createTomatoScore("critic-top", "Top Critic", this.wikiData.tomatoURL, this.tomatoData.criticTop, "none", this.isMobile, createTooltip));

				criticAdded = true;
			}

			// AUDIENCE SCORE
			//************************************************************
			var audienceAdded = false;
			if (letterboxd.storage.get('tomato-audience-enabled') === true) {
				// The span that holds the score
				const audienceSpan = letterboxd.helpers.createElement('span', {
					style: 'display: inline-block; padding-right: 10px;'
				});
				section.append(audienceSpan);

				// Add the toggle buttons
				// Div to hold buttons
				const buttonDiv2 = letterboxd.helpers.createElement('div', {
					style: 'display: block; margin-right: 10px;'
				});
				audienceSpan.append(buttonDiv2);

				if (this.isMobile) {
					// Add single toggle button
					buttonDiv2.append(letterboxd.helpers.createTomatoButton("audience-toggle", "ALL", "score-critic-all,score-critic-top", true, (this.tomatoData.audienceVerified.percent == "--"), this.isMobile));

				} else {
					buttonDiv2.append(letterboxd.helpers.createTomatoButton("audience-all", "ALL", "score-audience-all", true, false, this.isMobile));
					buttonDiv2.append(letterboxd.helpers.createTomatoButton("audience-verified", "VERIFIED", "score-audience-verified", false, (this.tomatoData.audienceVerified.percent == "--"), this.isMobile));
				}

				// Add scores
				audienceSpan.append(letterboxd.helpers.createTomatoScore("audience-all", "Audience", this.wikiData.tomatoURL, this.tomatoData.audienceAll, "block", this.isMobile, createTooltip));
				audienceSpan.append(letterboxd.helpers.createTomatoScore("audience-verified", "Verified Audience", this.wikiData.tomatoURL, this.tomatoData.audienceVerified, "none", this.isMobile, createTooltip));

				audienceAdded = true;
			}

			if (criticAdded == false && audienceAdded == false) {
				this.rtAdded = true; // so it doesn't keep calling
				return;
			}

			// APPEND to the sidebar
			//************************************************************
			this.appendRating(section, 'tomato-ratings');

			// Move the details text
			//************************************************************
			if (this.isMobile == false) {
				var criticAllText = section.querySelector('.mobile-details-text.score-critic-all');
				var criticTopText = section.querySelector('.mobile-details-text.score-critic-top');
				var audienceAllText = section.querySelector('.mobile-details-text.score-audience-all');
				var audienceVerifiedText = section.querySelector('.mobile-details-text.score-audience-verified');

				if (criticAllText != null)
					section.append(criticAllText);
				if (criticTopText != null)
					section.append(criticTopText);
				if (audienceAllText != null)
					section.append(audienceAllText);
				if (audienceVerifiedText != null)
					section.append(audienceVerifiedText);
			}


			// Click the rt-buttons
			//************************************************************
			if (this.isMobile) {
				if (this.tomatoData.criticTop.percent != "--" && letterboxd.storage.get('critic-default') === 'top') {
					section.querySelector(".rt-button.critic-toggle").click();
				}
				if (this.tomatoData.audienceVerified.percent != "--" && letterboxd.storage.get('audience-default') === 'verified') {
					section.querySelector(".rt-button.audience-toggle").click();
				}
			} else {
				if (this.tomatoData.criticTop.percent != "--" && letterboxd.storage.get('critic-default') === 'top') {
					section.querySelector(".rt-button.critic-top").click();
				}
				if (this.tomatoData.audienceVerified.percent != "--" && letterboxd.storage.get('audience-default') === 'verified') {
					section.querySelector(".rt-button.audience-verified").click();
				}
			}

			// Click the show details if needed
			//************************************************************
			if (showDetails != null) {
				if (letterboxd.storage.get('rt-default-view') === 'show' || (letterboxd.storage.get('rt-default-view') === 'remember' && letterboxd.storage.get('rt-score-details') === 'show')) {
					showDetails.click();
				}
			}

			// Add the Events for the hover
			//************************************************************
			letterboxd.helpers.addTooltipEvents(section);

			this.rtAdded = true;
		},

		collectTomatoScore(data, scoredetails) {

			if (scoredetails != null && scoredetails.score != null) {
				data.percent = scoredetails.score;
				data.state = scoredetails.sentiment;
				data.likedCount = scoredetails.likedCount;
				data.notLikedCount = scoredetails.notLikedCount;
				data.num_ratings = data.likedCount + data.notLikedCount;

				data.url = scoredetails.scoreLinkUrl;
				data.rating = scoredetails.averageRating

				if (scoredetails.certified != null && scoredetails.certified == true && data.type == "CRITIC") {
					data.state = "certified-fresh";
				} else if (scoredetails.certified != null && scoredetails.certified == true && data.type == "AUDIENCE") {
					data.state = "verified-hot";
				} else if (data.state == "POSITIVE" && data.type == "CRITIC") {
					data.state = "fresh";
				} else if (data.state == "NEGATIVE" && data.type == "CRITIC") {
					data.state = "rotten";
				} else if (data.state == "POSITIVE") {
					data.state = "upright";
				} else if (data.state == "NEGATIVE") {
					data.state = "spilled";
				}
			}
		},

		addMeta() {
			if (document.querySelector('.meta-ratings')) return;

			if (!document.querySelector('.sidebar')) return;

			// First, lets grab all the useful information
			//***************************************************************
			if (this.metaData.data != null) {
				var scoreContainer = this.metaData.data.querySelector('.c-productHero_player-scoreInfo .c-productHero_score-container');

				// Scores
				var criticScore = scoreContainer.querySelector('.c-siteReviewScore:not(.c-siteReviewScore_user) span');
				if (criticScore != null) {
					// Standard page with score
					this.metaData.critic.rating = criticScore.innerText;
				} else {
					// TV episodes with no Metascore
					this.metaData.critic.rating = "N/A";
				}

				var userScore = scoreContainer.querySelector('.c-siteReviewScore_user span');
				if (userScore != null) {
					// Standard page with score
					this.metaData.user.rating = userScore.innerText;
				} else {
					// TV episodes with no Metascore
					this.metaData.user.rating = "N/A";
				}

				// Grab the 'must see'
				if (this.metaData.data.querySelector('.c-productScoreInfo_must')) {
					this.metaData.mustSee = true;
				}

				// Grab the rating counts (same for desktop and mobile)
				// Critic
				var criticSection = this.metaData.data.querySelector('.c-reviewsSection_criticReviews');

				if (criticSection != null) {
					var criticPositive = criticSection.querySelectorAll('.c-reviewsStats_positiveStats span');
					var criticNeutral = criticSection.querySelectorAll('.c-reviewsStats_neutralStats span');
					var criticNegative = criticSection.querySelectorAll('.c-reviewsStats_negativeStats span');

					if (criticPositive.length == 2) {
						this.metaData.critic.positive = parseInt(criticPositive[1].innerText.replace(" Reviews", ""));
					}
					if (criticNeutral.length == 2) {
						this.metaData.critic.mixed = parseInt(criticNeutral[1].innerText.replace(" Reviews", ""));
					}
					if (criticNegative.length == 2) {
						this.metaData.critic.negative = parseInt(criticNegative[1].innerText.replace(" Reviews", ""));
					}

					this.metaData.critic.num_ratings = this.metaData.critic.positive + this.metaData.critic.mixed + this.metaData.critic.negative;

					// If there are ratings, but no reviews so metacritic doesn't display the breakdown
					if (!(this.metaData.critic.rating == "N/A" || this.metaData.critic.rating == "tbd") && this.metaData.critic.num_ratings == 0) {
						// parseFloat() will remove insigificant zeroes (so 7.0 will become 7)
						var temp = letterboxd.helpers.getTextBetween(this.metaData.raw, 'score:' + parseFloat(this.metaData.critic.rating).toString() + ',', 'sentiment:');

						this.metaData.critic.num_ratings = parseInt(letterboxd.helpers.getTextBetween(temp, 'reviewCount:', ','));
						this.metaData.critic.positive = parseInt(letterboxd.helpers.getTextBetween(temp, 'positiveCount:', ','));
						this.metaData.critic.mixed = parseInt(letterboxd.helpers.getTextBetween(temp, 'neutralCount:', ','));
						this.metaData.critic.negative = parseInt(letterboxd.helpers.getTextBetween(temp, 'negativeCount:', ','));

						if (this.metaData.critic.num_ratings.isNaN) this.metaData.critic.num_ratings = 0
						if (this.metaData.critic.positive.isNaN) this.metaData.critic.positive = 0
						if (this.metaData.critic.mixed.isNaN) this.metaData.critic.mixed = 0
						if (this.metaData.critic.negative.isNaN) this.metaData.critic.negative = 0
					}

					this.metaData.critic.highest = letterboxd.helpers.getMetaHighest(this.metaData.critic);
				}


				// Users
				var userSection = this.metaData.data.querySelector('.c-reviewsSection_userReviews');

				if (userSection != null) {
					var userPositive = userSection.querySelectorAll('.c-reviewsStats_positiveStats span');
					var userNeutral = userSection.querySelectorAll('.c-reviewsStats_neutralStats span');
					var userNegative = userSection.querySelectorAll('.c-reviewsStats_negativeStats span');

					if (userPositive.length == 2) {
						this.metaData.user.positive = parseInt(userPositive[1].innerText.replace(" Ratings", ""));
					}
					if (userNeutral.length == 2) {
						this.metaData.user.mixed = parseInt(userNeutral[1].innerText.replace(" Ratings", ""));
					}
					if (userNegative.length == 2) {
						this.metaData.user.negative = parseInt(userNegative[1].innerText.replace(" Ratings", ""));
					}

					this.metaData.user.num_ratings = this.metaData.user.positive + this.metaData.user.mixed + this.metaData.user.negative;

					// If there are ratings, but no reviews so metacritic doesn't display the breakdown
					if (!(this.metaData.user.rating == "N/A" || this.metaData.user.rating == "tbd") && this.metaData.user.num_ratings == 0) {
						// parseFloat() will remove insigificant zeroes (so 7.0 will become 7)
						var temp = letterboxd.helpers.getTextBetween(this.metaData.raw, 'score:' + parseFloat(this.metaData.user.rating).toString() + ',', 'sentiment:');

						this.metaData.user.num_ratings = parseInt(letterboxd.helpers.getTextBetween(temp, 'reviewCount:', ','));
						this.metaData.user.positive = parseInt(letterboxd.helpers.getTextBetween(temp, 'positiveCount:', ','));
						this.metaData.user.mixed = parseInt(letterboxd.helpers.getTextBetween(temp, 'neutralCount:', ','));
						this.metaData.user.negative = parseInt(letterboxd.helpers.getTextBetween(temp, 'negativeCount:', ','));

						if (Number.isNaN(this.metaData.user.num_ratings)) this.metaData.user.num_ratings = 0
						if (Number.isNaN(this.metaData.user.positive)) this.metaData.user.positive = 0
						if (Number.isNaN(this.metaData.user.mixed)) this.metaData.user.mixed = 0
						if (Number.isNaN(this.metaData.user.negative)) this.metaData.user.negative = 0
					}

					this.metaData.user.highest = letterboxd.helpers.getMetaHighest(this.metaData.user);
				}

			} else {
				// When metacritic score can only be found from omdb or imdb
				if (this.imdbData.meta != null) {
					this.metaData.critic.rating = this.imdbData.meta;
				} else if (this.omdbData.data.Metascore != null) {
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
				class: 'section ratings-histogram-chart meta-ratings ratings-extras'
			});

			// Add the Header
			const heading = letterboxd.helpers.createElement('h2', {
				class: 'section-heading section-heading-extras'
			});
			section.append(heading);


			if (this.metaData.data != null) {
				var elementClass = "logo-meta-link";
			} else {
				var elementClass = "logo-meta";
			}

			const logoHolder = letterboxd.helpers.createElement('a', {
				class: elementClass,
				style: 'width: 100%;'
			});
			if (this.wikiData.metaURL != null && this.wikiData.metaURL != "") {
				logoHolder.setAttribute('href', this.wikiData.metaURL);
			}
			heading.append(logoHolder);

			const metaLogo = letterboxd.helpers.createElement('span', {
				class: 'icon-meta',
				style: 'height: 20px; width: 20px; background-image: url("https://www.metacritic.com/images/icons/metacritic-icon.svg");'
			});
			logoHolder.append(metaLogo);

			const metaText = letterboxd.helpers.createElement('span', {
				class: 'text-meta',
				style: 'height: 20px; width: 100px; background-image: url("https://www.metacritic.com/images/icons/metacritic-wordmark.svg");',
			});
			logoHolder.append(metaText);

			// Add the Show Details button
			var showDetails = null;
			if (this.metaData.data != null) {
				showDetails = letterboxd.helpers.createShowDetailsButton("meta", "meta-score-details");
				section.append(showDetails);
			}

			var url = "";
			if (url.endsWith != "/") url += "/"
			url = this.wikiData.metaURL + "critic-reviews";

			var addTooltip = (this.isMobile || letterboxd.storage.get('tooltip-show-details') === true);

			// Critic score
			//***************************************************************
			var criticAdded = false;
			if (letterboxd.storage.get('metacritic-critic-enabled') === true) {
				if (this.wikiData.metaURL != null && this.wikiData.metaURL != "") {
				}
				section.append(letterboxd.helpers.createMetaScore("critic", "Critic", url, this.metaData.critic, this.metaData.mustSee, this.isMobile, addTooltip));
				criticAdded = true;
			}

			// User score
			//***************************************************************
			var userAdded = false;
			if (letterboxd.storage.get('metacritic-users-enabled') === true) {
				if (this.metaData.data != null) {
					url = url.replace("/critic-reviews", "/user-reviews")
					section.append(letterboxd.helpers.createMetaScore("user", "User", url, this.metaData.user, this.metaData.mustSee, this.isMobile, addTooltip));
					userAdded = true;
				}
			}

			// Add Must see if applicable
			if (letterboxd.storage.get('metacritic-mustsee-enabled') === true) {
				if (this.metaData.mustSee == true) {
					if (this.tmdbTV) {
						const mustSeeSpan = letterboxd.helpers.createElement('span', {
							class: 'meta-must-see meta-must-watch tooltip tooltip-extra display-rating -highlight',
							style: 'margin-top: 5px;',
							['data-original-title']: 'Metacritic Must-Watch'
						});
						section.append(mustSeeSpan);
					} else {
						const mustSeeSpan = letterboxd.helpers.createElement('span', {
							class: 'meta-must-see tooltip tooltip-extra display-rating -highlight',
							style: 'margin-top: 5px;',
							['data-original-title']: 'Metacritic Must-See'
						});
						section.append(mustSeeSpan);
					}
				}
			}

			if (criticAdded == false && userAdded == false) {
				this.metaAdded = true; // so it doesn't keep calling
				return;
			}

			// APPEND to the sidebar
			//************************************************************
			this.appendRating(section, 'meta-ratings');				

			// Move the details text
			//************************************************************
			if (this.isMobile == false){
				var criticText = document.querySelector('.meta-details-critic.mobile-details-text');
				var userText = document.querySelector('.meta-details-user.mobile-details-text');

				if (criticText != null)
					section.append(criticText);
				if (userText != null)
					section.append(userText);
			}

			//Add click for Show details button
			//************************************************************
			if (letterboxd.storage.get('meta-default-view') === 'show' || (letterboxd.storage.get('meta-default-view') === 'remember' && letterboxd.storage.get('meta-score-details') === 'show')) {
				showDetails.click();
			}

			// Add Hover events
			//************************************************************
			letterboxd.helpers.addTooltipEvents(section);

			this.metaAdded = true;
		},

		addLink(url) {
			if (url === null || url === "") {
				return;
			}

			// Check if already added
			if (!this.linksAdded.includes(url)) {
				this.linksAdded.push(url);

				var text = "";
				var className = "";
				if (url.includes("rottentomatoes")) {
					text = "RT";
					className = "tomato-button";
				} else if (url.includes("metacritic")) {
					text = "META";
					className = "meta-button";
				} else if (url.includes("boxofficemojo")) {
					text = "MOJO";
					className = "mojo-button";
				} else if (url.includes("anilist")) {
					text = "AL";
					className = "anilist-button";
				} else if (url.includes("myanimelist")) {
					text = "MAL";
					className = "mal-button";
				} else if (url.includes("anidb")) {
					text = "ANIDB";
					className = "anidb-button";
				} else if (url.includes("senscritique")) {
					text = "CRITIQUE";
					className = "sens-button";
				} else if (url.includes("mubi.com")) {
					text = "MUBI";
					className = "mubi-button";
				} else if (url.includes("filmaffinity.com")) {
					text = "AFFINITY";
					className = "filmaff-button";
				} else if (url.includes("wikipedia")) {
					text = "WIKI";
					className = "wiki-button";
				} else if (url.includes("allocine")) {
					text = "ALLO";
					className = "allocine-button";
				} else if (url.includes("filmarks")) {
					text = "FILMARKS";
					className = "filmarks-button";
				} else if (url.includes("doesthedogdie")) {
					text = "DOG";
					className = "ddd-button";
				}

				if (document.querySelector('.' + className)) {
					return;
				}

				// Create Button Element
				var button = letterboxd.helpers.createElement('a', {
					class: 'micro-button track-event ' + className,
					href: url
				});
				button.innerText = text;

				if (letterboxd.storage.get('open-same-tab') != true) {
					button.setAttribute("target", "_blank");
				}

				// Determine Placement
				var order = [
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
					'.criterion-button',
					'.mojo-button',
					'.wiki-button',
					'.ddd-button'
				];

				var index = order.indexOf('.' + className);
				// First Attempt
				for (var i = index + 1; i < order.length; i++) {
					var temp = document.querySelector(order[i]);
					if (temp != null) {
						temp.before(button);
						return;
					}
				}

				// Second Attempt
				for (var i = index - 1; i >= 0; i--) {
					var temp = document.querySelector(order[i]);
					if (temp != null) {
						temp.after(button);
						return;
					}
				}

				// Third Attempt
				var buttons = document.querySelectorAll('.micro-button');
				var lastButton = buttons[buttons.length - 1];
				lastButton.after(button);
			}
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
				if (this.isMobile == false) {
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

				// Save the report button then remove the old text, then re-add
				var report = footer.querySelector('.block-flag-wrapper');
				report.style['margin-left'] = '5px';

				// Save badges (adult)
				var badges = footer.querySelectorAll('.badge');

				footer.innerText = "";
				footer.prepend(report);

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
				if (this.isMobile) {
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
				console.error('Letterboxd Extras | Error! There was an error when adding the MPA rating!\nException:\n' + error);
			}

			this.ratingAdded = true;
		},

		initCinema(title) {
			if (this.letterboxdYear != null && parseInt(this.letterboxdYear) < 1978) {
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
			var url = "https://webapp.cinemascore.com/guest/search/title/" + encoded;
			this.cinemascore.state = 1;

			if (letterboxd.storage.get('cinema-enabled') === true) {
				browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: url }, (data) => {
					if (letterboxd.helpers.ValidateResponse("Cinemascore", data) == false){
						return;
					}

					var value = data.response;

					// Check if found
					if (this.cinemascore.data == null) {
						this.cinemascore.data = value;
					} else {
						this.cinemascore.data = [].concat(this.cinemascore.data, value);
					}

					if (this.verifyCinema(value, title, 'all')) {
						this.addCinema();

					} else {
						// Replace Ampersand (and)
						//****************************************************************
						if (this.cinemascore.state < 2 && title.includes("&")) {
							var temp = title.replace('&', 'and');
							this.getCinema(letterboxd.helpers.getValidASCIIString(temp), 'all');
						}

						// Search After Hyphen (-)
						//****************************************************************
						if (this.cinemascore.state < 2 && title.includes(" - ")) {
							var temp = title.split(" - ");
							if (temp[1].toUpperCase().includes("THE MOVIE")) {
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp[0]), 'begin');
							} else {
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp[1]), 'end');
							}
						}

						// Search After Colon (:)
						//****************************************************************
						if (this.cinemascore.state < 2 && title.includes(": ")) {
							var temp = title.split(": ");
							if (temp[1].toUpperCase().includes("THE MOVIE")) {
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp[0]), 'begin');
							} else {
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp[1]), 'end');
							}
						}

						// Search Before Colon (:)
						//****************************************************************
						if (this.cinemascore.state < 2 && title.includes(": ")) {
							var temp = title.split(": ");
							if (temp[1].toUpperCase().includes("THE MOVIE")) {
								// Already done before
							} else {
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp[0]), 'begin');
							}
						}

						// Replace Numbers with Roman Numerals
						//****************************************************************
						const res = /( [0-9]+)/g;
						if (this.cinemascore.state < 2 && res.test(title)) {
							var num = title.substring(title.search(res), title.length).trim();
							var roman = letterboxd.helpers.romanize(parseInt(num));
							var temp = title.replace(res, " " + roman);

							this.getCinema(letterboxd.helpers.getValidASCIIString(temp), 'all');
						}

						// Search before roman numerals
						//****************************************************************
						var romanExp = new RegExp(/\b(M{1,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|C?D|D?C{1,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|X?L|L?X{1,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|I?V|V?I{1,3}))\b/);
						if (this.cinemascore.state < 2 && title.match(romanExp)) {
							var match = title.match(romanExp)[0];
							var temp = title.split(match);
							temp = temp[0].trim();

							if (temp != "") {
								this.getCinema(letterboxd.helpers.getValidASCIIString(temp), 'begin');
							}
						}
					}
				});
			}
		},

		getCinema(title, titleType) {
			var encoded = letterboxd.helpers.encodeASCII(title);
			var url = "https://webapp.cinemascore.com/guest/search/title/" + encoded;
			browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: url }, (data) => {
				if (letterboxd.helpers.ValidateResponse("Cinemascore", data) == false){
					return;
				}

				var value = data.response;
				if (this.cinemascore.data == null) {
					this.cinemascore.data = value;
				} else {
					this.cinemascore.data = [].concat(this.cinemascore.data, value);
				}

				if (this.verifyCinema(value, title, titleType)) {
					this.addCinema();
				}
			});
		},

		verifyCinema(data, title, titleType) {
			if (this.cinemascore.state < 2 && data != null && data.length > 0 && data[0].GRADE != "") {
				var romanExp = new RegExp(/\b(M{1,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|C?D|D?C{1,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|X?L|L?X{1,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|I?V|V?I{1,3}))\b/);
				var numeric = new RegExp(/([0-9]+)/);
				const year = this.letterboxdYear;


				var years = [year, "", "", ""];

				if (this.omdbData.data != null && this.omdbData.data.Year != null && this.omdbData.data.Year != "N/A") {
					years[1] = this.omdbData.data.Year;
				} else if (this.omdbData.data != null) {
					years[1] = (new Date(this.omdbData.data.Released)).getFullYear().toString();
				}
				if (this.wikiData.date.value != null) {
					years[2] = (new Date(this.wikiData.date.value)).getFullYear().toString();
				}
				if (this.wikiData.date_origin.value != null) {
					years[3] = (new Date(this.wikiData.date_origin.value)).getFullYear().toString();
				}

				var result = null;
				// Get the correct score
				for (var ii = 0; ii < data.length; ii++) {
					// Check to see if the year cinemascore uses is one of the years we have
					if (data[ii].YEAR != null && years.includes(data[ii].YEAR)) {
						var found = false;

						if (titleType == "all") {
							var withYear = title.toUpperCase() + ' (' + data[ii].YEAR + ')';
							// If Exact
							if (data[ii].TITLE == title.toUpperCase() || data[ii].TITLE == withYear) {
								found = true;
							} else if (title.match(/^[0-9]+$/) && data[ii].TITLE == title + "**") {
								found = true;
							} else {
								// If not, make sure it starts with the exact title
								var reg = new RegExp('^(' + title + '){1}( |,|\\.|:|-|$)', 'i')
								found = data[ii].TITLE.match(reg);
							}

						} else if (titleType == "end") {
							// Make sure it ends with the searched title
							var reg = new RegExp('(' + title + '){1}$', 'i')
							found = data[ii].TITLE.match(reg);
						} else if (titleType == "begin") {
							// Make sure it begins with the searched title
							var reg = new RegExp('^(' + title + '){1}( |,|\\.|:|-|$)', 'i')
							found = data[ii].TITLE.match(reg);
						}

						if ((this.letterboxdTitle.match(romanExp) || this.letterboxdTitle.match(numeric)) && !(data[ii].TITLE.match(romanExp) || data[ii].TITLE.match(numeric))) {
							found = false;
						}

						if (found) {
							result = data[ii];
							break;
						}
					}
				}

				if (result != null) {
					this.cinemascore.result = result;
					return true;
				}
			}
			return false;
		},

		addCinema() {
			if (document.querySelector('.cinemascore')) return;

			if (this.cinemascore.result != null && this.cinemascore.state < 2) {
				this.cinemascore.state = 2;

				// Add the section to the page
				const section = letterboxd.helpers.createElement('section', {
					class: 'section ratings-histogram-chart cinemascore ratings-extras'
				});

				// Add the Header
				const heading = letterboxd.helpers.createElement('h2', {
					class: 'section-heading section-heading-extras',
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
				this.appendRating(section, 'cinemascore');
			}
		},

		searchSensCritique() {
			this.sensCritique.state = 1;

			var title = this.letterboxdTitle;
			var type = "movie";
			if (this.letterboxdNativeTitle != null && this.letterboxdNativeTitle.match(/[A-Za-z0-9]/i)) title = this.letterboxdNativeTitle;
			if (this.tmdbTV == true) type = "tvShow"

			var url = "https://apollo.senscritique.com/";
			var options = letterboxd.helpers.getSensSearchQuery(type, title);

			browser.runtime.sendMessage({ name: "GETDATA", type: "JSON", url: url, options: options }, (value) => {
				if (letterboxd.helpers.ValidateResponse("SensCritique search", value) == false){
					return;
				}

				this.sensCritique.state = 2;
				var sens = value.response;
				if (sens.data != null && sens.data.results != null) {
					sens = sens.data.results.hits.items;
					var results = [];
					for (var i = 0; i < sens.length; i++) {
						var result = { score: 0, data: sens[i] };

						if (sens[i].product != null){

							// Get directors/creators/producers
							var directors = [];
							if (sens[i].product.directors != null)
								directors = directors.concat(sens[i].product.directors);
							if (sens[i].product.creators != null)
								directors = directors.concat(sens[i].product.creators);
							if (sens[i].product.producers != null)
								directors = directors.concat(sens[i].product.producers);
								
							// Match based on directors/producers/creators
							for (var k = 0; k < directors.length; k++) {
								// Director name to lowercase and removed diacritics
								var director = directors[k].name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
								if (this.letterboxdDirectorsAlt.includes(director)) {
									result.score = 100 - Math.abs((parseInt(this.letterboxdYear)) - parseInt(sens[i].fields.year))
									break;
								}
							}
							// Match based on exact name and year match
							if (result.score == 0 && this.letterboxdTitle == sens[i].product.title && this.letterboxdYear == sens[i].fields.year) {
								result.score = 90;
							}

							// Only consider it a match if greater or equal to 90 score
							if (result.score >= 90) {
								results.push(result);
							}
						}
					}
					if (results.length > 0) {
						results.sort((a, b) => { return b.score - a.score });
						this.sensCritique.data = results[0].data;
						this.addSensCritique();
					}
				}
			});
		},

		addSensCritique() {
			if (document.querySelector('.sens-ratings')) return;

			if (!document.querySelector('.sidebar')) return;

			if (this.sensCritique.data == null) return;

			var url = "";
			if (this.sensCritique.data.fields != null && this.sensCritique.data.fields.url != null) {
				url = this.sensCritique.data.fields.url;
			} else {
				url = "https://www.senscritique.com" + this.sensCritique.data.product.url
			}

			// Lets add it to the page
			//***************************************************************
			// Add the section to the page

			const section = letterboxd.helpers.createChartSection(
				'sens',
				{
					href: url,
					style: 'height: 25px; width: 110px; position: absolute; background-image: url("' + browser.runtime.getURL("images/senscritique-logo.svg") + '");'
				},
				''
			);

			var showDetails = null;
			if (this.isMobile) {
				// Add the Show Details button
				showDetails = letterboxd.helpers.createShowDetailsButton("sens", "sens-score-details");
				section.append(showDetails);
			}

			// Score
			//***************************************************************
			var rating = this.sensCritique.data.product.rating;
			var ratingCount = this.sensCritique.data.product.stats.ratingCount;
			var recommendCount = this.sensCritique.data.product.stats.recommendCount;

			this.addLink(url);

			// Do not display if there is no score or ratings
			if (rating == null && ratingCount == 0) return;

			const container = letterboxd.helpers.createElement('span', {}, {
				['display']: 'block',
				['margin-bottom']: '10px'
			});

			// The span that holds the score
			const span = letterboxd.helpers.createElement('div', {}, {
				['display']: 'inline-block',
				['width']: 'auto'
			});

			// The element that is the score itself
			const ratingHolder = letterboxd.helpers.createElement('a', {
				class: 'tooltip tooltip-extra sens-score'
			});

			const ratingIcon = letterboxd.helpers.createElement('span', {
				class: 'sens-score-icon'
			});
			ratingHolder.append(ratingIcon);

			const ratingText = letterboxd.helpers.createElement('span', {
				class: 'display-rating -highlight'
			});
			ratingHolder.append(ratingText);

			var suffix = "/10";

			// Add the hoverover text and href
			var tooltip = 'No score available';
			if (ratingCount > 0 && rating == null) {
				tooltip = ratingCount.toLocaleString() + ' rating';
				if (ratingCount > 1) tooltip += "s";
				rating = "N/A";

			} else if (ratingCount > 0) {
				if (letterboxd.storage.get('convert-ratings') === "5"){
					suffix = "/5";
					rating = Number(rating / 2).toFixed(1);
				}
				tooltip = "Weighted average of " + rating + suffix + " based on " + ratingCount.toLocaleString() + ' ratings';

			} else {
				rating = "N/A";
			}
			ratingHolder.setAttribute('data-original-title', tooltip);
			ratingHolder.setAttribute('href', url + "/critiques");

			ratingText.innerText = rating;
			
			if (rating >= 6.5){
				ratingHolder.className += ' green';
				ratingIcon.style['background-image'] = 'url("' + browser.runtime.getURL("images/senscritique-icon-green.svg") + '")';
			}else{
				ratingIcon.style['background-image'] = 'url("' + browser.runtime.getURL("images/senscritique-icon-white.svg") + '")';
			}

			span.append(ratingHolder);
			container.append(span);

			// Number of ratings and likes text
			//***************************************************************
			const textSpan = letterboxd.helpers.createElement('div', {}, {
				['display']: 'inline-block',
				['width']: 'auto',
				['vertical-align']: 'top'
			});

			if (letterboxd.storage.get('sens-favorites-enabled') === true) {
				// Recommend Count
				const text2 = letterboxd.helpers.createElement('p', {
					class: 'display-rating sens-text'
				});
				text2.innerText = "♥ " + recommendCount.toLocaleString();
				textSpan.append(text2);
			}

			container.append(textSpan);
			section.append(container);

			// Add the tooltip as text for mobile
			letterboxd.helpers.createDetailsText('sens', section, tooltip, this.isMobile);

			// APPEND to the sidebar
			//************************************************************
			this.appendRating(section, 'sens-ratings');

			// Add Hover events
			//************************************************************
			letterboxd.helpers.addTooltipEvents(section);
		},

		appendRating(rating, className) {
			var order = letterboxd.storage.get('ratings-order');

			var index = order.indexOf(className);
			var sidebar = document.querySelector('.sidebar');

			if (this.hideRatings === true) {
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

		initTSPDT() {
			// Make the call now and save the data for later
			var url = "https://www.theyshootpictures.com/gf1000_all1000films.htm";
			this.tspdt.state = 1;
			browser.runtime.sendMessage({ name: "GETDATA", url: url }, (value) => {
				if (letterboxd.helpers.ValidateResponse("TSPDT list", value) == false){
					return;
				}

				this.tspdt.raw = value.response;
				this.tspdt.data = letterboxd.helpers.parseHTML(this.tspdt.raw);

				this.tspdt.state = 2;
			});
		},

		getTSPDTListURL() {
			// Get the letterboxd list from the page
			var url = "https://www.theyshootpictures.com/gf1000_links2.htm";
			browser.runtime.sendMessage({ name: "GETDATA", url: url }, (value) => {
				if (letterboxd.helpers.ValidateResponse("TSPDT link", value) == false){
					return;
				}

				const data = letterboxd.helpers.parseHTML(value.response);
				var list = data.querySelectorAll('#stacks_in_9823 span');

				var listURL = "";
				for (var i = 0; i < list.length; i++) {
					// Get URL
					var a = list[i].querySelector('a');
					if (a != null && a.hasAttribute('href') && a.getAttribute('href').includes('letterboxd.com/')) {
						listURL = a.getAttribute('href');
					}
					// Verify the URL is for the correct letterboxd list
					var em = list[i].querySelector('em');
					if (em != null && listURL != "" && em.innerText == '1,000 Greatest Films') {
						this.tspdt.listURL = listURL;
						break;
					}
				}

				// Set backup URL just in case
				if (this.tspdt.listURL == null) {
					this.tspdt.listURL = "https://letterboxd.com/thisisdrew/list/they-shoot-pictures-dont-they-1000-greatest-5/"
				}
			});
		},

		verifyTSPDT() {
			// Now that the data has been collected from TSPDT and WikiData, verify
			this.tspdt.state = 3;

			// Get list from page
			var list = this.tspdt.data.querySelector("div #stacks_out_1772 div div div");
			if (list != null) {
				list = list.innerHTML;
				list = list.replaceAll('<br>', '\n');
				list = list.replaceAll('&amp;', '&');
			} else {
				console.error("Letterboxd Extras | Error while processing TSPDT");
				return;
			}

			// Make changes to the title to account for differences between letterboxd tspdt
			var title = this.letterboxdTitle.toUpperCase();
			title = title.replaceAll(",", ",*"); // To account for JEANNE DIELMAN
			title = title.replaceAll(":", ":*"); // To account for THE GODFATHER PART II
			title = title.replaceAll("’", "(’|')"); // To account for L'ATALANTE
			title = title.replaceAll("(", "\\("); // To account for HISTOIRE(S) DU CINÉMA
			title = title.replaceAll(")", "\\)"); // To account for HISTOIRE(S) DU CINÉMA
			title = title.replaceAll(" AND", "( &| AND)") // To account for THE GLEANERS & I 
			title = title.replaceAll("?", "\\?") // To account for WHERE IS THE FRIEND'S HOUSE?
			title = title.replaceAll(".", "\\.") // To account for MADAME DE...
			title = title.replaceAll("…", "\\.\\.\\.") // To account for MADAME DE...
			title = title.replaceAll("\\.\\.\\.\\.", "…\\.") // To account for IF...
			title = title.replaceAll(/PART I\b/g, "(PART I|PART 1)") // To account for IVAN THE TERRIBLE, PART 1
			title = title.replaceAll(/PART II\b/g, "(PART II|PART 2)") // To account for IVAN THE TERRIBLE, PART 2

			var nativeTitle = "";
			if (this.letterboxdNativeTitle != null) {
				nativeTitle = "|" + this.letterboxdNativeTitle.toUpperCase();
				nativeTitle = nativeTitle.replaceAll("?", "\\?")
				nativeTitle = nativeTitle.replaceAll("(", "\\("); // To account for SAUVE QUI PEUT (LA VIE)
				nativeTitle = nativeTitle.replaceAll(")", "\\)"); // To account for SAUVE QUI PEUT (LA VIE)
				nativeTitle = nativeTitle.replaceAll(".", "\\.") // To account for MADAME DE...
				nativeTitle = nativeTitle.replaceAll("…", "\\.\\.\\.") // To account for MADAME DE...
			}

			var altTitle = "";
			if (this.wikiData.Alt_Title != null && this.letterboxdTitle != this.wikiData.Alt_Title && this.letterboxdNativeTitle != this.wikiData.Alt_Title) {
				altTitle = "|" + this.wikiData.Alt_Title.toUpperCase();
				altTitle = altTitle.replaceAll("?", "\\?")
				altTitle = altTitle.replaceAll(/PART I\b/g, "(PART I|PART 1)") // To account for IVAN THE TERRIBLE, PART 1
				altTitle = altTitle.replaceAll(/PART II\b/g, "(PART II|PART 2)") // To account for IVAN THE TERRIBLE, PART 2
				altTitle = altTitle.replaceAll(".", "\\.") // To account for IF...
			}

			var nfdTitle = "";
			if (title.match(new RegExp("[À-ÖØ-öø-ÿ]"))) {
				nfdTitle = "|" + title.normalize('NFKD').replace(/[^\w\s.-_\/]/g, '') // To account for EL
			}

			var shortTitle = "";
			if (title.includes(':')) {
				shortTitle = "|" + title.substring(0, title.indexOf(':'));
			}

			var altTitle2 = "";
			var altTitleList = document.querySelector('div.text-indentedlist p') // To account for Dream of Light/The Quince Tree Sun
			if (altTitleList != null) {
				altTitleList = altTitleList.innerText.toUpperCase();
				altTitleList = altTitleList.split(', ');
				if (altTitleList.length > 0) {
					altTitle2 = altTitleList[0];
					altTitle2 = altTitle2.replaceAll("\n", "");
					altTitle2 = altTitle2.replaceAll("\t", "");

					altTitle2 = "|" + altTitle2;
				}
			}
			if (title.includes('COLOR')) {
				altTitle2 += "|" + title.replaceAll('COLOR', 'COLOUR'); // To account for The Color of Pomegranates
			}
			altTitle2 += letterboxd.helpers.getTSPDTAltTitles(this.letterboxdTitle, this.letterboxdYear);

			// Add alternate titles from LB
			var altTitleList = document.querySelector('div.text-indentedlist p') // To account for Dream of Light/The Quince Tree Sun
			if (altTitleList != null) {
				altTitleList = altTitleList.innerText.toUpperCase();
				altTitleList = altTitleList.split(', ');
				altTitleList.forEach(x => {
					x = x.toUpperCase();
					x = x.replaceAll('\n', '');
					x = x.replaceAll('.', '\\.');
					x = x.replaceAll('?', '\\.');
					altTitle2 += "|" + x;
				});
			}


			var director = this.letterboxdDirectors[0];
			director = director.replaceAll(".", "\\.") // To account for F. W. Murnau
			if (this.letterboxdDirectors.length == 2) {
				director += "|" + this.letterboxdDirectors[0] + " & " + this.letterboxdDirectors[1]; // TO account for SINGIN' IN THE RAIN Stanley Donen & Gene Kelly
				director += "|" + this.letterboxdDirectors[1] + " & " + this.letterboxdDirectors[0];
			}
			else if (this.letterboxdDirectors.length == 3) {
				director += "|" + this.letterboxdDirectors[0] + ", " + this.letterboxdDirectors[1] + " & " + this.letterboxdDirectors[2]; // TO account for Airplane!
				director += "|" + this.letterboxdDirectors[0] + ", " + this.letterboxdDirectors[2] + " & " + this.letterboxdDirectors[1]; // TO account for Airplane!
				director += "|" + this.letterboxdDirectors[1] + ", " + this.letterboxdDirectors[0] + " & " + this.letterboxdDirectors[2]; // TO account for Airplane!
				director += "|" + this.letterboxdDirectors[1] + ", " + this.letterboxdDirectors[2] + " & " + this.letterboxdDirectors[0]; // TO account for Airplane!
				director += "|" + this.letterboxdDirectors[2] + ", " + this.letterboxdDirectors[0] + " & " + this.letterboxdDirectors[1]; // TO account for Airplane!
				director += "|" + this.letterboxdDirectors[2] + ", " + this.letterboxdDirectors[1] + " & " + this.letterboxdDirectors[0]; // TO account for Airplane!
			}

			// Regex match - include match with director (for HISTOIRE(S) DU CINÉMA) or year (for  LOS OLVIDADOS)
			var regex = new RegExp("([0-9]{1,4})\\. \\(([0-9]{1,4}|—|—-)\\) (" + title + nativeTitle + altTitle + nfdTitle + shortTitle + altTitle2 + ") (\\((" + director + "),|\\([A-Za-zÀ-ÖØ-öø-ÿ&.\\- ]+, " + this.letterboxdYear + ",)");
			if (list.match(regex)) {
				this.tspdt.found = true;
				this.tspdt.ranking = list.match(regex)[1];
			}
			// Alternate match - looser with the title, stricter with requiring BOTH director and year - to account for THE MAN WITH A MOVIE CAMERA
			regex = new RegExp("([0-9]{1,4})\\. \\(([0-9]{1,4}|—|—-)\\) .*(" + title + nativeTitle + altTitle + nfdTitle + shortTitle + altTitle2 + ").* (\\(" + director + ", " + this.letterboxdYear + ",)");
			if (list.match(regex)) {
				this.tspdt.found = true;
				this.tspdt.ranking = list.match(regex)[1];
			}

			if (this.tspdt.found) {
				this.addTSPDT();
			}
		},

		addTSPDT() {
			if (document.querySelector('.tspdt-ranking')) return;

			if (this.isMobile) {
				if (!document.querySelector('.sidebar')) return;
			} else {
				if (!document.querySelector('.production-statistic-list')) return;
			}

			// Lets add it to the page
			//***************************************************************
			// create the li
			const li = letterboxd.helpers.createElement('li', {
				class: 'stat tspdt-ranking extras-ranking'
			});

			// Determine list page number
			var url = this.tspdt.listURL;
			var page = Math.ceil(this.tspdt.ranking / 100);
			if (page > 1) {
				url += 'page/' + page + '/';
			}

			const a = letterboxd.helpers.createElement('a', {
				class: 'icon-16 tooltip tooltip-extra',
				style: 'padding-left: 0px',
				href: url
			});
			li.append(a);
			a.innerText = "🎥 " + this.tspdt.ranking;
			var tooltip = '№ ' + this.tspdt.ranking + " in \"They Shoot Pictures, Don't They?\" Top 1000"
			a.setAttribute('data-original-title', tooltip);

			// Add the tooltip as text for mobile
			if (this.isMobile) {
				const detailsSpan = letterboxd.helpers.createElement('span', {
					class: 'mobile-ranking-details',
					style: 'display:none'
				});

				const detailsText = letterboxd.helpers.createElement('p', {
				});
				detailsText.innerText = tooltip;
				detailsSpan.append(detailsText);

				li.append(detailsSpan);
			}

			// Add to page
			this.appendRanking(li, 'tspdt-ranking');

			// Add the hover events
			//*****************************************************************
			letterboxd.helpers.addTooltipEvents(li);

		},

		initBFI() {
			// Make the call now and save the data for later
			var url = "https://www.bfi.org.uk/sight-and-sound/greatest-films-all-time";
			this.bfi.state = 1;
			browser.runtime.sendMessage({ name: "GETDATA", url: url }, (value) => {
				if (letterboxd.helpers.ValidateResponse("BFI", value) == false){
					return;
				}

				this.bfi.raw = value.response;
				this.bfi.data = letterboxd.helpers.parseHTML(value);

				this.bfi.state = 2;
			});
		},

		verifyBFI() {
			// Now that the data has been collected from BFI and WikiData, verify
			this.bfi.state = 3;

			// Get list from page
			if (this.bfi.raw.includes("var initialPageState = ")) {
				var list = letterboxd.helpers.getTextBetween(this.bfi.raw, "var initialPageState = ", "</script>");
				list = JSON.parse(list);
				list = list.componentState.results;
			} else {
				console.error("Letterboxd Extras | Error while processing BFI");
				return;
			}

			// Make changes to the title to account for differences between letterboxd and BFI
			var title = this.letterboxdTitle.toUpperCase(); // Make uppercase to account for difference capitalization (Histoire(s) du cinéma)
			title = title.replaceAll("’", "'") // To account for Where Is the Friend's House? and L'Atalante
			var titles = [
				title
			];

			if (title.includes(',')) {
				titles.push(title.replaceAll(',', ''));
			}
			if (title.includes('…')) {
				titles.push(title.replaceAll('…', '...')); // To account for Madame de…
			}
			if (title.includes('COLOR')) {
				titles.push(title.replaceAll('COLOR', 'COLOUR')); // To account for The Color of Pomegranates
			}

			if (this.letterboxdNativeTitle != null) {
				var nativeTitle = this.letterboxdNativeTitle.toUpperCase();
				titles.push(nativeTitle);

				if (nativeTitle.includes('…')) {
					titles.push(nativeTitle.replaceAll('…', '...')); // To account for Madame de…
				}
			}

			if (this.letterboxdTitle.includes("’")) {
				titles.push(this.letterboxdTitle.toUpperCase().replaceAll('’', "' ")); // To account for L' eclisse
			}
			if (this.letterboxdTitle.includes("'")) {
				titles.push(this.letterboxdTitle.toUpperCase().replaceAll("'", "' ")); // To account for L' eclisse
			}

			if (this.wikiData.Alt_Title != null && this.letterboxdTitle != this.wikiData.Alt_Title && this.letterboxdNativeTitle != this.wikiData.Alt_Title) {
				var altTitle = this.wikiData.Alt_Title.toUpperCase();
				titles.push(altTitle);
			}

			if (title.match(new RegExp("[À-ÖØ-öø-ÿ]"))) {
				var nfdTitle = title.normalize('NFKD').replace(/[^\w\s.-_\/]/g, '')
				titles.push(nfdTitle);
			}

			// Add alternate titles from LB to array
			var altTitleList = document.querySelector('div.text-indentedlist p') // To account for Dream of Light/The Quince Tree Sun
			if (altTitleList != null) {
				altTitleList = altTitleList.innerText.toUpperCase();
				altTitleList = altTitleList.split(', ');
				titles = titles.concat(altTitleList);
			}

			const bfiYear = letterboxd.helpers.getBFIYear(this.letterboxdTitle, this.letterboxdYear);

			var directors = [this.letterboxdDirectors[0]];
			// Add co-directors, in both orders
			if (this.letterboxdDirectors.length >= 2) {
				directors.push(this.letterboxdDirectors[0] + ", " + this.letterboxdDirectors[1]);
				directors.push(this.letterboxdDirectors[1] + ", " + this.letterboxdDirectors[0]); // To account for Singin' in the Rain
			}
			// If the director has a middle name, add alt with shortened middle name
			if ((this.letterboxdDirectors[0].split(" ").length - 1) == 2) {
				var regex = new RegExp("[A-Za-z]+ ([A-Za-z]{2,}) [A-Za-z]+");
				if (this.letterboxdDirectors[0].match(regex)) {
					var middle = this.letterboxdDirectors[0].match(regex)[1];
					var newMiddle = middle.substring(0, 2) + ".";
					directors.push(this.letterboxdDirectors[0].replace(middle, newMiddle)); // To account for The Passion of Joan of Arc
				}
			}

			// Match film to BFI list
			const result = list.filter((x) =>
				(titles.includes(x.film.name.toUpperCase().trim()) || titles.includes(x.film.name.toUpperCase().trim().replaceAll(',', ''))) &&
					(x.film.year == bfiYear || directors.includes(x.film.credits.director)));

			if (result.length > 0) {
				this.bfi.found = true;
				this.bfi.ranking = result[0].rank;

				this.bfi.listIndex = list.length - list.indexOf(result[0]);
			}

			// If found, add
			if (this.bfi.found) {
				this.addBFI();
			}
		},

		addBFI() {
			if (document.querySelector('.bfi-ranking')) return;

			try{
				if (this.isMobile) {
					if (!document.querySelector('.sidebar')) return;
				} else {
					if (!document.querySelector('.production-statistic-list')){
						throw new Error("Unable to locate the production-statistic-list on the Letterboxd page!");
					}
				}

				// Lets add it to the page
				//***************************************************************
				// create the li
				const li = letterboxd.helpers.createElement('li', {
					class: 'stat bfi-ranking extras-ranking'
				});

				// Determine list page number
				var url = 'https://letterboxd.com/bfi/list/sight-and-sounds-greatest-films-of-all-time/';
				var page = Math.ceil(this.bfi.listIndex / 100);
				if (this.bfi.ranking == "196") {
					page = letterboxd.helpers.getBFIListPage(this.bfi.ranking, this.letterboxdTitle, this.letterboxdYear);
				}
				if (page > 1) {
					url += 'page/' + page + '/';
				}

				const a = letterboxd.helpers.createElement('a', {
					class: 'has-icon icon-16 tooltip tooltip-extra',
					href: url
				});
				li.append(a);
				a.innerText = this.bfi.ranking;
				var tooltip = '№ ' + this.bfi.ranking + " in \"BFI Sight and Sound\" Top 250";
				a.setAttribute('data-original-title', tooltip);

				const span = letterboxd.helpers.createElement('span', {
					class: 'icon',
					style: 'background: url(' + browser.runtime.getURL('/images/bfi-logo.svg') + ')'
				});
				a.append(span);

				// Add the tooltip as text for mobile
				if (this.isMobile) {
					const detailsSpan = letterboxd.helpers.createElement('span', {
						class: 'mobile-ranking-details',
						style: 'display:none'
					});

					const detailsText = letterboxd.helpers.createElement('p', {
					});
					detailsText.innerText = tooltip;
					detailsSpan.append(detailsText);

					li.append(detailsSpan);
				}

				// Add to page
				this.appendRanking(li, 'bfi-ranking');

				// Add the hover events
				//*****************************************************************
				letterboxd.helpers.addTooltipEvents(li);
					
			}catch (error){
				console.error("Letterboxd Extras | BFI error: " + error)
			}
		},

		appendRanking(ranking, className) {
			// Create the ul element if needed
			var extrasStats = document.querySelector('.extras-stats')
			if (extrasStats == null) {
				extrasStats = letterboxd.helpers.createElement('ul', {
					class: 'production-statistic-list extras-stats'
				});
				if (this.isMobile) {
					// Add to page
					extrasStats.className += ' extras-ranking-mobile';
					document.querySelector('.production-masthead .details').append(extrasStats);

					// Add the Show Details button
					const showDetails = letterboxd.helpers.createShowDetailsButton("film-stats", "mobile-ranking-details")
					showDetails.className = "film-stats-show-details";
					extrasStats.before(showDetails);
				} else {
					// Add to page
					document.querySelector('.production-statistic-list').after(extrasStats);
				}
			}

			// Order of rankings
			var order = [
				'.tspdt-ranking',
				'.bfi-ranking'
			];

			var index = order.indexOf('.' + className);

			// First
			for (var i = index + 1; i < order.length; i++) {
				var temp = extrasStats.querySelector(order[i]);
				if (temp != null) {
					temp.before(ranking);
					return;
				}
			}

			// Second
			for (var i = index - 1; i >= 0; i--) {
				var temp = extrasStats.querySelector(order[i]);
				if (temp != null) {
					temp.after(ranking);
					return;
				}
			}

			// Third
			extrasStats.append(ranking);
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

			this.addLink(this.allocine.url);

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

			// Add the Show Details button
			if (this.isMobile) {
				const showDetails = letterboxd.helpers.createShowDetailsButton("allocine", "allocine-score-details");
				section.append(showDetails);
			}

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

					criticSpan.append(letterboxd.helpers.createAllocineCriticScore(letterboxd, "ratings-style", this.allocine.critic.rating, this.allocine.critic.num_ratings, null, this.allocine.urlCritic, this.isMobile));
					criticSpan.append(letterboxd.helpers.createAllocineStars(this.allocine.critic.rating));
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

					userSpan.append(letterboxd.helpers.createAllocineCriticScore(letterboxd, "ratings-style", this.allocine.user.rating, this.allocine.user.num_ratings, this.allocine.user.num_reviews, this.allocine.urlUser, this.isMobile));
					userSpan.append(letterboxd.helpers.createAllocineStars(this.allocine.user.rating));
					section.append(userSpan);
				}

				// Add the tooltip as text for mobile
				// Critic Rating Tooltip
				var criticScore = section.querySelector(".allocine-critic-score .allocine-critic .tooltip");
				if (criticScore != null) {
					var tooltip = criticScore.getAttribute('data-original-title');
					letterboxd.helpers.createDetailsText('allocine', section, tooltip, this.isMobile);
				}

				// User Rating Tooltip
				var userScore = section.querySelector(".allocine-user-score .allocine-critic .tooltip");
				if (userScore != null) {
					var tooltip = userScore.getAttribute('data-original-title');
					letterboxd.helpers.createDetailsText('allocine', section, tooltip, this.isMobile);
				}

			} else {
				// Histogram Graph
				//***************************************************************

				// Add the div to hold the toggle buttons
				// Div to hold buttons
				const buttonDiv = letterboxd.helpers.createElement('div', {
					class: 'allocine-buttons',
					style: 'display: block;'
				});
				section.append(buttonDiv);

				buttonDiv.append(letterboxd.helpers.createTomatoButton("allocine-button allo-user", "USER", "allocine-user-score", true, false, this.isMobile));
				buttonDiv.append(letterboxd.helpers.createTomatoButton("allocine-button allo-critic", "CRITIC", "allocine-critic-score", false, (this.allocine.critic.rating == 0), this.isMobile));
				if (letterboxd.storage.get('allocine-users-enabled') != true || letterboxd.storage.get('allocine-critic-enabled') != true) {
					buttonDiv.style['display'] = "none";
				}

				// User score - user rt-score-div so I can reuse changeTomatoScore
				const userSpan = letterboxd.helpers.createElement('span', {
					class: 'allocine-user-score rt-score-div',
					style: 'position: relative; display: block;'
				});

				userSpan.append(letterboxd.helpers.createHistogramScore(
					letterboxd.storage, 
					"allocine", 
					this.allocine.user.rating, 
					this.allocine.user.num_reviews, 
					this.allocine.urlUser, 
					this.isMobile
				));

				userSpan.append(letterboxd.helpers.createHistogramGraph(
					letterboxd.storage, 
					"allocine", 
					this.allocine.urlUser, 
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
					class: 'allocine-critic-score rt-score-div',
					style: 'position: relative; display: block; height: 44px; display:none;'
				});
				criticSpan.append(letterboxd.helpers.createAllocineCriticScore(letterboxd, "allocine", this.allocine.critic.rating, this.allocine.critic.num_ratings, null, this.allocine.urlCritic, this.isMobile));
				criticSpan.append(letterboxd.helpers.createAllocineStars(this.allocine.critic.rating));
				section.append(criticSpan);

				// Add the tooltip as text for mobile
				// User Rating Tooltip
				var userScore = section.querySelector(".allocine-user-score .average-rating .tooltip");
				if (userScore != null) {
					var tooltip = userScore.getAttribute('data-original-title');
					letterboxd.helpers.createDetailsText('allocine', section.querySelector(".allocine-user-score"), tooltip, this.isMobile);
				}

				// Critic Rating Tooltip
				var criticScore = section.querySelector(".allocine-critic-score .allocine-critic .tooltip");
				if (criticScore != null) {
					var tooltip = criticScore.getAttribute('data-original-title');
					letterboxd.helpers.createDetailsText('allocine', section.querySelector(".allocine-critic-score"), tooltip, this.isMobile);
				}
			}

			// APPEND to the sidebar
			//************************************************************
			this.appendRating(section, 'allocine-ratings');

			// Add click event for score buttons
			//************************************************************
			//if (letterboxd.storage.get('allocine-style') === "histogram" && letterboxd.storage.get('allocine-critic-enabled') === true){
			if (section.querySelector('.rt-button.allo-button')) {
				if (this.allocine.critic.rating != 0 && (letterboxd.storage.get('allocine-default-view') === 'critic' || letterboxd.storage.get('allocine-users-enabled') != true)) {
					section.querySelector(".rt-button.allo-critic").click();
				}
			}

			// Add the hover events
			//*****************************************************************
			letterboxd.helpers.addTooltipEvents(section);
		},

		async initDDD(){
			this.ddd.state = 1;
			var options = {
				method: 'GET',
					  headers: {
					"Accept": "application/json",
					'X-API-KEY': letterboxd.storage.get("ddd-apikey")
				}
			};

			// Call the ddd API with the IMDB query 
			var url = "https://www.doesthedogdie.com/dddsearch?imdb=" + this.imdbID;
			if (this.imdbID != ''){
				const response = await new Promise((resolve, reject) => {
					browser.runtime.sendMessage({ name: "GETDATA", url: url, options: options, type: "JSON" }, (value) => {
						if (letterboxd.helpers.ValidateResponse("DDD IMDb", value) == false){
							reject(new Error("Invalid response"));
							return;
						}
        					resolve(value);
					});
				});
				var result = response.response;
				if (result.items != null && result.items.length > 0) {
					var item = result.items[0];
					if (item.tmdbId > 0 && item.tmdbId != parseInt(this.tmdbID)){
						// uh oh, DDD has the wrong movie???
						// Found with https://letterboxd.com/film/the-hunt-2012/
					}else{
						this.ddd.data = item;
						this.ddd.state = 2;
					}
				}
			}

			// If not found with the first call, do the search query instead
			if (this.ddd.data == null){
				// Search for title
				url = "https://www.doesthedogdie.com/dddsearch?q=" + this.letterboxdTitle;
				var response = await new Promise((resolve, reject) => {
					browser.runtime.sendMessage({ name: "GETDATA", url: url, options: options, type: "JSON" }, (value) => {
						if (letterboxd.helpers.ValidateResponse("DDD Search", value) == false){
							reject(new Error("Invalid response"));
							return;
						}
        					resolve(value);
					});
				});					
				var result = response.response;

				// Search for native title as well
				if (this.letterboxdNativeTitle != null && this.letterboxdNativeTitle != ""){
					url = "https://www.doesthedogdie.com/dddsearch?q=" + this.letterboxdNativeTitle;
					response = await new Promise((resolve, reject) => {
						browser.runtime.sendMessage({ name: "GETDATA", url: url, options: options, type: "JSON" }, (value) => {
							if (letterboxd.helpers.ValidateResponse("DDD Search", value) == false){
								reject(new Error("Invalid response"));
								return;
							}
							resolve(value);
						});
					});
					if (result.items != null && response.response.items != null)
						result.items = result.items.concat(response.response.items);
				}

				if (result.items != null && result.items.length > 0){
					for (var i = 0; i < result.items.length; i++){
						var item = result.items[i];
						var itemType = item.itemType.name;

						// Make sure the item type matches the letterboxd movie
						if ((this.tmdbTV == true && itemType != "TV Show") || (this.tmdbTV == false && itemType != "Movie")){
							continue;
						}

						// Try to match on the TMDB ID
						if (item.tmdbId == this.tmdbID){
							// This is an exact match, set and exit out
							this.ddd.data = item;
							this.ddd.state = 2;
							break;
						}
						else if (item.tmdbId != null && item.tmdbId > 0){
							// DDD item has a tmdb ID that does not match letterboxd, lets continue instead of matching on the name
							continue;
						}

						// Try to match on the name
						if (item.name == this.letterboxdTitle && item.releaseYear == this.letterboxdYear || (item.name == this.letterboxdTitle + " " + this.letterboxdYear && item.releaseYear == this.letterboxdYear)){
							// Match based on name may not be accurate, don't exit so we can keep checking for a match based on TMDB if needed
							this.ddd.data = item;
							this.ddd.state = 2;
						}
					}
				}
			}

			if (this.ddd.state < 2 || this.ddd.data == null){
				console.log("Letterboxd Extras | Unable to locate DDD film page.");
				this.ddd.state = 3;
			}else{
				// Add link to the page
				this.ddd.id = this.ddd.data.id;
				this.addDDD();
			}
		},

		addDDD(){
			if (this.ddd.id != null){
				this.ddd.url = "https://www.doesthedogdie.com/media/" + this.ddd.id;
				this.addLink(this.ddd.url);
			}

			this.ddd.added = true;
		},

		getFilmarks() {
			this.filmarks.state = 1;
			var apiURL = "https://markuapi.apn.leapcell.app/" + this.filmarks.id;
				
			// Make Calls
			browser.runtime.sendMessage({ name: "GETDATA", url: apiURL, type: "JSON" }, (value) => {
				if (letterboxd.helpers.ValidateResponse("Filmarks", value) == false){
					return;
				}

				try {
					this.filmarks.data = value.response;
					this.filmarks.state = 2;
				} catch (error) {
					console.error(error);
					this.filmarks.state = 3; // Error
				}

				if (this.filmarks.state == 2 && this.filmarks.data != null){
					this.filmarks.movie = this.filmarks.data.data;
					this.addFilmarks();
				}
			});
		},

		searchFilmarks() {
			this.filmarks.state = 1;

			var isAnime = (this.myAnimeListHelper.id != null || this.anilistHelper.id != null);
			var apiURL = "https://markuapi.apn.leapcell.app/search/";
			if (this.tmdbTV && isAnime){
				apiURL += "animes?limit=20&q=" + encodeURIComponent(this.letterboxdTitle);
			}else if (this.tmdbTV){
				apiURL += "dramas?limit=20&q=" + encodeURIComponent(this.letterboxdTitle);
			}else{
				apiURL += "movies?limit=20&q=" + encodeURIComponent(this.letterboxdTitle);
			}
				
			// Make Calls
			browser.runtime.sendMessage({ name: "GETDATA", url: apiURL, type: "JSON" }, (value) => {
				if (letterboxd.helpers.ValidateResponse("Filmarks", value) == false){
					return;
				}

				try {
					this.filmarks.data = value.response;
					this.filmarks.state = 2;
				} catch (error) {
					console.error(error);
					this.filmarks.state = 3; // Error
				}

				if (this.filmarks.state == 2 && this.filmarks.data != null){
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
					
				this.addLink(this.filmarks.url);
			}else{
				console.log("Letterboxd Extras | Unable to find/match Filmarks page.");
				return;
			}

			// Do not display if there is no score or ratings
			if (this.filmarks.rating == null && this.filmarks.num_ratings == 0) return;

			// Add to Letterboxd
			//***************************************************************
			// Add the section to the page
			const section = letterboxd.helpers.createElement('section', {
				class: 'section ratings-histogram-chart filmarks-ratings ratings-extras'
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

			if (this.isMobile) {
				// Add the Show Details button			
				const showDetails = letterboxd.helpers.createShowDetailsButton("filmarks", "filmarks-score-details");
				section.append(showDetails);
			}

			// Score
			//***************************************************************
			const ratingSpan = letterboxd.helpers.createElement('span', {
				class: 'filmarks-score rt-score-div',
				style: 'position: relative; display: block;'
			});
			ratingSpan.append(letterboxd.helpers.createAllocineCriticScore(letterboxd, "filmarks", this.filmarks.rating, this.filmarks.num_ratings, null, this.filmarks.url, this.isMobile));
			ratingSpan.append(letterboxd.helpers.createAllocineStars(this.filmarks.rating));
			section.append(ratingSpan);

			// Add the tooltip as text for mobile
			// Critic Rating Tooltip
			var scoreSpan = section.querySelector(".filmarks-score .filmarks .tooltip");
			if (scoreSpan != null) {
				var tooltip = scoreSpan.getAttribute('data-original-title');
				letterboxd.helpers.createDetailsText('filmarks', section.querySelector(".filmarks-score"), tooltip, this.isMobile);
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
		ValidateResponse(name, value){
			// Standard fetch response validation with standardized debug messages
			// should catch any issues and prevent any catastrophic errors

			if (letterboxd.storage.get('console-log') === true && value != null && value.url != null && value.status != null) {
				console.log("Letterboxd Extras | Fetch made to URL: " + value.url + "\nResponse status: " + value.status);
			}

			var output = true;
			if (value == null || value.status == null){
				// Something went really wrong with the fetch
				console.error("Letterboxd Extras | There was an error with the " + name + " call. Error unknown");
				output = false;
			} else if (value.status == 202 && (value.response == null || value.response == "")){
				console.error("Letterboxd Extras | There was an error with the " + name + " call. Site returned a 202 without a body, this is likely some anti-bot measures.");
				output = false;
			} else if (value.status > 299 || value.status == 0){
				// Something went wrong, check for errors in the response
				if (value.errors != null && value.errors.length > 0){
					console.error("Letterboxd Extras | There was an error with the " + name + " call. Message: " + value.errors[0]);
				}else{
					console.error("Letterboxd Extras | There was an error with the " + name + " call. Code: " + value.status);
				}
				output = false;
			}		

			return output;
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
			showDetails.addEventListener('click', event => { toggleDetails(event, letterboxd); });

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

		createTomatoScore(type, display, url, data, visibility, isMobile, addTooltip) {
			const baseType = type.split('-')[0];

			const scoreDiv = letterboxd.helpers.createElement('div', {
				class: 'rt-score-div score-' + type,
				style: 'display: ' + visibility + ';'
			});

			if (visibility == "none") {
				scoreDiv.className += " disabled";
			}

			var image = 'images/tomato-critic-no-score.svg';
			if (data.state == "certified-fresh") {
				image = 'images/tomato-critic-certified-fresh.svg';
			} else if (data.state == "verified-hot") {
				image = 'images/tomato-audience-verified-hot.svg';
			} else if (data.state == "fresh") {
				image = 'images/tomato-critic-fresh.svg';
			} else if (data.state == "rotten") {
				image = 'images/tomato-critic-rotten.svg';
			} else if (data.state == "upright") {
				image = 'images/tomato-audience-hot.svg';
			} else if (data.state == "spilled") {
				image = 'images/tomato-audience-stale.svg';
			} else if (type.includes("critic")) {
				image = 'images/tomato-critic-no-score.svg';
			} else {
				image = 'images/tomato-audience-no-score.svg';
			}
			image = browser.runtime.getURL(image);

			const imageSpan = letterboxd.helpers.createElement('span', {
				class: 'icon-popcorn',
				style: 'background-image: url("' + image + '");'
			});
			scoreDiv.append(imageSpan);

			var suffix = "";
			var rating = data.rating;
			if (type.includes("critic")) {
				suffix = "/10";
			} else {
				suffix = "/5";
			}

			if (letterboxd.storage.get('convert-ratings') === "10"){
				suffix = "/10";
				if (type.includes("audience")) {
					rating = Number(rating * 2).toFixed(1);
				}

			}else if (letterboxd.storage.get('convert-ratings') === "5"){
				suffix = "/5";
				if (type.includes("critic")) {
					rating = Number(rating / 2).toFixed(1);
				}
			}

			// The element that is the score itself
			var hover = 'Average of ' + rating + suffix + ' based on ' + parseInt(data.num_ratings).toLocaleString() + ' ' + display + ' rating';
			if (data.percent == "--" || rating == "")
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
				class: 'tooltip tooltip-extra display-rating -highlight tomato-score',
				href: url,
				style: 'display: inline-block; width: 50px',
				['data-original-title']: hover
			});
			score.innerText = data.percent;
			scoreDiv.append(score);

			// Add the liked/notliked bars
			if (data.likedCount + data.notLikedCount > 0) {
				const chartSpan = letterboxd.helpers.createElement('span', {
					class: 'rt-score-details',
					style: 'display: none; width: 140px; margin-left: 5px;'
				});
				if ((type.includes("critic") && letterboxd.storage.get('tomato-audience-enabled') === true) || isMobile) {
					chartSpan.style['margin-bottom'] = '10px';
				}
				chartSpan.append(this.createTomatoBarCount("Fresh", parseInt(data.likedCount), parseInt(data.num_ratings), isMobile));
				chartSpan.append(this.createTomatoBarCount("Rotten", parseInt(data.notLikedCount), parseInt(data.num_ratings), isMobile));

				scoreDiv.append(chartSpan);
			}

			// Add the tooltip as text for mobile
			if (addTooltip) {
				const detailsSpan = letterboxd.helpers.createElement('span', {
					class: 'rt-score-div score-' + baseType + ' score-' + type + ' mobile-details-text'
				});

				if (isMobile){
					detailsSpan.className += ' rt-score-details'; 
				}

				if (type.includes('critic-top') || type.includes('audience-verified') || isMobile){
					detailsSpan.style.display = 'none';
				}

				const detailsText = letterboxd.helpers.createElement('p', {
				});
				detailsText.innerText = hover;
				detailsSpan.append(detailsText);

				scoreDiv.append(detailsSpan);
			}

			return scoreDiv;
		},

		changeTomatoScoreMobile(event) {
			// Get the parent node
			const parent = event.target.parentNode.parentNode;
			// Grab the target score div and then the other non-target score div
			const targetNode = parent.querySelector('.rt-score-div.disabled:not(.mobile-details-text)');
			const otherNode = parent.querySelector('.rt-score-div:not(.disabled):not(.mobile-details-text)');

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
			let targetNodes = parent.querySelectorAll(`.rt-score-div${target}`);
			let otherNodes = parent.querySelectorAll(`.rt-score-div:not(${target})`);

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

				targetNodes = parent.querySelectorAll(`.rt-score-div${baseTarget}.mobile-details-text${target}`);
				otherNodes = parent.querySelectorAll(`.rt-score-div${baseTarget}.mobile-details-text:not(${target})`);

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

		createTomatoButton(type, text, target, selected, disabled, isMobile) {
			if (target.includes(',')) {
				var targets = target.split(',');
				target = targets[0];
				var targetOther = targets[1];
			} else {
				var targetOther = "";
			}

			const button = letterboxd.helpers.createElement('span', {
				class: 'rt-button ' + type,
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

		createTomatoBarCount(type, count, total, isMobile) {
			// Span that holds it all
			const span = letterboxd.helpers.createElement('span', {
				style: 'display: block; width: 140px;'
			});
				// Text label (ie, 'Fresh")
			const label = letterboxd.helpers.createElement('span', {
				class: 'rt-bar text-label'
			});
			if (isMobile)
				label.className += " extras-mobile";
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
				class: 'rt-bar text-count'
			});
			if (isMobile)
				countText.className += " extras-mobile";
			countText.innerText = count.toLocaleString();
			span.append(countText);

			return span;
		},

		getMetaHighest(data) {
			var ratings = [data.positive, data.mixed, data.negative];
			var highest = 0;

			for (var i = 0; i < ratings.length; i++) {
				if (ratings[i] > highest)
					highest = ratings[i];
			}

			return highest;
		},

		createMetaScore(type, display, url, data, mustSee, isMobile, addTooltip) {
			// The span that holds the score
			var style = "";
			if (type == "critic" || mustSee)
				style += "margin-right: 10px;"
			const span = letterboxd.helpers.createElement('span', {
				class: 'meta-span-' + type,
				style: style
			});

			var mobileClass = "";
			if (isMobile)
				mobileClass = 'extras-mobile';

			var colour = letterboxd.helpers.determineMetaColour(data.rating, (type == "user"));
			var textColour = letterboxd.helpers.determineMetaTextColour(data.rating, (type == "user"));
			var className = 'meta-score';
			if (type == "user")
				className += "-user"
			var style = 'background-color: ' + colour + '; color: ' + textColour
			if (data.rating == "tbd" || data.rating == "N/A")
				style += '; border: 1px solid grey'

			// The element that is the score itself
			const text = letterboxd.helpers.createElement('a', {
				class: 'tooltip display-rating -highlight ' + className,
				style: style
			});

			// Create Tooltip
			var tooltip = "";
			var rating = data.rating;
			var suffix = "";
			if (data.num_ratings > 0 && rating == "tbd") {
				tooltip = 'No score yet (' + data.num_ratings.toLocaleString() + ' ' + display + ' review';
				if (data.num_ratings == 1)
					tooltip += ")";
				else
					tooltip += "s)";

			} else if (data.num_ratings > 0) {
				suffix = "/100";
				if (type == "user")
					suffix = "/10";

				if ((letterboxd.storage.get('convert-ratings') === "5")){
					suffix = "/5";
					if (type == "critic"){
						rating = Number(rating / 10 / 2).toFixed(1);
					}else{
						rating = Number(rating / 2).toFixed(1);
					}
				}
				else if ((letterboxd.storage.get('convert-ratings') === "10")){
					suffix = "/10";
					if (type == "critic"){
						rating = Number(rating / 10).toFixed(1);
					}
				}

				tooltip = "Weighted average of " + rating + suffix + " based on " + data.num_ratings.toLocaleString() + ' ' + display + ' review';
				if (data.num_ratings != 1)
					tooltip += "s"
					
			} else if (url != "") {
				if (rating == "N/A") {
					tooltip = 'No score available';
				} else {
					tooltip = 'No score yet';
				}
			}
			text.setAttribute('data-original-title', tooltip);

			if (tooltip != "")
				text.className += " tooltip-extra";

			// Add href link
			if (data.num_ratings > 0){
				text.setAttribute('href', url);
			}

			text.innerText = rating;
			span.append(text);

			// Add the positive/mixed/negative bars
			const chartSpan = letterboxd.helpers.createElement('span', {
				class: 'meta-score-details score-' + type + ' ' + mobileClass,
				style: 'display: none'
			});
			if (type == "critic" && letterboxd.storage.get('metacritic-mustsee-enabled') === true && mustSee) {
				chartSpan.className += ' short';
			}
			if ((isMobile) || (type == "critic" && letterboxd.storage.get('metacritic-users-enabled') === true) || (type == "user" && letterboxd.storage.get('metacritic-mustsee-enabled') === true && mustSee)) {
				chartSpan.style['margin-bottom'] = '10px';
			}
			chartSpan.append(letterboxd.helpers.createMetaBarCount("Positive", data.positive, data.highest, letterboxd.helpers.determineMetaColour(100, false)));
			chartSpan.append(letterboxd.helpers.createMetaBarCount("Mixed", data.mixed, data.highest, letterboxd.helpers.determineMetaColour(50, false)));
			chartSpan.append(letterboxd.helpers.createMetaBarCount("Negative", data.negative, data.highest, letterboxd.helpers.determineMetaColour(0, false)));
			span.append(chartSpan);

			// Add the tooltip as text for mobile
			if (addTooltip && tooltip != "") {
				const detailsSpan = letterboxd.helpers.createElement('span', {
					class: 'meta-details-' + type + ' mobile-details-text'
				});

				if (isMobile){
					detailsSpan.className += ' meta-score-details'
					detailsSpan.style.display = 'none';
				}

				const detailsText = letterboxd.helpers.createElement('p', {
				});
				detailsText.innerText = tooltip;
				detailsSpan.append(detailsText);

				span.append(detailsSpan);
			}

			return span;
		},

		createMetaBarCount(type, count, total, color) {
			// Span that holds it all
			const span = letterboxd.helpers.createElement('span', {
				style: 'display: block; width: 150px;'
			});
				// Text label
			const label = letterboxd.helpers.createElement('span', {
				class: 'meta-bar-label'
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
				class: 'meta-bar-value'
			});
			countText.innerText = count.toLocaleString();
			span.append(countText);

			return span;
		},

		createDetailsRow(headerText, value, currency, togetherWith) {
			// Determine className
			var className = "";
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

			var sharedEl = null;
			if (togetherWith != null && togetherWith != "") {
				sharedEl = letterboxd.helpers.createElement('a', {
					href: "/film/" + togetherWith
				});
				sharedEl.innerText = "(Shared)";
			}

			// Check if already added to the page
			if (document.querySelector('.' + className + '') != null) {
				// Replace the exising value
				var p = document.querySelector('.' + className + ' p');
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

				// Add the shared togetherwith link
				if (sharedEl != null) {
					sluglist.append(sharedEl);
				}

				// Append to the Tab Details
				//********************************************
				// Get the details tab
				const tabDetails = document.querySelector('#tab-details');

				// Append the Header
				// If budget
				if (className == "budget" && tabDetails.querySelector('.box-office-us.header')) {
					tabDetails.querySelector('.box-office-us.header').before(header);
				} else if (className == "budget" && tabDetails.querySelector('.box-office-ww.header')) {
					tabDetails.querySelector('.box-office-ww.header').before(header);
					// If box office US
				} else if (className == "box-office-us" && tabDetails.querySelector('.budget.detail')) {
					tabDetails.querySelector('.budget.detail').after(header);
				} else if (className == "box-office-us" && tabDetails.querySelector('.box-office-ww.header')) {
					tabDetails.querySelector('.box-office-ww.header').before(header);
					// If box office WW
				} else if (className == "box-office-ww" && tabDetails.querySelector('.box-office-us.detail')) {
					tabDetails.querySelector('.box-office-us.detail').after(header);
				} else if (className == "box-office-ww" && tabDetails.querySelector('.budget.detail')) {
					tabDetails.querySelector('.budget.detail').after(header);
					// else
				} else {
					tabDetails.append(header);
				}

				// Append the sluglist
				header.after(sluglist);
			}
		},

		createHistogramScore(storage, type, rating, count, url, isMobile) {
			// The span that holds the score
			var style = "";
			if (isMobile) {
				style = "left: auto;";
			} else {
				style = "left: 188px;";
			}
			const scoreSpan = this.createElement('span', {
				class: 'average-rating',
				style: style + ' position:absolute;'
			});

			var convertRatings = (storage.get('convert-ratings') === "5");
			var convert10Point = (storage.get('convert-ratings') === "10");
			var suffix = "/10";
			var tooltip = "";
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
				tooltip = 'Weighted average of ' + rating + suffix + ' based on ' + count.toLocaleString() + ' ratings'
			}

			// The element that is the score itself
			const scoreElement = this.createElement('a', {
				class: 'tooltip display-rating -highlight imdb-score tooltip-extra',
				href: url,
				['data-original-title']: tooltip
			});

			if (rating == "N/A") {
				scoreElement.innerText = "N/A";
			} else if (type === "anilist" && convertRatings == false) {
				scoreElement.innerText = rating + "%";
			} else {
				scoreElement.innerText = rating;
			}

			scoreSpan.append(scoreElement);

			return scoreSpan;
		},


		createHistogramGraph(storage, type, url, count, votes, percents, highest) {
			// Add the bars for the rating
			let histogramType = "rating-histogram-condensed";

			if (votes.length == 10) {
				histogramType = "rating-histogram-exploded"
			}

			const histogram = this.createElement('div', {
				class: 'rating-histogram clear ' + histogramType + ' rating-histogram-extras',
				style: 'position: relative;'
			});
			const ul = this.createElement('ul', {
			});
			histogram.append(ul);

			let width = 15;
			if (votes.length == 6) {
				width = 26;
			} else if (votes.length == 5) {
				width = 35;
			}

			// Loop for each bar
			for (var ii = 0; ii < votes.length; ii++) {
				var left = (ii * (width + 1)).toString() + "px;";
				const il = this.createElement('li', {
					class: 'rating-histogram-bar',
					style: 'width: ' + width + 'px; left: ' + left
				});
				ul.append(il);

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

				// Determine rating type (rating vs review)
				let ratingType = "ratings";
				if (type == "allocine") {
					ratingType = "reviews";
				}

				// Determine Suffixes
				let currentRatingsSuffix = letterboxd.overview.ratingsSuffix.map((x) => x);
				if (type === "anilist" && storage.get('convert-ratings') === false) {
					currentRatingsSuffix = ['10/100', '20/100', '30/100', '40/100', '50/100', '60/100', '70/100', '80/100', '90/100', '100/100'];
				} else if (type === "allocine") {
					currentRatingsSuffix = ['0-★', '★', '★★', '★★★', '★★★★', '★★★★★'];
				}

				const a = this.createElement('a', {
					class: 'ir tooltip ' + type + ' tooltip-extra',
					['data-original-title']: voteCount.toLocaleString() + " " + currentRatingsSuffix[ii] + ' ' + ratingType + ' (' + percentage.toString() + '%)'
				});
				il.append(a);

				// IMDb reviews link
				if (type == "imdb") {
					a.href = url.replace('/ratings', '') + '/reviews?ratingFilter=' + (ii + 1).toString();
				} else if (type == "allocine") {
					a.href = url + "star-" + ii;
				}

				var max = 44.0;
				var min = 1;
				var percent = voteCount / highest;
				var height = (max * percent);

				if (height < min) {
					height = min;
				}

				height = height.toString() + "px;";

				const i = this.createElement('i', {
					style: 'height: ' + height
				});
				a.append(i);
			}

			// Extra class for mobile
			var starClass = "";
			if (letterboxd.overview.isMobile) {
				starClass = " rating-star-extra-mobile"
			}

			// Add the stars for visual
			// Uses the same star image that letterboxd uses, but with some css filters to change the colors
			// See: https://stackoverflow.com/questions/42966641/how-to-transform-black-into-any-given-color-using-only-css-filters/43960991#43960991
			// Also: https://codepen.io/sosuke/pen/Pjoqqp
			// 1 Star
			const span1Star = this.createElement('span', {
				class: 'rating-green rating-green-tiny rating-1'
			});
			const span1StarInner = this.createElement('span', {
				class: 'rating rated-2 rating-star-' + type + starClass
			});
			span1StarInner.innerText = "★";
			span1Star.append(span1StarInner);

			// 5 Star
			const span5Star = this.createElement('span', {
				class: 'rating-green rating-green-tiny rating-5'
			});
			const span5StarInner = this.createElement('span', {
				class: 'rating rated-10 rating-star-' + type + starClass
			});
			span5StarInner.innerText = "★★★★★";
			span5Star.append(span5StarInner);

			ul.before(span1Star);
			ul.after(span5Star);

			return histogram;
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
				class: 'tooltip display-rating -highlight imdb-score tooltip-extra',
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

		createAllocineStars(rating) {
			var holder = letterboxd.helpers.createElement('div', {
				class: 'allo-critic-stars'
			});

			// Star back
			const span5Starback = letterboxd.helpers.createElement('span', {
				class: 'rating rated-10 rating-star-allocine-critic',
				style: 'position: absolute;'
			});
			span5Starback.innerText = "★★★★★";
			holder.append(span5Starback);

			rating = letterboxd.helpers.roundHalf(rating);

			// Star front
			// determine width
			var totalWidth = 64;
			var starWidth = 12;
			var betweenWidth = 1;
			var width = (starWidth * Math.floor(rating)) + Math.floor(rating) * betweenWidth;
			if (rating > Math.floor(rating)) {
				width += starWidth / 2;
			}
			//width = totalWidth - width;

			const span5Starfront = letterboxd.helpers.createElement('span', {
				class: 'rating rated-10 rating-star-allocine',
				style: 'position: absolute; width:' + width + 'px;'
			});
			span5Starfront.innerText = "★★★★★";
			holder.append(span5Starfront);

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
				class: `section ratings-histogram-chart ${sectionID}-ratings ratings-extras`
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

			if (logoProps.innerHTML) {
				logoHolder.innerHTML += logoProps.innerHTML
			}

			return logoHolder;

		},

		createChartSection(sectionID, logoProps, headerStyle) {

			const chartSection = this.createChartSectionElement(sectionID);
			const heading = this.createChartSectionHeader(headerStyle);
			chartSection.append(heading);

			const logoHolder = this.createChartSectionLogoHolder(sectionID, logoProps);
			heading.append(logoHolder);

			if (this.isMobile) {
				// Add the Show Details button
				const showDetails = this._createShowDetailsButton();
				chartSection.append(showDetails);
			}

			return chartSection;

		},

		getValidASCIIString(input) {
			var output = '';

			for (var i = 0; i < input.length; i++) {
				if (input[i] == "–") {
					output += "-";
				} else if (input.codePointAt(i) >= 256) {
					break;
				} else {
					output += input[i];
				}
			}

			return output;
		},

		encodeASCII(text) {
			return btoa(unescape(encodeURIComponent(text)));
		},

		romanize(num) {
			if (isNaN(num))
				return NaN;

			var digits = String(+num).split(""),
				key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
					"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
					"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
				roman = "",
				i = 3;
			while (i--)
				roman = (key[+digits.pop() + (i * 10)] || "") + roman;
			return Array(+digits.join("") + 1).join("M") + roman;
		},

		determineMetaColour(metascore, user) {
			var output = "transparent"; // transparent background tba
			if (metascore != "tbd" && metascore != "N/A") {
				var score = parseFloat(metascore);
				if (user == true) score = score * 10;

				if (score >= 61) {
					output = "#00ce7a" // Green
				} else if (score >= 40) {
					output = "#ffbd3f"; // Yellow
				} else {
					output = "#ff6874"; // Red
				}
			}
			return output;
		},

		determineMetaTextColour(metascore, user) {
			var output = "lightgray"; // Grey/black default
			if (metascore != "tbd" && metascore != "N/A") {
				var score = parseFloat(metascore);
				if (user == true) score = score * 10;

				if (score >= 40) {
					output = "#262626"; // Grey/black
				} else {
					output = "#fff"; // White
				}
			}
			return output;
		},

		cinemascoreTitle(title, year) {
			var output = "";

			if (title == null || title == "") {
				title = letterboxd.overview.letterboxdTitle;
			}
			// Get the Movie Title and clean it up a bit
			if (title.startsWith('The ')) {
				title = title.replace("The ", "");
				title = title + ", The";
			} else if (title.startsWith('A ')) {
				title = title.replace("A ", "");
				title = title + ", A";
			}
			// Normalize (ie, remove accents/diacritics)
			title = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

			// I don't like doing it this way, but there is no other way for certain movies where cinemascore has incorrect data
			output = title;
			switch (title) {
				case "Harry Potter and the Order of the Phoenix":
					output = "Harry Potter and Order of the Phoenix";
					break;
				case "Ocean's Eleven":
					if (year == "2001")
						output = "Ocean's 11";
					break;
				case "One Eight Seven":
					if (year == "1997")
						output = "187";
					break;
				default:
					output = title;
					break;
			}
			return output;
		},

		getTSPDTAltTitles(title, year) {
			var output = "";

			if (title == "Harlan County U.S.A." && year == "1976") {
				output = "Harlan County, U.S.A.";
			}
			else if (title == "Dont Look Back" && year == "1967") {
				output = "Don't Look Back";
			}

			output = output.replaceAll('.', '\\.');
			if (output != "")
				output = "|" + output.toUpperCase();

			return output;
		},

		getBFIYear(title, year) {
			var output = year;

			if (title == "The Ascent" && year == "1977") {
				output = "1976";
			}
			else if (title == "The Color of Pomegranates" && year == "1969") {
				output = "1968";
			}

			return output;
		},

		getBFIListPage(rank, movieTitle, movieYear) {
			// The movies which are tied are in difference positions on the BFI site and the LB list for some reason
			// Ugly, but let's just correct the page number manually
			var output = "";
			if (rank == "196") {
				switch (movieTitle) {
					case "Paisan":
					case "The Headless Woman":
					case "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb":
					case "L'Eclisse":
					case "Wavelength":
						output = "2";
						break;
					default:
						output = "3";
						break;
				}
			}
			return output;
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

		getSensSearchQuery(type, title) {
			var query = `
				query Results($query: String, $filters: [SKFiltersSet], $page: SKPageInput, $sortBy: String) {
					results(query: $query, filters: $filters) {
						hits(page: $page, sortBy: $sortBy) {
							sortedBy
							page {
								from
								pageNumber
								total
								totalPages
								__typename
							}
							items {
								... on ResultHit {
								id
								product {
									title
									rating
									dateRelease
									dateReleaseOriginal
									dateReleaseUS
									stats {
										ratingCount
										recommendCount
									}
									directors {
										name
										person_id
										url
									}
									url
								}
								fields {
									title
									url
									year
								}
								}
							}
						}
					}
				}
				`;
			var options = {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					accept: 'application/json'
				},
				body: JSON.stringify({
					query,
					variables: {
						filters: [{ "identifier": "universe", "value": type }],
						pages: { from: 0, size: 16 },
						query: title
					}
				})
			};

			return options;
		},

		getSensIDQuery(id) {
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
			var options = {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					accept: 'application/json'
				},
				body: JSON.stringify({
					query,
					variables: {
						id: parseInt(id)
					}
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
				sparqlQuery = "SELECT DISTINCT ?itemLabel ?BirthName ?Date_Of_Birth ?Date_Of_Birth_Precision ?Date_Of_Death ?Date_Of_Death_Precision ?BirthCityLabel ?BirthCountry ?DeathCityLabel ?DeathCountry ?Wikipedia ?WikipediaEN ?Years_Start ?Years_End ?IMDb_ID  WHERE {\n" +
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
						"  OPTIONAL {\n" +
						"    ?WikipediaEN schema:about ?item .\n" +
						"    ?WikipediaEN schema:inLanguage \"en\" .\n" +
						"    ?WikipediaEN schema:isPartOf <https://en.wikipedia.org/> .\n" +
						"  }\n" +
						"  OPTIONAL {\n" +
						"    ?Wikipedia schema:about ?item .\n" +
						"    ?Wikipedia schema:inLanguage \"en\" .\n" +
						"    ?Wikipedia schema:isPartOf <https://en.wikipedia.org/> .\n" +
						"  }\n" +
						"}";

			}else if (queryType == "LOSTFILMS"){
				var sparqlQuery = "SELECT ?letterboxdID WHERE {\n" +
						"  VALUES ?filmtype {wd:Q11424 wd:Q24862 wd:Q20667187 wd:Q226730 wd:Q506240 wd:Q336144} .\n" +
						"  ?item wdt:P31 ?filmtype.\n" +
						"  ?item wdt:P12020 wd:Q122238711.\n" +
						"  ?item wdt:P6127 ?letterboxdID.\n" +
						"}";
			} else {
				sparqlQuery = "SELECT DISTINCT ?item ?itemLabel ?Rotten_Tomatoes_ID ?Metacritic_ID ?Anilist_ID ?MAL_ID ?Mubi_ID ?FilmAffinity_ID ?SensCritique_ID ?Allocine_Film_ID ?Allocine_TV_ID ?Douban_ID ?Kinopoisk_ID ?DDD_ID ?Filmarks_ID ?MDL_ID ?Criterion_ID ?Criterion_Spine_ID ?Country_Of_Origin ?MPAA_film_ratingLabel ?BBFC_ratingLabel ?FSK_ratingLabel ?CNC_rating ?EIRIN_ratingLabel ?KMRB_ratingLabel ?ACB_ratingLabel ?ClassInd_ratingLabel ?Budget ?Budget_UnitLabel ?Budget_TogetherWith ?Box_OfficeUS ?Box_OfficeUS_UnitLabel ?Box_OfficeWW ?Box_OfficeWW_UnitLabel ?US_Title ?TV_Start ?TV_Start_Precision ?TV_End ?TV_End_Precision ?WikipediaEN ?Wikipedia ?StateOfTransmission WHERE {\n" +
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
					"  OPTIONAL {\n" +
					"    ?WikipediaEN schema:about ?item .\n" +
					"    ?WikipediaEN schema:inLanguage \"en\" .\n" +
					"    ?WikipediaEN schema:isPartOf <https://en.wikipedia.org/> .\n" +
					"  }\n" +
					"  OPTIONAL {\n" +
					"    ?Wikipedia schema:about ?item .\n" +
					"    ?Wikipedia schema:inLanguage \"" + lang + "\" .\n" +
					"    ?Wikipedia schema:isPartOf <https://" + lang + ".wikipedia.org/> .\n" +
					"  }\n" +
					"}";
			}

			sparqlQuery = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=' + sparqlQuery;

			return sparqlQuery;
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

		calculateAge(start, end) {
			var ageDifMs = end - start;
			var ageDate = new Date(ageDifMs);
			return Math.abs(ageDate.getUTCFullYear() - 1970);
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

		getPersonRole(role){
			switch(role){
				case "director":
				case "co-director":
				case "additional-directing":
					return "by this director";

				case "writer":
				case "producer":
				case "executive-producer":
					return "by this " + role.replace('-',' ');

				case "actor":
					return "with this " + role.replace('-',' ');
						
				case "original-writer":
					return "by this writer";
						
				case "editor":
					return "edited by this editor";

				case "cinematography":
					return "shot by this cinematographer";

				case "composer":
					return "with music by this composer";
					
				default:
					return "with " + role.replace('-',' ') + " by this artist";
			}
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
	{ class: CriterionHelper, target: letterboxd.overview, property: 'criterionHelper', args: [] }
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
		if (window.location.pathname.startsWith('/film/') && !window.location.pathname.includes("ratings")) {
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