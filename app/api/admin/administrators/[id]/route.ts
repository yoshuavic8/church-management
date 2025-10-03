import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "../../../../utils/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, first_name, last_name, email, password } = body;
    const adminId = params.id;

    console.log("Received update request:", { adminId, body });

    // Check if at least one field is provided (allow empty strings for optional fields)
    if (
      status === undefined &&
      first_name === undefined &&
      last_name === undefined &&
      email === undefined &&
      password === undefined
    ) {
      return NextResponse.json(
        { error: "At least one field is required for update" },
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

    // Prepare update data - only include fields that are provided
    const updateData: any = {};
    if (status !== undefined && status !== "") updateData.status = status;
    if (first_name !== undefined && first_name !== "")
      updateData.first_name = first_name;
    if (last_name !== undefined && last_name !== "")
      updateData.last_name = last_name;
    if (email !== undefined && email !== "") updateData.email = email;
    if (password !== undefined && password !== "")
      updateData.password = password;

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/administrators/${adminId}`;
    console.log("Updating administrator:", { adminId, apiUrl, updateData });

    // Call the Node.js API backend to update administrator
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(updateData),
    });

    console.log("Response status:", response.status);
    const result = await response.json();
    console.log("Response result:", result);

    if (!response.ok) {
      throw new Error(result.error || "Failed to update administrator");
    }

    return NextResponse.json({
      success: true,
      data: result.administrator,
      message: "Administrator updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating administrator:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
