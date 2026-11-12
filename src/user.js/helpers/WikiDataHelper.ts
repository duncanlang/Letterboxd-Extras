import { StorageObject } from '../types/types';

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql';

/** A property bound by a plain wdt: OPTIONAL on the film query. */
interface FilmProperty {
	/** The WikiData property id, without the leading 'P'. */
	pid: number
	/** The variable the value is bound to. */
	name: string
	/** The variable in the SELECT clause, when the label service rewrites `name`. */
	select?: string
}

interface IdConstraint {
	pid: number
	statementVar: string
	valueVar: string
}

export type WikiDataQueryType = 'MAIN' | 'DATE' | 'PERSON' | 'LOSTFILMS';

export interface WikiDataIds {
	letterboxdId?: string
	imdbId?: string
	tmdbId?: string
}

export interface WikiDataQueryParams extends WikiDataIds {
	queryType: WikiDataQueryType
	/** Selects the TMDB series id rather than the film id. */
	isTV?: boolean
	/** The viewer's language, primary subtag only. */
	locale?: string
	/** True when the English Wikipedia article should always be used. */
	preferEnglish?: boolean
}

interface IdConstraintParams extends WikiDataIds {
	isTV?: boolean
	/** Selects the TMDB person id. */
	isPerson?: boolean
}

interface WikipediaParams {
	locale?: string
	preferEnglish?: boolean
}

interface QuantityStatementOptions {
	/** The quantity property id. */
	pid: number
	/** Statement node variable. */
	entryVar: string
	/** Variable receiving the quantity. */
	valueVar: string
	/** Variable receiving the statement value node. */
	valueNodeVar: string
	/** Variable receiving the unit entity. */
	unitVar: string
	/** Variable receiving the unit's ISO 4217 code. */
	unitLabelVar: string
	/** Q-id constraining the quantity to a place (pq:P3005). */
	place?: string
	/** Additional pattern text emitted before the rank filter. */
	extra?: string
}

interface TimeStatementOptions {
	/** The time property id. */
	pid: number
	/** Statement node variable. */
	entryVar: string
	/** Variable receiving the timestamp. */
	valueVar: string
	/** Variable receiving the wikibase:timePrecision. */
	precisionVar: string
	/** How to discard non-preferred statements. */
	rankMode?: 'minus' | 'bestRank'
	/** Trailing whitespace after the precision line, kept so the query matches the hand-written original. */
	precisionPadding?: string
}

interface PlaceStatementOptions {
	/** P19 for place of birth, P20 for place of death. */
	pid: number
	/** Variable bound to the accepted place types. */
	locationTypeVar: string
	/** Statement node variable. */
	entryVar: string
	/** Variable receiving the settlement. */
	cityVar: string
	/** When set, the settlement is reached through this intermediate entity with wdt:P131 rather than directly. */
	viaVar?: string
	/** Statement node variable for the settlement's country. */
	countryVar: string
	/** Variable receiving the country entity. */
	countryOfVar: string
	/** Variable receiving the ISO 3166 code. */
	outputVar: string
	/** Trailing whitespace after the settlement line, kept so the query matches the hand-written original. */
	cityPadding?: string
}

interface BuildQueryOptions {
	/** Variables to select, without the leading '?'. */
	select: string[]
	distinct?: boolean
	/** The body of the WHERE clause. 
	 *  Unlike SQL, WHERE clauses are mandatory in SPARQL.
	 *  WHERE clauses describe a pattern of relations
	 *  whereas filter is more like a traditional WHERE in SQL */
	where: string
	/** Extra spacing between the select list and WHERE, kept so the query matches the hand-written original. */
	selectPadding?: string
	/** Extra spacing after the closing brace. */
	closePadding?: string
	/** Variables to group by. */
	groupBy?: string[]
}

type WikiDataPrefix = 'p' | 'ps' | 'psv' | 'pq' | 'wdt' | 'wd' | 'wikibase' | 'schema' | 'bd';

export interface WikiDataRequest {
	url: string
	options: {
		method: 'POST'
		headers: Record<string, string>
		body: string
	}
}

/** Q-ids accepted as a "place" when resolving a person's birth or death location. */
const LOCATION_TYPES = [
	'Q532', 'Q515', 'Q3957', 'Q1549591', 'Q179872',
	'Q7830213', 'Q2755753', 'Q769603', 'Q18663566', 'Q486972'
];

