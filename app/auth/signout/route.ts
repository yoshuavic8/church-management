import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST() {
  // Create a Supabase client
  const supabase = createRouteHandlerClient({ cookies });

  // Sign out from Supabase Auth
  await supabase.auth.signOut();

  // Redirect to home page
  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
  );
}
