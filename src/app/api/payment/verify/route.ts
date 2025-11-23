import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Ticket from '@/models/Ticket';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { orderId, paymentId, userId } = body;

        // Simulate verification
        if (!paymentId) {
            return NextResponse.json({ success: false, message: 'Payment failed' }, { status: 400 });
        }

        // Update User and Ticket status
        const user = await User.findById(userId);
        if (user) {
            user.paymentStatus = 'Completed';
            await user.save();

            // Find ticket and update
            await Ticket.findOneAndUpdate({ userId: user._id }, { status: 'Valid' });
        }

        return NextResponse.json({ success: true, message: 'Payment verified' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
