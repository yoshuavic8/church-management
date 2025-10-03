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

    // Call the Node.js API backend to generate password list
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/password-management/password-list`,
      {
        method: "GET",
        headers: authHeaders,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate password list");
    }

    const textData = await response.text();

    return new NextResponse(textData, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="password-reference-list-${
          new Date().toISOString().split("T")[0]
        }.txt"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating password list:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
