import MagicString from 'magic-string';

import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Get the directory of this config file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { CONNECTION_DOMAINS, LETTERBOXD_EXTRAS_AUTHORS, LETTERBOXD_EXTRAS_VERSION } from './constants.js';

// Rollup Plugin that configures output
function userScriptHeaderPlugin() {

	// TODO: Import the host_permissions and the optional host_permissions of the manifest.json to

	const maxIndentSpace = 14;
	let spacing = '';
	const connectionDecorator = '@connect';
	const indentSpace = maxIndentSpace - connectionDecorator.length;
	for (let i = 0; i < indentSpace; i++) {
		spacing += ' ';
	}

	const connectionDomains = CONNECTION_DOMAINS.map(domain => `// @connect${spacing}${domain}`).join('\n');

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
// ==/UserScript==\n\n`);

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}
	};

}

function browserSwitchPlugin() {

	return {

		renderChunk(code) {

			code = new MagicString(code);
			code.prepend(`const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";

if (isChrome) {
	var browser = chrome;
}\n\n`);

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}
	};

}

function callChromeBuilder() {
	return {
		writeBundle() {
			const batPath = join(__dirname, '..', 'build.bat');
			exec(`"${batPath}" chrome`, (error, stdout, stderr) => {
				if (error) {
					console.error(`Error executing built.bat: ${error.message}`);
					return;
				}
				if (stderr) {
					console.error(`stderr: ${stderr}`);
				}
				if (stdout) {
					console.log(`stdout: ${stdout}`);
				}
				console.log('built.bat chrome executed successfully');
			});
		}
	};
}

/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const builds = [
	{
		input: 'user.js/letterboxd-extras.js',
		plugins: [
			browserSwitchPlugin(),
			userScriptHeaderPlugin(),
			callChromeBuilder()
		],
		output: [
			{
				format: 'iife',
				name: 'LETTERBOXD_EXTRAS',
				file: 'user.js/build/letterboxd-extras.user.js',
			}
		]
	}
];

export default args => args.configOnlyModule ? builds.slice(0, 3) : builds;
