import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stall from '@/models/Stall';
import User from '@/models/User';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { stallId, userId } = await req.json();

        const stall = await Stall.findById(stallId);
        if (!stall) {
            return NextResponse.json({ message: 'Stall not found' }, { status: 404 });
        }

        if (stall.status !== 'Available') {
            return NextResponse.json({ message: 'Stall is not available' }, { status: 400 });
        }

        // Update stall status
        stall.status = 'Booked';
        stall.bookedBy = userId;
        await stall.save();

        return NextResponse.json({ message: 'Stall booked successfully', stall }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await dbConnect();
    try {
        const stalls = await Stall.find({}).populate('bookedBy', 'name companyName');
        return NextResponse.json(stalls);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
