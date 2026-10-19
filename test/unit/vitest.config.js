import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

// Tests run in a happy-dom document that believes it is on letterboxd.com, so `location` and relative
// URLs behave as they would on the site (the same approach as refined-github's vite.config.ts).
export default defineConfig({
	test: {
		// This folder, wherever vitest is started from (`npm run test-unit` runs it from test/).
		root: fileURLToPath(new URL('.', import.meta.url)),
		environment: 'happy-dom',
		environmentOptions: {
			happyDOM: {
				url: 'https://letterboxd.com',
			},
		},
		// test/unit mirrors src: test/unit/user.js/helpers/X.test.js tests src/user.js/helpers/X.js.
		include: ['user.js/**/*.test.{js,ts}'],
	},
});
