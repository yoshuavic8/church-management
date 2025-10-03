import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "../../../utils/auth-helpers";

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

    // Call the Node.js API backend to get administrators
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/administrators`,
      {
        method: "GET",
        headers: authHeaders,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch administrators");
    }

    return NextResponse.json({
      success: true,
      data: result.administrators,
    });
  } catch (error: any) {
    console.error("Error fetching administrators:", error);
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
    const { first_name, last_name, email, password } = await req.json();

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
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

    // Call the Node.js API backend to create administrator
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/administrators`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create administrator");
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Administrator created successfully",
    });
  } catch (error: any) {
    console.error("Error creating administrator:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
