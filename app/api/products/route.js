import prisma from '../../../lib/prisma.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3.js';

export async function GET(request) {
  try {
    const products = await prisma.product.findMany({
      include: {
        rating: true,
        orderItems: true,
      },
    });
    return Response.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    // Extract files and fields
    const files = formData.getAll("images");
    const name = formData.get("name");
    const description = formData.get("description");
    const mrp = parseFloat(formData.get("mrp"));
    const price = parseFloat(formData.get("price"));
    const category = formData.get("category");
    const inStock = formData.get('inStock')

    const imageUrls = [];

    // const body = await request.json();
    // const { name, description, mrp, price, images, category, inStock } = body;

    if (!name || !description || isNaN(mrp) || isNaN(price) || !files || !category) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload each file to LocalStack S3
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
        })
      );

      // LocalStack URL format
      imageUrls.push(`${process.env.S3_ENDPOINT}/${process.env.BUCKET_NAME}/${fileName}`);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp: parseFloat(mrp),
        price: parseFloat(price),
        images: imageUrls,
        category,
        inStock: inStock ?? true,
      },
    });

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}