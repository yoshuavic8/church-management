import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(request: NextRequest) {
  // Create the response object
  const res = NextResponse.next();

  // Add CORS headers to all responses
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return res;
  }

  const supabase = createMiddlewareClient({ req: request, res });

  // Check if we have a session
  let session;
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);

      // Clear auth cookies on error
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }

    session = data.session;
  } catch (error) {
    console.error("Unexpected error in middleware:", error);

    // Clear auth cookies on error
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    return response;
  }

  const pathname = request.nextUrl.pathname;

  // If no session and trying to access protected routes
  if (!session) {
    // Allow access to public routes
    if (
      pathname === "/" ||
      pathname === "/auth/login" ||
      pathname === "/auth/member/login" ||
      pathname === "/auth/admin/login" ||
      pathname === "/auth/register" ||
      pathname === "/self-checkin" ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/auth") ||
      pathname === "/super-admin-setup" // Allow access to super admin setup page
    ) {
      return res;
    }

    // Determine appropriate login page based on the route
    let loginPath = "/auth/member/login";

    // If trying to access admin or staff routes, redirect to admin login
    if (
      pathname.startsWith("/admin") ||
      pathname === "/dashboard" ||
      pathname.startsWith("/ministries") ||
      pathname.startsWith("/cell-groups") ||
      pathname.startsWith("/districts") ||
      pathname.startsWith("/classes") ||
      pathname.startsWith("/pastoral") ||
      pathname.startsWith("/attendance") ||
      pathname.startsWith("/members")
    ) {
      loginPath = "/auth/admin/login";
    }

    // Redirect to appropriate login page
    const redirectUrl = new URL(loginPath, request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);

    // Add cache control and CORS headers
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  }

  // Get user role level from session
  const userMetadata = session.user?.user_metadata || {};

  // Log user metadata for debugging
  console.log("User metadata in middleware:", userMetadata);
  console.log("User ID in middleware:", session.user?.id);
  console.log("User email in middleware:", session.user?.email);

  // Ensure role level is properly converted to number
  let userRoleLevel = 1; // Default to member
  if (userMetadata.role_level) {
    userRoleLevel = Number(userMetadata.role_level);
    console.log("Role level from metadata:", userRoleLevel);
  }

  // Also check if user has admin role string
  const userRole = userMetadata.role || "member";
  if (userRole === "admin" && userRoleLevel < 4) {
    userRoleLevel = 4; // Ensure admin role gets admin level
    console.log("Upgraded to admin level based on role string");
  }

  // Log the final decision for debugging
  console.log("User role in middleware:", userRole);
  console.log("User role level in middleware:", userRoleLevel);
  console.log("Current path:", pathname);

  console.log("Final role level in middleware:", userRoleLevel);

  // Admin-only routes (level 4)
  if (
    (pathname.startsWith("/admin") || pathname === "/dashboard") &&
    userRoleLevel < 4
  ) {
    // Redirect non-admin users to member dashboard
    const redirectUrl = new URL("/member/dashboard", request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Add cache control and CORS headers
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  }

  // Ministry leader routes (level 3+)
  if (
    (pathname.startsWith("/ministries/manage") ||
      pathname.startsWith("/classes/manage")) &&
    userRoleLevel < 3
  ) {
    // Redirect to member dashboard
    const redirectUrl = new URL("/member/dashboard", request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Add cache control and CORS headers
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  }

  // Cell leader routes (level 2+)
  if (
    (pathname.startsWith("/cell-groups/manage") ||
      pathname.startsWith("/attendance/record")) &&
    userRoleLevel < 2
  ) {
    // Redirect to member dashboard
    const redirectUrl = new URL("/member/dashboard", request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Add cache control and CORS headers
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  }

  // Staff routes (level 2+) - accessible by cell leaders, ministry leaders, and admins
  if (
    (pathname.startsWith("/members") ||
      pathname.startsWith("/cell-groups") ||
      pathname.startsWith("/districts") ||
      pathname.startsWith("/ministries") ||
      pathname.startsWith("/classes") ||
      pathname.startsWith("/pastoral") ||
      pathname.startsWith("/attendance")) &&
    userRoleLevel < 2
  ) {
    // Redirect regular members to member dashboard
    const redirectUrl = new URL("/member/dashboard", request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Add cache control and CORS headers
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  }

  // Member routes - only accessible by logged in users
  if (pathname.startsWith("/member") && !session) {
    const redirectUrl = new URL("/auth/member/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);

    const response = NextResponse.redirect(redirectUrl);

    // Add cache control and CORS headers
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  }

  // If user is logged in and tries to access login/register pages
  if (
    session &&
    (pathname === "/auth/login" ||
      pathname === "/auth/member/login" ||
      pathname === "/auth/admin/login" ||
      pathname === "/auth/register" ||
      pathname === "/")
  ) {
    console.log(
      "User is logged in and trying to access login/register/home page"
    );
    console.log("Redirecting based on role level:", userRoleLevel);

    // Redirect to appropriate dashboard based on role level
    let redirectUrl;

    if (userRoleLevel >= 4) {
      console.log("Redirecting to admin dashboard");
      redirectUrl = new URL("/dashboard", request.url);
    } else if (userRoleLevel >= 3) {
      console.log("Redirecting to ministry dashboard");
      redirectUrl = new URL("/ministries/dashboard", request.url);
    } else if (userRoleLevel >= 2) {
      console.log("Redirecting to cell group dashboard");
      redirectUrl = new URL("/cell-groups/dashboard", request.url);
    } else {
      console.log("Redirecting to member dashboard");
      redirectUrl = new URL("/member/dashboard", request.url);
    }

    // Add cache control headers to prevent caching
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    return response;
  }

  // Add CORS headers to the final response
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  return res;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
