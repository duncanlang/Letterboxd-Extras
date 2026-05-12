import { LOAD_STATES } from '../constants';

const rankingOrder = [
    '.imdb-ranking',
    '.tspdt-ranking',
    '.bfi-ranking',
    '.afi-ranking',
    '.ebert-ranking',
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
        isRanked: true,
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
        isRanked: true,
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
        icon: '🎥',
        image: null,
        isRanked: true,
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
        isRanked: true,
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
        isRanked: false,
        listUrl: 'https://letterboxd.com/dvideostor/list/roger-eberts-great-movies/'
    };

    customLoadState = LOAD_STATES['Uninitialized'];
    customLists = [];

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
    
    async loadCustomRankings(letterboxdID){
        this.customLoadState = LOAD_STATES['Loading'];
        this.letterboxdID = letterboxdID;

        // Load from storage
        const data = await browser.storage.local.get('custom_lists');
        if (data == undefined || data == null || data.custom_lists == null) {
            this.customLoadState = LOAD_STATES['Failed'];
            return;
        }
        this.customLists = data.custom_lists;

        for (let i = 0; i < this.customLists.length; i++){
            const customList = this.customLists[i];

            customList.prefix = `custom${i}`;
            customList.rank = customList.list[this.letterboxdID]?.rank ?? 0;
            customList.index = customList.list[this.letterboxdID]?.index ?? customList.rank;
            
            this.createRanking(customList);
        }

        this.customLoadState = LOAD_STATES['Success'];
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
        if (data.isRanked == false) {
            tooltip = `Included in "${label}"`;
        } else {
            tooltip = `№ ${rank} in "${label}" Top ${total}`;
        }
        a.setAttribute('data-original-title', tooltip);

        // Logo
        if (data.icon != null && data.icon != '') {
            const logoSpan = this.helpers.createElement('span', {
                class: 'extras-ranking-icon',
            });
            logoSpan.innerText = data.icon
            a.append(logoSpan);
        } else {
            let imageUrl;
            if (prefix.startsWith('custom')){
                imageUrl = data.image;
            } else {
                imageUrl = browser.runtime.getURL(`/images/${data.image}`);
            }

            const logoSpan = this.helpers.createElement('span', {
                class: 'extras-ranking-image',
                style: `background: url('${imageUrl}')`
            });
            a.append(logoSpan);
        }
        
        // Rank
        if (data.isRanked) {
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
        let extrasStats = document.querySelector('.extras-statistics-list')
        if (extrasStats == null) {
            extrasStats = this.helpers.createElement('div', {
                class: 'production-statistic-list extras-statistics-list'
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

        const index = rankingOrder.indexOf(`.${prefix}-ranking`);
        if (index == -1) {
            extrasStats.append(ranking);
            return;
        }

        // First - search forwards
        for (let i = index + 1; i < rankingOrder.length; i++) {
            let temp = extrasStats.querySelector(rankingOrder[i]);
            if (temp) {
                temp.before(ranking);
                return;
            }
        }

        // Second - check for custom rankings
        for (let i = 0; i <= 9; i++) {
            let temp = extrasStats.querySelector(`.custom${i}-ranking`);
            if (temp) {
                temp.before(ranking);
                return;
            }
        }

        // Third - search backwards
        for (let i = index - 1; i >= 0; i--) {
            let temp = extrasStats.querySelector(rankingOrder[i]);
            if (temp) {
                temp.after(ranking);
                return;
            }
        }

        // Fourth - nothing found, just append
        extrasStats.append(ranking);
    }
}