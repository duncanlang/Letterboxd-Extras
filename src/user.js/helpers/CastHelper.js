import { CAST_AVATAR_PLACEHOLDER_SVG, CAST_WATCHED_EYE_SVG } from '../SVG.js';

export class CastHelper {

	constructor(storage, helpers, pageState) {
		this.storage = storage;
		this.helpers = helpers;
		this.pageState = pageState;

		this.rendered = false;
		this.currentFilmPath = null;
		this.seenCountCache = new Map();
		this.isExpandedView = true;
		this.actorsData = [];
		this.visibleCount = 20;
		this.imdbMap = new Map();
		this.username = null;
		this.loggedIn = false;

		this.injectStyles();
	}

	injectStyles() {
		if (document.getElementById('extras-cast-styles')) return;

		const style = document.createElement('style');
		style.id = 'extras-cast-styles';
		style.textContent = `
			.extras-cast-section {
				margin-top: 10px;
				margin-bottom: 15px;
			}
			.extras-cast-toolbar {
				display: flex;
				align-items: center;
				justify-content: flex-end;
				margin-bottom: 12px;
			}
			.extras-cast-toggle-btn {
				background: rgba(255, 255, 255, 0.08);
				color: #9ab;
				border: 1px solid rgba(255, 255, 255, 0.12);
				border-radius: 14px;
				padding: 3px 10px;
				font-size: 11px;
				font-family: inherit;
				font-weight: 600;
				cursor: pointer;
				transition: all 0.2s ease;
				display: inline-flex;
				align-items: center;
				gap: 5px;
			}
			.extras-cast-toggle-btn:hover {
				background: rgba(255, 255, 255, 0.16);
				color: #fff;
				border-color: rgba(255, 255, 255, 0.25);
			}
			.extras-cast-grid {
				display: grid;
				grid-template-columns: minmax(0, 1fr);
				gap: 6px;
			}
			.extras-cast-card {
				display: flex;
				align-items: center;
				gap: 12px;
				padding: 5px 10px;
				border-radius: 6px;
				background: rgba(255, 255, 255, 0.02);
				border: 1px solid rgba(255, 255, 255, 0.04);
				min-width: 0;
				overflow: hidden;
				transition: background 0.15s ease, border-color 0.15s ease;
			}
			.extras-cast-card:hover {
				background: rgba(255, 255, 255, 0.06);
				border-color: rgba(255, 255, 255, 0.12);
			}
			.extras-cast-avatar-wrap {
				flex-shrink: 0;
				width: 42px;
				height: 42px;
				border-radius: 50%;
				overflow: hidden;
				background-color: #1e252d;
				border: 1.5px solid rgba(255, 255, 255, 0.12);
				box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.extras-cast-avatar-img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				border-radius: 50%;
				display: block;
			}
			.extras-cast-avatar-placeholder {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;
				height: 100%;
				background: #242c34;
			}
			.extras-cast-info {
				display: flex;
				flex-direction: column;
				justify-content: center;
				min-width: 0;
				flex-grow: 1;
				gap: 2px;
			}
			.extras-cast-name {
				color: #fff !important;
				font-weight: 700;
				font-size: 13.5px;
				line-height: 1.25;
				text-decoration: none;
				word-break: break-word;
			}
			.extras-cast-name:hover {
				color: #00e054 !important;
			}
			.extras-cast-subrow {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 8px;
				min-width: 0;
			}
			.extras-cast-character {
				color: #89a;
				font-size: 12px;
				line-height: 1.2;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				min-width: 0;
				flex: 1 1 0%;
			}
			.extras-cast-watched {
				display: inline-flex;
				align-items: center;
				gap: 4px;
				font-size: 11px;
				color: #678 !important;
				text-decoration: none;
				padding: 1px 7px;
				border-radius: 10px;
				background-color: rgba(255, 255, 255, 0.04);
				border: 1px solid rgba(255, 255, 255, 0.06);
				width: fit-content;
				margin-left: auto;
				flex-shrink: 0;
				transition: all 0.15s ease;
			}
			.extras-cast-watched:hover {
				background-color: rgba(255, 255, 255, 0.1);
				border-color: rgba(255, 255, 255, 0.18);
				color: #bcd !important;
			}
			.extras-cast-watched.-has-watched {
				color: #00e054 !important;
				background-color: rgba(0, 224, 84, 0.12);
				border-color: rgba(0, 224, 84, 0.25);
			}
			.extras-cast-watched.-has-watched:hover {
				background-color: rgba(0, 224, 84, 0.22);
				border-color: rgba(0, 224, 84, 0.4);
			}
			.extras-cast-footer {
				margin-top: 14px;
				padding-top: 10px;
				border-top: 1px solid rgba(255, 255, 255, 0.08);
				font-size: 12px;
				color: #89a;
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 10px;
			}
			.extras-cast-count-label {
				font-size: 12px;
				color: #89a;
			}
			.extras-cast-load-more-btn {
				background: rgba(255, 255, 255, 0.08);
				color: #bcd;
				border: 1px solid rgba(255, 255, 255, 0.14);
				border-radius: 14px;
				padding: 4px 14px;
				font-size: 11.5px;
				font-family: inherit;
				font-weight: 600;
				cursor: pointer;
				transition: all 0.2s ease;
			}
			.extras-cast-load-more-btn:hover {
				background: rgba(0, 224, 84, 0.15);
				color: #00e054;
				border-color: rgba(0, 224, 84, 0.35);
			}
		`;
		document.head.appendChild(style);
	}

