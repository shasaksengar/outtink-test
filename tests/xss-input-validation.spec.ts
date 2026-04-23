import { test, expect } from '../fixtures/test-fixtures';
import { attachObservation, attachSecurityObservers } from '../utils/security-observer';
import { securityPayloads } from '../utils/test-data';

test.describe('XSS and Input Validation Testing', () => {
  for (const payload of securityPayloads) {
    test(`neutralizes ${payload.name}`, async ({ page, loginPage }, testInfo) => {
      const observation = attachSecurityObservers(page);

      await loginPage.goto();
      await loginPage.expectReady();
      await page.evaluate(() => {
        window.localStorage.removeItem('__xssExecuted');
        (window as typeof window & { __xssExecuted?: boolean }).__xssExecuted = false;
      });

      await loginPage.login(payload.value, payload.value);
      await page.waitForLoadState('domcontentloaded').catch(() => undefined);

      const challenge = await loginPage.detectChallenge();
      const hasError = await loginPage.hasAuthenticationError();
      const scriptExecuted = await page.evaluate(() => Boolean((window as typeof window & { __xssExecuted?: boolean }).__xssExecuted));
      const activeInjectedMarkup = await page.evaluate(() => {
        const candidates = [...document.querySelectorAll('script, [onerror], [onload]')];
        return candidates.filter((element) => {
          const html = element.outerHTML || '';
          return html.includes('__xssExecuted') || html.includes('window.__xssExecuted');
        }).length;
      });

      await attachObservation(testInfo, `xss-observation-${payload.category}`, {
        payload: {
          name: payload.name,
          category: payload.category
        },
        challenge,
        hasAuthenticationError: hasError,
        scriptExecuted,
        activeInjectedMarkup,
        browserObservation: observation
      });

      expect(scriptExecuted).toBe(false);
      expect(observation.dialogs, 'Payload must not trigger browser dialogs').toHaveLength(0);
      expect(activeInjectedMarkup, 'Injected markup must not be rendered as active DOM').toBe(0);
      expect(challenge.detected || hasError).toBeTruthy();
    });
  }
});
