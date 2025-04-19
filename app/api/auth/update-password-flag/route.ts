import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = getSupabaseClient();

    console.log("Updating password_reset_required flag for member:", memberId);
    
    // Update flag in database
    const { data, error } = await supabase
      .from("members")
      .update({
        password_reset_required: false,
      })
      .eq("id", memberId)
      .select();

    if (error) {
      console.error("Error updating password flag:", error);
      return NextResponse.json(
        { error: "Failed to update password flag" },
        { status: 500 }
      );
    }

    console.log("Update flag result:", data);
    
    return NextResponse.json({
      success: true,
      message: "Password flag updated successfully",
      data
    });
  } catch (error) {
    console.error("Error in update-password-flag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
