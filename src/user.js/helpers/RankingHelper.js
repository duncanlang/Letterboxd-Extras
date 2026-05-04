import { LOAD_STATES } from '../constants';

const rankingOrder = [
    '.imdb-ranking',
    '.tspdt-ranking',
    '.bfi-ranking',
    '.afi-ranking',
    '.ebert-ranking'
];

export class RankingHelper {
    
    letterboxdID = null;

    afiData = { 
        loadState: LOAD_STATES['Uninitialized'],
        prefix: 'afi',
        label: 'AFI 100 Years',
        rank: 0,
        index: 0,
        totalRank: 100,
        list: null,
        image: 'afi-logo.png',
        listUrl: 'https://letterboxd.com/afi/list/afis-100-years100-movies-10th-anniversary/'
    };
    bfiData = { 
        loadState: LOAD_STATES['Uninitialized'],
        prefix: 'bfi',
        label: 'BFI Sight and Sound',
        rank: 0,
        index: 0,
        totalRank: 250,
        list: null,
        image: 'bfi-logo.svg',
        listUrl: 'https://letterboxd.com/bfi/list/sight-and-sounds-greatest-films-of-all-time/'
    };
    tspdtData = { 
        loadState: LOAD_STATES['Uninitialized'],
        prefix: 'tspdt',
        label: "They Shoot Pictures, Don't They?",
        rank: 0,
        index: 0,
        totalRank: 1000,
        list: null,
        listUrl: 'https://letterboxd.com/thisisdrew/list/they-shoot-pictures-dont-they-1000-greatest-7/'
    };
    imdbData = { 
        loadState: LOAD_STATES['Uninitialized'],
        prefix: 'imdb',
        label: "IMDb",
        rank: 0,
        index: 0,
        totalRank: 250,
        list: null,
        image: 'imdb-logo.svg',
        listUrl: 'https://letterboxd.com/dave/list/imdb-top-250/'
    };
    ebertData = { 
        loadState: LOAD_STATES['Uninitialized'],
        prefix: 'ebert',
        label: "Roger Ebert's Great Movies",
        rank: 0,
        index: 0,
        totalRank: 250,
        list: null,
        image: 'ebert-great-movies-logo.svg',
        listUrl: 'https://letterboxd.com/dvideostor/list/roger-eberts-great-movies/'
    };

    get loadState() {
        const states = [ this.afiData, this.bfiData, this.tspdtData, this.imdbData, this.ebertData ].map(x => x.loadState);

        // Check if any are failed
        if (states.includes(LOAD_STATES['Failure'])) return LOAD_STATES['Failure'];

        // Check for loading or reload
        if (states.includes(LOAD_STATES['Loading']) || states.includes(LOAD_STATES['Reload'])) {
            return LOAD_STATES['Loading'];
        }

        // Check for success
        if (states.every(x => x === LOAD_STATES['Success'])) return LOAD_STATES['Success'];

        // Otherwise, we're still Uninitialized
        return LOAD_STATES['Uninitialized'];
    };

	constructor(storage, helpers, pageState) {
		this.storage = storage;
		this.helpers = helpers;
		this.pageState = pageState;
	}

    loadRankings(letterboxdID){
        this.letterboxdID = letterboxdID;

        // BFI Sight and Sound
        if (this.bfiData.loadState == LOAD_STATES['Uninitialized']){
            if (this.storage.get('bfi-enabled') === true){
                this._loadRanking(this.bfiData);
            }
            else{
                this.bfiData.loadState = LOAD_STATES['Success'];
            }
        }
        
        // TSPDT
        if (this.tspdtData.loadState == LOAD_STATES['Uninitialized']){
            if (this.storage.get('tspdt-enabled') === true){
                this._loadRanking(this.tspdtData);
            }
            else{
                this.tspdtData.loadState = LOAD_STATES['Success'];
            }
        }

        // AFI
        if (this.afiData.loadState == LOAD_STATES['Uninitialized']){
            if (this.storage.get('afi-enabled') === true){
                this._loadRanking(this.afiData);
            }
            else{
                this.afiData.loadState = LOAD_STATES['Success'];
            }
        }
        
        // Roger Ebert Great Movies
        if (this.ebertData.loadState == LOAD_STATES['Uninitialized']){
            if (this.storage.get('ebert-great-enabled') === true){
                this._loadRanking(this.ebertData);
            }
            else{
                this.ebertData.loadState = LOAD_STATES['Success'];
            }
        }
    }

