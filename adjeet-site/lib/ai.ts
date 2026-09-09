import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;

if (!apiKey) {
  console.warn('[ai] OPENAI_API_KEY is missing in environment variables.');
}

export const ai = new OpenAI({
  apiKey: apiKey || 'missing-key',
  baseURL: baseURL || 'https://api.openai.com/v1',
});

export default ai;
