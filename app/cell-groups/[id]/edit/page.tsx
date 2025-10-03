'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';
import Layout from '../../../components/layout/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type CellGroup = {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  district_id?: string;
  meeting_day?: string;
  meeting_time?: string;
  meeting_location?: string;
  status: 'active' | 'inactive';
  leader?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  district?: {
    id: string;
    name: string;
  };
};

type District = {
  id: string;
  name: string;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export default function EditCellGroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [cellGroup, setCellGroup] = useState<CellGroup | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader_id: '',
    assistant_leader_id: '',
    district_id: '',
    meeting_day: '',
    meeting_time: '',
    meeting_location: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch cell group data
        const cellGroupResponse = await apiClient.getCellGroup(id as string);
        if (!cellGroupResponse.success || !cellGroupResponse.data) {
          throw new Error(cellGroupResponse.error?.message || 'Failed to fetch cell group');
        }
        
        const cellGroupData = cellGroupResponse.data;
        setCellGroup(cellGroupData);
        
        // Set form data
        setFormData({
          name: cellGroupData.name || '',
          description: cellGroupData.description || '',
          leader_id: cellGroupData.leader_id || '',
          assistant_leader_id: cellGroupData.assistant_leader_id || '',
          district_id: cellGroupData.district_id || '',
          meeting_day: cellGroupData.meeting_day || '',
          meeting_time: cellGroupData.meeting_time || '',
          meeting_location: cellGroupData.meeting_location || '',
          status: cellGroupData.status || 'active',
        });

        // Fetch districts
        const districtsResponse = await apiClient.getDistricts();
        if (districtsResponse.success && districtsResponse.data) {
          setDistricts(districtsResponse.data);
        }

        // Fetch cell group members for leader selection
        const cellGroupMembersResponse = await apiClient.getCellGroupMembers(id as string);
        if (cellGroupMembersResponse.success && cellGroupMembersResponse.data) {
          // Extract active members from the cell group
          const activeMembers = cellGroupMembersResponse.data
            .filter((membership: any) => membership.status === 'active')
            .map((membership: any) => membership.member);
          setMembers(activeMembers);
        } else {
          // Fallback: if cell group members API fails, fetch all members
          const membersResponse = await apiClient.getMembers({ limit: 1000 });
          if (membersResponse.success && membersResponse.data) {
            setMembers(membersResponse.data);
          }
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellGroup || !user) return;

    try {
      setSaving(true);
      setError(null);

      // Prepare data for API
      const updateData = {
        ...formData,
        // Convert empty strings to null for foreign keys
        leader_id: formData.leader_id || null,
        assistant_leader_id: formData.assistant_leader_id || null,
        district_id: formData.district_id || null,
        meeting_time: formData.meeting_time || null,
      };

      const response = await apiClient.updateCellGroup(cellGroup.id, updateData);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update cell group');
      }

      alert('Cell group updated successfully!');
      router.push(`/cell-groups/${cellGroup.id}`);
      
    } catch (error: any) {
      console.error('Error updating cell group:', error);
      setError(error.message || 'Failed to update cell group');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading cell group data...</p>
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
            <p className="font-bold">Error loading cell group</p>
            <p className="text-sm">{error}</p>
            <Link
              href="/cell-groups"
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Back to Cell Groups
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!cellGroup) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center">
            <p className="text-gray-500">Cell group not found</p>
            <Link
              href="/cell-groups"
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Back to Cell Groups
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
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Cell Group</h1>
                <p className="text-gray-600 mt-2">Update cell group information</p>
              </div>
              <Link
                href={`/cell-groups/${cellGroup.id}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg p-6">
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Error updating cell group</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Cell Group Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Brief description of the cell group..."
                />
              </div>

              {/* Leadership and Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="leader_id" className="block text-sm font-medium text-gray-700">
                    Cell Group Leader
                  </label>
                  <select
                    id="leader_id"
                    name="leader_id"
                    value={formData.leader_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a leader...</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="assistant_leader_id" className="block text-sm font-medium text-gray-700">
                    Assistant Leader
                  </label>
                  <select
                    id="assistant_leader_id"
                    name="assistant_leader_id"
                    value={formData.assistant_leader_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select an assistant leader...</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="district_id" className="block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <select
                    id="district_id"
                    name="district_id"
                    value={formData.district_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a district...</option>
                    {districts.map(district => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Meeting Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="meeting_day" className="block text-sm font-medium text-gray-700">
                    Meeting Day
                  </label>
                  <select
                    id="meeting_day"
                    name="meeting_day"
                    value={formData.meeting_day}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a day...</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="meeting_time" className="block text-sm font-medium text-gray-700">
                    Meeting Time
                  </label>
                  <input
                    type="time"
                    id="meeting_time"
                    name="meeting_time"
                    value={formData.meeting_time}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="meeting_location" className="block text-sm font-medium text-gray-700">
                    Meeting Location
                  </label>
                  <input
                    type="text"
                    id="meeting_location"
                    name="meeting_location"
                    value={formData.meeting_location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Meeting location or address"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Link
                  href={`/cell-groups/${cellGroup.id}`}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
