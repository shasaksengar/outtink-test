import { test, expect } from '../fixtures/test-fixtures';
import { attachObservation } from '../utils/security-observer';
import { getCredential, repeatedInvalidAttempts } from '../utils/test-data';

test.describe('Secure Login Automation', () => {
  test('authenticates with valid credentials', async ({ page, loginPage, protectedPage }) => {
    const validCredential = getCredential('valid-login');

    await loginPage.goto();
    await loginPage.expectReady();
    await loginPage.login(validCredential.username, validCredential.password);

    const challenge = await loginPage.detectChallenge();
    test.skip(challenge.detected, `Authentication challenge detected: ${challenge.types.join(', ')}`);

    await expect(page).not.toHaveURL(/login/i);
    await protectedPage.expectAuthenticated();
  });

  test('rejects invalid credentials and records security evidence', async ({ loginPage }, testInfo) => {
    const invalidCredential = getCredential('invalid-login');

    await loginPage.goto();
    await loginPage.expectReady();
    await loginPage.login(invalidCredential.username, invalidCredential.password);

    const challenge = await loginPage.detectChallenge();
    const hasError = await loginPage.hasAuthenticationError();

    await attachObservation(testInfo, 'invalid-login-observation', {
      challenge,
      hasAuthenticationError: hasError
    });

    expect(challenge.detected || hasError).toBeTruthy();
  });

  test('detects defensive responses after repeated invalid attempts', async ({ loginPage }, testInfo) => {
    const invalidCredential = getCredential('invalid-login-repeat');

    await loginPage.goto();
    await loginPage.expectReady();

    const observations = [];

    for (let attempt = 1; attempt <= repeatedInvalidAttempts; attempt++) {
      await loginPage.login(invalidCredential.username, `${invalidCredential.password}-${attempt}`);
      const challenge = await loginPage.detectChallenge();
      const hasError = await loginPage.hasAuthenticationError();

      observations.push({
        attempt,
        challenge,
        hasAuthenticationError: hasError
      });

      if (challenge.detected) {
        break;
      }
    }

    await attachObservation(testInfo, 'repeated-invalid-login-observations', observations);

    expect(observations.some((item) => item.challenge.detected || item.hasAuthenticationError)).toBeTruthy();
  });
});
