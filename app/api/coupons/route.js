import prisma from '../../../lib/prisma.js';

export async function GET(request) {
  try {
    const coupons = await prisma.coupon.findMany();
    return Response.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return Response.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, description, discount, forNewUser, forMember, isPublic, expiresAt } = body;

    if (!code || !description || !discount || expiresAt === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discount: parseFloat(discount),
        forNewUser: forNewUser || false,
        forMember: forMember || false,
        isPublic: isPublic || false,
        expiresAt: new Date(expiresAt),
      },
    });

    return Response.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return Response.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}