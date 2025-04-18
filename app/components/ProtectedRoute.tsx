'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  adminOnly?: boolean;
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  adminOnly = false,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push(redirectTo);
      } else if (adminOnly && !isAdmin) {
        // Not an admin, redirect to member dashboard
        router.push('/member/dashboard');
      }
    }
  }, [user, loading, isAdmin, adminOnly, redirectTo, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated or doesn't have required permissions, don't render children
  if (!user || (adminOnly && !isAdmin)) {
    return null;
  }

  // Render children if authenticated and has required permissions
  return <>{children}</>;
}
