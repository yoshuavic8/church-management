import { NextRequest, NextResponse } from "next/server";

// Delete specific file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: { message: "Authorization header required" } },
        { status: 401 }
      );
    }

    // Forward request to backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/files/${params.id}`;

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("File delete API error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
