import { NextResponse } from 'next/server';

// This is a temporary, in-memory store for the live state.
// In a production Vercel environment, this will reset on each serverless function invocation.
// For a persistent state, use a database like Firebase Realtime Database, Redis, or MongoDB.
let liveState = {
  isLive: false,
  currentPitchId: null,
  isWinnerShowcaseLive: false,
  showcasedCategoryId: null,
};

export async function GET() {
  return NextResponse.json({ success: true, data: liveState });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    liveState = { ...liveState, ...body };
    return NextResponse.json({ success: true, data: liveState });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
