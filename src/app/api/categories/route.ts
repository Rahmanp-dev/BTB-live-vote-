import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Pitch from '@/models/Pitch';

export async function GET() {
  await dbConnect();
  try {
    const categories = await Category.find({});
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    // Check if default categories exist
    const existingCategories = await Category.find({});
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: 'Web Development' },
        { name: '3D Animation' },
        { name: 'Video Editing' },
        { name: 'VFX' },
      ];
      await Category.insertMany(defaultCategories);
    }

    const category = await Category.create({ name: body.name });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
