import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "../../utils/auth-helpers";

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

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    // Call the Node.js API backend to get members
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/members${
        queryString ? `?${queryString}` : ""
      }`,
      {
        method: "GET",
        headers: authHeaders,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch members");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get authorization headers from the incoming request
    const authHeaders = getAuthHeaders(req);

    // Check if we have authorization token
    if (!authHeaders.Authorization) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Call the Node.js API backend to create member
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/members`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create member");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