/** Q-ids treated as a film when sweeping WikiData for lost films. */
const LOST_FILM_TYPES = [ 'Q11424', 'Q24862', 'Q20667187', 'Q226730', 'Q506240', 'Q336144' ];

/**
 * Properties bound by a plain wdt: OPTIONAL on the film query. `select` is the variable that ends
 * up in the SELECT clause, which differs from `name` wherever the label service rewrites it.
 */
const FILM_PROPERTIES: FilmProperty[] = [
	{ pid: 1258, name: 'Rotten_Tomatoes_ID' },
	{ pid: 1712, name: 'Metacritic_ID' },
	{ pid: 8729, name: 'Anilist_ID' },
	{ pid: 4086, name: 'MAL_ID' },
	{ pid: 7299, name: 'Mubi_ID' },
	{ pid: 480, name: 'FilmAffinity_ID' },
	{ pid: 10100, name: 'SensCritique_ID' },
	{ pid: 1265, name: 'Allocine_Film_ID' },
	{ pid: 1267, name: 'Allocine_TV_ID' },
	{ pid: 4529, name: 'Douban_ID' },
	{ pid: 2603, name: 'Kinopoisk_ID' },
	{ pid: 13888, name: 'DDD_ID' },
	{ pid: 13904, name: 'Filmarks_ID' },
	{ pid: 3868, name: 'MDL_ID' },
	{ pid: 9584, name: 'Criterion_ID' },
	{ pid: 12279, name: 'Criterion_Spine_ID' },
	{ pid: 13992, name: 'Bluray_ID' },
	{ pid: 6932, name: 'Ebert_ID' },
	{ pid: 495, name: 'Country_Of_Origin' },
	{ pid: 1657, name: 'MPAA_film_rating', select: 'MPAA_film_ratingLabel' },
	{ pid: 2629, name: 'BBFC_rating', select: 'BBFC_ratingLabel' },
	{ pid: 1981, name: 'FSK_rating', select: 'FSK_ratingLabel' },
	{ pid: 2758, name: 'CNC_rating' },
	{ pid: 2756, name: 'EIRIN_rating', select: 'EIRIN_ratingLabel' },
	{ pid: 3818, name: 'KMRB_rating', select: 'KMRB_ratingLabel' },
	{ pid: 3156, name: 'ACB_rating', select: 'ACB_ratingLabel' },
	{ pid: 3216, name: 'ClassInd_rating', select: 'ClassInd_ratingLabel' },
	{ pid: 12020, name: 'StateOfTransmission' }
];

const FILM_SELECT_HEAD = [ 'item', 'itemLabel' ];
const FILM_SELECT_TAIL = [
	'Budget', 'Budget_UnitLabel', 'Budget_TogetherWith',
	'Box_OfficeUS', 'Box_OfficeUS_UnitLabel',
	'Box_OfficeWW', 'Box_OfficeWW_UnitLabel',
	'US_Title', 'TV_Start', 'TV_Start_Precision', 'TV_End', 'TV_End_Precision', 'Wikipedia'
];

/** The film property whose select variable trails the tail block rather than leading it. */
const FILM_SELECT_TRAILING_PROPERTY = 'StateOfTransmission';

const DATE_SELECT = [ 'Date', 'Date_Country', 'Date_Precision', 'Date_Format', 'Date_City_Country' ];

const PERSON_SELECT = [
	'itemLabel', 'BirthName', 'Date_Of_Birth', 'Date_Of_Birth_Precision',
	'Date_Of_Death', 'Date_Of_Death_Precision', 'BirthCityLabel', 'BirthCountry',
	'DeathCityLabel', 'DeathCountry', 'Wikipedia', 'Years_Start', 'Years_End', 'IMDb_ID'
];

