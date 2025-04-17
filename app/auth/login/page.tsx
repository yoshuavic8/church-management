'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new member login page
    router.replace('/auth/member/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Redirecting...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Anda akan dialihkan ke halaman login baru.
          </p>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Jika Anda tidak dialihkan, silakan klik salah satu link berikut:
            </p>
            <div className="mt-4 flex flex-col space-y-2">
              <Link href="/auth/member/login" className="text-primary hover:underline">
                Login Anggota
              </Link>
              <Link href="/auth/admin/login" className="text-primary hover:underline">
                Login Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
