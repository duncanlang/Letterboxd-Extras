
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


		this.id = null;

	}
    
}