/** External identifiers matched against ?item. */
const ID_CONSTRAINTS: Record<'letterboxd' | 'imdb' | 'tmdbTV' | 'tmdbFilm' | 'tmdbPerson', IdConstraint> = {
	letterboxd: { pid: 6127, statementVar: 'letterboxdStatement', valueVar: 'letterboxdID' },
	imdb: { pid: 345, statementVar: 'imdbStatement', valueVar: 'imdbID' },
	tmdbTV: { pid: 4983, statementVar: 'tmdbStatement', valueVar: 'tmdbID' },
	tmdbFilm: { pid: 4947, statementVar: 'tmdbStatement', valueVar: 'tmdbID' },
	tmdbPerson: { pid: 4985, statementVar: 'tmdbStatement', valueVar: 'tmdbID' }
};

// -- Pattern primitives -----------------------------------------------------------------

/**
 * Binds a literal value to a query variable with a VALUES clause.
 *
 * @param variable - Variable name, without the leading '?'.
 * @param value - The literal to bind.
 */
function getValuesBinding( variable: string, value: string ): string {

	return `  VALUES ?${variable} { "${value}"}\n`;

}

/**
 * Binds a set of entities to a query variable with a VALUES clause.
 *
 * @param variable - Variable name, without the leading '?'.
 * @param entities - Q-ids to bind.
 * @param [indent] - Leading whitespace.
 */
function getEntityValuesBinding( variable: string, entities: string[], indent = '  ' ): string {

	return `${indent}VALUES ?${variable} {${entities.map( id => `wd:${id}` ).join( ' ' )}}`;

}

/**
 * Excludes statements WikiData has marked with a deprecated rank.
 *
 * @param statementVar - The statement node variable, without the leading '?'.
 */
function getDeprecatedRankFilter( statementVar: string ): string {

	return `MINUS { ?${statementVar} wikibase:rank wikibase:DeprecatedRank. }`;

}

/**
 * Requests server-side labels for the query, in the viewer's language first.
 *
 * @param [languages] - Fallback language codes, tried in order after [AUTO_LANGUAGE].
 */
function getLabelService( languages: string[] = [ 'en' ] ): string {

	return `  SERVICE wikibase:label { bd:serviceParam wikibase:language "${[ '[AUTO_LANGUAGE]', ...languages ].join( ',' )}". }\n`;

}

/**
 * Builds a group graph pattern matching ?item on a WikiData external identifier. The match is
 * routed through the statement node rather than a direct wdt: claim so that statements marked
 * with a deprecated rank can be excluded.
 *
 * @param pid - The WikiData property id, without the leading 'P'.
 * @param statementVar - Name of the statement node variable.
 * @param valueVar - Name of the variable holding the id, bound by an earlier VALUES clause.
 * @returns A bare group pattern, with no UNION prefix and no trailing newline.
 */
function getIdMatchPattern( pid: number, statementVar: string, valueVar: string ): string {

	return `{ ?item p:P${pid} ?${statementVar}. ?${statementVar} ps:P${pid} ?${valueVar}. ` +
		`${getDeprecatedRankFilter( statementVar )} }`;

}

/**
 * Joins id match patterns into a single alternation. The leading branch is emitted as a bare
 * group and every branch after it is prefixed with UNION, so callers never have to track which
 * of their optional ids happened to come first.
 *
 * @param matches - The branches to join.
 * @param [continuesAlternation] - True when the caller has already emitted a branch of
 *   this same alternation, in which case the leading branch here still needs its UNION.
 */
function getIdMatchAlternation( matches: IdConstraint[], continuesAlternation: boolean ): string {

	return matches
		.map( ( match, index ) => {

			const pattern = getIdMatchPattern( match.pid, match.statementVar, match.valueVar );
			const isLeading = ( index === 0 && ! continuesAlternation );

			return isLeading ? `  ${pattern}\n` : `  UNION ${pattern}\n`;

		} )
		.join( '' );

}

/**
 * Builds an OPTIONAL pattern binding a WikiData property to a query variable via a direct wdt:
 * claim. Suitable for plain values; ids needing deprecated-rank filtering or a statement node
 * should use getIdMatchPattern instead.
 *
 * @param pid - The WikiData property id, without the leading 'P'.
 * @param name - Name of the variable to bind the value to.
 */
function getWikiDataSPARQLOptionalPIDQuery( pid: number, name: string ): string {

	return `OPTIONAL { ?item wdt:P${pid} ?${name}. }\n`;

}

/**
 * Builds an OPTIONAL pattern for each supplied property and concatenates them in order.
 *
 * @param properties - The properties to bind.
 */
