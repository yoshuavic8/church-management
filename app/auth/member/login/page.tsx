'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../lib/supabase';

export default function MemberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  // Check if user just registered
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('registered') === 'true') {
      setRegistered(true);
    }
  }, []);

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

      // Get user directly from auth
      if (!data.user) {
        throw new Error('User data not found');
      }

      // Get user metadata directly from auth
      const userMetadata = data.user.user_metadata || {};

      // Log auth user data for debugging
      console.log('Auth user data:', data.user);
      console.log('Auth user metadata:', userMetadata);

      // Determine role and role level directly from auth metadata
      let role = userMetadata.role || 'member';
      let roleLevel = userMetadata.role_level ? Number(userMetadata.role_level) : 1;
      let roleContext = userMetadata.role_context || null;

      // Also get user data from members table as fallback
      const { data: userData, error: userError } = await supabase
        .from('members')
        .select('id, role, role_level, role_context, first_name, last_name, email')
        .eq('id', data.user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user role from members table:', userError);
        // Continue with auth metadata
      } else if (userData && (!userMetadata.role || !userMetadata.role_level)) {
        // Use members data as fallback if auth metadata is missing
        role = userData.role || role;
        roleLevel = userData.role_level || roleLevel;
        roleContext = userData.role_context || roleContext;
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

      // Update user metadata with role information if needed
      if (role !== userMetadata.role ||
          roleLevel !== Number(userMetadata.role_level) ||
          JSON.stringify(roleContext) !== JSON.stringify(userMetadata.role_context)) {

        console.log('Updating user metadata with role information');
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
          data: {
            role,
            role_level: roleLevel,
            role_context: roleContext
          }
        });

        if (updateError) {
          console.error('Error updating user metadata:', updateError);
          // Continue anyway, this is not critical
        } else {
          console.log('User metadata updated successfully:', updateData);
        }
      } else {
        console.log('User metadata already up to date, skipping update');
      }

      // Check if there's a redirect URL in the query parameters
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirectTo');

      // For member login, always redirect to member dashboard
      let redirectPath = '/member/dashboard';
      if (redirectTo && redirectTo.startsWith('/member')) {
        redirectPath = redirectTo;
      }

      console.log('Redirecting to:', redirectPath);
      console.log('Current URL:', window.location.href);
      console.log('Current origin:', window.location.origin);

      // Determine if we're in production or development
      const isProduction = window.location.origin.includes('vercel.app') ||
                          window.location.origin.includes('church-management');

      // Use relative path for navigation to avoid CORS issues
      const relativePath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;

      console.log('Is production environment:', isProduction);
      console.log('Using relative path for navigation:', relativePath);

      // Force a hard navigation to ensure middleware processes the request properly
      // Use relative URL to avoid CORS issues
      window.location.href = relativePath;

      // As a fallback, also use the router with a delay
      setTimeout(() => {
        console.log('Fallback navigation with router');
        router.replace(relativePath);
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);

      // Provide more specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Silakan periksa email Anda untuk link konfirmasi.');
      } else if (error.message?.includes('User not found')) {
        setError('Pengguna tidak ditemukan. Silakan periksa email Anda atau daftar terlebih dahulu.');
      } else {
        setError(error.message || 'Terjadi kesalahan saat login. Silakan coba lagi.');
      }

      // Try to sign out to clear any partial auth state
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Error during sign out after failed login:', signOutError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Member Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Login untuk anggota gereja
          </p>
        </div>

        {registered && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Pendaftaran berhasil! Silakan login dengan akun Anda.
                </p>
              </div>
            </div>
          </div>
        )}

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
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Daftar
            </Link>
          </p>
        </div>

        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">
            Admin atau pengurus?{' '}
            <Link href="/auth/admin/login" className="text-primary hover:underline">
              Login admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
