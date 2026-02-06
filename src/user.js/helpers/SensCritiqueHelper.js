import { LOAD_STATES } from '../constants';
import { Helper } from './Helper';

export class SensCritiqueHelper extends Helper {

	constructor(storage, helpers) {

		super(storage, helpers, 'senscritique');

	}

	getData(sensCritiqueID) {

		// ID found in WikiData
		this.sensCritique.state = 1;

		const url = 'https://apollo.senscritique.com/';
		const options = this._getSensIDOptions(sensCritiqueID);

		browser.runtime.sendMessage({ name: 'GETDATA', type: 'JSON', url: url, options: options }, value => {
			if (this.helpers.ValidateResponse('SensCritique API', value) === false) {
				return;
			}

			this.loadState = LOAD_STATES['Success'];
			const sensCritiqueResponse = value.response;
			if (sensCritiqueResponse.data !== null) {
				this.data = sensCritiqueResponse.data;
				this.addSensCritique();
			}
		});
	}

	/**
	 * Construct request options to send to SensCritique.
	 *
	 * @param {string} id - The id of the SensCritique page for the current film.
	 * @private
	 */
	_getSensIDOptions(id) {
		const query = `
					query ($id: Int!) {
						product(id: $id) {
							title
							rating
							dateRelease
							dateReleaseOriginal
							dateReleaseUS
							stats {
								ratingCount
								recommendCount
							}
							url
						}
					}
				`;

		const options = {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json'
			},
			body: JSON.stringify({
				query,
				variables: {
					id: parseInt(id)
				}
			})
		};

		return options;


	}

}
