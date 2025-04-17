'use client';

import { useState } from 'react';
import Header from '../../components/Header';

export default function SyncUsersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any | null>(null);
  const [adminSecret, setAdminSecret] = useState('');

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminSecret) {
      setError('Admin secret is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/auth/sync-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminSecret }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync users');
      }
      
      setSuccess(data);
      setAdminSecret('');
    } catch (error: any) {
      console.error('Error syncing users:', error);
      setError(error.message || 'Failed to sync users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Sync Auth Users with Members"
        backTo="/admin"
        backLabel="Admin Dashboard"
      />
      
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sync Users</h2>
          
          <p className="text-gray-600 mb-4">
            This tool will synchronize users from the Supabase Auth system with the Members table.
            It will create member records for auth users that don't have corresponding member records.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Sync completed successfully!</p>
              <p>Total users: {success.results.total}</p>
              <p>Synced: {success.results.synced}</p>
              <p>Errors: {success.results.errors}</p>
              
              {success.results.details.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium">Details:</h3>
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {success.results.details.map((detail: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {detail.user_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {detail.email || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                detail.action === 'created' 
                                  ? 'bg-green-100 text-green-800' 
                                  : detail.action === 'updated_id'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {detail.action === 'created' 
                                  ? 'Created' 
                                  : detail.action === 'updated_id'
                                    ? 'Updated ID'
                                    : 'Error'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {detail.error || detail.existing_id || ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSync}>
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
              {loading ? 'Syncing...' : 'Sync Users'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
