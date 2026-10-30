import { LOAD_STATES } from "./constants";

export class LetterboxdGeneral {

	yearFilterAdded = false;

	constructor(storage, helpers) {
		this.extensionStorage = storage;
		this.extensionHelpers = helpers;
	}

	stopRunning() {
		this.running = false;
	}

	async init(){
		this.running = true;

		// Add 'Go to Film' button
		const portals = document.querySelectorAll('div[data-floating-ui-portal]:not([data-floating-ui-portal-extras])'); 
		if (portals != null && portals.length > 0){
			for (var i = 0; i < portals.length; i++){
				var portal = portals[i];
				portal.setAttribute('data-floating-ui-portal-extras', '');

				this.addGoToFilm(portal);
			}
		}

		// Add current year to year browse dropdown
		if (this.yearFilterAdded == false && window.location.pathname.startsWith('/films/') && document.querySelector('.smenu-menu.browse-nav-smenu')){
			this.addCurrentYearFilter()
		}

		// Stop
		return this.stopRunning();
	}

	addGoToFilm(portal){
		const ul = portal.querySelector('div ul');

		var filmUrl = "";

		// Get film URL
		var items = ul.querySelectorAll('li a');
		for (var i = 0; i < items.length; i++){
			filmUrl = this.extensionHelpers.regexExtract(items[i].getAttribute("href"), "(\/film\/[A-Za-z0-9\-_'.,`]+\/)", 1, "");

			if (filmUrl != "")
				break;
		}

		if (filmUrl == ""){
			console.error("Letterboxd Extras | Unable to find page URL for \"Go to film\" button!");
			return;
		}

		// Create elements
		const li = this.extensionHelpers.createElement('li', {
			class: 'popmenu-textitem -centered'
		});
		const a = this.extensionHelpers.createElement('a', {
			href: filmUrl,
			["data-tabindex"]: '',
			tabindex: '-1'
		});
		a.innerText = "Go to film";
		li.append(a);

		// Add to page
		ul.append(li);
	}

	addCurrentYearFilter(){
		if (this.yearFilterAdded) return;

		const menus = document.querySelectorAll('ul.smenu-menu.browse-nav-smenu')
		for(let i = 0; i < menus.length; i++) {
			if (menus[i].innerHTML.includes('Year')) {

				const upcoming = document.querySelector('li a[href="/films/upcoming/"]');

				const year = new Date().getFullYear();

				// Create elements
				const li = this.extensionHelpers.createElement('li', {});
				const a = this.extensionHelpers.createElement('a', {
					class: 'item',
					href: `/films/year/${year}`
				});
				a.innerText = year
				li.append(a);

				upcoming.parentElement.after(li);

				this.yearFilterAdded = true;
				break;
			}
		}
	}

}
