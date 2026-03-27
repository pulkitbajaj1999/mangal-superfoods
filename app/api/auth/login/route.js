import prisma from '../../../../lib/prisma.js';
import { scryptSync } from 'crypto';

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return derivedKey === key;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { mobile, password } = body;

    if (!mobile || !/^\d{10}$/.test(mobile) || !password) {
      return new Response(JSON.stringify({ error: 'Invalid mobile or password' }), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    if (!user.password || !verifyPassword(password, user.password)) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const { password: _password, ...safeUser } = user;
    return new Response(JSON.stringify({ success: true, user: safeUser }), { status: 200 });
  } catch (error) {
    console.error('Auth login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
