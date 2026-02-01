import { LOAD_STATES } from "./constants";

export class LetterboxdGeneral {

	constructor(storage, helpers) {
		this.extensionStorage = storage;
		this.extensionHelpers = helpers;
	}

	stopRunning() {
		this.running = false;
	}

	async init(){
		this.running = true;

		const portals = document.querySelectorAll('div[data-floating-ui-portal]:not([data-floating-ui-portal-extras])'); 
		if (portals != null && portals.length > 0){
			for (var i = 0; i < portals.length; i++){
				var portal = portals[i];
				portal.setAttribute('data-floating-ui-portal-extras', '');

				this.addGoToFilm(portal);
			}
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

}
