import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base-page';
import { envValue } from '../utils/env';

export type ChallengeDetection = {
  detected: boolean;
  types: string[];
  evidence: string[];
};

export class LoginPage extends BasePage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.username = this.bySelectorOrRole(
      envValue('USERNAME_SELECTOR'),
      page.getByLabel(/user|email|login/i).or(page.getByRole('textbox').first())
    );
    this.password = this.bySelectorOrRole(
      envValue('PASSWORD_SELECTOR'),
      page.getByLabel(/password/i).or(page.locator('input[type="password"]').first())
    );
    this.submitButton = this.bySelectorOrRole(
      envValue('LOGIN_BUTTON_SELECTOR'),
      page.getByRole('button', { name: /log in|login|sign in|submit/i })
    );
    this.errorMessage = this.bySelectorOrRole(
      envValue('ERROR_SELECTOR'),
      page.getByText(/invalid|incorrect|failed|required|error|denied|locked|try again/i).first()
    );
  }

  async goto(): Promise<void> {
    await this.page.goto(envValue('LOGIN_PATH', '/login'));
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submitButton.click();
  }

  async expectReady(): Promise<void> {
    await expect(this.username).toBeVisible();
    await expect(this.password).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async detectChallenge(): Promise<ChallengeDetection> {
    const checks = [
      { type: 'captcha', pattern: /captcha|recaptcha|hcaptcha|i am not a robot/i },
      { type: 'mfa', pattern: /mfa|multi-factor|two-factor|2fa|verification code|otp/i },
      { type: 'bot-protection', pattern: /bot|automated|suspicious|unusual traffic|verify you are human/i },
      { type: 'rate-limit', pattern: /too many|rate limit|temporarily blocked|try again later|locked/i },
      { type: 'additional-verification', pattern: /additional verification|security check|confirm your identity/i }
    ];

    const types: string[] = [];
    const evidence: string[] = [];

    for (const check of checks) {
      const locator = this.page.getByText(check.pattern).first();
      if (await locator.isVisible().catch(() => false)) {
        types.push(check.type);
        evidence.push(await locator.innerText().catch(() => check.type));
      }
    }

    const challengeFrame = this.page
      .frameLocator('iframe[title*="captcha" i], iframe[src*="captcha" i], iframe[src*="challenge" i]')
      .locator('body');
    if (await challengeFrame.isVisible().catch(() => false)) {
      types.push('challenge-frame');
      evidence.push('Challenge iframe detected');
    }

    return {
      detected: types.length > 0,
      types,
      evidence
    };
  }

  async hasAuthenticationError(): Promise<boolean> {
    return this.errorMessage.isVisible().catch(() => false);
  }
}
