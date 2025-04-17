import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
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
    return NextResponse.redirect(redirectUrl);
  }

  // Get user role level from session
  const userMetadata = session.user?.user_metadata || {};

  // Log user metadata for debugging
  console.log("User metadata in middleware:", userMetadata);

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

  console.log("Final role level in middleware:", userRoleLevel);

  // Admin-only routes (level 4)
  if (
    (pathname.startsWith("/admin") || pathname === "/dashboard") &&
    userRoleLevel < 4
  ) {
    // Redirect non-admin users to member dashboard
    return NextResponse.redirect(new URL("/member/dashboard", request.url));
  }

  // Ministry leader routes (level 3+)
  if (
    (pathname.startsWith("/ministries/manage") ||
      pathname.startsWith("/classes/manage")) &&
    userRoleLevel < 3
  ) {
    // Redirect to member dashboard
    return NextResponse.redirect(new URL("/member/dashboard", request.url));
  }

  // Cell leader routes (level 2+)
  if (
    (pathname.startsWith("/cell-groups/manage") ||
      pathname.startsWith("/attendance/record")) &&
    userRoleLevel < 2
  ) {
    // Redirect to member dashboard
    return NextResponse.redirect(new URL("/member/dashboard", request.url));
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
    return NextResponse.redirect(new URL("/member/dashboard", request.url));
  }

  // Member routes - only accessible by logged in users
  if (pathname.startsWith("/member") && !session) {
    return NextResponse.redirect(new URL("/auth/member/login", request.url));
  }

  // If user is logged in and tries to access login/register pages
  if (
    session &&
    (pathname === "/auth/login" ||
      pathname === "/auth/member/login" ||
      pathname === "/auth/admin/login" ||
      pathname === "/auth/register")
  ) {
    // Redirect to appropriate dashboard based on role level
    if (userRoleLevel >= 4) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (userRoleLevel >= 3) {
      return NextResponse.redirect(
        new URL("/ministries/dashboard", request.url)
      );
    } else if (userRoleLevel >= 2) {
      return NextResponse.redirect(
        new URL("/cell-groups/dashboard", request.url)
      );
    } else {
      return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }
  }

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
