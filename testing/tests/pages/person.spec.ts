import {test, expect} from '../../utils/playwright_setup';

// Using John Ford as an example as a deceased person with many lost films,
// the amount of which is unlikely to change. Ideally this could be done
// with mock data.

test.describe('Test Person Page', () => {

	test.describe('Average Person', () => {

		test.beforeEach('Navigate to Person', async ({page}) => {

			// Dom content loaded will only execute after all script defer and script module's
			// So should fire after React fully populates page
			await page.goto('/actor/timothee-chalamet', { waitUntil: 'domcontentloaded' });

		});

		test('Has no lost films', async ({page}) => {

			await page.locator('#content-nav').getByText('Visibility Filters').hover();
			await page.getByText('Hide Lost films' ).click();
			const lostElements = await page.locator('.tooltip.griditem.extras-lost-film').all();
			expect(lostElements.length).toBe(0);

		})

		test('Can click imdb link', async ({page}) => {

			await page.locator('p', { hasText: 'More Details at' }).locator('a', {hasText: 'IMDB'}).click();
			await page.waitForLoadState('domcontentloaded')
			expect(page.url()).toBe("https://www.imdb.com/name/nm3154303/");

		})

		// TMDB behavior slightly different, as by default currently opens a new page
		test('Can click tmdb link', async ({page, context}) => {

			const pagePromise = context.waitForEvent('page')

			await page.locator('p', { hasText: 'More Details at' }).locator('a', {hasText: 'TMDB'}).click();
			const newPage = await pagePromise;

			expect(newPage.url()).toBe("https://www.themoviedb.org/person/1190668-timoth-e-chalamet");

		})

		test('Can click Wikipedia link', async ({page}) => {

			await page.locator('p', { hasText: 'More Details at' }).locator('a', {hasText: 'WIKI'}).click();
			await page.waitForLoadState('domcontentloaded')
			expect(page.url()).toBe("https://en.wikipedia.org/wiki/Timoth%C3%A9e_Chalamet");

		})

		test('Has no death date', async ({page}) => {

			await expect(page.getByRole('cell', { name: 'Died' })).not.toBeVisible();

		})

	})

	test.describe('Lost Films + Death Date', () => {

			test.beforeEach('Navigate to Person', async ({page}) => {

				// Dom content loaded will only execute after all script defer and script module's
				// So should fire after React fully populates page
				await page.goto('/director/john-ford-2', { waitUntil: 'domcontentloaded' });

			});

			test('Has correct number of lost films', async ({page}) => {

				//await page.getByRole('link', { name: 'Hide Lost films' }).click();
				await page.locator('#content-nav').getByText('Visibility Filters').hover();

				// Get initial list of films
				const initialElements = await page.locator('.tooltip.griditem').all();
				expect(initialElements.length).toBe(144);
				await page.getByText('Hide Lost films' ).click();

				const lostElements = await page.locator('.tooltip.griditem.extras-lost-film').all();
				expect(lostElements.length).toBe(45);

				const expectedText = 'There are 99 films by this director matching your filters.';
  			await expect(page.getByText(expectedText)).toBeVisible();

				const filmDifference = initialElements.length - lostElements.length;
				await expect(page.getByText(`There are ${filmDifference} films by this director matching your filters.`)).toBeVisible();

			})

			test('Has Death Date', async ({page}) => {

				await expect(page.getByRole('cell', { name: 'Died' })).toBeVisible();

			})

		})


})