import type { BrowserContext, Page } from '@playwright/test';

export async function captureSessionSnapshot(context: BrowserContext, page: Page) {
  return {
    cookies: await context.cookies(),
    storageState: await context.storageState(),
    localStorage: await page.evaluate(() => ({ ...window.localStorage })),
    sessionStorage: await page.evaluate(() => ({ ...window.sessionStorage }))
  };
}

export async function restoreWebStorage(page: Page, snapshot: Awaited<ReturnType<typeof captureSessionSnapshot>>) {
  await page.evaluate((state) => {
    window.localStorage.clear();
    window.sessionStorage.clear();

    for (const [key, value] of Object.entries(state.localStorage)) {
      window.localStorage.setItem(key, value);
    }

    for (const [key, value] of Object.entries(state.sessionStorage)) {
      window.sessionStorage.setItem(key, value);
    }
  }, snapshot);
}
