'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';
import { RoleLevel, ContextType, getRoleName } from '../../lib/role-utils';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  role_level: number;
  role_context: any;
  status: string;
};

type CellGroup = {
  id: string;
  name: string;
};

type Ministry = {
  id: string;
  name: string;
};

type District = {
  id: string;
  name: string;
};

export default function RoleManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Member[]>([]);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);
  const [selectedRoleLevel, setSelectedRoleLevel] = useState<number>(1);
  const [selectedContextType, setSelectedContextType] = useState<ContextType | ''>('');
  const [selectedContextIds, setSelectedContextIds] = useState<string[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, role, role_level, role_context, status')
        .order('first_name', { ascending: true });
        
      if (usersError) throw usersError;
      setUsers(usersData || []);
      
      // Fetch cell groups
      const { data: cellGroupsData, error: cellGroupsError } = await supabase
        .from('cell_groups')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (cellGroupsError) throw cellGroupsError;
      setCellGroups(cellGroupsData || []);
      
      // Fetch ministries
      const { data: ministriesData, error: ministriesError } = await supabase
        .from('ministries')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (ministriesError) throw ministriesError;
      setMinistries(ministriesData || []);
      
      // Fetch districts
      const { data: districtsData, error: districtsError } = await supabase
        .from('districts')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (districtsError) throw districtsError;
      setDistricts(districtsData || []);
    } catch (error: any) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter is applied in the filteredUsers computed property
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

  const handleSelectUser = (user: Member) => {
    setSelectedUser(user);
    setSelectedRoleLevel(user.role_level || 1);
    
    // Reset context selections
    setSelectedContextType('');
    setSelectedContextIds([]);
    
    // If user has role context, set the appropriate values
    if (user.role_context) {
      if (user.role_context[ContextType.CellGroup]) {
        setSelectedContextType(ContextType.CellGroup);
        setSelectedContextIds(Array.isArray(user.role_context[ContextType.CellGroup]) 
          ? user.role_context[ContextType.CellGroup] 
          : [user.role_context[ContextType.CellGroup]]);
      } else if (user.role_context[ContextType.Ministry]) {
        setSelectedContextType(ContextType.Ministry);
        setSelectedContextIds(Array.isArray(user.role_context[ContextType.Ministry]) 
          ? user.role_context[ContextType.Ministry] 
          : [user.role_context[ContextType.Ministry]]);
      } else if (user.role_context[ContextType.District]) {
        setSelectedContextType(ContextType.District);
        setSelectedContextIds(Array.isArray(user.role_context[ContextType.District]) 
          ? user.role_context[ContextType.District] 
          : [user.role_context[ContextType.District]]);
      }
    }
  };

  const handleRoleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = Number(e.target.value);
    setSelectedRoleLevel(level);
    
    // Reset context if changing to member or admin
    if (level === RoleLevel.Member || level === RoleLevel.Admin) {
      setSelectedContextType('');
      setSelectedContextIds([]);
    }
    
    // Set default context type based on role level
    if (level === RoleLevel.CellLeader) {
      setSelectedContextType(ContextType.CellGroup);
    } else if (level === RoleLevel.MinistryLeader) {
      setSelectedContextType(ContextType.Ministry);
    }
  };

  const handleContextTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContextType(e.target.value as ContextType);
    setSelectedContextIds([]);
  };

  const handleContextIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setSelectedContextIds(selectedValues);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    
    try {
      // Validate inputs
      if (selectedRoleLevel === RoleLevel.CellLeader && (!selectedContextType || selectedContextIds.length === 0)) {
        throw new Error('Cell Group Leaders must have at least one cell group assigned');
      }
      
      if (selectedRoleLevel === RoleLevel.MinistryLeader && (!selectedContextType || selectedContextIds.length === 0)) {
        throw new Error('Ministry Leaders must have at least one ministry assigned');
      }
      
      // Prepare context type and IDs
      let contextType = null;
      let contextIds = null;
      
      if (selectedRoleLevel !== RoleLevel.Member && selectedRoleLevel !== RoleLevel.Admin) {
        contextType = selectedContextType;
        contextIds = selectedContextIds;
      }
      
      // Call API to update role
      const response = await fetch('/api/admin/set-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: selectedUser.email,
          roleLevel: selectedRoleLevel,
          contextType,
          contextIds
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }
      
      setUpdateSuccess(`Successfully updated role for ${selectedUser.first_name} ${selectedUser.last_name}`);
      
      // Refresh user list
      fetchData();
    } catch (error: any) {
      
      setUpdateError(error.message || 'Failed to update role');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Role Management"
        backTo="/admin"
        backLabel="Admin Dashboard"
      />
      
      <div className="space-y-6">
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleSelectUser(user)}
                      >
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectUser(user);
                            }}
                            className="text-primary hover:underline"
                          >
                            Edit Role
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Role Editor */}
        {selectedUser && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Edit Role: {selectedUser.first_name} {selectedUser.last_name}
            </h2>
            
            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {updateError}
              </div>
            )}
            
            {updateSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {updateSuccess}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="role_level" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role_level"
                  value={selectedRoleLevel}
                  onChange={handleRoleLevelChange}
                  className="input-field"
                >
                  <option value={RoleLevel.Member}>Member</option>
                  <option value={RoleLevel.CellLeader}>Cell Group Leader</option>
                  <option value={RoleLevel.MinistryLeader}>Ministry Leader</option>
                  <option value={RoleLevel.Admin}>Admin</option>
                </select>
              </div>
              
              {selectedRoleLevel === RoleLevel.CellLeader && (
                <div>
                  <label htmlFor="context_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Context Type
                  </label>
                  <select
                    id="context_type"
                    value={selectedContextType}
                    onChange={handleContextTypeChange}
                    className="input-field"
                  >
                    <option value="">Select Context Type</option>
                    <option value={ContextType.CellGroup}>Cell Group</option>
                    <option value={ContextType.District}>District</option>
                  </select>
                </div>
              )}
              
              {selectedRoleLevel === RoleLevel.MinistryLeader && (
                <div>
                  <label htmlFor="context_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Context Type
                  </label>
                  <select
                    id="context_type"
                    value={selectedContextType}
                    onChange={handleContextTypeChange}
                    className="input-field"
                  >
                    <option value="">Select Context Type</option>
                    <option value={ContextType.Ministry}>Ministry</option>
                  </select>
                </div>
              )}
              
              {selectedContextType === ContextType.CellGroup && (
                <div className="md:col-span-2">
                  <label htmlFor="context_ids" className="block text-sm font-medium text-gray-700 mb-1">
                    Cell Groups
                  </label>
                  <select
                    id="context_ids"
                    multiple
                    value={selectedContextIds}
                    onChange={handleContextIdChange}
                    className="input-field h-40"
                  >
                    {cellGroups.map(cellGroup => (
                      <option key={cellGroup.id} value={cellGroup.id}>
                        {cellGroup.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl (or Cmd on Mac) to select multiple cell groups
                  </p>
                </div>
              )}
              
              {selectedContextType === ContextType.Ministry && (
                <div className="md:col-span-2">
                  <label htmlFor="context_ids" className="block text-sm font-medium text-gray-700 mb-1">
                    Ministries
                  </label>
                  <select
                    id="context_ids"
                    multiple
                    value={selectedContextIds}
                    onChange={handleContextIdChange}
                    className="input-field h-40"
                  >
                    {ministries.map(ministry => (
                      <option key={ministry.id} value={ministry.id}>
                        {ministry.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl (or Cmd on Mac) to select multiple ministries
                  </p>
                </div>
              )}
              
              {selectedContextType === ContextType.District && (
                <div className="md:col-span-2">
                  <label htmlFor="context_ids" className="block text-sm font-medium text-gray-700 mb-1">
                    Districts
                  </label>
                  <select
                    id="context_ids"
                    multiple
                    value={selectedContextIds}
                    onChange={handleContextIdChange}
                    className="input-field h-40"
                  >
                    {districts.map(district => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl (or Cmd on Mac) to select multiple districts
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                disabled={updateLoading}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {updateLoading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
