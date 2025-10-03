import { NextRequest } from "next/server";

/**
 * Extract authorization token from request headers
 * @param req - NextRequest object
 * @returns The bearer token or null if not found
 */
export function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Get authorization headers for API requests
 * @param req - NextRequest object
 * @returns Headers object with authorization token
 */
export function getAuthHeaders(req: NextRequest): Record<string, string> {
  const token = getAuthToken(req);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
