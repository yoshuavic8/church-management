import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../types/supabase";

// Create a Supabase client with the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// POST /api/enrollments - Create a new enrollment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.class_id || !data.member_id) {
      return NextResponse.json(
        {
          error: "Missing required fields: class_id and member_id are required",
        },
        { status: 400 }
      );
    }

    // Check if member is already enrolled in this class
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("class_enrollments")
      .select("id")
      .eq("class_id", data.class_id)
      .eq("member_id", data.member_id);

    if (checkError) {
      return NextResponse.json(
        { error: "Error checking existing enrollment: " + checkError.message },
        { status: 500 }
      );
    }

    if (existingEnrollment && existingEnrollment.length > 0) {
      // If level is selected, check if enrolled in this specific level
      if (data.level_id) {
        const { data: existingLevelEnrollment, error: levelCheckError } =
          await supabase
            .from("class_enrollments")
            .select("id")
            .eq("class_id", data.class_id)
            .eq("member_id", data.member_id)
            .eq("level_id", data.level_id);

        if (levelCheckError) {
          return NextResponse.json(
            {
              error:
                "Error checking existing level enrollment: " +
                levelCheckError.message,
            },
            { status: 500 }
          );
        }

        if (existingLevelEnrollment && existingLevelEnrollment.length > 0) {
          return NextResponse.json(
            { error: "Member is already enrolled in this class level" },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Member is already enrolled in this class" },
          { status: 400 }
        );
      }
    }

    // Create enrollment record
    const enrollmentData: any = {
      class_id: data.class_id,
      member_id: data.member_id,
      status: data.status || "enrolled",
      enrollment_date:
        data.enrollment_date || new Date().toISOString().split("T")[0],
    };

    // Only add level_id if it's provided and not null
    if (data.level_id) {
      enrollmentData.level_id = data.level_id;
    }

    const { data: enrollment, error } = await supabase
      .from("class_enrollments")
      .insert(enrollmentData)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Error creating enrollment: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: enrollment });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/enrollments/:id - Update an enrollment
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing enrollment ID" },
        { status: 400 }
      );
    }

    const { data: enrollment, error } = await supabase
      .from("class_enrollments")
      .update({ status: data.status })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Error updating enrollment: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: enrollment });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/enrollments/:id - Delete an enrollment
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing enrollment ID" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("class_enrollments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Error deleting enrollment: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
