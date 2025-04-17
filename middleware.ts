import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  
  // If no session and trying to access protected routes
  if (!session) {
    // Allow access to public routes
    if (
      pathname === '/' ||
      pathname === '/auth/login' ||
      pathname === '/auth/register' ||
      pathname === '/self-checkin' ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/auth')
    ) {
      return res;
    }
    
    // Redirect to login for all other routes
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user role from session
  const userRole = session.user?.user_metadata?.role || 'member';
  
  // Admin routes - only accessible by admins
  if (
    (pathname.startsWith('/admin') ||
     pathname.startsWith('/members') ||
     pathname.startsWith('/cell-groups') ||
     pathname.startsWith('/districts') ||
     pathname.startsWith('/ministries') ||
     pathname.startsWith('/classes') ||
     pathname.startsWith('/pastoral') ||
     pathname.startsWith('/attendance') ||
     pathname === '/dashboard') && 
    userRole !== 'admin'
  ) {
    // Redirect non-admin users to member dashboard
    return NextResponse.redirect(new URL('/member/dashboard', request.url));
  }
  
  // Member routes - only accessible by logged in users
  if (pathname.startsWith('/member') && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If user is logged in and tries to access login/register pages
  if (session && (pathname === '/auth/login' || pathname === '/auth/register')) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/member/dashboard', request.url));
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
