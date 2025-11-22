import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import College from '@/models/College';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { name, couponCode, discountAmount } = await req.json();
        const college = await College.create({
            name,
            code: couponCode, // Map couponCode to code field
            discountAmount
        });
        return NextResponse.json(college, { status: 201 });
    } catch (error: any) {
        console.error('Error creating college:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await dbConnect();
    try {
        const colleges = await College.find({});
        return NextResponse.json(colleges);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
