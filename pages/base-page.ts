import type { Locator, Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  protected bySelectorOrRole(selector: string | undefined, fallback: Locator): Locator {
    return selector ? this.page.locator(selector) : fallback;
  }

  async visibleText(pattern: RegExp): Promise<boolean> {
    return this.page.getByText(pattern).first().isVisible().catch(() => false);
  }
}
