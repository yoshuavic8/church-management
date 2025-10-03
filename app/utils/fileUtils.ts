/**
 * Utility functions for handling file URLs
 */

/**
 * Get the base API URL for file access
 */
export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
};

/**
 * Get the full API URL for API calls
 */
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
};

/**
 * Convert a relative file path to full URL
 * @param filePath - Relative path like '/uploads/images/filename.jpg'
 * @returns Full URL like 'http://localhost:3001/uploads/images/filename.jpg'
 */
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return "";

  // If already a full URL, return as is
  if (filePath.startsWith("http")) {
    return filePath;
  }

  // Convert relative path to full URL
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
};

/**
 * Check if a URL is a file uploaded through our system
 * @param url - URL to check
 * @returns true if it's an uploaded file URL
 */
export const isUploadedFileUrl = (url: string): boolean => {
  const baseUrl = getApiBaseUrl();
  return url.startsWith(`${baseUrl}/uploads/`);
};

/**
 * Get the relative path from a full file URL
 * @param fullUrl - Full URL like 'http://localhost:3001/uploads/images/filename.jpg'
 * @returns Relative path like '/uploads/images/filename.jpg'
 */
export const getRelativeFilePath = (fullUrl: string): string => {
  const baseUrl = getApiBaseUrl();
  if (fullUrl.startsWith(baseUrl)) {
    return fullUrl.substring(baseUrl.length);
  }
  return fullUrl;
};
