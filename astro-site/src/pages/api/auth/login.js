import { getUser } from '../../../lib/db.js';
import { createToken } from '../../../lib/auth.js';
import bcrypt from 'bcryptjs';

export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await getUser(username);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = createToken(user);

    return new Response(JSON.stringify({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        allowed_langs: user.allowed_langs
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `nora_auth=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
