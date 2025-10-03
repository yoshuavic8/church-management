import { apiClient } from "../lib/api-client";

// Test function to check if changePassword method exists
export const testChangePasswordMethod = () => {
  console.log("Testing apiClient methods:");
  console.log("apiClient:", apiClient);
  console.log("changePassword method:", apiClient.changePassword);
  console.log("typeof changePassword:", typeof apiClient.changePassword);

  // Log all methods of apiClient
  const methods = Object.getOwnPropertyNames(
    Object.getPrototypeOf(apiClient)
  ).filter(
    (name) => typeof apiClient[name as keyof typeof apiClient] === "function"
  );

  console.log("Available methods:", methods);

  return typeof apiClient.changePassword === "function";
};

export default testChangePasswordMethod;
