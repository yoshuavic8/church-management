import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
