function getOffset(el) {
	const rect = el.getBoundingClientRect();
	return {
		left: rect.left + window.scrollX,
		top: rect.top + window.scrollY
	};
}

function ShowTwipsy(event) {
	const htmlEl = document.querySelector('html');
	if (htmlEl.getAttribute('class').includes('no-mobile')) {
	} else {
		return;
	}

	// To account for the tenet easter egg
	const body = htmlEl.querySelector('body');

	if (body.querySelector('.twipsy-extra-out')) {
		const temp = body.querySelector('.twipsy-extra-out');
		temp.parentNode.removeChild(temp);
	}

	const twipsy = document.createElement('div');
	twipsy.className = 'twipsy above twipsy-extra';

	const arrow = document.createElement('div');
	arrow.className = 'twipsy-arrow';
	arrow.style = 'left: 50%';
	twipsy.append(arrow);

	const inner = document.createElement('div');
	inner.className = 'twipsy-inner';
	inner.innerText = this.getAttribute('data-original-title');
	twipsy.append(inner);

	body.prepend(twipsy);

	const rect = getOffset(this);
	const top = rect.top - twipsy.clientHeight;
	const left = rect.left - (twipsy.clientWidth / 2) + (this.offsetWidth / 2);

	twipsy.style = `display:block; top: ${top.toString()}px; left: ${left.toString()}px;`;

	twipsy.className = twipsy.className.replace('twipsy-extra', 'twipsy-extra-in');
}

function HideTwipsy(event) {
	if (document.querySelector('.twipsy-extra-in')) {
		const twipsy = document.querySelector('.twipsy-extra-in');
		// twipsy.parentNode.removeChild(twipsy);
		twipsy.className = twipsy.className.replace('in', 'out');
		setTimeout(() => twipsy.style.visibility = 'hidden', 100);
	}
}

/**
 * Toggles the visibility of rating detail sections and updates the button text.
 *
 * @param {Event} event - The click event from the show/hide details button
 * @param {Object} letterboxdStorage - The storage object used to persist detail visibility state
 * @param {boolean} isMobile - Whether the page is being viewed in its mobile configuration
 */
function toggleDetails(event, letterboxdStorage, isMobile) {
	// Get the target class stored in the 'target' attribute of the clicked button
	const target = `.${event.target.getAttribute('target')}`;
	const elements = document.querySelectorAll(target);

	elements.forEach(element => {
		if (element.style.display === 'none') {
			element.style.display = 'inline-block';
		} else {
			element.style.display = 'none';
		}
	});

	// Move the Rotten Tomatoes tooltip text depending on the details visibility
	if (event.target.className.includes('rt-show-details') && !isMobile) {
		const tomatoDiv = document.querySelector('.tomato-ratings.ratings-extras');

		const criticAllText = document.querySelector('.mobile-details-text.score-critic-all');
		const criticTopText = document.querySelector('.mobile-details-text.score-critic-top');
		const audienceAllText = document.querySelector('.mobile-details-text.score-audience-all');
		const audienceVerifiedText = document.querySelector('.mobile-details-text.score-audience-verified');

		const criticAllDiv = document.querySelector('.rt-score-div.score-critic-all');
		const criticTopDiv = document.querySelector('.rt-score-div.score-critic-top');
		const audienceAllDiv = document.querySelector('.rt-score-div.score-audience-all');
		const audienceVerifiedDiv = document.querySelector('.rt-score-div.score-audience-verified');

		if (event.target.innerText.includes('SHOW')) {
			// Details shown - Put the text after each rating div
			if (criticAllDiv !== null && criticAllText !== null) { criticAllDiv.after(criticAllText); }
			if (criticTopDiv !== null && criticTopText !== null) { criticTopDiv.after(criticTopText); }
			if (audienceAllDiv !== null && audienceAllText !== null) { audienceAllDiv.after(audienceAllText); }
			if (audienceVerifiedDiv !== null && audienceVerifiedText !== null) { audienceVerifiedDiv.after(audienceVerifiedText); }

		} else if (tomatoDiv !== null) {
			// Details hidden - Put the text after all of the rating divs
			if (criticAllText !== null) { tomatoDiv.append(criticAllText); }
			if (criticTopText !== null) { tomatoDiv.append(criticTopText); }
			if (audienceAllText !== null) { tomatoDiv.append(audienceAllText); }
			if (audienceVerifiedText !== null) { tomatoDiv.append(audienceVerifiedText); }
		}
	}

	if (event.target.className.includes('meta-show-details')) {
		// Move the tooltip details text depending on the details visibility
		const metaDiv = document.querySelector('.meta-ratings.ratings-extras');

		const criticText = document.querySelector('.meta-details-critic.mobile-details-text');
		const userText = document.querySelector('.meta-details-user.mobile-details-text');

		const criticDiv = document.querySelector('span.meta-span-critic');
		const userDiv = document.querySelector('span.meta-span-user');

		if (event.target.innerText.includes('SHOW')) {
			// Details shown - Put the text after each rating div
			if (criticDiv !== null && criticText !== null) { criticDiv.after(criticText); }
			if (userDiv !== null && userText !== null) { userDiv.after(userText); }
		} else {
			// Details hidden - Put the text after all of the rating divs
			if (criticText !== null) { metaDiv.append(criticText); }
			if (userText !== null) { metaDiv.append(userText); }
		}

		// Move the 'must-see' badge depending on the details visibility
		const mustSee = document.querySelector('.meta-must-see');
		let userScore = document.querySelector('.meta-score-user');
		const criticScoreDetails = document.querySelector('.meta-score-details.score-critic');
		if (mustSee !== null && userScore !== null) {
			userScore = userScore.parentNode;

			if (event.target.innerText.includes('SHOW')) {
				criticScoreDetails.after(mustSee);
			} else {
				userScore.after(mustSee);
			}

		}
	}

	if (event.target.innerText.includes('SHOW')) {
		event.target.innerText = 'HIDE DETAILS';
		letterboxdStorage.set(target.replace('.', ''), 'show');
	} else {
		event.target.innerText = 'SHOW DETAILS';
		letterboxdStorage.set(target.replace('.', ''), 'hide');
	}
}

function toggleAllRatings(event) {
	const element = document.querySelector('.extras-ratings-holder');

	if (element.style.display === 'none') {
		element.style.display = 'block';
		event.target.innerText = 'Show less ratings';
	} else {
		element.style.display = 'none';
		event.target.innerText = 'Show more ratings';
	}
}
