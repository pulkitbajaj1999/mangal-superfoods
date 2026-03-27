import prisma from '../../../lib/prisma.js';

export async function GET(request) {
  try {
    // For now, return all. In real app, filter by user
    const addresses = await prisma.address.findMany({
      include: {
        user: true,
      },
    });
    return Response.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return Response.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, name, mobile, pincode, addressLine1, addressLine2, landmark, city, state } = body;

    if (!userId || !name || !mobile || !pincode || !addressLine1 || !addressLine2 || !city || !state) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        mobile,
        pincode,
        addressLine1,
        addressLine2,
        landmark: landmark || null,
        city,
        state,
      },
    });

    return Response.json(address, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return Response.json({ error: 'Failed to create address' }, { status: 500 });
  }
}