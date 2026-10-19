## Setup

- Execute `npm install` from the `test` folder

## Run

- Execute `npm run test-unit` (or just `npm test`) from the `test` folder.
  Tests run in [Vitest](https://vitest.dev/) with a [happy-dom](https://github.com/capricorn86/happy-dom) document that behaves as if it were on `https://letterboxd.com`.

## Layout

- `user.js/` mirrors `src/user.js/`: the tests for `src/user.js/helpers/MetacriticHelpers.js` are in `user.js/helpers/MetacriticHelpers.test.js`.
- `utils/` holds code shared by tests, such as the stand-ins for the `storage`, `helpers` and `pageState` every helper is constructed with.
- `vitest.config.js` configures the run.
