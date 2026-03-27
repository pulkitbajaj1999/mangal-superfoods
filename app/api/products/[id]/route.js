import prisma from '../../../../lib/prisma.js';
import { s3Client } from '@/lib/s3.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        rating: true,
        orderItems: true,
      },
    });

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.formData()

    // Get new files and the list of URLs to keep
    const newFiles = formData.getAll('images'); 
    const existingImages = JSON.parse(formData.get('existingImages') || "[]");

    const uploadedUrls = [];

    // Upload ONLY the modified/new images to LocalStack S3
    for (const file of newFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
        }));

        uploadedUrls.push(`${process.env.S3_ENDPOINT}/${process.env.BUCKET_NAME}/${fileName}`);
    }

    const finalImages = [...existingImages, ...uploadedUrls ]

    // const body = await request.json();
    // const { name, description, mrp, price, images, category, inStock } = body;
    
    
    const { name, description, mrp, price, category, inStock } = Object.fromEntries(formData.entries())
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(mrp && { mrp: parseFloat(mrp) }),
        ...(price && { price: parseFloat(price) }),
        ...(finalImages && { images: finalImages }),
        ...(category && { category }),
        ...(inStock !== undefined && { inStock: inStock === 'true' ? true : false }),
      },
    });

    return Response.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if product exists and has any order items
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // If product has been ordered, don't allow deletion
    if (product.orderItems.length > 0) {
      return Response.json({ error: 'Cannot delete product that has been ordered' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return Response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

// export async function DELETE(request, { params }) {
//   try {
//     const { id } = params;
//     await prisma.product.delete({
//       where: { id },
//     });

//     return Response.json({ message: 'Product deleted' });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     return Response.json({ error: 'Failed to delete product' }, { status: 500 });
//   }
// }