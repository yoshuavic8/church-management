import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase";
import { hashPassword, verifyPassword } from "../../../utils/passwordUtils";

export async function POST(req: NextRequest) {
  try {
    const { memberId, currentPassword, newPassword } = await req.json();

    if (!memberId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate new password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
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

    if (error || !member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Verify current password
    console.log("Verifying current password for member:", memberId);
    console.log("Password hash in database:", member.password_hash);

    const isValid = await verifyPassword(currentPassword, member.password_hash);
    console.log("Current password verification result:", isValid);

    if (!isValid) {
      console.log("Current password verification failed");
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    console.log("New password hash:", newPasswordHash);

    // Update password in database
    console.log("Updating password in database for member:", memberId);
    const updateData = {
      password_hash: newPasswordHash,
      password_reset_required: false,
      last_password_change: new Date().toISOString(),
    };
    console.log("Update data:", updateData);

    const { data: updateResult, error: updateError } = await supabase
      .from("members")
      .update(updateData)
      .eq("id", memberId)
      .select();

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    console.log("Update result:", updateResult);
    if (!updateResult || updateResult.length === 0) {
      console.warn("No rows were updated");
    } else {
      console.log("Updated member data:", updateResult[0]);
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
