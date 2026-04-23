import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base-page';
import { envValue } from '../utils/env';

export class ProtectedPage extends BasePage {
  readonly protectedMarker: Locator;
  readonly logoutControl: Locator;

  constructor(page: Page) {
    super(page);

    this.protectedMarker = this.bySelectorOrRole(
      envValue('PROTECTED_ASSERT_SELECTOR'),
      page.getByText(/dashboard|account|profile|welcome|logout|sign out/i).first()
    );
    this.logoutControl = this.bySelectorOrRole(
      envValue('LOGOUT_SELECTOR'),
      page.getByRole('button', { name: /logout|log out|sign out/i }).or(page.getByRole('link', { name: /logout|log out|sign out/i }))
    );
  }

  async goto(): Promise<void> {
    await this.page.goto(envValue('PROTECTED_PATH', '/dashboard'));
  }

  async expectAuthenticated(): Promise<void> {
    await expect(this.protectedMarker).toBeVisible();
  }

  async logout(): Promise<void> {
    if (await this.logoutControl.isVisible().catch(() => false)) {
      await this.logoutControl.click();
      return;
    }

    await this.page.goto(envValue('LOGOUT_PATH', '/logout'));
  }

  async isProtectedContentVisible(): Promise<boolean> {
    return this.protectedMarker.isVisible().catch(() => false);
  }
}
