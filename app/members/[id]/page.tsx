'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api-client';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  occupation?: string;
  join_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  status: string;
  role?: string;
  cell_group?: {
    id: string;
    name: string;
  };
  district?: {
    id: string;
    name: string;
  };
  cell_group_memberships?: Array<{
    id: string;
    status: string;
    joined_date: string;
    cell_group: {
      id: string;
      name: string;
      district?: {
        id: string;
        name: string;
      };
    };
  }>;
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.getMember(id as string);
        
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to fetch member');
        }

        setMember(response.data);
        console.log('Member data for view:', response.data);
        console.log('Cell group info (legacy):', response.data.cell_group);
        console.log('Cell group memberships (current):', response.data.cell_group_memberships);
        console.log('District info:', response.data.district);
        
        // Extract actual cell group and district from memberships
        const activeMembership = response.data.cell_group_memberships?.find(
          (membership: any) => membership.status === 'active'
        );
        console.log('Active cell group membership:', activeMembership);
        
      } catch (error: any) {
        console.error('Error fetching member:', error);
        setError(error.message || 'Failed to fetch member data');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchMemberData();
    }
  }, [user, id]);

  // Handle delete member
  const handleDeleteMember = async () => {
    if (!member || !user) return;

    try {
      const response = await apiClient.deleteMember(member.id);
      
      if (response.success) {
        alert(`Member ${member.first_name} ${member.last_name} has been deleted successfully.`);
        router.push('/members');
      } else {
        alert(response.error?.message || 'Failed to delete member');
      }
    } catch (error: any) {
      console.error('Error deleting member:', error);
      alert(error.message || 'Failed to delete member');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatValue = (value?: string) => {
    return value || 'N/A';
  };

  const capitalizeFirst = (value?: string) => {
    if (!value) return 'N/A';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading member...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading member</p>
            <p className="text-sm">{error}</p>
            <Link
              href="/members"
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Back to Members
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!member) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center">
            <p className="text-gray-500">Member not found</p>
            <Link
              href="/members"
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Back to Members
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Member Details</h1>
              <p className="text-gray-600 mt-2">
                {member.first_name} {member.last_name}
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Link
                href="/members"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Back to Members
              </Link>
              <Link
                href={`/members/${member.id}/edit`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                Edit Member
              </Link>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Delete Member
              </button>
            </div>
          </div>

          {/* Member Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">First Name</label>
                    <p className="mt-1 text-sm text-gray-900">{formatValue(member.first_name)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Name</label>
                    <p className="mt-1 text-sm text-gray-900">{formatValue(member.last_name)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{formatValue(member.email)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{formatValue(member.phone)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{capitalizeFirst(member.gender)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(member.date_of_birth)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="mt-1 text-sm text-gray-900">{capitalizeFirst(member.marital_status)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Occupation</label>
                  <p className="mt-1 text-sm text-gray-900">{formatValue(member.occupation)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{formatValue(member.address)}</p>
                </div>
              </div>
            </div>

            {/* Church Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Church Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Join Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(member.join_date)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {capitalizeFirst(member.status)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Role</label>
                  <p className="mt-1 text-sm text-gray-900">{capitalizeFirst(member.role)}</p>
                </div>

                {/* Cell Group - from memberships */}
                {(() => {
                  const activeMembership = member.cell_group_memberships?.find(
                    (membership: any) => membership.status === 'active'
                  );
                  const currentCellGroup = activeMembership?.cell_group || member.cell_group;
                  
                  return currentCellGroup ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Cell Group</label>
                      <p className="mt-1 text-sm text-gray-900">{currentCellGroup.name}</p>
                      {activeMembership && (
                        <p className="text-xs text-gray-500">
                          Joined: {new Date(activeMembership.joined_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : null;
                })()}

                {/* District - from cell group or direct assignment */}
                {(() => {
                  const activeMembership = member.cell_group_memberships?.find(
                    (membership: any) => membership.status === 'active'
                  );
                  const currentDistrict = activeMembership?.cell_group?.district || member.district;
                  
                  return currentDistrict ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">District</label>
                      <p className="mt-1 text-sm text-gray-900">{currentDistrict.name}</p>
                      {activeMembership?.cell_group?.district && (
                        <p className="text-xs text-gray-500">Via Cell Group</p>
                      )}
                    </div>
                  ) : null;
                })()}

                <div>
                  <label className="block text-sm font-medium text-gray-500">Emergency Contact Name</label>
                  <p className="mt-1 text-sm text-gray-900">{formatValue(member.emergency_contact_name)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Emergency Contact Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{formatValue(member.emergency_contact_phone)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {member.notes && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{member.notes}</p>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Delete Member
                  </h2>
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this member? This action cannot be undone.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    {member.phone && (
                      <p className="text-sm text-gray-600">{member.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteMember}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    Delete Member
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
