import { CAST_AVATAR_PLACEHOLDER_SVG, CAST_WATCHED_EYE_SVG, CAST_VIEW_PHOTOS_SVG, CAST_VIEW_COMPACT_SVG } from '../SVG.js';

const BATCH_SIZE = 20;

export class CastHelper {

	constructor(storage, helpers, pageState) {
		this.storage = storage;
		this.helpers = helpers;
		this.pageState = pageState;

		this.rendered = false;
		this.actors = [];
		this.visibleCount = 0;
		this.imdbCast = new Map();
		this.username = null;
		this.castList = null;
		this.list = null;
		this.compactButton = null;
		this.photosButton = null;
	}

	/**
	 * Adds the actor count and view toggle above the cast list on the film page.
	 * Called again once the IMDb data arrives to fill in photos and character names.
	 */
	render(imdbData, loggedIn) {
		// The card list reused below is only styled on Letterboxd's desktop site
		if (this.pageState.isMobile) return;

		this.imdbCast = this.mapImdbCast(imdbData);

		if (this.rendered) {
			this.updateCards();
			return;
		}

		const castList = document.querySelector('#tab-panel-cast .cast-list');
		if (castList === null) return;

		this.actors = Array.from(castList.querySelectorAll('a[href*="/actor/"]')).map(link => {
			const href = link.getAttribute('href');
			return {
				name: link.textContent.trim(),
				href: href,
				slug: href.replace(/^\/actor\/|\/$/g, ''),
				character: link.getAttribute('data-original-title') || link.getAttribute('title') || ''
			};
		});
		if (this.actors.length === 0) return;

		this.castList = castList;
		this.username = loggedIn ? this.getUsername() : null;

		const section = this.helpers.createElement('div', { class: 'extras-cast-section' });
		section.append(this.createToolbar());

		// Same card list as the film page's related news, filled when the photos view is first shown
		this.list = this.helpers.createElement('div', { class: 'extras-cast-list card-summary-list -vertical-list-vp-min-tablet' });
		section.append(this.list);

		castList.before(section);

		this.setView(this.storage.localGet('cast-extras-view') === 'photos');
		this.rendered = true;
	}

	createToolbar() {
		// Letterboxd's list page bar: count on the left, view toggle on the right
		const toolbar = this.helpers.createElement('div', { class: 'internal-content-nav has-toggle extras-cast-toolbar' });

		const toggle = this.helpers.createElement('ul', { class: 'view-toggle' });
		this.compactButton = this.createViewButton('Compact', CAST_VIEW_COMPACT_SVG, false);
		this.photosButton = this.createViewButton('Photos', CAST_VIEW_PHOTOS_SVG, true);
		toggle.append(this.compactButton.parentElement, this.photosButton.parentElement);
		toolbar.append(toggle);

		const count = this.helpers.createElement('p', { class: 'list-date' });
		count.innerText = `${this.actors.length} actor${this.actors.length === 1 ? '' : 's'}`;
		toolbar.append(count);

		toolbar.append(this.helpers.createElement('div', { class: 'clear' }));

		return toolbar;
	}

	createViewButton(label, icon, photos) {
		const item = this.helpers.createElement('li', {});
		const button = this.helpers.createElement('button', { class: 'replace', type: 'button', title: `${label} view` });
		button.innerHTML = icon;
		button.addEventListener('click', () => {
			this.setView(photos);
			this.storage.localSet('cast-extras-view', photos ? 'photos' : 'compact');
		});
		item.append(button);

		return button;
	}

	setView(photos) {
		this.compactButton.parentElement.classList.toggle('selected', !photos);
		this.photosButton.parentElement.classList.toggle('selected', photos);
		this.castList.style.display = photos ? 'none' : '';
		this.list.style.display = photos ? '' : 'none';

		if (photos && this.visibleCount === 0) {
			this.loadMore();
		}
	}

	loadMore() {
		const button = this.list.querySelector('.showalltrigger');
		if (button !== null) button.remove();

		for (const actor of this.actors.slice(this.visibleCount, this.visibleCount + BATCH_SIZE)) {
			this.list.append(this.createCard(actor));
		}
		this.visibleCount = Math.min(this.visibleCount + BATCH_SIZE, this.actors.length);

		const remaining = this.actors.length - this.visibleCount;
		if (remaining > 0) {
			this.list.append(this.createLoadMoreButton(remaining));
		}
	}

	createLoadMoreButton(remaining) {
		// Same button Letterboxd uses to expand its related news list
		const button = this.helpers.createElement('button', {
			class: 'showalltrigger',
			type: 'button',
			title: `Showing ${this.visibleCount} of ${this.actors.length} cast members`
		});
		const label = this.helpers.createElement('span', { class: 'label' });
		label.innerText = `Load ${Math.min(BATCH_SIZE, remaining)} More`;
		button.append(label);
		button.addEventListener('click', () => this.loadMore());

		return button;
	}

