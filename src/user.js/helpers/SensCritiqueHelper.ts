/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

export class SensCritiqueHelper extends Helper {

    recommendCount: string = ""
    highest: number = 0;
    votes: number[] = [];
    percents: number[] = [];

    constructor(storage: StorageObject, helpers: any, pageState: PageState) {

        super(storage, helpers, pageState, 'sens');

    }

    _loadData(senscritiqueID: string) {

        const apiURL = `https://apollo.senscritique.com/`;
        const options = this._getQuery(senscritiqueID);

        this._apiRequestCallback('SensCritique API', apiURL, 'JSON', options, value => {

            this.data = value.response.data;
            this.loadState = LOAD_STATES['Success'];

            this.populateRatingsSidebar();
        });
    }


	/**
	 * Searches the SensCritique API using the title, native title, and year.
	 *
	 * @param {string} movieTitle - The title of the film
	 * @param {string} movieNativeTitle - The native title of the film
	 * @param {string} releaseYear - The year the film was first released.
	 * @param {string[]} letterboxdDirectors - A list of directors who are credited for the film.
	 */
    searchData(movieTitle : string, movieNativeTitle : string, releaseYear : string, letterboxdDirectors : string[], tmdbTV: boolean) {
		if (!this._canLoadData()) {
			return;
		}

        this.loadState = LOAD_STATES['Loading'];

        if (movieNativeTitle != null) 
            movieTitle = movieNativeTitle;

        const url = "https://apollo.senscritique.com/";
        const mediaType = tmdbTV ? "tvShow" : "movie";
        const options = this._getSearchQuery(mediaType, movieTitle);

        this._apiRequestCallback('SensCritique API', url, 'JSON', options, value => {

            let sens = value.response;

            if (sens.data != null && sens.data.results != null) {
                sens = sens.data.results.hits.items;
                let results = [];

                for (let i = 0; i < sens.length; i++) {
                    let result = { score: 0, data: sens[i] };

                    if (result.data.product != null){

                        // Get directors/creators/producers
                        if (letterboxdDirectors.length > 0){

                            let directors: any[] = [];

                            if (result.data.product.directors != null)
                                directors = directors.concat(result.data.product.directors);
                            if (result.data.product.creators != null)
                                directors = directors.concat(result.data.product.creators);
                            if (result.data.product.producers != null)
                                directors = directors.concat(result.data.product.producers);
                                
                            // Match based on directors/producers/creators
                            for (let k = 0; k < directors.length; k++) {
                                // Director name to lowercase and removed diacritics
                                let director = directors[k].name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                if (letterboxdDirectors.includes(director)) {
                                    result.score = 100 - Math.abs((parseInt(releaseYear)) - parseInt(result.data.fields.year))
                                    break;
                                }
                            }
                        }

                        // Match based on exact name and year match
                        if (result.score == 0 && movieTitle == result.data.product.title && releaseYear == result.data.fields.year) {
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
                    this.data = results[0].data;
                    this.loadState = LOAD_STATES['Success'];

                    this.populateRatingsSidebar();
                } else {
                    this.loadState = LOAD_STATES['Failure'];
                }
            }
        });
    }

    populateRatingsSidebar() {

        if (!this._canPopulateRatingsSidebar()) {
            return;
        }
        
        if (this.data == null) return;

        // Collect Date from the Senscritique API
        //* **************************************************************
        
        this.linkURL = "";
        if (this.data.fields != null && this.data.fields.url != null) {
            this.linkURL = this.data.fields.url;
        } else {
            this.linkURL = "https://www.senscritique.com" + this.data.product.url
        }

        this.addButtonLink(this.linkURL, 'SENS');

        this.rating = this.data.product.rating;
        this.num_ratings = this.data.product.stats.ratingCount;
        this.recommendCount = this.data.product.stats.recommendCount;

        for (let i = 0; i < 10; i++) {
            this.votes[i] = this.data.product.statsDetails.split[`rating${i + 1}`];
            if (this.votes[i] > this.highest) this.highest = this.votes[i]; 
        }
        for (let i = 0; i < 10; i++) {
            this.percents[i] = Number.parseFloat((this.votes[i] / this.highest * 100).toFixed(2));
        }

        // Do not display if there is no score or ratings
        if (this.rating == null && this.num_ratings === 0) return;

        // Add to Letterboxd
        //* **************************************************************
        // Add the section to the page
        
		const section = this._createChartSection(
			{
			href: this.linkURL,
			style: 'height: 25px; width: 110px; position: absolute; background-image: url("' + browser.runtime.getURL("images/senscritique-logo.svg") + '");'
			}
		);

		// Score
		//* **************************************************************

        if (this.storage.get('sens-style') === 'ratings') {
            // Create a span that holds the entire
            const sensSpan = this.helpers.createElement('span', {}, {
                display: 'block',
                'margin-bottom': '10px'
            });

            // Rating/Score
            const scoreSpan = this.helpers.createElement('span', {}, {
                ['display']: 'inline-block',
                ['width']: 'auto'
            });

            const scoreHolder = this.helpers.createElement('a', {
                class: 'tooltip tooltip-extra sens-score'
            });
            scoreSpan.append(scoreHolder);

            const scoreIcon = this.helpers.createElement('span', {
                class: 'sens-score-icon'
            });
            scoreHolder.append(scoreIcon);

            const scoreText = this.helpers.createElement('span', {
                class: 'display-rating -highlight'
            });
            scoreHolder.append(scoreText);

            const { tooltip, score, totalScore } = this._getAverageScore(this.rating, this.ratingAlt);
            this.tooltip = tooltip;
            if (this.pageState.isMobile === true) scoreText.setAttribute('class', `${scoreText.getAttribute('class')} extras-mobile`);

            scoreText.innerText = score;
            scoreHolder.setAttribute('data-original-title', tooltip);
            scoreHolder.setAttribute('href', this.linkURL + '/critiques');

            sensSpan.append(scoreSpan);

            if (this.rating != null && this.rating >= 6.5){
                scoreHolder.className += ' green';
                scoreIcon.style['background-image'] = 'url("' + browser.runtime.getURL("images/senscritique-icon-green.svg") + '")';
            }else{
                scoreIcon.style['background-image'] = 'url("' + browser.runtime.getURL("images/senscritique-icon-white.svg") + '")';
            }

            // Favourites/Likes
            const likeSpan = this.helpers.createElement('span', {}, {
                ['display']: 'inline-block',
                ['width']: 'auto',
                ['vertical-align']: 'top'
            });

            const likeCount = this.helpers.createElement('p', {
                class: 'display-rating sens-text'
            });
            likeCount.innerText = `♥ ${this.recommendCount}`;
            likeSpan.append(likeCount);

            sensSpan.append(likeSpan);

            section.append(sensSpan);

        } else {
            
            // Histogram
            const histogram = this.helpers.createHistogram(
                this.storage,
                'sens',
                this.linkURL + '/critiques',
                this.rating,
                this.num_ratings,
                this.votes,
                this.percents,
                this.highest
            );
            histogram.style['margin-top'] = '15px'
            
            if (this.rating != null && this.rating >= 6.5){
                histogram.classList.add('sens-green');
            }
            
            section.append(histogram);

        }


		// Add the tooltip as text for mobile
		this._createRatingDetailsText(section, this.tooltip);

		// APPEND to the sidebar
		//* ***********************************************************
		this.appendSidebarRating(section);

		// Add Hover events
		//* ***********************************************************
		this.helpers.addTooltipEvents(section);
    }

    _getQuery(id : string) {
        const query = `
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
                        statsDetails {
                            split {
                                rating1
                                rating2
                                rating3
                                rating4
                                rating5
                                rating6
                                rating7
                                rating8
                                rating9
                                rating10
                            }
                        }
                    }
                }
            `;

        const options = {
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
    }
    
    _getSearchQuery(mediaType : string, movieTitle : string) {
        const query = `
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
                                statsDetails {
                                    split {
                                        rating1
                                        rating2
                                        rating3
                                        rating4
                                        rating5
                                        rating6
                                        rating7
                                        rating8
                                        rating9
                                        rating10
                                    }
                                }
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

        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                accept: 'application/json'
            },
            body: JSON.stringify({
                query,
                variables: {
                    filters: [{ "identifier": "universe", "value": mediaType }],
                    pages: { from: 0, size: 16 },
                    query: movieTitle
                }
            })
        };

        return options;
    }

}
