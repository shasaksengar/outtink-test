import { readCsvRecords } from './csv';

export type SecurityPayload = {
  name: string;
  value: string;
  category: 'script' | 'html' | 'special' | 'long' | 'malformed';
};

export type CredentialRecord = {
  scenario: string;
  username: string;
  password: string;
  expectedOutcome: 'success' | 'error';
  notes: string;
};

export const credentialRecords = readCsvRecords<CredentialRecord>('test-data/credentials.csv');

export function getCredential(scenario: string): CredentialRecord {
  const record = credentialRecords.find((item) => item.scenario === scenario);
  if (!record) {
    throw new Error(`Missing credential record for scenario: ${scenario}`);
  }
  return record;
}

export const securityPayloads = readCsvRecords<SecurityPayload>('test-data/security-payloads.csv');

export const repeatedInvalidAttempts = 5;
