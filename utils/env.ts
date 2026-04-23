import fs from 'fs';
import path from 'path';

export function loadEnvFile(fileName = '.env'): void {
  const envPath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function requiredEnv(keys: string[]): string[] {
  return keys.filter((key) => !process.env[key]);
}

export function envValue(key: string, fallback = ''): string {
  return process.env[key] || fallback;
}
