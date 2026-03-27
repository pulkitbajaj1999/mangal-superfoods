import prisma from '../../../lib/prisma.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const ratings = await prisma.rating.findMany({
      where: productId ? { productId } : {},
      include: {
        user: true,
        product: true,
      },
    });
    return Response.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return Response.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rating, review, userId, productId, orderId } = body;

    if (!rating || !userId || !productId || !orderId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating: parseInt(rating),
        review: review || '',
        userId,
        productId,
        orderId,
      },
      include: {
        user: true,
        product: true,
      },
    });

    return Response.json(newRating, { status: 201 });
  } catch (error) {
    console.error('Error creating rating:', error);
    return Response.json({ error: 'Failed to create rating' }, { status: 500 });
  }
}