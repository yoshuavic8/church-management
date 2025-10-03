import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "../../../utils/auth-helpers";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Get authorization headers from the incoming request
    const authHeaders = getAuthHeaders(req);

    // Check if we have authorization token
    if (!authHeaders.Authorization) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Call the Node.js API backend to verify passwords
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/password-management/verify-passwords`,
      {
        method: "GET",
        headers: authHeaders,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to verify passwords");
    }

    return NextResponse.json({
      success: true,
      correct: result.correct,
      incorrect: result.incorrect,
      missing: result.missing,
      message: "Password verification completed",
    });
  } catch (error: any) {
    console.error("Error verifying passwords:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
