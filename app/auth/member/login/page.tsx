'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

export default function MemberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const { loginMemberWithPassword } = useAuth();



  // Handle member login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to login with email:', email);

      // First, check if the member exists and has a password set
      const response = await fetch('/api/auth/check-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const checkData = await response.json();
      console.log('Member check result:', checkData);

      if (!response.ok) {
        if (checkData.needsPasswordSetup) {
          setError('Your account does not have a password set. Please contact an administrator to set up your password.');
          setLoading(false);
          return;
        }
        throw new Error(checkData.error || 'Login failed');
      }

      // Proceed with login
      const result = await loginMemberWithPassword(email, password);
      console.log('Login result:', result);

      if (result.success) {
        // Check if password reset is required
        if (result.passwordResetRequired) {
          router.push('/member/reset-password');
        } else {
          router.push('/member/dashboard');
        }
      } else {
        if (result.needsPasswordSetup) {
          setError('Your account does not have a password set. Please contact an administrator to set up your password.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Member Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in with your email and password
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-700 p-4 mb-4">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-700 p-4 mb-4">
            <div className="flex">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <p>If this is your first login, your default password is your date of birth in format DDMMYYYY (e.g., 31122000 for December 31, 2000). If you don't have a date of birth recorded, your default password is "Welcome123".</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
