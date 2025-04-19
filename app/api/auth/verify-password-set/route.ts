import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // Use searchParams directly from the request
    const memberId = req.nextUrl.searchParams.get("memberId");

    console.log("Verifying password set for member ID:", memberId);

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Get member by id
    const { data: member, error } = await supabase
      .from("members")
      .select("password_hash")
      .eq("id", memberId)
      .single();

    console.log("Verification query result:", { member, error });

    if (error) {
      return NextResponse.json(
        { error: "Failed to verify password set" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      passwordSet: !!member?.password_hash,
      passwordHash: member?.password_hash ? "[REDACTED]" : null,
    });
  } catch (error) {
    console.error("Error verifying password set:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
