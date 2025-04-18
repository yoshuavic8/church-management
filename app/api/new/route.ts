import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint is deprecated. Please use the appropriate API endpoint for your request.'
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint is deprecated. Please use the appropriate API endpoint for your request.'
  });
}
