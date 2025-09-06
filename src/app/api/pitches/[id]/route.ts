import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();
  try {
    const body = await request.json();
    const updatedPitch = await Pitch.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!updatedPitch) {
      return NextResponse.json({ success: false, error: 'Pitch not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedPitch });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();
  try {
    const deletedPitch = await Pitch.deleteOne({ _id: id });
    if (deletedPitch.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Pitch not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
