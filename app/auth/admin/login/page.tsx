'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Clear any invalid tokens on page load
  useEffect(() => {
    const clearInvalidTokens = async () => {
      try {
        const supabase = getSupabaseClient();
        // Check if we have a session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          // Sign out to clear any invalid tokens
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Unexpected error checking session:', error);
      }
    };

    clearInvalidTokens();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Sign out first to clear any existing tokens
      await supabase.auth.signOut();

      // Then sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Get user role from members table
      const { data: userData, error: userError } = await supabase
        .from('members')
        .select('id, role, role_level, role_context, first_name, last_name, email')
        .eq('id', data.user?.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user role:', userError);
        // Continue with default role
      }

      // Get user metadata
      const userMetadata = data.user?.user_metadata;

      // Determine role and role level
      let role = 'member';
      let roleLevel = 1;
      let roleContext = null;

      // First check if we have role info in the members table
      if (userData) {
        role = userData.role || role;
        roleLevel = userData.role_level || roleLevel;
        roleContext = userData.role_context || roleContext;
      }

      // Then check if we have role info in user metadata (takes precedence)
      if (userMetadata) {
        role = userMetadata.role || role;
        roleLevel = userMetadata.role_level || roleLevel;
        roleContext = userMetadata.role_context || roleContext;
      }

      // Check if user has admin privileges
      if (roleLevel < 2) {
        // Not an admin or staff member
        setError('Anda tidak memiliki akses admin. Silakan gunakan halaman login anggota.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Log final role information
      console.log('Final role:', role);
      console.log('Final role level:', roleLevel);

      // If user exists in auth but not in members table, create a member record
      if (!userData && data.user) {
        console.log('User exists in auth but not in members table. Creating member record...');

        // Create a new member record
        const { error: insertError } = await supabase
          .from('members')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              first_name: userMetadata?.first_name || '',
              last_name: userMetadata?.last_name || '',
              role: role,
              role_level: roleLevel,
              role_context: roleContext,
              status: 'active'
            }
          ]);

        if (insertError) {
          console.error('Error creating member record:', insertError);
        }
      }

      // Update user metadata with role information
      await supabase.auth.updateUser({
        data: {
          role,
          role_level: roleLevel,
          role_context: roleContext
        }
      });

      // Check if there's a redirect URL in the query parameters
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirectTo');

      // Redirect based on role level or redirectTo parameter
      if (redirectTo) {
        router.push(redirectTo);
      } else if (roleLevel >= 4) { // Admin
        router.push('/dashboard');
      } else if (roleLevel >= 3) { // Ministry Leader
        router.push('/ministries/dashboard');
      } else if (roleLevel >= 2) { // Cell Leader
        router.push('/cell-groups/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Login khusus untuk admin dan pengurus gereja
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/reset-password" className="text-primary hover:underline">
                Lupa password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Anggota gereja?{' '}
            <Link href="/auth/member/login" className="text-primary hover:underline">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
