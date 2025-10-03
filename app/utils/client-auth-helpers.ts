/**
 * Get authorization headers with token from localStorage
 * @returns Headers object with authorization token if available
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Get token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Make authenticated fetch request
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with Response
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });
}
