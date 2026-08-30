
import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';


/**
 * A class that helps access and display data from Plex.
 *
 * @augments Helper
 */
export class PlexHelper extends Helper {

	constructor(storage, helpers, pageState) {

		super(storage, helpers, pageState, 'plex-watchlist');

		this.loadState = LOAD_STATES['Uninitialized'];
		this.id = null;
		this.token = null;
		this.watchlist = [];
		this.etag = null;
	}

	async initialize(){
		this.loadState = LOAD_STATES['Loading']; // Prevent this running multiple times
		this.enabled = this.storage.get('plex-watchlist-enabled');

		// Create the watchlist button
		this._createWatchlistButton();

		// Load the cache
		this._loadCache();

		// TODO - instead of simply getting the token from the storage, rework so it calls the background script
		// have the background script verify if the token is valid and refresh if necessary

		// Init the auth token
		const auth_data = await browser.storage.local.get('plex_data').then(function (value) {
			return value.plex_data;
		});
		this.token = auth_data.token;

		this.loadState = LOAD_STATES['Pending']; // Indicate we are now ready and waiting to call the api
	}

	_createWatchlistButton() {
		if (!this.enabled) return;

		const menuItem = this.helpers.createElement('li', {
			class: ''
		});
		const addButton = this.helpers.createElement('button', {
			class: 'extras-menubutton disabled'
		});
		addButton.type = 'button'
		addButton.role = 'menuitem'
		addButton.disabled = true
		addButton.innerText = 'Add to Plex watchlist';
		menuItem.append(addButton);
		this.addButton = addButton;
		
		const removeButton = this.helpers.createElement('button', {
			class: 'extras-menubutton',
			style: 'display: none'
		});
		removeButton.type = 'button'
		removeButton.role = 'menuitem'
		removeButton.innerText = 'Remove from Plex watchlist';
		menuItem.append(removeButton);
		this.removeButton = removeButton;

		document.querySelector('li.panel-sharing').after(menuItem);
		
		// Add click events
		addButton.addEventListener('click', event => {
			this.addToPlexWatchlist();
		});
		removeButton.addEventListener('click', event => {
			this.removeFromPlexWatchlist();
		});
	}
	
	async checkWatchlistStatus(id) {
		this.loadState = LOAD_STATES['Loading'];
		this.id = id;

		if (!this.enabled) return;

		if (this.id != null){
			// Check if already on watchlist
			await this._checkWatchlist();

			// Set the button based on the current watchlist status
			this._updateWatchlistButton();
			
			this.addButton.disabled = false;
			this.addButton.classList.remove('disabled');
		}
		else {
			this.addButton.setAttribute('data-original-title', 'Unable to match to Plex ID');
			this.addButton.addEventListener('mouseover', ShowTwipsy);
			this.addButton.addEventListener('mouseout', HideTwipsy);
		}

		this.loadState = LOAD_STATES['Success'];
	}
	
	_updateWatchlistButton() {

		// Add the event based on whether the film is on the watchlist
		if (this.watchlist.includes(this.id)) {
			this.addButton.style.display = 'none';
			this.removeButton.style.display = '';
		}
		else{
			this.addButton.style.display = '';
			this.removeButton.style.display = 'none';
		}

	}

	async _checkWatchlist() {
		let total = 999999;
		let current = 0;

		while(current < total) {
			let containerSize = (current == 0) ? 5 : 100
			let url = `https://discover.provider.plex.tv/library/sections/watchlist/all?X-Plex-Container-Start=${current}&X-Plex-Container-Size=${containerSize}`
			let options = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'X-Plex-Token': this.token,
					'If-None-Match': this.etag ?? null
				}
			};

			const result = await new Promise((resolve, reject) => {
				browser.runtime.sendMessage({ name: "GETDATA", url: url, options: options, type: "JSON" }, (value) => {
					resolve(value);
				});
			});

			// Call error
			if (result == null || result.status == null || result.response == null){
				this.helpers.WriteConsoleLog('ERROR', `Unable to fetch entire watchlist, error unknown.`);
				return;
			}
			if (result.status >= 400 || result.etag == null){
				this.helpers.WriteConsoleLog('ERROR', `Unable to fetch entire watchlist, call returned status ${result.status}.`);
				return;
			}
			// Check for etag, if the same use the cache
			if (this.etag === result.etag){
				this.helpers.WriteConsoleLog('DEBUG', `Watchlist call returned same etag, using cached list.`);
				return;
			}
			else if (current == 0) {
				this.helpers.WriteConsoleLog('DEBUG', `Watchlist call returned NEW etag, parsing new list.`);
				this.watchlist = [];
				this.etag = result.etag;
				
			}

			total = result?.response?.MediaContainer?.totalSize;
			current += result?.response?.MediaContainer?.size;
			let list = result?.response?.MediaContainer?.Metadata?.map(item => item.ratingKey) || [];

			this.watchlist.push.apply(this.watchlist, list);
		}

		this._saveCache();
	}

	async addToPlexWatchlist() {
		if (this.id == null || this.token == null){
			this.helpers.WriteConsoleLog('ERROR', `Unable to update watchlist, either Plex ID or access token are missing.`);
		}

		let url = `https://discover.provider.plex.tv/actions/addToWatchlist?ratingKey=${this.id}`
		let options = {
			method: 'PUT',
			headers: {
				'X-Plex-Token': this.token
			}
		};

		const result = await new Promise((resolve, reject) => {
			browser.runtime.sendMessage({ name: "GETDATA", url: url, options: options, type: "TEXT" }, (value) => {
				resolve(value);
			});
		});

		if (result != null && result.status != null && result.status == 200){
			this.watchlist.push(this.id);

			this._updateWatchlistButton();
		}
		else{
			this.helpers.WriteConsoleLog('ERROR', `Unable to update watchlist, call returned status: ${result.status}`);
		}
	}

	async removeFromPlexWatchlist() {
		if (this.id == null || this.token == null){
			this.helpers.WriteConsoleLog('ERROR', `Unable to update watchlist, either Plex ID or access token are missing.`);
		}

		let url = `https://discover.provider.plex.tv/actions/removeFromWatchlist?ratingKey=${this.id}`
		let options = {
			method: 'PUT',
			headers: {
				'X-Plex-Token': this.token
			}
		};

		const result = await new Promise((resolve, reject) => {
			browser.runtime.sendMessage({ name: "GETDATA", url: url, options: options, type: "TEXT" }, (value) => {
				resolve(value);
			});
		});

		if (result != null && result.status != null && result.status == 200){
			let index = this.watchlist.indexOf(this.id);
			if (index > -1) 
				this.watchlist = this.watchlist.splice(index, this.id);

			this._updateWatchlistButton();
		}
		else{
			this.helpers.WriteConsoleLog('ERROR', `Unable to update watchlist, call returned status: ${result.status}`);
		}
	}

	async _saveCache() {
		let plex_cache = {
			etag: this.etag,
			watchlist: this.watchlist
		}

    	await browser.storage.local.set({ plex_cache: plex_cache });
	}

	async _loadCache() {
		let data = await browser.storage.local.get('plex_cache');
		
		if (data != undefined && data != null && data.plex_cache != null) {
			this.etag = data.plex_cache.etag;
			this.watchlist = data.plex_cache.watchlist;
		}
	}
    
}