function getWikiDataSPARQLOptionalPIDQueries( properties: FilmProperty[] ): string {

	return properties
		.map( property => getWikiDataSPARQLOptionalPIDQuery( property.pid, property.name ) )
		.join( '' );

}

// -- Statement blocks -------------------------------------------------------------------

/**
 * Builds an OPTIONAL block reading a quantity-valued property with its unit, and optionally
 * the place the quantity applies to.
 */
function getQuantityStatement( options: QuantityStatementOptions ): string {

	const { pid, entryVar, valueVar, valueNodeVar, unitVar, unitLabelVar, place, extra } = options;

	const subject = place
		? `    ?${entryVar} ps:P${pid} ?${valueVar};\n      pq:P3005 wd:${place}.\n`
		: `    ?${entryVar} ps:P${pid} ?${valueVar}.\n`;

	return '  OPTIONAL {\n' +
		`    ?item p:P${pid} ?${entryVar}.\n` +
		subject +
		'    OPTIONAL {\n' +
		`      ?${entryVar} psv:P${pid} ?${valueNodeVar}.\n` +
		`      ?${valueNodeVar} wikibase:quantityUnit ?${unitVar}.\n` +
		`      ?${unitVar} p:P498 [ps:P498 ?${unitLabelVar}].\n` +
		'    }\n' +
		( extra || '' ) +
		`    ${getDeprecatedRankFilter( entryVar )}\n` +
		'  }\n';

}

/**
 * Builds an OPTIONAL block reading a time-valued property with its precision.
 */
function getTimeStatement( options: TimeStatementOptions ): string {

	const { pid, entryVar, valueVar, precisionVar, rankMode = 'minus', precisionPadding = '' } = options;

	const rankLine = ( rankMode === 'bestRank' )
		? `    ?${entryVar} a wikibase:BestRank\n`
		: `    ${getDeprecatedRankFilter( entryVar )}\n`;

	return '  OPTIONAL { \n' +
		`    ?item p:P${pid} ?${entryVar}.\n` +
		`    ?${entryVar} ps:P${pid} ?${valueVar}.\n` +
		`    ?${entryVar} psv:P${pid} [wikibase:timePrecision ?${precisionVar}].${precisionPadding}\n` +
		rankLine +
		'  }\n';

}

/**
 * Builds an OPTIONAL block resolving a person's birth or death place down to a country code.
 */
function getPlaceStatement( options: PlaceStatementOptions ): string {

	const {
		pid, locationTypeVar, entryVar, cityVar, viaVar,
		countryVar, countryOfVar, outputVar, cityPadding = ''
	} = options;

	const reachCity = viaVar
		? `    ?${entryVar} ps:P${pid} ?${viaVar}.${cityPadding}\n` +
			`    ?${viaVar} wdt:P131 ?${cityVar}.\n`
		: `    ?${entryVar} ps:P${pid} ?${cityVar}.${cityPadding}\n`;

	return '  OPTIONAL { \n' +
		`${getEntityValuesBinding( locationTypeVar, LOCATION_TYPES, '    ' )}\n` +
		`    ?item p:P${pid} ?${entryVar}.\n` +
		reachCity +
		`    ?${cityVar} wdt:P31/wdt:P279* ?${locationTypeVar}.\n` +
		'    OPTIONAL { \n' +
		`      ?${cityVar} p:P17 ?${countryVar}.\n` +
		`      ?${countryVar} ps:P17 ?${countryOfVar}.\n` +
		`      ?${countryVar} a wikibase:BestRank\n` +
		'      OPTIONAL { \n' +
		`        ?${countryOfVar} wdt:P298 ?${outputVar}.\n` +
		'      }\n' +
		'    }\n' +
		'  }\n';

}

/**
 * Builds the OPTIONAL block reading publication dates with their precision, format and the
 * place of release.
 */
