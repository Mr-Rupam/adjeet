import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Strip leading whitespace + zero-width / BOM (Excel ignores them when parsing
// formulas), then prefix leading =, +, -, @, tab, CR, |, % with a single quote
// so Sheets/Excel treat the cell as literal text instead of a formula.
const LEADING_INVISIBLE = /^[\s​﻿]+/;
const FORMULA_TRIGGERS = /^[=+\-@\t\r|%]/;

function escapeCell(value: string | number | boolean): string | number | boolean {
  if (typeof value !== 'string') return value;
  const stripped = value.replace(LEADING_INVISIBLE, '');
  return FORMULA_TRIGGERS.test(stripped) ? `'${value}` : value;
}

export async function appendToSheet(data: Record<string, string | number | boolean>) {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Replace actual literal '\n' characters from the env string with real newlines for the key
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountEmail || !privateKey || !sheetId) {
    console.warn('[sheets] Missing Google Sheets credentials in .env. Skipping sheet append.');
    return false;
  }

  try {
    const auth = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; // takes the first sheet

    const safe = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, escapeCell(v)])
    );
    await sheet.addRow(safe);
    return true;
  } catch (error) {
    console.error('[sheets] Failed to append to Google Sheet:', error);
    return false;
  }
}
