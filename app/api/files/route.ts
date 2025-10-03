import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Redirect to backend API for file listing
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const search = searchParams.get("search") || "";

    // Get authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: { message: "Authorization header required" } },
        { status: 401 }
      );
    }

    // Forward request to backend API
    const backendUrl = new URL("/api/files", process.env.NEXT_PUBLIC_API_URL);
    backendUrl.searchParams.set("page", page);
    backendUrl.searchParams.set("limit", limit);
    if (search) {
      backendUrl.searchParams.set("search", search);
    }

    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Files API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