function getReleaseDateStatement(): string {

	return '  OPTIONAL {\n' +
		'    ?item p:P577 ?Date_Statement.\n' +
		'    ?Date_Statement ps:P577 ?Date. \n' +
		'    ?Date_Statement psv:P577 [wikibase:timePrecision ?Date_Precision].\n' +
		'    OPTIONAL { ?Date_Statement pq:P437 ?Date_Format. }\n' +
		'    OPTIONAL { \n' +
		'      ?Date_Statement pq:P291 ?Date_Country.\n' +
		'      OPTIONAL {\n' +
		'        ?Date_Country wdt:P17 ?Date_City_Country.\n' +
		'        FILTER NOT EXISTS { ?Date_Country wdt:P31 wd:Q6256. }\n' +
		'      } \n' +
		'    }\n' +
		`    ${getDeprecatedRankFilter( 'Date_Statement' )}\n` +
		'  }\n';

}

/**
 * Builds the OPTIONAL block linking ?item to a Wikipedia article. When the viewer's locale is
 * not English and they have not asked to prefer English, the localised article is looked up
 * first and English is used as a fallback.
 */
function getWikipediaStatement( { locale = '', preferEnglish = false }: WikipediaParams ): string {

	const article = ( variable: string, language: string ) =>
		'  OPTIONAL { ' +
		`   ?${variable} schema:about ?item ;` +
		`             schema:isPartOf <https://${language}.wikipedia.org/> .` +
		'  }';

	if ( locale === '' || locale === 'en' || preferEnglish ) {

		return article( 'Wikipedia', 'en' );

	}

	return article( `${locale}_link`, locale ) +
		article( 'en_link', 'en' ) +
		`  BIND(COALESCE(?${locale}_link, ?en_link) AS ?Wikipedia)`;

}

// -- Identifier constraints -------------------------------------------------------------

/**
 * Binds each supplied identifier to its query variable.
 *
 * @param ids
 */
function getIdBindings( { letterboxdId, imdbId, tmdbId }: WikiDataIds ): string {

	let bindings = '';

	if ( letterboxdId ) {

		bindings += getValuesBinding( ID_CONSTRAINTS.letterboxd.valueVar, letterboxdId );

	}

	if ( imdbId ) {

		bindings += getValuesBinding( ID_CONSTRAINTS.imdb.valueVar, imdbId );

	}

	if ( tmdbId ) {

		bindings += getValuesBinding( ID_CONSTRAINTS.tmdbFilm.valueVar, tmdbId );

	}

	return `${bindings}\n`;

}

/**
 * Builds the alternation constraining ?item to whichever identifiers are available.
 */
function getIdConstraints( { letterboxdId, imdbId, tmdbId, isTV, isPerson }: IdConstraintParams ): string {

	let constraints = '';

	if ( letterboxdId ) {

		const { pid, statementVar, valueVar } = ID_CONSTRAINTS.letterboxd;
		constraints += `  ${getIdMatchPattern( pid, statementVar, valueVar )}\n`;

	}

	const matches: IdConstraint[] = [];

	if ( imdbId ) {

		matches.push( ID_CONSTRAINTS.imdb );

	}

	if ( tmdbId && isTV && ! isPerson ) {

		matches.push( ID_CONSTRAINTS.tmdbTV );

	}

	if ( tmdbId && ! isTV && ! isPerson ) {

		matches.push( ID_CONSTRAINTS.tmdbFilm );

	}

	if ( tmdbId && isPerson ) {

		matches.push( ID_CONSTRAINTS.tmdbPerson );

	}

	return constraints + getIdMatchAlternation( matches, Boolean( letterboxdId ) );

}

// -- Whole queries ----------------------------------------------------------------------

/**
 * Assembles a SELECT query from its clauses.
 */
function buildQuery( { select, distinct, where, selectPadding = '', closePadding = '', groupBy }: BuildQueryOptions ): string {

	const keyword = distinct ? 'SELECT DISTINCT' : 'SELECT';
	const variables = select.map( name => `?${name}` ).join( ' ' );

	let query = `${keyword} ${variables}${selectPadding} WHERE {\n${where}}${closePadding}`;

	if ( groupBy ) {

		query += `GROUP BY ${groupBy.map( name => `?${name}` ).join( ' ' )}`;

	}

	return query;

}

/**
 * The film query: every external id, content rating, financial figure and broadcast date the
 * overview page knows how to display.
 */
