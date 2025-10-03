import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "../../../lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Call Node.js API to check member
    const response = await apiClient.checkMember(email);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error?.message || "Member not found" },
        { status: 404 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      memberId: response.data.memberId,
      hasPassword: response.data.hasPassword,
    });
  } catch (error) {
    console.error("Check member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
