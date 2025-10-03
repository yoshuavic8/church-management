import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    // Extract the path from the URL
    const url = new URL(request.url);
    const path = url.pathname.replace("/api-proxy", "");

    // Forward the request to the backend
    const backendUrl = `${API_BASE_URL}${path}`;

    console.log(
      "Proxying image request from:",
      url.pathname,
      "to:",
      backendUrl
    );

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        // Forward relevant headers
        "User-Agent": request.headers.get("User-Agent") || "",
      },
    });

    if (!response.ok) {
      console.warn(
        "Backend image request failed:",
        response.status,
        backendUrl
      );
      return new NextResponse("Image not found", { status: 404 });
    }

    // Get the content type from backend response
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // Stream the response back to client
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error proxying image request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
