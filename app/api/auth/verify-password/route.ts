import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase";
import { verifyPassword } from "../../../utils/passwordUtils";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Get member by email
    const { data: member, error } = await supabase
      .from("members")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // If password_hash is not set, return error
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

    // Verify password
    const isValid = await verifyPassword(password, member.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return member data without password_hash
    const { password_hash, ...memberData } = member;

    return NextResponse.json({
      success: true,
      member: memberData,
      passwordResetRequired: member.password_reset_required,
    });
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
