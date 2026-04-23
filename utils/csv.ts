import fs from 'fs';
import path from 'path';

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export function readCsvRecords<T extends Record<string, string>>(relativePath: string): T[] {
  const filePath = path.resolve(process.cwd(), relativePath);
  const file = fs.readFileSync(filePath, 'utf-8').trim();

  if (!file) {
    return [];
  }

  const lines = file.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).filter(Boolean).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] ?? '';
      return record;
    }, {}) as T;
  });
}
