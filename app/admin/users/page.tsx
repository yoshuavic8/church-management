'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [setAdminLoading, setSetAdminLoading] = useState(false);
  const [setAdminError, setSetAdminError] = useState<string | null>(null);
  const [setAdminSuccess, setSetAdminSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, role, status')
        .order('first_name', { ascending: true });
        
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter users client-side for simplicity
    // Could be replaced with a server-side search if needed
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.status?.toLowerCase().includes(query)
    );
  });

  const handleSetAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminEmail) {
      setSetAdminError('Email is required');
      return;
    }
    
    setSetAdminLoading(true);
    setSetAdminError(null);
    setSetAdminSuccess(null);
    
    try {
      const response = await fetch('/api/admin/set-admin-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: adminEmail }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set admin role');
      }
      
      setSetAdminSuccess(data.message || 'Successfully set admin role');
      setAdminEmail('');
      
      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error('Error setting admin role:', error);
      setSetAdminError(error.message || 'Failed to set admin role');
    } finally {
      setSetAdminLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="User Management"
        backTo="/admin"
        backLabel="Admin Dashboard"
      />
      
      <div className="space-y-6">
        {/* Set Admin Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Set Admin Role</h2>
          
          {setAdminError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {setAdminError}
            </div>
          )}
          
          {setAdminSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {setAdminSuccess}
            </div>
          )}
          
          <form onSubmit={handleSetAdmin} className="flex items-end space-x-4">
            <div className="flex-grow">
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                User Email
              </label>
              <input
                type="email"
                id="adminEmail"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="input-field"
                placeholder="Enter user email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={setAdminLoading}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {setAdminLoading ? 'Setting...' : 'Set as Admin'}
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-500">
            This will grant admin privileges to the user with the specified email address.
          </p>
        </div>
        
        {/* User List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-medium text-gray-900 mb-4 md:mb-0">Users</h2>
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                />
                <button
                  type="submit"
                  className="ml-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role || 'member'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status || 'inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
