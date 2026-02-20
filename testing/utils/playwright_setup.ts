import { test as base, BrowserContext, chromium, Page} from '@playwright/test'
import dontenv from 'dotenv';
import path from 'path';
import * as url from 'url';

interface FixturesType {
		extensionId: string
		context: BrowserContext;
}

export const test = base.extend<FixturesType>({

	context: async({}, use) => {

		const __filename = url.fileURLToPath(import.meta.url); 
		const __dirname = path.dirname(__filename); 

		const pathToExtension = path.join(__dirname, "../../src/dist/chrome");

		const context = await chromium.launchPersistentContext("", {
			headless: false,
			// Only load one extension
			args: [
				`--disable-extensions-except=${pathToExtension}`,
				`--load-extension=${pathToExtension}`
			]
		})

		await use(context);
		await context.close();
	},
  extensionId: async ({ context }, use) => {
    // for manifest v3:
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker)
      serviceWorker = await context.waitForEvent('serviceworker');

    const extensionId = serviceWorker.url().split('/')[2];
    await use(extensionId);
  },

})

export { expect } from '@playwright/test';