import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ 
    success: true, 
    message: "Logged in successfully",
    user: { email: "user@vespera.ai", name: "User" }
  });
}

export async function GET(request: Request) {
  return NextResponse.json({ success: true });
}
