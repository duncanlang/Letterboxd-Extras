## Setup

- Execute `npm install` from the `test` folder
- Build the Chrome extension so that `src/dist/chrome` exists (`npm run build-chrome` from the `src` folder)

## Run

- Execute `npm run test-e2e` from the `test` folder.
  [Playwright](https://playwright.dev/) opens Chrome with the built extension loaded and runs the specs against the live letterboxd.com.
- Execute `npm run record-test` from the `test` folder to record a new test with Playwright's code generator.

## Layout

- `pages/` holds the specs, one file per kind of Letterboxd page.
- `utils/` holds shared setup, such as the fixture that loads the extension.
- `playwright.config.ts` configures the run.