    _loadRanking(data){
        data.loadState = LOAD_STATES['Loading'];

        const request = {
            name: 'GETDATA',
            type: 'JSON',
            url: browser.runtime.getURL(`data/${data.prefix}_ranking.json`)
        };
        browser.runtime.sendMessage(request, value => {
            if (this.helpers.ValidateResponse(data.label, value) === false) {
                data.loadState = LOAD_STATES['Failure'];
                return;
            }

            if (!value.response) {
                data.loadState = LOAD_STATES['Failure'];
                return;
            }

            data.list = value.response;
            data.rank = data.list[this.letterboxdID]?.rank ?? 0;
            data.index = data.list[this.letterboxdID]?.index ?? data.rank;
            this.createRanking(data);
        });
    }

    createRanking(data){
        let rank = data.rank;
        let total = data.totalRank;
        let prefix = data.prefix;
        let label = data.label;
        let index = data.index;

        this.helpers.WriteConsoleLog('DEBUG', `${prefix} rank found: ${rank}.`);
        if (rank == 0 || rank > total) return;

        if (document.querySelector(`.${prefix}-ranking`)) return;
        
        // Determine list page number
        let url = data.listUrl;
        let page = Math.ceil(index / 100);
        if (page > 1) {
            url += `page/${page}/`;
        }
        
        // Lets add it to the page
        //***************************************************************
        const div = this.helpers.createElement('div', {
            class: `production-statistic ${prefix}-ranking extras-ranking`
        });

        const a = this.helpers.createElement('a', {
            class: 'tooltip tooltip-extra',
            href: url
        });
        div.append(a);
        let tooltip = '';
        if (prefix == 'ebert') {
            tooltip = `Included in "${label}"`;
        } else {
            tooltip = `№ ${rank} in "${label}" Top ${total}`;
        }
        a.setAttribute('data-original-title', tooltip);

        // Logo
        if (prefix == 'tspdt') {
            const logoSpan = this.helpers.createElement('span', {
                class: 'extras-ranking-icon',
            });
            logoSpan.innerText = '🎥'
            a.append(logoSpan);
        } else {
            const logoSpan = this.helpers.createElement('span', {
                class: 'extras-ranking-icon',
                style: 'background: url(' + browser.runtime.getURL(`/images/${data.image}`) + ')'
            });
            a.append(logoSpan);
        }
        
        // Rank
        if (prefix != 'ebert') {
            const labelSpan = this.helpers.createElement('span', {
                class: 'label'
            });
            labelSpan.innerText = rank;
            a.append(labelSpan);
        }

        // Add the tooltip as text for mobile
        if (this.pageState.isMobile) {
            const detailsSpan = this.helpers.createElement('span', {
                class: 'mobile-ranking-details',
                style: 'display:none'
            });

            const detailsText = this.helpers.createElement('p', {
            });
            detailsText.innerText = tooltip;
            detailsSpan.append(detailsText);

            div.append(detailsSpan);
        }
        
        // Add to page
        this._appendRanking(div, prefix);

        // Add the hover events
        //*****************************************************************
		this.helpers.addTooltipEvents(div);

        data.loadState = LOAD_STATES['Success'];
    }

    _appendRanking(ranking, prefix){

		// Create the ul element if needed
        var extrasStats = document.querySelector('.extras-stats')
        if (extrasStats == null) {
            extrasStats = this.helpers.createElement('div', {
                class: 'production-statistic-list extras-stats'
            });
            if (this.pageState.isMobile) {
                // Add to page
                extrasStats.className += ' extras-ranking-mobile';
                document.querySelector('.production-masthead .details').append(extrasStats);

                // Add the Show Details button
                const showDetails = this.helpers.createShowDetailsButton("film-stats", "mobile-ranking-details")
                showDetails.className = "film-stats-show-details";
                extrasStats.before(showDetails);
            } else {
                // Add to page
                document.querySelector('.production-statistic-list').after(extrasStats);
            }
        }

        var index = rankingOrder.indexOf(`.${prefix}-ranking`);

        // First
        for (var i = index + 1; i < rankingOrder.length; i++) {
            var temp = extrasStats.querySelector(rankingOrder[i]);
            if (temp != null) {
                temp.before(ranking);
                return;
            }
        }

        // Second
        for (var i = index - 1; i >= 0; i--) {
            var temp = extrasStats.querySelector(rankingOrder[i]);
            if (temp != null) {
                temp.after(ranking);
                return;
            }
        }

        // Third
        extrasStats.append(ranking);
    }
}