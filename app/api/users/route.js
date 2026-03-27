import prisma from '../../../lib/prisma.js';
import { randomBytes, scryptSync } from 'crypto';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(':');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return derivedKey === key;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const mobile = url.searchParams.get('mobile');

    if (mobile) {
      const user = await prisma.user.findUnique({ where: { mobile } });
      if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }
      return Response.json(user);
    }

    const users = await prisma.user.findMany({
      include: {
        ratings: true,
        Address: true,
        buyerOrders: true,
      },
    });
    return Response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, email, image, cart, mobile, password, role } = body;

    if (!id || !name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = password ? hashPassword(password) : null;

    const user = await prisma.user.create({
      data: {
        id,
        name,
        email: email || '',
        image: image || '',
        cart: cart || {},
        mobile: mobile || null,
        password: hashedPassword,
        role: role || 'CUSTOMER',
      },
    });

    return Response.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, email } = body;

    if (!id) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return Response.json(user, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}