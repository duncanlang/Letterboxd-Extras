import MagicString from 'magic-string';

import {CONNECTION_DOMAINS, LETTERBOXD_EXTRAS_AUTHORS, LETTERBOXD_EXTRAS_VERSION} from './constants.js';

// Rollup Plugin that configures output
function userScriptHeaderPlugin() {

	// TODO: Import the host_permissions and the optional host_permissions of the manifest.json to

	const maxIndentSpace = 14;
	let spacing = '';
	let connectionDecorator = '@connect';
	let indentSpace = maxIndentSpace - connectionDecorator.length;
	for (let i = 0; i < indentSpace; i++) {
		spacing += ' '
	}

	const connectionDomains = CONNECTION_DOMAINS.map(domain => {

		return `// @connect${spacing}${domain}`

	}).join('\n')

	return {

		renderChunk(code) {

			code = new MagicString(code);
			code.prepend(`/* global GM_xmlhttpRequest */
// ==UserScript==
// @name         Letterboxd Extras
// @namespace    https://github.com/duncanlang
// @version      ${LETTERBOXD_EXTRAS_VERSION}
// @description  Adds a few additional features to Letterboxd.
// @author       ${LETTERBOXD_EXTRAS_AUTHORS.join(', ')}
// @match        https://letterboxd.com/*
${connectionDomains}
// @grant        GM_addStyle
// @supportURL   https://github.com/duncanlang/Letterboxd-Extras/issues
// @run-at       document-start
// ==/UserScript==\n\n`)

				return {
					code: code.toString(),
					map: code.generateMap()
				}

		}
	}

}

function browserSwitchPlugin() {

	return {

		renderChunk(code) {

			code = new MagicString(code);
			code.prepend(`const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";

if (isChrome) {
	var browser = chrome;
}\n\n`)

				return {
					code: code.toString(),
					map: code.generateMap()
				}

		}
	}

}

/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const builds = [
	{
		input: 'letterboxd-extras.js',
		plugins: [
			browserSwitchPlugin(),
			userScriptHeaderPlugin(),
		],
		output: [
			{
				format: 'iife',
				name: 'LETTERBOXD_EXTRAS',
				file: 'build/letterboxd-extras.user.js',
			}
		]
	}
];

export default ( args ) => args.configOnlyModule ? builds.slice( 0, 3 ) : builds;
