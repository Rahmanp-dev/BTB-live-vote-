// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function buffer(readable: NodeJS.ReadableStream) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type;

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
            // This part is tricky because we can't return from here.
            // The response has to be sent after the stream finishes.
            // We will handle the response logic in the main try-catch block.
            console.error('Cloudinary Upload Error:', error);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(Buffer.from(fileBuffer));
    readableStream.push(null);
    
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'pitchrate' }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      readableStream.pipe(uploadStream);
    });
    

    return NextResponse.json({ success: true, url: result.secure_url });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
