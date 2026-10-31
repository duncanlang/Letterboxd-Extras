/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOAD_STATES } from '../constants';
import { PageState, StorageObject } from '../types/types';
import { Helper } from './Helper';

export class CinemascoreHelper extends Helper {

    data: Object[]
    movieTitle : string;
    movieYears : string[];
    cinemascoreGrade : string;

	constructor(storage: StorageObject, helpers: any, pageState: PageState) {

		super(storage, helpers, pageState, 'cinemascore');

        this.data = [];
        this.movieTitle = '';
        this.movieYears = [];
        this.cinemascoreGrade = '';

	}

    populateRatingsSidebar(): void {

		// Return if there is no grade
		if (this.cinemascoreGrade === '') { return; }
        
		// Create and Add
		// Add the section to the page
		const chartSection = this._createChartSectionElement(false);
		const heading = this._createChartSectionHeader( { style: 'height: 13px;' } );
		const a = this.helpers.createElement('a', {
            href: 'https://www.cinemascore.com/'
        });
        a.innerText = 'Cinemascore';
        heading.append(a);
		chartSection.append(heading);

        // The span that holds the score
		const span = this.helpers.createElement('span', {}, {
			'display': 'inline-block',
		});

		// The element that is the score itself
		const text = this.helpers.createElement('a', {
            class: 'tooltip display-rating -highlight cinema-grade',
		});
		text.innerText = this.cinemascoreGrade;
		span.append(text);

        chartSection.append(span);
        
        // Append to the sidebar
        //* ****************************************************************
        this.appendSidebarRating(chartSection);
        
    }

	async searchData(movieTitle : string, movieYears: string[], tmdbTV: boolean) {

        this.movieTitle = movieTitle;
        this.movieYears = movieYears;

		if (this.storage.get('cinema-enabled') !== true){
		    this.loadState = LOAD_STATES['Success'];
            return;
		}

        if (tmdbTV == true) {
		    this.loadState = LOAD_STATES['Success'];
            this.helpers.WriteConsoleLog('DEBUG', `Cinemascore: item has TMDB TV ID, skipping.`);
            return;
        }
        
        if (this.movieYears.every(year => parseInt(year) < 1978)) {
            // Cinemascore founded in 1978, so don't bother for anything prior
		    this.loadState = LOAD_STATES['Success'];
            this.helpers.WriteConsoleLog('DEBUG', `Cinemascore: film from prior to 1978, skipping.`);
            return;
        }

		this.loadState = LOAD_STATES['Pending'];

        const originalTitle = this._getSearchTitle(movieTitle);
        const searchTermObjects: Object[] = this._getAllSearchTitles(originalTitle);

        let successfulResponse = null;

        for (const searchTermObject of searchTermObjects) {            
            const result = await this._fetchCinemascoreAsync(searchTermObject);
            
            if (result) {
                successfulResponse = result;
                break; // Stop searching once a match is found
            }
        }

        if (!successfulResponse) {
            this.loadState = LOAD_STATES['Failure'];
            this.helpers.WriteConsoleLog('DEBUG', `Cinemascore: did not match any results from the API.`);
            return;
        }

        this.populateRatingsSidebar();

        this.loadState = LOAD_STATES['Success'];
	}
    
