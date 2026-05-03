import { LOAD_STATES } from '../constants';

const rankingOrder = [
    '.imdb-ranking',
    '.tspdt-ranking',
    '.bfi-ranking',
    '.afi-ranking'
];

export class RankingHelper {
    
    letterboxdID = null;

    afiData = { 
        loadState: LOAD_STATES['Uninitialized'],
        prefix: 'afi',
        label: 'AFI 100 Years',
        rank: 0,
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
        totalRank: 250,
        list: null,
        listUrl: 'https://letterboxd.com/bfi/list/sight-and-sounds-greatest-films-of-all-time/'
    };
    tspdtData = { 
        loadState: LOAD_STATES['Uninitialized'],
        prefix: 'tspdt',
        label: "They Shoot Pictures, Don't They?",
        rank: 0,
        totalRank: 1000,
        list: null,
        listUrl: 'https://letterboxd.com/thisisdrew/list/they-shoot-pictures-dont-they-1000-greatest-7/'
    };
    imdbData = { 
        loadState: LOAD_STATES['Uninitialized'],
        prefix: 'imdb',
        label: "IMDb",
        rank: 0,
        totalRank: 250,
        list: null,
        image: 'imdb-logo.svg',
        listUrl: 'https://letterboxd.com/dave/list/imdb-top-250/'
    };

	constructor(storage, helpers, pageState) {
		this.storage = storage;
		this.helpers = helpers;
		this.pageState = pageState;
	}

    loadRankings(letterboxdID){
        this.letterboxdID = letterboxdID;

        // AFI
        if (this.afiData.loadState == LOAD_STATES['Uninitialized']){
            if (this.storage.get('afi-enabled') === true){
                this._loadRanking(this.afiData);
            }
            else{
                data.loadState = LOAD_STATES['Success'];
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
            data.rank = data.list[this.letterboxdID].rank ?? 0;
            this.createRanking(data);
        });
    }

    createRanking(data){
        let rank = data.rank;
        let total = data.totalRank;
        let prefix = data.prefix;
        let label = data.label;

        this.helpers.WriteConsoleLog('DEBUG', `${prefix} rank found: ${rank}.`);
        if (rank == 0 || rank > total) return;

        if (document.querySelector(`.${prefix}-ranking`)) return;
        
        // Determine list page number
        let url = data.listUrl;
        let page = Math.ceil(rank / 100);
        if (page > 1) {
            url += 'page/' + page + '/';
        }
        
        // Lets add it to the page
        //***************************************************************
        const li = this.helpers.createElement('li', {
            class: `stat ${prefix}-ranking extras-ranking`
        });

        const a = this.helpers.createElement('a', {
            class: 'has-icon icon-16 tooltip tooltip-extra',
            href: data.listUrl
        });
        li.append(a);
        
        // Rank and tooltip
        a.innerText = rank;
        var tooltip = `№ ${rank} in "${label}" Top ${total}`;
        a.setAttribute('data-original-title', tooltip);

        // Logo
        const span = this.helpers.createElement('span', {
            class: 'icon',
            style: 'background: url(' + browser.runtime.getURL(`/images/${data.image}`) + ')'
        });
        a.append(span);

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

            li.append(detailsSpan);
        }
        
        // Add to page
        this._appendRanking(li, prefix);

        // Add the hover events
        //*****************************************************************
		this.helpers.addTooltipEvents(li);

        data.loadState = LOAD_STATES['Success'];
    }

    _appendRanking(ranking, prefix){

		// Create the ul element if needed
        var extrasStats = document.querySelector('.extras-stats')
        if (extrasStats == null) {
            extrasStats = this.helpers.createElement('ul', {
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