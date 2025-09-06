import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';

export async function POST() {
  await dbConnect();
  try {
    await Pitch.updateMany({}, { $set: { ratings: [] } });
    return NextResponse.json({ success: true, message: 'All ratings have been reset.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