	normalize(str) {
		if (!str) return '';
		const normalized = str.toLowerCase().normalize('NFD');
		return normalized.replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
	}

	truncateCharacter(name, maxLength = 30) {
		if (!name) return '';
		const trimmed = name.trim();
		if (trimmed.length <= maxLength) return trimmed;

		// If name contains multiple roles separated by " / "
		if (trimmed.includes('/')) {
			const roles = trimmed.split(/\s*\/\s*/).map(r => r.trim()).filter(Boolean);
			let result = '';
			for (const role of roles) {
				const candidate = result ? `${result} / ${role}` : role;
				if (candidate.length + 3 <= maxLength) {
					result = candidate;
				} else {
					break;
				}
			}
			if (result) {
				return `${result}...`;
			}
		}

		// Fallback for long single role or if first role exceeds maxLength
		const cut = trimmed.slice(0, maxLength - 3);
		const lastSpace = cut.lastIndexOf(' ');
		if (lastSpace > 12) {
			return `${cut.slice(0, lastSpace).replace(/\s*[/,-]?\s*$/, '').trim()}...`;
		}
		return `${cut.replace(/\s*[/,-]?\s*$/, '').trim()}...`;
	}

	getUsername() {
		try {
			// 1. From 'Show your activity' link in sidebar on film pages (e.g. /username/film/coherence/activity/)
			const activityLink = document.querySelector('a[href*="/film/"][href*="/activity"], a.show-activity');
			if (activityLink) {
				const href = activityLink.getAttribute('href') || '';
				const m = href.match(/^\/([^/]+)\/film\//);
				if (m && m[1]) return m[1];
			}

			// 2. From person object in scripts: person = { username: '...' } or person.username = '...'
			const scriptHtml = document.documentElement.innerHTML;
			const personObjMatch = scriptHtml.match(/person\s*=\s*\{[^}]*username:\s*["']([^"']+)["']/);
			if (personObjMatch && personObjMatch[1]) {
				return personObjMatch[1];
			}
			const personPropMatch = scriptHtml.match(/person\.username\s*=\s*["']([^"']+)["']/);
			if (personPropMatch && personPropMatch[1]) {
				return personPropMatch[1];
			}

			// 3. From user menu or avatar link in navigation header
			const profileLink = document.querySelector('.nav-account .nav-link, a.nav-account-profile-link, #header .nav-account a[href^="/"], li.nav-account a[href^="/"]');
			if (profileLink) {
				const href = profileLink.getAttribute('href') || '';
				const m = href.match(/^\/([a-zA-Z0-9_\-]+)\/?$/);
				const excluded = ['films', 'members', 'lists', 'reviews', 'activity', 'watchlist', 'journal'];
				if (m && m[1] && !excluded.includes(m[1].toLowerCase())) {
					return m[1];
				}
			}

			// 4. From any data-person attribute on user interaction elements
			const personEl = document.querySelector('[data-person]');
			if (personEl) {
				const p = personEl.getAttribute('data-person');
				if (p) return p;
			}
		} catch (e) {
			console.error('Error getting username:', e);
		}
		return null;
	}

	isCastExtrasEnabled() {
		if (this.storage.get('cast-extras-enabled') === false) return false;
		if (this.storage.get('expanded-cast-enabled') === false) return false;
		return true;
	}

	render(imdbCastEdges = null, loggedIn = false) {
		if (!this.isCastExtrasEnabled()) {
			const castPanel = document.querySelector('#tab-panel-cast');
			if (castPanel) {
				const existing = castPanel.querySelector('.extras-cast-section');
				if (existing) existing.remove();
				const originalCastList = castPanel.querySelector('.cast-list');
				if (originalCastList) originalCastList.style.display = '';
			}
			return;
		}

		const castPanel = document.querySelector('#tab-panel-cast');
		if (!castPanel) return;

		const originalCastList = castPanel.querySelector('.cast-list');
		if (!originalCastList) return;

		// Check if film path changed or if we need to re-render
		if (this.currentFilmPath !== window.location.pathname) {
			this.currentFilmPath = window.location.pathname;
			this.rendered = false;
			this.visibleCount = 20;
			const existing = castPanel.querySelector('.extras-cast-section');
			if (existing) existing.remove();
		}

		// Collect actors from original cast list if not collected
		const actorLinks = Array.from(originalCastList.querySelectorAll('a[href*="/actor/"]'));
		if (actorLinks.length === 0) return;

		this.actorsData = actorLinks.map(a => {
			const name = a.textContent.trim();
			const href = a.getAttribute('href');
			const slug = href.replace(/^\/actor\/|\/$/g, '');
			const character = a.getAttribute('data-original-title') || a.getAttribute('title') || '';
			return { name, href, slug, character };
		});

		// Build IMDb cast lookup map
		const imdbMap = new Map();
		if (imdbCastEdges && Array.isArray(imdbCastEdges)) {
			for (const edge of imdbCastEdges) {
				const node = edge && edge.node;
				const textName = node && node.name && node.name.nameText && node.name.nameText.text;
				if (textName) {
					const norm = this.normalize(textName);
					imdbMap.set(norm, {
						photoUrl: (node.name.primaryImage && node.name.primaryImage.url) || null,
						character: (node.characters && node.characters[0] && node.characters[0].name) || ''
					});
				}
			}
		}

		this.imdbMap = imdbMap;
		this.loggedIn = loggedIn;
		this.username = loggedIn ? this.getUsername() : null;

		let section = castPanel.querySelector('.extras-cast-section');
		if (!section) {
			section = document.createElement('div');
			section.className = 'extras-cast-section';
			castPanel.insertBefore(section, originalCastList);
		} else if (this.rendered) {
			// If already rendered, update photos and character names in-place
			const showPhotos = this.storage.get('cast-extras-photos') !== false;
			if (imdbMap.size > 0) {
				const cards = section.querySelectorAll('.extras-cast-card');
				for (const card of cards) {
					const nameEl = card.querySelector('.extras-cast-name');
					if (!nameEl) continue;
					const normName = this.normalize(nameEl.textContent);
					const imdbActor = imdbMap.get(normName);
					if (imdbActor) {
						if (showPhotos && imdbActor.photoUrl) {
							const avatarWrap = card.querySelector('.extras-cast-avatar-wrap');
							if (avatarWrap && !avatarWrap.querySelector('.extras-cast-avatar-img')) {
								const img = document.createElement('img');
								img.className = 'extras-cast-avatar-img';
								img.src = imdbActor.photoUrl;
								img.alt = nameEl.textContent;
								img.loading = 'lazy';
								img.onerror = () => {
									avatarWrap.innerHTML = `<div class="extras-cast-avatar-placeholder">${CAST_AVATAR_PLACEHOLDER_SVG}</div>`;
								};
								avatarWrap.innerHTML = '';
								avatarWrap.appendChild(img);
							}
						}
						if (imdbActor.character) {
							const charEl = card.querySelector('.extras-cast-character');
							if (charEl && (!charEl.textContent || charEl.textContent.toLowerCase() === 'extra')) {
								const fullChar = imdbActor.character;
								charEl.textContent = this.truncateCharacter(fullChar);
								if (fullChar) {
									charEl.title = fullChar;
								}
							}
						}
					}
				}
			}
			return;
		}

		// Initial display batch
		const initialBatch = this.actorsData.slice(0, this.visibleCount);

		section.innerHTML = '';

		// Create Toolbar with View Toggle
		const toolbar = document.createElement('div');
		toolbar.className = 'extras-cast-toolbar';

		const toggleBtn = document.createElement('button');
		toggleBtn.type = 'button';
		toggleBtn.className = 'extras-cast-toggle-btn';
		toggleBtn.textContent = this.isExpandedView ? 'Show Compact View' : 'Show Photos View';
		toggleBtn.addEventListener('click', () => {
			this.isExpandedView = !this.isExpandedView;
			toggleBtn.textContent = this.isExpandedView ? 'Show Compact View' : 'Show Photos View';
			const gridEl = section.querySelector('.extras-cast-grid');
			const footerEl = section.querySelector('.extras-cast-footer');
			if (this.isExpandedView) {
				if (gridEl) gridEl.style.display = 'grid';
				if (footerEl) footerEl.style.display = 'flex';
				originalCastList.style.display = 'none';
			} else {
				if (gridEl) gridEl.style.display = 'none';
				if (footerEl) footerEl.style.display = 'none';
				originalCastList.style.display = 'block';
			}
		});
		toolbar.appendChild(toggleBtn);
		section.appendChild(toolbar);

		// Hide original cast list when expanded view is active
		originalCastList.style.display = this.isExpandedView ? 'none' : 'block';

		// Create Grid
		const grid = document.createElement('div');
		grid.className = 'extras-cast-grid';
		if (!this.isExpandedView) {
			grid.style.display = 'none';
		}

		for (const actor of initialBatch) {
			const card = this.createActorCard(actor);
			grid.appendChild(card);
		}

		section.appendChild(grid);

		// Footer with Load More button if there are more than 20 actors
		if (this.actorsData.length > 20) {
			const footer = document.createElement('div');
			footer.className = 'extras-cast-footer';
			this.updateFooter(footer, grid);
			if (!this.isExpandedView) {
				footer.style.display = 'none';
			}
			section.appendChild(footer);
		}

		this.rendered = true;
	}

	createActorCard(actor) {
		const card = document.createElement('div');
		card.className = 'extras-cast-card';
		card.dataset.slug = actor.slug;

		// Match IMDb data
		const normName = this.normalize(actor.name);
		const imdbActor = this.imdbMap ? this.imdbMap.get(normName) : null;
		const photoUrl = (imdbActor && imdbActor.photoUrl) || null;
		let characterName = actor.character;
		if ((!characterName || characterName.toLowerCase() === 'extra') && imdbActor && imdbActor.character) {
			characterName = imdbActor.character;
		}

		const showPhotos = this.storage.get('cast-extras-photos') !== false;
		const showSeen = this.storage.get('cast-extras-seen-count') !== false;

		// Avatar element
		if (showPhotos) {
			const avatarWrap = document.createElement('a');
			avatarWrap.className = 'extras-cast-avatar-wrap';
			avatarWrap.href = actor.href;
			avatarWrap.title = actor.name;

			if (photoUrl) {
				const img = document.createElement('img');
				img.className = 'extras-cast-avatar-img';
				img.src = photoUrl;
				img.alt = actor.name;
				img.loading = 'lazy';
				img.onerror = () => {
					avatarWrap.innerHTML = `<div class="extras-cast-avatar-placeholder">${CAST_AVATAR_PLACEHOLDER_SVG}</div>`;
				};
				avatarWrap.appendChild(img);
			} else {
				avatarWrap.innerHTML = `<div class="extras-cast-avatar-placeholder">${CAST_AVATAR_PLACEHOLDER_SVG}</div>`;
			}
			card.appendChild(avatarWrap);
		}

		// Info element
		const info = document.createElement('div');
		info.className = 'extras-cast-info';

		const nameLink = document.createElement('a');
		nameLink.className = 'extras-cast-name';
		nameLink.href = actor.href;
		nameLink.textContent = actor.name;
		info.appendChild(nameLink);

		// Subrow (Row 2: Character name on left, seen count on right)
		const subrow = document.createElement('div');
		subrow.className = 'extras-cast-subrow';

		const rawCharName = characterName || '';
		const charSpan = document.createElement('span');
		charSpan.className = 'extras-cast-character';
		charSpan.textContent = this.truncateCharacter(rawCharName);
		if (rawCharName) {
			charSpan.title = rawCharName;
		}
		subrow.appendChild(charSpan);

		// Watched badge
		if (showSeen && this.loggedIn && this.username) {
			const watchedLink = document.createElement('a');
			watchedLink.className = 'extras-cast-watched';
			watchedLink.href = `/${this.username}/films/with/actor/${actor.slug}/`;
			watchedLink.title = `View films starring ${actor.name} you have seen`;

			const iconSpan = document.createElement('span');
			iconSpan.className = 'extras-cast-watched-icon';
			iconSpan.innerHTML = CAST_WATCHED_EYE_SVG;

			const countSpan = document.createElement('span');
			countSpan.className = 'extras-cast-watched-count';
			countSpan.textContent = '...';

			watchedLink.appendChild(iconSpan);
			watchedLink.appendChild(countSpan);

			subrow.appendChild(watchedLink);

			// Fetch or retrieve watched count asynchronously
			this.loadActorWatchedCount(this.username, actor.slug, watchedLink);
		}

		info.appendChild(subrow);

		card.appendChild(info);
		return card;
	}

	loadMoreActors(grid, footer) {
		const nextBatch = this.actorsData.slice(this.visibleCount, this.visibleCount + 20);
		for (const actor of nextBatch) {
			const card = this.createActorCard(actor);
			grid.appendChild(card);
		}
		this.visibleCount += nextBatch.length;
		this.updateFooter(footer, grid);
	}

	updateFooter(footer, grid) {
		if (!footer) return;
		footer.innerHTML = '';
		const total = this.actorsData.length;
		const remaining = total - this.visibleCount;

		const label = document.createElement('span');
		label.className = 'extras-cast-count-label';

		if (remaining <= 0) {
			label.textContent = `Showing all ${total} cast members`;
			footer.appendChild(label);
			return;
		}

		const nextCount = Math.min(20, remaining);
		label.textContent = `Showing ${this.visibleCount} of ${total} cast members`;
		footer.appendChild(label);

		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'extras-cast-load-more-btn';
		btn.textContent = `Load ${nextCount} More`;
		btn.addEventListener('click', () => {
			this.loadMoreActors(grid, footer);
		});
		footer.appendChild(btn);
	}

	async loadActorWatchedCount(username, actorSlug, badgeElement) {
		const cacheKey = `lb_extra_v2_seen_${username}_${actorSlug}`;

		// Check memory / sessionStorage cache
		if (this.seenCountCache.has(cacheKey)) {
			this.updateBadgeCount(badgeElement, this.seenCountCache.get(cacheKey));
			return;
		}

		try {
			const sessionVal = sessionStorage.getItem(cacheKey);
			if (sessionVal !== null) {
				const count = parseInt(sessionVal, 10);
				this.seenCountCache.set(cacheKey, count);
				this.updateBadgeCount(badgeElement, count);
				return;
			}
		} catch (e) {
			// ignore sessionStorage error
		}

		// Fetch from Letterboxd
		try {
			const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'https://letterboxd.com';
			const url = `${origin}/${username}/films/with/actor/${actorSlug}/`;
			const res = await fetch(url, { credentials: 'same-origin' });
			if (res.status === 200) {
				const html = await res.text();
				let count = null;

				if (typeof DOMParser !== 'undefined') {
					const doc = new DOMParser().parseFromString(html, 'text/html');
					const emptySection = doc.querySelector('.filtered-message.empty-text, .empty-text');
					const headingEl = doc.querySelector('.filtered-message .ui-block-heading, .ui-block-heading');
					const headingText = headingEl ? headingEl.textContent.trim() : '';

					if (emptySection || /haven[’']t\s+watched\s+any|hasn[’']t\s+watched\s+any|watched\s+any\s+films\s+starring/i.test(headingText)) {
						count = 0;
					} else if (headingText) {
						const m = headingText.match(/watched\s+([0-9,]+)\s+film/i);
						if (m) {
							count = parseInt(m[1].replace(/,/g, ''), 10);
						}
					}

					// Fallback: only count items in the member's main film list
					if (count === null) {
						const filmList = doc.querySelector('#content .poster-list, section.film-list .poster-list, .films-watched .poster-list');
						if (filmList) {
							const posters = filmList.querySelectorAll('li.poster-container, .film-poster');
							count = posters.length;
						} else if (doc.querySelector('.empty-text') || (doc.body && /no\s+films/i.test(doc.body.textContent))) {
							count = 0;
						}
					}
				}

				// Fallback regex if DOMParser not available or count unassigned
				if (count === null) {
					const headingMatch = html.match(/class="[^"]*ui-block-heading[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
					const headingText = headingMatch ? headingMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
					if (/haven[’']t\s+watched\s+any|hasn[’']t\s+watched\s+any|watched\s+any\s+films\s+starring/i.test(headingText)) {
						count = 0;
					} else if (headingText) {
						const m = headingText.match(/watched\s+([0-9,]+)\s+film/i);
						if (m) {
							count = parseInt(m[1].replace(/,/g, ''), 10);
						}
					}
				}

				if (count === null) {
					count = 0;
				}

				this.seenCountCache.set(cacheKey, count);
				try {
					sessionStorage.setItem(cacheKey, count.toString());
				} catch (e) {}

				this.updateBadgeCount(badgeElement, count);
			} else {
				this.updateBadgeCount(badgeElement, null);
			}
		} catch (err) {
			console.error(`Failed to load watched count for ${actorSlug}:`, err);
			this.updateBadgeCount(badgeElement, null);
		}
	}

	updateBadgeCount(badgeElement, count) {
		if (!badgeElement) return;
		const countSpan = badgeElement.querySelector('.extras-cast-watched-count');
		if (!countSpan) return;

		if (count === null) {
			badgeElement.style.display = 'none';
			return;
		}

		countSpan.textContent = `${count} seen`;
		if (count > 0) {
			badgeElement.classList.add('-has-watched');
		} else {
			badgeElement.classList.remove('-has-watched');
		}
	}
}
