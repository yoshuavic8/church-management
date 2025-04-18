import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase";
import {
  hashPassword,
  generateSecurePassword,
} from "../../../utils/passwordUtils";

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

    // Get member by id
    const { data: member, error } = await supabase
      .from("members")
      .select("email, first_name, last_name")
      .eq("id", memberId)
      .single();

    if (error || !member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Generate default password
    const defaultPassword = generateSecurePassword(10);

    // Hash password
    const passwordHash = await hashPassword(defaultPassword);

    // Update member with password hash
    const updatePayload = {
      password_hash: passwordHash,
      password_reset_required: true,
      last_password_change: new Date().toISOString(),
    };

    const { data: updateData, error: updateError } = await supabase
      .from("members")
      .update(updatePayload)
      .eq("id", memberId)
      .select();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to set default password" },
        { status: 500 }
      );
    }

    // Verify the update was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from("members")
      .select("password_hash")
      .eq("id", memberId)
      .single();

    // Return success with default password
    // In a production environment, you would send this via email instead
    return NextResponse.json({
      success: true,
      message: "Default password set successfully",
      defaultPassword,
      member: {
        id: memberId,
        email: member.email,
        name: `${member.first_name} ${member.last_name}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
