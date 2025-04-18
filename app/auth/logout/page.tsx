'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Logout() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      await logout();

      // Redirect to home page after logout
      router.push('/');
    };

    performLogout();
  }, [router, logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Logging Out
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Anda akan dialihkan ke halaman beranda.
          </p>
        </div>

        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Logging you out...</p>
        </div>
      </div>
    </div>
  );
}
