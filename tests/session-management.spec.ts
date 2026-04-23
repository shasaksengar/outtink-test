import { test, expect } from '../fixtures/test-fixtures';
import { LoginPage } from '../pages/login-page';
import { ProtectedPage } from '../pages/protected-page';
import { attachObservation } from '../utils/security-observer';
import { captureSessionSnapshot, restoreWebStorage } from '../utils/session';
import { getCredential } from '../utils/test-data';

test.describe('Session Management Validation', () => {
  test('rejects old session state after logout', async ({ browser, page, context, loginPage, protectedPage }, testInfo) => {
    const validCredential = getCredential('valid-login');

    await loginPage.goto();
    await loginPage.expectReady();
    await loginPage.login(validCredential.username, validCredential.password);

    const challenge = await loginPage.detectChallenge();
    test.skip(challenge.detected, `Authentication challenge detected: ${challenge.types.join(', ')}`);

    await protectedPage.expectAuthenticated();
    const snapshot = await captureSessionSnapshot(context, page);

    await protectedPage.logout();
    await protectedPage.goto();
    await expect(protectedPage.protectedMarker).not.toBeVisible();

    const replayContext = await browser.newContext({
      baseURL: process.env.BASE_URL,
      storageState: snapshot.storageState
    });
    const replayPage = await replayContext.newPage();
    const replayProtectedPage = new ProtectedPage(replayPage);

    await replayPage.goto(process.env.PROTECTED_PATH || '/dashboard');
    await restoreWebStorage(replayPage, snapshot);
    await replayPage.reload();

    const replaySucceeded = await replayProtectedPage.isProtectedContentVisible();
    await attachObservation(testInfo, 'session-reuse-observation', {
      replaySucceeded,
      cookieCount: snapshot.cookies.length
    });

    expect(replaySucceeded).toBe(false);
    await replayContext.close();
  });

  test('documents behavior for concurrent sessions in separate contexts', async ({ browser }, testInfo) => {
    const validCredential = getCredential('valid-login');

    const firstContext = await browser.newContext({ baseURL: process.env.BASE_URL });
    const secondContext = await browser.newContext({ baseURL: process.env.BASE_URL });
    const firstPage = await firstContext.newPage();
    const secondPage = await secondContext.newPage();
    const firstLogin = new LoginPage(firstPage);
    const secondLogin = new LoginPage(secondPage);
    const firstProtected = new ProtectedPage(firstPage);
    const secondProtected = new ProtectedPage(secondPage);

    await firstLogin.goto();
    await firstLogin.login(validCredential.username, validCredential.password);
    const firstChallenge = await firstLogin.detectChallenge();
    test.skip(firstChallenge.detected, `Authentication challenge detected: ${firstChallenge.types.join(', ')}`);
    await firstProtected.expectAuthenticated();

    await secondLogin.goto();
    await secondLogin.login(validCredential.username, validCredential.password);
    const secondChallenge = await secondLogin.detectChallenge();
    test.skip(secondChallenge.detected, `Authentication challenge detected: ${secondChallenge.types.join(', ')}`);
    await secondProtected.expectAuthenticated();

    await firstProtected.goto();
    const firstSessionStillValid = await firstProtected.isProtectedContentVisible();
    await secondProtected.goto();
    const secondSessionStillValid = await secondProtected.isProtectedContentVisible();

    await attachObservation(testInfo, 'concurrent-session-observation', {
      firstSessionStillValid,
      secondSessionStillValid,
      expectedPolicy: 'Older sessions may be invalidated, or multiple active sessions may be allowed. The test records observed behavior for review.'
    });

    expect(secondSessionStillValid).toBe(true);
    expect(typeof firstSessionStillValid).toBe('boolean');

    await firstContext.close();
    await secondContext.close();
  });
});
