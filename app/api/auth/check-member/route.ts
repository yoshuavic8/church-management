import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Get member by email
    const { data: member, error } = await supabase
      .from("members")
      .select("id, email, password_hash")
      .eq("email", email)
      .single();

    if (error || !member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if password is set
    if (!member.password_hash) {
      return NextResponse.json(
        {
          error: "Password not set for this account",
          memberId: member.id,
          email: member.email,
          needsPasswordSetup: true,
        },
        { status: 401 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      memberId: member.id,
      hasPassword: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