function getFilmQuery( params: WikiDataQueryParams ): string {

	const selectName = ( property: FilmProperty ) => property.select || property.name;
	const leading = FILM_PROPERTIES.filter( p => p.name !== FILM_SELECT_TRAILING_PROPERTY );
	const trailing = FILM_PROPERTIES.filter( p => p.name === FILM_SELECT_TRAILING_PROPERTY );

	const where =
		getLabelService() +
		'\n' +
		getIdBindings( params ) +
		getIdConstraints( params ) +
		'\n' +
		getWikiDataSPARQLOptionalPIDQueries( FILM_PROPERTIES ) +
		getQuantityStatement( {
			pid: 2130, entryVar: 'Budget_Entry', valueVar: 'Budget',
			valueNodeVar: 'valuenode', unitVar: 'Budget_Unit', unitLabelVar: 'Budget_UnitLabel',
			extra: '    OPTIONAL {\n' +
				'      ?Budget_Entry pq:P1706 ?TogetherWith.\n' +
				'      ?TogetherWith wdt:P6127 ?Budget_TogetherWith\n' +
				'    }\n'
		} ) +
		getQuantityStatement( {
			pid: 2142, entryVar: 'Box_Office_Entry', valueVar: 'Box_OfficeUS',
			valueNodeVar: 'valuenode2', unitVar: 'Box_Office_Unit',
			unitLabelVar: 'Box_OfficeUS_UnitLabel', place: 'Q30'
		} ) +
		getQuantityStatement( {
			pid: 2142, entryVar: 'Box_Office_Entry', valueVar: 'Box_OfficeUS',
			valueNodeVar: 'valuenode2', unitVar: 'Box_Office_Unit',
			unitLabelVar: 'Box_OfficeUS_UnitLabel', place: 'Q2017699'
		} ) +
		getQuantityStatement( {
			pid: 2142, entryVar: 'Box_Office_EntryWW', valueVar: 'Box_OfficeWW',
			valueNodeVar: 'valuenode3', unitVar: 'Box_OfficeWW_Unit',
			unitLabelVar: 'Box_OfficeWW_UnitLabel', place: 'Q13780930'
		} ) +
		'  OPTIONAL {\n' +
		'    ?item p:P1476 ?Title_Entry.\n' +
		'    ?Title_Entry ps:P1476 ?US_Title;\n' +
		'      pq:P3005 wd:Q30.\n' +
		'  }\n' +
		getTimeStatement( {
			pid: 580, entryVar: 'TV_Start_entry', valueVar: 'TV_Start',
			precisionVar: 'TV_Start_Precision'
		} ) +
		getTimeStatement( {
			pid: 582, entryVar: 'TV_End_entry', valueVar: 'TV_End',
			precisionVar: 'TV_End_Precision'
		} ) +
		getWikipediaStatement( params );

	return buildQuery( {
		distinct: true,
		select: [
			...FILM_SELECT_HEAD,
			...leading.map( selectName ),
			...FILM_SELECT_TAIL,
			...trailing.map( selectName )
		],
		where
	} );

}

/**
 * The release-date query, kept separate from the film query because a film carries one release
 * date per country and the join would multiply every other row.
 */
function getReleaseDateQuery( params: WikiDataQueryParams ): string {

	const where =
		getLabelService() +
		'\n' +
		getIdBindings( params ) +
		getIdConstraints( params ) +
		'\n' +
		getReleaseDateStatement();

	return buildQuery( {
		distinct: true,
		select: DATE_SELECT,
		where,
		closePadding: ' \n',
		groupBy: [ 'Date', 'Date_Precision', 'Date_Country', 'Date_Format', 'Date_City_Country' ]
	} );

}

/**
 * The person query: names, life dates and the places that bracket them.
 */
