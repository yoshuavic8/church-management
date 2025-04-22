// API client for enrollments

// Create a new enrollment
export async function createEnrollment(data: {
  class_id: string;
  member_id: string;
  level_id?: string;
  status?: "enrolled" | "completed" | "dropped";
  enrollment_date?: string;
}) {
  const response = await fetch("/api/enrollments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create enrollment");
  }

  return response.json();
}

// Update an enrollment
export async function updateEnrollmentStatus(
  id: string,
  status: "enrolled" | "completed" | "dropped"
) {
  const response = await fetch(`/api/enrollments?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update enrollment");
  }

  return response.json();
}

// Delete an enrollment
export async function deleteEnrollment(id: string) {
  const response = await fetch(`/api/enrollments?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete enrollment");
  }

  return response.json();
}
