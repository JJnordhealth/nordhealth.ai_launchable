import { getI18nOverrides } from '../../../../lib/db.js';
import fs from 'fs';
import path from 'path';

export const prerender = false;

const VALID_LANGS = ['en', 'fi', 'no', 'dk'];

function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

export async function GET({ params }) {
  const { lang } = params;

  if (!VALID_LANGS.includes(lang)) {
    return new Response(JSON.stringify({ error: 'Invalid language' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Load static i18n
    const i18nPath = path.join(process.cwd(), 'src/i18n', `${lang}.json`);
    const staticData = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));

    // Get overrides from DB
    const overrides = await getI18nOverrides(lang);

    // Merge overrides into static data
    for (const override of overrides) {
      setNestedValue(staticData, override.key_path, override.value);
    }

    return new Response(JSON.stringify(staticData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    console.error('Merged i18n error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
