'use client';

import { useState } from 'react';
import Header from '../../components/Header';

export default function FixRolePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any | null>(null);
  const [email, setEmail] = useState('');
  const [adminSecret, setAdminSecret] = useState('');

  const handleFixRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!adminSecret) {
      setError('Admin secret is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/auth/fix-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, adminSecret }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix user role');
      }
      
      setSuccess(data);
      setEmail('');
      setAdminSecret('');
    } catch (error: any) {
      console.error('Error fixing user role:', error);
      setError(error.message || 'Failed to fix user role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Fix User Role"
        backTo="/admin"
        backLabel="Admin Dashboard"
      />
      
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Fix Admin Role</h2>
          
          <p className="text-gray-600 mb-4">
            This tool will fix the admin role for a user by updating both the auth user metadata and the member record.
            Use this if a user has been set as admin but still cannot access the admin dashboard.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Role fixed successfully!</p>
              <p>User: {success.results.auth_user.email}</p>
              
              <div className="mt-4">
                <h3 className="font-medium">Actions taken:</h3>
                <ul className="list-disc list-inside mt-2">
                  {success.results.actions.map((action: string, index: number) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              
              {success.results.auth_user.metadata_before && (
                <div className="mt-4">
                  <h3 className="font-medium">Auth metadata before:</h3>
                  <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(success.results.auth_user.metadata_before, null, 2)}
                  </pre>
                </div>
              )}
              
              {success.results.auth_user.metadata_after && (
                <div className="mt-4">
                  <h3 className="font-medium">Auth metadata after:</h3>
                  <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(success.results.auth_user.metadata_after, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleFixRole}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                User Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter user email"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="adminSecret" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Secret
              </label>
              <input
                type="password"
                id="adminSecret"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="input-field"
                placeholder="Enter admin secret"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This is the secret key set in your environment variables.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? 'Fixing...' : 'Fix Admin Role'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
