'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';
import { RoleLevel, ContextType, getRoleName } from '../../../lib/role-utils';

type Permission = {
  id: string;
  name: string;
  description: string;
  roles: number[];
};

type UserPermission = {
  user_id: string;
  permission_id: string;
  granted_by: string;
  granted_at: string;
};

export default function UserPermissions() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([
    { id: 'manage_members', name: 'Manage Members', description: 'Create, edit, and delete member records', roles: [RoleLevel.Admin] },
    { id: 'manage_cell_groups', name: 'Manage Cell Groups', description: 'Create, edit, and delete cell groups', roles: [RoleLevel.Admin, RoleLevel.MinistryLeader] },
    { id: 'manage_attendance', name: 'Manage Attendance', description: 'Record and edit attendance for any meeting', roles: [RoleLevel.Admin, RoleLevel.MinistryLeader, RoleLevel.CellLeader] },
    { id: 'manage_articles', name: 'Manage Articles', description: 'Create, edit, and delete articles', roles: [RoleLevel.Admin] },
    { id: 'manage_events', name: 'Manage Events', description: 'Create, edit, and delete events', roles: [RoleLevel.Admin, RoleLevel.MinistryLeader] },
    { id: 'generate_documents', name: 'Generate Documents', description: 'Generate official church documents', roles: [RoleLevel.Admin] },
    { id: 'view_reports', name: 'View Reports', description: 'View church-wide reports and statistics', roles: [RoleLevel.Admin, RoleLevel.MinistryLeader] },
    { id: 'manage_users', name: 'Manage Users', description: 'Manage user accounts and permissions', roles: [RoleLevel.Admin] },
  ]);
  const [userPermissions, setUserPermissions] = useState<{[key: string]: string[]}>({}); // user_id -> permission_ids
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    // In a real implementation, we would fetch permissions from the database
    // For now, we're using the hardcoded permissions array
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, role, role_level, status')
        .order('first_name', { ascending: true });
        
      if (error) throw error;
      
      setUsers(data || []);
      
      // In a real implementation, we would fetch user permissions from the database
      // For now, we'll simulate it based on role_level
      const simulatedPermissions: {[key: string]: string[]} = {};
      
      data?.forEach(user => {
        const roleLevel = user.role_level || 1;
        simulatedPermissions[user.id] = permissions
          .filter(p => p.roles.includes(roleLevel))
          .map(p => p.id);
      });
      
      setUserPermissions(simulatedPermissions);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setUserPermissions(prev => {
      const userPerms = [...(prev[selectedUser] || [])];
      
      if (checked && !userPerms.includes(permissionId)) {
        userPerms.push(permissionId);
      } else if (!checked && userPerms.includes(permissionId)) {
        const index = userPerms.indexOf(permissionId);
        userPerms.splice(index, 1);
      }
      
      return {
        ...prev,
        [selectedUser]: userPerms
      };
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // In a real implementation, we would save the permissions to the database
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Permissions updated successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div>
      <Header
        title="User Permissions"
        backTo="/admin/users"
        backLabel="Back to Users"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Users</h2>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[500px]">
              <ul className="divide-y divide-gray-200">
                {loading ? (
                  <li className="p-4 text-center">
                    <div className="animate-spin inline-block h-6 w-6 border-t-2 border-b-2 border-primary rounded-full"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                  </li>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <li 
                      key={user.id} 
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedUser === user.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleUserChange(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {user.email || 'No email'}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role_level === 4 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role_level === 3
                              ? 'bg-yellow-100 text-yellow-800'
                              : user.role_level === 2
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getRoleName(user.role_level) || 'Member'}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-500">
                    No users found
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {selectedUserData 
                  ? `Permissions for ${selectedUserData.first_name} ${selectedUserData.last_name}`
                  : 'Select a user to manage permissions'}
              </h2>
            </div>
            
            {error && (
              <div className="m-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                {error}
              </div>
            )}
            
            {success && (
              <div className="m-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
                {success}
              </div>
            )}
            
            {selectedUser ? (
              <div className="p-4">
                <div className="space-y-4">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`permission-${permission.id}`}
                          type="checkbox"
                          checked={userPermissions[selectedUser]?.includes(permission.id) || false}
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          disabled={saving}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-700">
                          {permission.name}
                        </label>
                        <p className="text-gray-500">{permission.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Available to: {permission.roles.map(r => getRoleName(r)).join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {saving ? 'Saving...' : 'Save Permissions'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Select a user from the list to manage their permissions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
