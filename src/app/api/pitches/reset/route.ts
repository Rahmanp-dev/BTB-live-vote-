import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';

export async function POST() {
  await dbConnect();
  try {
    // This updates all documents in the Pitch collection, setting the ratings array to be empty.
    await Pitch.updateMany({}, { $set: { ratings: [] } });
    return NextResponse.json({ success: true, message: 'All ratings have been reset.' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
