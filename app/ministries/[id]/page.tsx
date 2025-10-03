'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import EditMinistryModal from '../../components/EditMinistryModal';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api-client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Types
type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
};

type MinistryMember = {
  id: string;
  member: Member;
  role?: string;
  joined_date: string;
  status: string;
};

type Ministry = {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  leader?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
  ministry_members: MinistryMember[];
};

// Add Member Modal Component
function AddMemberToMinistryModal({ 
  isOpen, 
  onClose, 
  ministryId, 
  onMemberAdded 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  ministryId: string; 
  onMemberAdded: () => void; 
}) {
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [ministryRoles, setMinistryRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isNewRole, setIsNewRole] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      setSelectedMembers([]);
      setSelectedRoleId('');
      setCustomRole('');
      setSearchTerm('');
      setError(null);
      setIsNewRole(false);
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch available members and ministry roles in parallel
      const [membersResponse, rolesResponse] = await Promise.all([
        apiClient.getMembers({ 
          page: 1, 
          limit: 1000,
          search: searchTerm.trim() || undefined
        }),
        apiClient.getMinistryRoles()
      ]);
      
      if (membersResponse.success) {
        setAvailableMembers(membersResponse.data || []);
      }
      
      if (rolesResponse.success) {
        setMinistryRoles(rolesResponse.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 0 || searchTerm.length === 0) {
      const timeoutId = setTimeout(() => {
        fetchInitialData();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMembers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Determine role to use
      let roleToSubmit = undefined;
      const willCreateNewRole = isNewRole && customRole.trim();
      
      if (selectedRoleId) {
        // Find the selected role name
        const selectedRole = ministryRoles.find(role => role.id === selectedRoleId);
        roleToSubmit = selectedRole?.name;
      } else if (customRole.trim()) {
        roleToSubmit = customRole.trim();
      }
      
      const response = await apiClient.addMemberToMinistry(ministryId, {
        member_ids: selectedMembers,
        role: roleToSubmit
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to add members');
      }
      
      // Show success message and refresh roles if new role was created
      if (willCreateNewRole) {
        alert(`Members added successfully! New role "${roleToSubmit}" has been created and will be available for future use.`);
        // Refresh ministry roles to include the new role
        try {
          const rolesResponse = await apiClient.getMinistryRoles();
          if (rolesResponse.success) {
            setMinistryRoles(rolesResponse.data || []);
          }
        } catch (roleError) {
          console.error('Error refreshing roles:', roleError);
        }
      }
      
      onMemberAdded();
      onClose();
    } catch (error: any) {
      console.error('Error adding members:', error);
      setError(error.message || 'Failed to add members to ministry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Add Members to Ministry
                  </h3>
                  
                  {/* Role Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Selection
                    </label>
                    
                    {/* Predefined Roles Dropdown */}
                    <div className="mb-2">
                      <label htmlFor="roleSelect" className="block text-xs font-medium text-gray-600 mb-1">
                        Select from predefined roles:
                      </label>
                      <select
                        id="roleSelect"
                        value={selectedRoleId}
                        onChange={(e) => {
                          setSelectedRoleId(e.target.value);
                          if (e.target.value) setCustomRole(''); // Clear custom role if predefined role is selected
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      >
                        <option value="">-- Select a role --</option>
                        {ministryRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name} {role.is_leadership ? '(Leadership)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Role Input */}
                    <div>
                      <label htmlFor="customRole" className="block text-xs font-medium text-gray-600 mb-1">
                        Or enter custom role:
                      </label>
                      <input
                        type="text"
                        id="customRole"
                        value={customRole}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomRole(value);
                          if (value.trim()) {
                            setSelectedRoleId(''); // Clear predefined role if custom role is entered
                            
                            // Check if this custom role already exists in ministryRoles
                            const roleExists = ministryRoles.some(role => 
                              role.name.toLowerCase() === value.trim().toLowerCase()
                            );
                            setIsNewRole(!roleExists && value.trim().length > 0);
                          } else {
                            setIsNewRole(false);
                          }
                        }}
                        placeholder="e.g., Special Assistant, Event Coordinator"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      {isNewRole && customRole.trim() && (
                        <div className="mt-1 flex items-center text-xs text-green-600">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="font-medium">New role "{customRole.trim()}" will be created</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-1 text-xs text-gray-500">
                      You can select a predefined role or enter a custom role name. 
                      <span className="text-indigo-600 font-medium">Custom roles will be automatically saved for future use.</span>
                    </p>
                  </div>

                  {/* Search */}
                  <div className="mb-4">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                      Search Members
                    </label>
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  )}

                  {/* Members List */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Members ({selectedMembers.length} selected)
                    </label>
                    <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                        </div>
                      ) : availableMembers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No members found
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {availableMembers.map((member) => (
                            <label key={member.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedMembers.includes(member.id)}
                                onChange={() => handleMemberToggle(member.id)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {member.first_name} {member.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading || selectedMembers.length === 0}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : `Add ${selectedMembers.length} Member${selectedMembers.length === 1 ? '' : 's'}`}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function MinistryDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const ministryId = params?.id as string;
  
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [editMinistryModalOpen, setEditMinistryModalOpen] = useState(false);

  useEffect(() => {
    if (user && ministryId) {
      fetchMinistryDetail();
    }
  }, [user, ministryId]);

  const fetchMinistryDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!ministryId) {
        throw new Error('Ministry ID is required');
      }

      const response = await apiClient.getMinistry(ministryId);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch ministry details');
      }

      setMinistry(response.data);
    } catch (error: any) {
      console.error('Error fetching ministry:', error);
      setError(error.message || 'Failed to fetch ministry details');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the ministry?')) {
      return;
    }

    try {
      const response = await apiClient.removeMemberFromMinistry(ministryId, memberId);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to remove member');
      }
      
      // Refresh ministry data
      await fetchMinistryDetail();
    } catch (error: any) {
      console.error('Error removing member:', error);
      alert(error.message || 'Failed to remove member');
    }
  };

  const handleMemberAdded = () => {
    fetchMinistryDetail();
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !ministry) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Error</h2>
            <p className="mt-2 text-gray-600">{error || 'Ministry not found'}</p>
            <button
              onClick={() => router.push('/ministries')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              Back to Ministries
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => router.push('/ministries')}
                  className="text-gray-400 hover:text-gray-500"
                >
                  Ministries
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">{ministry.name}</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="mt-4 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {ministry.name}
              </h1>
              {ministry.description && (
                <p className="mt-1 text-sm text-gray-500">{ministry.description}</p>
              )}
            </div>
            <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4 space-x-2">
              <button
                onClick={() => setEditMinistryModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Ministry
              </button>
              <button
                onClick={() => setAddMemberModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Members
              </button>
            </div>
          </div>
        </div>

        {/* Ministry Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Leader</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {ministry.leader ? `${ministry.leader.first_name} ${ministry.leader.last_name}` : 'Not assigned'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Members</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {ministry.ministry_members?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ministry.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ministry.status}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Ministry Members</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Members can have multiple roles and join multiple ministries
            </p>
          </div>
          
          {ministry.ministry_members && ministry.ministry_members.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {ministry.ministry_members.map((ministryMember) => (
                <li key={ministryMember.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {ministryMember.member.first_name?.[0]}{ministryMember.member.last_name?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {ministryMember.member.first_name} {ministryMember.member.last_name}
                          </p>
                          {ministryMember.role && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {ministryMember.role}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{ministryMember.member.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(ministryMember.joined_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRemoveMember(ministryMember.member.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No members yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding members to this ministry.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setAddMemberModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Members
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Member Modal */}
        <AddMemberToMinistryModal
          isOpen={addMemberModalOpen}
          onClose={() => setAddMemberModalOpen(false)}
          ministryId={ministryId}
          onMemberAdded={handleMemberAdded}
        />

        {/* Edit Ministry Modal */}
        <EditMinistryModal
          isOpen={editMinistryModalOpen}
          onClose={() => setEditMinistryModalOpen(false)}
          ministry={ministry}
          onMinistryUpdated={fetchMinistryDetail}
        />
      </div>
    </Layout>
  );
}

export default function MinistryDetailPage() {
  return (
    <ProtectedRoute>
      <MinistryDetailContent />
    </ProtectedRoute>
  );
}
