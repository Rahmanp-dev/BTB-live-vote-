import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function DELETE() {
    await dbConnect();

    try {
        // Drop the entire colleges collection to start fresh
        await mongoose.connection.db.collection('colleges').drop();

        return NextResponse.json({
            success: true,
            message: 'All colleges deleted. You can now create new ones with the correct schema.'
        });
    } catch (error: any) {
        // If collection doesn't exist, that's fine
        if (error.code === 26) {
            return NextResponse.json({
                success: true,
                message: 'Colleges collection was already empty or did not exist.'
            });
        }
        console.error('Reset error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