	createCard(actor) {
		const card = this.helpers.createElement('article', { class: 'card-summary extras-cast-card' });
		const inner = this.helpers.createElement('div', { class: 'inner' });
		card.append(inner);

		if (this.storage.get('cast-extras-photos') === true) {
			inner.append(this.createAvatar(actor));
		}

		const detail = this.helpers.createElement('div', { class: 'extras-cast-detail body-text -prose' });
		const name = this.helpers.createElement('a', { class: 'extras-cast-name', href: actor.href });
		name.innerText = actor.name;
		const character = this.helpers.createElement('span', { class: 'extras-cast-character' });
		this.setCharacter(character, actor);
		detail.append(name, character);
		inner.append(detail);

		if (this.storage.get('cast-extras-seen-count') === true && this.username !== null) {
			inner.append(this.createWatchedLink(actor));
		}

		return card;
	}

	createAvatar(actor) {
		const media = this.helpers.createElement('figure', { class: 'media -image' });
		const link = this.helpers.createElement('a', { class: 'canvas', href: actor.href, title: actor.name });
		this.setPhoto(link, actor);
		media.append(link);

		return media;
	}

	// IMDb headshot, or a placeholder when there is none or it fails to load
	setPhoto(link, actor) {
		const photoUrl = this.imdbCast.get(this.normalize(actor.name))?.photoUrl;
		if (!photoUrl) {
			link.innerHTML = CAST_AVATAR_PLACEHOLDER_SVG;
			return;
		}

		const img = this.helpers.createElement('img', { src: photoUrl, alt: actor.name, loading: 'lazy' });
		img.addEventListener('error', () => {
			link.innerHTML = CAST_AVATAR_PLACEHOLDER_SVG;
		});
		link.replaceChildren(img);
	}

	// Letterboxd lists some roles as "Extra" or leaves them blank, so fall back to IMDb's character name
	setCharacter(span, actor) {
		let character = actor.character;
		if (character === '' || character.toLowerCase() === 'extra') {
			character = this.imdbCast.get(this.normalize(actor.name))?.character || character;
		}
		span.innerText = character;
		span.title = character;
	}

	// Fills in photos and character names for cards created before the IMDb data loaded
	updateCards() {
		this.list.querySelectorAll('.extras-cast-card').forEach((card, i) => {
			const actor = this.actors[i];
			const photo = card.querySelector('.canvas');
			if (photo !== null && photo.querySelector('img') === null) {
				this.setPhoto(photo, actor);
			}
			this.setCharacter(card.querySelector('.extras-cast-character'), actor);
		});
	}

	createWatchedLink(actor) {
		const link = this.helpers.createElement('a', {
			class: 'extras-cast-watched',
			href: `/${this.username}/films/with/actor/${actor.slug}/`,
			title: `Films starring ${actor.name} you have watched`
		});
		link.innerHTML = CAST_WATCHED_EYE_SVG;
		const count = this.helpers.createElement('span', {});
		count.innerText = '...';
		link.append(count);

		this.loadWatchedCount(actor.slug, link, count);

		return link;
	}

	// Counts are cached for the tab session so revisiting films doesn't refetch them
	async loadWatchedCount(slug, link, countSpan) {
		const cacheKey = `extras-cast-seen-${this.username}-${slug}`;

		let count = null;
		try {
			count = sessionStorage.getItem(cacheKey);
		} catch (error) {
			// sessionStorage can be blocked by browser privacy settings
		}

		if (count === null) {
			count = await this.fetchWatchedCount(slug);
			if (count === null) {
				link.style.display = 'none';
				return;
			}
			try {
				sessionStorage.setItem(cacheKey, count);
			} catch (error) {
				// Nothing to do, the count just won't be cached
			}
		}

		count = Number(count);
		countSpan.innerText = `${count} film${count === 1 ? '' : 's'}`;
		link.classList.toggle('-has-watched', count > 0);
	}

	async fetchWatchedCount(slug) {
		try {
			const response = await fetch(`/${this.username}/films/with/actor/${slug}/`, { credentials: 'same-origin' });
			if (!response.ok) return null;

			// Heading reads "You’ve watched 11 films starring ..." or "You haven’t watched any films starring ..."
			const page = new DOMParser().parseFromString(await response.text(), 'text/html');
			const heading = page.querySelector('.ui-block-heading');
			if (heading === null) return null;

			const match = heading.textContent.match(/watched\s+([\d,]+)\s+film/i);
			return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
		} catch (error) {
			console.error(`Letterboxd Extras | Unable to load the watched count for ${slug}`, error);
			return null;
		}
	}

	// Letterboxd's page scripts set person.username when logged in
	getUsername() {
		const match = document.documentElement.innerHTML.match(/person\.username\s*=\s*["']([^"']+)["']/);
		if (match !== null) return match[1];

		// Otherwise the sidebar's "Show your activity" link: /{username}/film/{slug}/activity/
		const activity = document.querySelector('a[href*="/film/"][href$="/activity/"]');
		return activity?.getAttribute('href').match(/^\/([^/]+)\/film\//)?.[1] ?? null;
	}

	// Lower-case letters and digits only, so "Stellan Skarsgård" matches IMDb's spelling of the name
	normalize(name) {
		return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
	}

	// Normalized actor name -> { photoUrl, character } from the IMDb credits
	mapImdbCast(imdbData) {
		const cast = new Map();
		for (const edge of imdbData?.title?.credits?.edges ?? []) {
			const text = edge.node?.name?.nameText?.text;
			if (text) {
				cast.set(this.normalize(text), {
					photoUrl: edge.node.name.primaryImage?.url ?? null,
					character: edge.node.characters?.[0]?.name ?? ''
				});
			}
		}
		return cast;
	}
}
