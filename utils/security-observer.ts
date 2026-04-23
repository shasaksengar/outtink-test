import type { Page, TestInfo } from '@playwright/test';

export type SecurityObservation = {
  dialogs: string[];
  consoleErrors: string[];
  pageErrors: string[];
};

export function attachSecurityObservers(page: Page): SecurityObservation {
  const observation: SecurityObservation = {
    dialogs: [],
    consoleErrors: [],
    pageErrors: []
  };

  page.on('dialog', async (dialog) => {
    observation.dialogs.push(`${dialog.type()}: ${dialog.message()}`);
    await dialog.dismiss();
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      observation.consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    observation.pageErrors.push(error.message);
  });

  return observation;
}

export async function attachObservation(testInfo: TestInfo, name: string, data: unknown): Promise<void> {
  await testInfo.attach(name, {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json'
  });
}
