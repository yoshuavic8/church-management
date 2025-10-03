'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { apiClient } from '../../lib/api-client';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import AddMemberToCellGroupModal from '../../components/AddMemberToCellGroupModal';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Define types
type CellGroup = {
  id: string;
  name: string;
  description?: string;
  district_id?: string;
  leader_id?: string;
  leader?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  assistant_leader_id?: string;
  assistant_leader?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  district?: {
    id: string;
    name: string;
  };
  meeting_day?: string;
  meeting_time?: string;
  meeting_location?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  members?: Member[];
  cell_group_members?: Array<{
    id: string;
    joined_date: string;
    status: string;
    member: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      status: string;
      join_date?: string;
    };
  }>;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  join_date: string;
};

// Client-side component for cell group details
function CellGroupDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const cellGroupId = params.id as string;

  const [cellGroup, setCellGroup] = useState<CellGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);

  useEffect(() => {
    const fetchCellGroupData = async () => {
      try {
        setLoading(true);

        if (!user) {
          throw new Error('Authentication required. Please login.');
        }

        // Fetch cell group details
        const cellGroupResponse = await apiClient.getCellGroup(cellGroupId);
        if (!cellGroupResponse.success) {
          throw new Error(cellGroupResponse.error?.message || 'Failed to fetch cell group');
        }

        setCellGroup(cellGroupResponse.data);

        // Extract members from cell group data
        if (cellGroupResponse.data.cell_group_members && Array.isArray(cellGroupResponse.data.cell_group_members)) {
          const transformedMembers = cellGroupResponse.data.cell_group_members.map((item: any) => ({
            id: item.member.id,
            first_name: item.member.first_name,
            last_name: item.member.last_name,
            email: item.member.email,
            phone: item.member.phone,
            status: item.member.status,
            join_date: item.joined_date
          }));
          setMembers(transformedMembers);
        }

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch cell group data');
        setLoading(false);
      }
    };

    if (user && cellGroupId) {
      fetchCellGroupData();
    }
  }, [user, cellGroupId]);

  const handleAddMemberSuccess = () => {
    // Refresh the cell group data
    if (user && cellGroupId) {
      const fetchCellGroupData = async () => {
        try {
          const cellGroupResponse = await apiClient.getCellGroup(cellGroupId);
          if (cellGroupResponse.success) {
            setCellGroup(cellGroupResponse.data);
            
            if (cellGroupResponse.data.cell_group_members && Array.isArray(cellGroupResponse.data.cell_group_members)) {
              const transformedMembers = cellGroupResponse.data.cell_group_members.map((item: any) => ({
                id: item.member.id,
                first_name: item.member.first_name,
                last_name: item.member.last_name,
                email: item.member.email,
                phone: item.member.phone,
                status: item.member.status,
                join_date: item.joined_date
              }));
              setMembers(transformedMembers);
            }
          }
        } catch (error) {
          console.error('Error refreshing cell group data:', error);
        }
      };
      
      fetchCellGroupData();
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!cellGroup || !user) return;
    
    if (!confirm(`Are you sure you want to remove ${memberName} from ${cellGroup.name}?`)) {
      return;
    }

    try {
      const response = await apiClient.removeMemberFromCellGroup(cellGroup.id, memberId);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to remove member');
      }

      alert(`${memberName} has been removed from ${cellGroup.name} successfully.`);
      handleAddMemberSuccess(); // Refresh data
    } catch (error: any) {
      console.error('Error removing member:', error);
      alert(error.message || 'Failed to remove member from cell group');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cell group...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading cell group</p>
            <p className="text-sm">{error}</p>
          </div>
          <Link 
            href="/cell-groups"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Cell Groups
          </Link>
        </div>
      </div>
    );
  }

  if (!cellGroup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">Cell group not found</p>
            <p className="text-sm">The requested cell group could not be found.</p>
          </div>
          <Link 
            href="/cell-groups"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Cell Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <Link
                href="/cell-groups"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{cellGroup.name}</h1>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  cellGroup.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {cellGroup.status}
              </span>
            </div>
            {cellGroup.description && (
              <p className="text-gray-600 mt-2">{cellGroup.description}</p>
            )}
          </div>
          <Link
            href={`/cell-groups/${cellGroup.id}/edit`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Edit Cell Group
          </Link>
        </div>
      </div>

      {/* Cell Group Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-3">
            {cellGroup.leader && (
              <div>
                <label className="text-sm font-medium text-gray-500">Leader</label>
                <p className="text-sm text-gray-900">
                  {cellGroup.leader.first_name} {cellGroup.leader.last_name}
                </p>
                <p className="text-sm text-gray-600">{cellGroup.leader.email}</p>
                {cellGroup.leader.phone && (
                  <p className="text-sm text-gray-600">{cellGroup.leader.phone}</p>
                )}
              </div>
            )}

            {cellGroup.assistant_leader && (
              <div>
                <label className="text-sm font-medium text-gray-500">Assistant Leader</label>
                <p className="text-sm text-gray-900">
                  {cellGroup.assistant_leader.first_name} {cellGroup.assistant_leader.last_name}
                </p>
                <p className="text-sm text-gray-600">{cellGroup.assistant_leader.email}</p>
                {cellGroup.assistant_leader.phone && (
                  <p className="text-sm text-gray-600">{cellGroup.assistant_leader.phone}</p>
                )}
              </div>
            )}

            {cellGroup.district && (
              <div>
                <label className="text-sm font-medium text-gray-500">District</label>
                <p className="text-sm text-gray-900">{cellGroup.district.name}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-sm text-gray-900 capitalize">{cellGroup.status}</p>
            </div>
          </div>
        </div>

        {/* Meeting Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Meeting Information</h2>
          <div className="space-y-3">
            {cellGroup.meeting_day && (
              <div>
                <label className="text-sm font-medium text-gray-500">Meeting Day</label>
                <p className="text-sm text-gray-900">{cellGroup.meeting_day}</p>
              </div>
            )}

            {cellGroup.meeting_time && (
              <div>
                <label className="text-sm font-medium text-gray-500">Meeting Time</label>
                <p className="text-sm text-gray-900">{cellGroup.meeting_time}</p>
              </div>
            )}

            {cellGroup.meeting_location && (
              <div>
                <label className="text-sm font-medium text-gray-500">Meeting Location</label>
                <p className="text-sm text-gray-900">{cellGroup.meeting_location}</p>
              </div>
            )}

            {!cellGroup.meeting_day && !cellGroup.meeting_time && !cellGroup.meeting_location && (
              <p className="text-sm text-gray-500">No meeting information available</p>
            )}
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Members ({members.length || 0})
          </h2>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => setAddMemberModalOpen(true)}
          >
            Add Member
          </button>
        </div>

        {(!members || members.length === 0) ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No members</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding members to this cell group.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members?.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(member.join_date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/members/${member.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleRemoveMember(member.id, `${member.first_name} ${member.last_name}`)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {cellGroup && (
        <AddMemberToCellGroupModal
          isOpen={addMemberModalOpen}
          onClose={() => setAddMemberModalOpen(false)}
          onSuccess={handleAddMemberSuccess}
          cellGroupId={cellGroup.id}
          cellGroupName={cellGroup.name}
          currentMemberIds={members.map(m => m.id)}
        />
      )}
    </div>
  );
}

export default function CellGroupDetailPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <CellGroupDetailContent />
      </Layout>
    </ProtectedRoute>
  );
}
