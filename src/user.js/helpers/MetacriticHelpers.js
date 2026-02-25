import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class MetacriticHelper extends Helper {

	constructor(storage, helpers, pageState) {

		super(storage, helpers, pageState, 'meta');

        this.state = 0;
        this.data = null;
        this.raw = null;
        this.mustSee = false;
        this.critic = { rating: "N/A", num_ratings: 0, positive: 0, mixed: 0, negative: 0, highest: 0 };
        this.user = { rating: "N/A", num_ratings: 0, positive: 0, mixed: 0, negative: 0, highest: 0 };
	}

    parseRatingScore(data, element){
        if (element == null)
            return;

        if (element != null) {
            // Standard page with score
            data.rating = element.innerText;
        } else {
            // TV episodes with no Metascore
            data.rating = "N/A";
        }
    }

	parseRatingCounts(data, element){
		if (element != null) {
			var criticPositive = element.querySelectorAll('.reviews-stats__positive-stats span');
			var criticNeutral = element.querySelectorAll('.reviews-stats__neutral-stats span');
			var criticNegative = element.querySelectorAll('.reviews-stats__negative-stats span');

			if (criticPositive.length == 2) {
				data.positive = parseInt(criticPositive[1].innerText.replace(" Reviews", ""));
			}
			if (criticNeutral.length == 2) {
				data.mixed = parseInt(criticNeutral[1].innerText.replace(" Reviews", ""));
			}
			if (criticNegative.length == 2) {
				data.negative = parseInt(criticNegative[1].innerText.replace(" Reviews", ""));
			}

			data.num_ratings = data.positive + data.mixed + data.negative;

			// If there are ratings, but no reviews so metacritic doesn't display the breakdown
			if (!(data.rating == "N/A" || data.rating == "tbd") && data.num_ratings == 0) {
				// parseFloat() will remove insigificant zeroes (so 7.0 will become 7)
				var temp = this.getTextBetween(this.raw, 'score:' + parseFloat(data.rating).toString() + ',', 'sentiment:');

				data.num_ratings = parseInt(this.getTextBetween(temp, 'reviewCount:', ','));
				data.positive = parseInt(this.getTextBetween(temp, 'positiveCount:', ','));
				data.mixed = parseInt(this.getTextBetween(temp, 'neutralCount:', ','));
				data.negative = parseInt(this.getTextBetween(temp, 'negativeCount:', ','));

				if (data.num_ratings.isNaN) data.num_ratings = 0
				if (data.positive.isNaN) data.positive = 0
				if (data.mixed.isNaN) data.mixed = 0
				if (data.negative.isNaN) data.negative = 0
			}

			data.highest = this._getMetaHighest(data);
		}
	}

    _getMetaHighest(data) {
        var ratings = [data.positive, data.mixed, data.negative];
        var highest = 0;

        for (var i = 0; i < ratings.length; i++) {
            if (ratings[i] > highest)
                highest = ratings[i];
        }

        return highest;
    }

    createMetaScore(type, display, url, data, mustSee, isMobile, addTooltip) {
        // The span that holds the score
        var style = "";
        if (type == "critic" || mustSee)
            style += "margin-right: 10px;"
        const span = this.helpers.createElement('span', {
            class: 'meta-span-' + type,
            style: style
        });

        var mobileClass = "";
        if (isMobile)
            mobileClass = 'extras-mobile';

        var colour = this._determineMetaColour(data.rating, (type == "user"));
        var textColour = this._determineMetaTextColour(data.rating, (type == "user"));
        var className = 'meta-score';
        if (type == "user")
            className += "-user"
        var style = 'background-color: ' + colour + '; color: ' + textColour
        if (data.rating == "tbd" || data.rating == "N/A")
            style += '; border: 1px solid grey'

        // The element that is the score itself
        const text = this.helpers.createElement('a', {
            class: 'tooltip display-rating -highlight ' + className,
            style: style
        });

        // Create Tooltip
        var tooltip = "";
        var rating = data.rating;
        var suffix = "";
        if (data.num_ratings > 0 && rating == "tbd") {
            tooltip = 'No score yet (' + data.num_ratings.toLocaleString() + ' ' + display + ' review';
            if (data.num_ratings == 1)
                tooltip += ")";
            else
                tooltip += "s)";

        } else if (data.num_ratings > 0) {
            suffix = "/100";
            if (type == "user")
                suffix = "/10";

            if ((this.storage.get('convert-ratings') === "5")){
                suffix = "/5";
                if (type == "critic"){
                    rating = Number(rating / 10 / 2).toFixed(1);
                }else{
                    rating = Number(rating / 2).toFixed(1);
                }
            }
            else if ((this.storage.get('convert-ratings') === "10")){
                suffix = "/10";
                if (type == "critic"){
                    rating = Number(rating / 10).toFixed(1);
                }
            }

            tooltip = "Weighted average of " + rating + suffix + " based on " + data.num_ratings.toLocaleString() + ' ' + display + ' review';
            if (data.num_ratings != 1)
                tooltip += "s"
                
        } else if (url != "") {
            if (rating == "N/A") {
                tooltip = 'No score available';
            } else {
                tooltip = 'No score yet';
            }
        }
        text.setAttribute('data-original-title', tooltip);

        if (tooltip != "")
            text.className += " tooltip-extra";

        // Add href link
        if (data.num_ratings > 0){
            text.setAttribute('href', url);
        }

        text.innerText = rating;
        span.append(text);

        // Add the positive/mixed/negative bars
        const chartSpan = this.helpers.createElement('span', {
            class: 'meta-score-details score-' + type + ' ' + mobileClass,
            style: 'display: none'
        });
        if (type == "critic" && this.storage.get('metacritic-mustsee-enabled') === true && mustSee) {
            chartSpan.className += ' short';
        }
        if ((isMobile) || (type == "critic" && this.storage.get('metacritic-users-enabled') === true) || (type == "user" && this.storage.get('metacritic-mustsee-enabled') === true && mustSee)) {
            chartSpan.style['margin-bottom'] = '10px';
        }
        chartSpan.append(this._createMetaBarCount("Positive", data.positive, data.highest, this._determineMetaColour(100, false)));
        chartSpan.append(this._createMetaBarCount("Mixed", data.mixed, data.highest, this._determineMetaColour(50, false)));
        chartSpan.append(this._createMetaBarCount("Negative", data.negative, data.highest, this._determineMetaColour(0, false)));
        span.append(chartSpan);

        // Add the tooltip as text for mobile
        if (addTooltip && tooltip != "") {
            const detailsSpan = this.helpers.createElement('span', {
                class: 'meta-details-' + type + ' mobile-details-text'
            });

            if (isMobile){
                detailsSpan.className += ' meta-score-details'
                detailsSpan.style.display = 'none';
            }

            const detailsText = this.helpers.createElement('p', {
            });
            detailsText.innerText = tooltip;
            detailsSpan.append(detailsText);

            span.append(detailsSpan);
        }

        return span;
    }

    _createMetaBarCount(type, count, total, color) {
        // Span that holds it all
        const span = this.helpers.createElement('span', {
            style: 'display: block; width: 150px;'
        });
            // Text label
        const label = this.helpers.createElement('span', {
            class: 'meta-bar-label'
        });
        label.innerText = type;
        span.append(label);

        // Span that holds the bar
        const barSpan = this.helpers.createElement('span', {
            style: 'display: inline-block;'
        });
            // Bar outline
        const backBar = this.helpers.createElement('span', {
            class: 'meta-bar outline'
        });
            // Bar that displays the percentage
        var style = (Math.round((count / total) * 100));
        style = 'width: ' + style.toString() + '%; background-color:' + color + ';';
        const frontBar = this.helpers.createElement('span', {
            class: 'meta-bar fill',
            style: style
        });
        backBar.append(frontBar);
        barSpan.append(backBar);
        span.append(barSpan);

        // Text that shows the num of ratings
        const countText = this.helpers.createElement('span', {
            class: 'meta-bar-value'
        });
        countText.innerText = count.toLocaleString();
        span.append(countText);

        return span;
    }
    
    _determineMetaColour(metascore, user) {
        var output = "transparent"; // transparent background tba
        if (metascore != "tbd" && metascore != "N/A") {
            var score = parseFloat(metascore);
            if (user == true) score = score * 10;

            if (score >= 61) {
                output = "#00ce7a" // Green
            } else if (score >= 40) {
                output = "#ffbd3f"; // Yellow
            } else {
                output = "#ff6874"; // Red
            }
        }
        return output;
    }

    _determineMetaTextColour(metascore, user) {
        var output = "lightgray"; // Grey/black default
        if (metascore != "tbd" && metascore != "N/A") {
            var score = parseFloat(metascore);
            if (user == true) score = score * 10;

            if (score >= 40) {
                output = "#262626"; // Grey/black
            } else {
                output = "#fff"; // White
            }
        }
        return output;
    }
}
