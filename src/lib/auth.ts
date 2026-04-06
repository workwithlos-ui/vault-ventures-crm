// Simple JWT-like token generation (no external jwt library)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export function generateToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ authenticated: true, iat: Date.now() })).toString('base64');
  return `${header}.${payload}.signature`;
}

export function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (err) {
    return null;
  }
}

export function verifyPassword(password: string) {
  return password === ADMIN_PASSWORD;
}
