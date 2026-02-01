import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'fallback-secret';

export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      allowed_langs: user.allowed_langs
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export function getTokenFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  return cookies['nora_auth'];
}

export function getUserFromRequest(request) {
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookies(cookieHeader);
  if (!token) return null;
  return verifyToken(token);
}

export function canEditLang(user, lang) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.allowed_langs && user.allowed_langs.includes(lang);
}
