import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "../../../utils/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const { type, memberIds } = await req.json();

    if (!type || !["all", "selected"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid reset type. Must be 'all' or 'selected'" },
        { status: 400 }
      );
    }

    if (type === "selected" && (!memberIds || !Array.isArray(memberIds))) {
      return NextResponse.json(
        { error: "Member IDs are required for selected reset" },
        { status: 400 }
      );
    }

    // Get authorization headers from the incoming request
    const authHeaders = getAuthHeaders(req);

    // Check if we have authorization token
    if (!authHeaders.Authorization) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Call the Node.js API backend to reset passwords
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/password-management/reset-passwords`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          type,
          memberIds: type === "selected" ? memberIds : undefined,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to reset passwords");
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      message: "Passwords reset successfully",
    });
  } catch (error: any) {
    console.error("Error resetting passwords:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
