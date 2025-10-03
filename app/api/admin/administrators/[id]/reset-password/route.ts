import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "../../../../../utils/auth-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = params.id;

    // Get authorization headers from the incoming request
    const authHeaders = getAuthHeaders(req);

    // Check if we have authorization token
    if (!authHeaders.Authorization) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Call the Node.js API backend to reset administrator password
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/administrators/${adminId}/reset-password`,
      {
        method: "POST",
        headers: authHeaders,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to reset administrator password");
    }

    return NextResponse.json({
      success: true,
      newPassword: result.password,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error resetting administrator password:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
