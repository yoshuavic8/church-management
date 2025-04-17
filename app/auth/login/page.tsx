'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';

export default function Login() {
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

      // Check if user has role in metadata
      const userMetadata = data.user?.user_metadata;
      const metadataRole = userMetadata?.role;
      const metadataRoleLevel = userMetadata?.role_level;

      // Log all role information for debugging
      console.log('User data from members table:', userData);
      console.log('User metadata from auth:', userMetadata);

      // Use role from members table, metadata, or default to 'member'
      // For role level, explicitly convert to number to ensure correct type
      const role = userData?.role || metadataRole || 'member';
      const roleLevel = userData?.role_level ? Number(userData.role_level) :
                       metadataRoleLevel ? Number(metadataRoleLevel) : 1;
      const roleContext = userData?.role_context || userMetadata?.role_context || null;

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
      } else { // Regular Member
        router.push('/member/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
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
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