function getPersonQuery( params: WikiDataQueryParams & { isPerson: true } ): string {

	const { pid } = ID_CONSTRAINTS.tmdbPerson;
	const statementVar = 'statement0';

	const where =
		getLabelService( [ 'mul', 'en' ] ) +
		'  \n' +
		`  ?item p:P${pid} ?${statementVar}.\n` +
		`  ?${statementVar} ps:P${pid} "${params.tmdbId}".\n` +
		`  ${getDeprecatedRankFilter( statementVar )}\n` +
		'\n' +
		'  OPTIONAL { \n' +
		'    ?item wdt:P1477 ?BirthName.\n' +
		'    FILTER(LANG(?BirthName) = "en") .\n' +
		'  }\n' +
		getWikiDataSPARQLOptionalPIDQuery( 345, 'IMDb_ID' ) +
		getTimeStatement( {
			pid: 569, entryVar: 'BirthEntry', valueVar: 'Date_Of_Birth',
			precisionVar: 'Date_Of_Birth_Precision', rankMode: 'bestRank', precisionPadding: ' '
		} ) +
		getTimeStatement( {
			pid: 570, entryVar: 'DeathEntry', valueVar: 'Date_Of_Death',
			precisionVar: 'Date_Of_Death_Precision', rankMode: 'bestRank'
		} ) +
		getWikiDataSPARQLOptionalPIDQuery( 2031, 'Years_Start' ) +
		getWikiDataSPARQLOptionalPIDQuery( 2032, 'Years_End' ) +
		getPlaceStatement( {
			pid: 19, locationTypeVar: 'locationType', entryVar: 'Entry', cityVar: 'BirthCity',
			countryVar: 'Country', countryOfVar: 'Country_Of_Birth', outputVar: 'BirthCountry',
			cityPadding: '  '
		} ) +
		getPlaceStatement( {
			pid: 19, locationTypeVar: 'locationType2', entryVar: 'Entry', cityVar: 'BirthCity',
			viaVar: 'BirthTemp', countryVar: 'Country', countryOfVar: 'Country_Of_Birth',
			outputVar: 'BirthCountry', cityPadding: '  '
		} ) +
		getPlaceStatement( {
			pid: 20, locationTypeVar: 'locationType3', entryVar: 'Entry2', cityVar: 'DeathCity',
			countryVar: 'Country2', countryOfVar: 'Country_Of_Death', outputVar: 'DeathCountry'
		} ) +
		getPlaceStatement( {
			pid: 20, locationTypeVar: 'locationType4', entryVar: 'Entry2', cityVar: 'DeathCity',
			viaVar: 'DeathTemp', countryVar: 'Country2', countryOfVar: 'Country_Of_Death',
			outputVar: 'DeathCountry', cityPadding: '  '
		} ) +
		getWikipediaStatement( params );

	return buildQuery( {
		distinct: true,
		select: PERSON_SELECT,
		selectPadding: ' ',
		where
	} );

}

/**
 * Sweeps WikiData for films recorded as lost, so the overview page can badge them.
 */
function getLostFilmsQuery(): string {

	const where =
		`${getEntityValuesBinding( 'filmtype', LOST_FILM_TYPES )} .\n` +
		'  ?item wdt:P31 ?filmtype.\n' +
		'  ?item wdt:P12020 wd:Q122238711.\n' +
		'  ?item wdt:P6127 ?letterboxdID.\n';

	return buildQuery( { select: [ 'letterboxdID' ], where } );

}

/**
 * Builds the SPARQL text for one of the known query types.
 *
 * @param params
 * @param [params.imdbId]
 * @param [params.tmdbId]
 * @param [params.letterboxdId]
 * @param [params.isTV]
 * @param params.queryType
 * @param [params.locale] - The viewer's language, primary subtag only.
 * @param [params.preferEnglish]
 */
function getQuery( params: WikiDataQueryParams ): string {

	switch ( params.queryType ) {

		case 'DATE':
			return getReleaseDateQuery( params );

		case 'PERSON':
			return getPersonQuery( { ...params, isPerson: true } );

		case 'LOSTFILMS':
			return getLostFilmsQuery();

		default:
			return getFilmQuery( params );

	}

}

/**
 * Builds the request the background script needs to run one of the known query types.
 */
export function getWikiDataRequest( params: WikiDataQueryParams ): WikiDataRequest {

	return {
		url: WIKIDATA_ENDPOINT,
		options: {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/sparql-results+json'
			},
			body: `query=${encodeURIComponent( getQuery( params ) )}&format=json`
		}
	};

}

/**
 * The viewer's language and the 'wiki-prefer-en' setting, which pick the Wikipedia article
 * the film and person queries link to.
 */
export function getWikiDataLocaleParams( storage: StorageObject ): Required<WikipediaParams> {

	let locale = window.navigator.language;
	if ( locale.length > 2 ) {

		locale = locale.substring( 0, 2 );

	}

	return { locale, preferEnglish: storage.get( 'wiki-prefer-en' ) === true };

}
