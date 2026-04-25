import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

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

    await sheet.addRow(data);
    return true;
  } catch (error) {
    console.error('[sheets] Failed to append to Google Sheet:', error);
    return false;
  }
}
