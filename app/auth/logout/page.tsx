'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../lib/supabase';

export default function Logout() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Sign out
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          throw error;
        }
        
        // Clear cookies manually if needed
        document.cookie = 'sb-access-token=; Max-Age=0; path=/; domain=' + window.location.hostname;
        document.cookie = 'sb-refresh-token=; Max-Age=0; path=/; domain=' + window.location.hostname;
        
        // Redirect to login page
        router.push('/auth/login');
      } catch (error: any) {
        console.error('Error during logout:', error);
        setError(error.message || 'An error occurred during logout');
        
        // Still try to redirect after a delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };
    
    handleLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Logging Out</h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Logging you out...</p>
          </div>
        )}
      </div>
    </div>
  );
}
