import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { ProtectedPage } from '../pages/protected-page';
import { loadEnvFile, requiredEnv } from '../utils/env';

loadEnvFile();

type AppFixtures = {
  loginPage: LoginPage;
  protectedPage: ProtectedPage;
  configuredApp: void;
};

const requiredAppEnv = ['BASE_URL'] as const;

export const test = base.extend<AppFixtures>({
  configuredApp: [
    async ({}, use, testInfo) => {
      const missing = requiredEnv([...requiredAppEnv]);
      if (missing.length > 0) {
        testInfo.skip(`Missing required environment variables: ${missing.join(', ')}`);
      }
      await use();
    },
    { auto: true }
  ],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  protectedPage: async ({ page }, use) => {
    await use(new ProtectedPage(page));
  }
});

export { expect } from '@playwright/test';
