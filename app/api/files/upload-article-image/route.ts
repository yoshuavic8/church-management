import { NextRequest, NextResponse } from "next/server";

// Article image upload endpoint for rich text editor
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: { message: "Authorization header required" } },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();

    // Forward request to backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/upload-article-image`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Article image upload API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
