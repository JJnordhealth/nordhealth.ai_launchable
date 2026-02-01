import { getI18nOverrides, setI18nOverride, deleteI18nOverride } from '../../../lib/db.js';
import { getUserFromRequest, canEditLang } from '../../../lib/auth.js';

export const prerender = false;

const VALID_LANGS = ['en', 'fi', 'no', 'dk'];

export async function GET({ params }) {
  const { lang } = params;

  if (!VALID_LANGS.includes(lang)) {
    return new Response(JSON.stringify({ error: 'Invalid language' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const overrides = await getI18nOverrides(lang);
    return new Response(JSON.stringify({ overrides }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get overrides error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ params, request }) {
  const { lang } = params;

  if (!VALID_LANGS.includes(lang)) {
    return new Response(JSON.stringify({ error: 'Invalid language' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const user = getUserFromRequest(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!canEditLang(user, lang)) {
    return new Response(JSON.stringify({ error: 'No permission for this language' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { key_path, value } = body;

    if (!key_path) {
      return new Response(JSON.stringify({ error: 'key_path required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (value === null || value === undefined) {
      // Delete the override (revert to static)
      await deleteI18nOverride(lang, key_path);
    } else {
      await setI18nOverride(lang, key_path, value, user.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Set override error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
