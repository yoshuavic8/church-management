/**
 * Helper functions for handling image URLs
 */

/**
 * Get the API base URL for images
 */
const getApiBaseUrl = () => {
  // Check if we're running on the server (Node.js) or client (browser)
  if (typeof window === "undefined") {
    // Server-side: use full URL to connect to API
    return process.env.API_URL || "http://localhost:3001";
  } else {
    // Client-side: use current location for proxy path
    return "";
  }
};

/**
 * Resolve image URL to full URL
 * @param imageUrl - The image URL from API (could be relative or absolute)
 * @returns Full URL for the image
 */
export function resolveImageUrl(
  imageUrl: string | null | undefined
): string | null {
  if (!imageUrl) return null;

  // If it's already a full URL, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If it's a relative path starting with /uploads, resolve it
  if (imageUrl.startsWith("/uploads/")) {
    const apiBaseUrl = getApiBaseUrl();
    if (apiBaseUrl) {
      return `${apiBaseUrl}${imageUrl}`;
    }
    // Client-side: proxy through Next.js API routes
    return `/api-proxy${imageUrl}`;
  }

  // For other relative paths, return as is
  return imageUrl;
}

/**
 * Handle image load error with fallback
 * @param event - The error event
 * @param fallbackUrl - Optional fallback image URL
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl?: string
) {
  const img = event.target as HTMLImageElement;

  if (fallbackUrl && img.src !== fallbackUrl) {
    img.src = fallbackUrl;
  } else {
    // Hide the image if no fallback or fallback also failed
    img.style.display = "none";
  }

  console.warn("Image failed to load:", img.src);
}