    _getAllSearchTitles(movieTitle: string): Object[] {
        const searchTitles: Object[] = [];

        // Original Title
        searchTitles.push({ searchTerm: movieTitle, matchType: 'ALL' } );

        // Replace Ampersand (and)
        if (movieTitle.includes("&")) {
            searchTitles.push({ searchTerm: movieTitle.replace('&', 'and'), matchType: 'ALL' } );
        }

        // Search After Hyphen (-)
        //****************************************************************
        if (movieTitle.includes(" - ")) {
            let titleSplit = movieTitle.split(" - ");

            if (titleSplit[1].toUpperCase().includes("THE MOVIE")) {
                searchTitles.push({ searchTerm: titleSplit[0], matchType: 'START' } );
            } else {
                searchTitles.push({ searchTerm: titleSplit[1], matchType: 'END' } );
            }
        }

        // Search After Colon (:)
        //****************************************************************
        if (movieTitle.includes(": ")) {
            let titleSplit = movieTitle.split(": ");

            if (titleSplit[1].toUpperCase().includes("THE MOVIE")) {
                searchTitles.push({ searchTerm: titleSplit[0], matchType: 'START' } );
            } else {
                searchTitles.push({ searchTerm: titleSplit[1], matchType: 'END' } );
            }
        }

        // Search Before Colon (:)
        //****************************************************************
        if (movieTitle.includes(": ")) {
            let titleSplit = movieTitle.split(": ");

            if (titleSplit[1].toUpperCase().includes("THE MOVIE")) {
                // Already done before
            } else {
                searchTitles.push({ searchTerm: titleSplit[0], matchType: 'START' } );
            }
        }

        // Replace Numbers with Roman Numerals
        //****************************************************************
        const digitRegex = /( [0-9]+)/g;
        if (digitRegex.test(movieTitle)) {

            const num = movieTitle.substring(movieTitle.search(digitRegex), movieTitle.length).trim();
            const roman = this._romanizeNumber(parseInt(num));
            let searchTerm = movieTitle.replace(digitRegex, " " + roman);

            searchTitles.push({ searchTerm: searchTerm, matchType: 'ALL' } );
        }

        // Search before roman numerals
        //****************************************************************
        const romanRegex = new RegExp(/\b(M{1,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|C?D|D?C{1,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|X?L|L?X{1,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|I?V|V?I{1,3}))\b/);
        const romanMatch = movieTitle.match(romanRegex)

        if (romanMatch) {
            let titleSplit = movieTitle.split(romanMatch[0]);
            let searchTerm = titleSplit[0].trim();

            if (searchTerm != "") {
                searchTitles.push({ searchTerm: searchTerm, matchType: 'ALL' } );
            }
        }

        return searchTitles;
    }

    _fetchCinemascoreAsync(searchTermObject: any): Promise<any> {
        return new Promise((resolve) => {
            
            const encodedTitle = btoa(searchTermObject.searchTerm);
            const url = `https://webapp.cinemascore.com/guest/search/title/${encodedTitle}`;

            this._apiRequestCallback('Cinemascore', url, 'JSON', {}, (value) => {

                    if (value.response == null || value.response.length == 0)
                        resolve(null);

                    // Combine into single array
                    this.data.concat(value.response);

                    // Check if data actually exists and contains results/matches
                    if (this._verifyResult(value.response, searchTermObject.searchTerm, searchTermObject.matchType)){
                        resolve(value); // Found a match!
                    } else {
                        resolve(null);  // No match, signal to try next
                    }

                }, 
                (onFailureValue) => {
                    resolve(null); // Treat errors/failures as a miss so it falls back to the next title
                }
            );
        });
    }

    _getSearchTitle(movieTitle : string) {
        let output = movieTitle

        // Get the movie title and clean it up a bit
        if (output.startsWith('The ')) {
            output = output.replace("The ", "");
            output = output + ", The";

        } else if (output.startsWith('A ')) {
            output = output.replace("A ", "");
            output = output + ", A";
        }

        // Normalize (ie, remove accents/diacritics)
        output = output.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        output = output.replaceAll('–', '-') // en dash
        output = output.replaceAll('—', '-') // em dash
        output = output.replaceAll('’', "'") // apostrophe
        output = output.replaceAll('\u00A0', ' '); // Non-breaking space

        // I don't like doing it this way, but there is no other way for certain movies where cinemascore has incorrect data
        switch (output) {
            case "Harry Potter and the Order of the Phoenix":
                output = "Harry Potter and Order of the Phoenix";
                break;
            case "Ocean's Eleven":
                if (this.movieYears.length > 0 && this.movieYears[0] == "2001")
                    output = "Ocean's 11";
                break;
            case "One Eight Seven":
                if (this.movieYears.length > 0 && this.movieYears[0] == "1997")
                    output = "187";
                break;
            case "A.I. Artificial Intelligence":
                if (this.movieYears.length > 0 && this.movieYears[0] == "2001")
                    output = "A.I.: Artificial Intelligence";
                break;
        }

        return output;
    }

    _romanizeNumber(input: number) {
        if (isNaN(input))
            return NaN;

        var digits = String(+input).split(""),
            key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
                "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
                "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
            roman = "",
            i = 3;
        while (i--)
            roman = (key[ + digits.pop()! + (i * 10)] || "") + roman;

        return Array(+digits.join("") + 1).join("M") + roman;
    }
    
    _verifyResult(data : any, title : string, matchType : string): boolean {

        const romanRegex = new RegExp(/\b(M{1,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|C?D|D?C{1,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|X?L|L?X{1,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|I?V|V?I{1,3}))\b/);
        const digitRegex = new RegExp(/([0-9]+)/);

        // Get the correct score
        for (var ii = 0; ii < data.length; ii++) {
            // Check to see if the year cinemascore uses is one of the years we have
            const cinemascoreTitle = data[ii].TITLE;
            const cinemascoreYear = data[ii].YEAR;
            const cinemascoreGrade = data[ii].GRADE;

            if (cinemascoreYear != null && this.movieYears.includes(cinemascoreYear)) {
                let found = false;

                if (matchType == 'ALL') {
                    const withYear = title.toUpperCase() + ` (${cinemascoreYear})`;
                    // If Exact
                    if (cinemascoreTitle == title.toUpperCase() || cinemascoreTitle == withYear) {
                        found = true;
                    } else if (title.match(/^[0-9]+$/) && cinemascoreTitle == title + "**") {
                        found = true;
                    } else {
                        // If not, make sure it either starts or ends with the exact title
                        found = (cinemascoreTitle.startsWith(title.toUpperCase()) || cinemascoreTitle.endsWith(title.toUpperCase()));

                        // If not, make sure it starts with the exact title
                        //const reg = new RegExp(`^(${title}){1}( |,|\\.|:|-|$)`, 'i')
                        //found = cinemascoreTitle.match(reg);
                    }

                } else if (matchType == 'END') {
                    // Make sure it ends with the searched title
                    const reg = new RegExp(`(${title}){1}$`, 'i')
                    found = cinemascoreTitle.match(reg);

                } else if (matchType == 'START') {
                    // Make sure it begins with the searched title
                    const reg = new RegExp(`^(${title}){1}( |,|\\.|:|-|$)`, 'i')
                    found = cinemascoreTitle.match(reg);
                }

                if ((this.movieTitle.match(romanRegex) || this.movieTitle.match(digitRegex)) && !(cinemascoreTitle.match(romanRegex) || cinemascoreTitle.match(digitRegex))) {
                    found = false;
                }

                if (found) {
                    this.cinemascoreGrade = cinemascoreGrade;

                    this.helpers.WriteConsoleLog('DEBUG', `Cinemascore: Found match: ${cinemascoreTitle} ${cinemascoreYear} ${cinemascoreGrade}.`);
                    return true;
                }
            }
        }

        return false;
    }
}
