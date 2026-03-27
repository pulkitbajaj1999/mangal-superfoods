import prisma from '../../../lib/prisma.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const whereClause = userId ? { userId } : {};

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: true,
        address: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    return Response.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { total, userId, addressId, paymentMethod, orderItems, isCouponUsed, coupon } = body;

    if (!total || !userId || !addressId || !paymentMethod || !orderItems || orderItems.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order with orderItems
    const order = await prisma.order.create({
      data: {
        total: parseFloat(total),
        userId,
        addressId,
        paymentMethod,
        isCouponUsed: isCouponUsed || false,
        coupon: coupon || {},
        orderItems: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price),
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return Response.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return Response.json({ error: 'Failed to create order' }, { status: 500 });
  }
}