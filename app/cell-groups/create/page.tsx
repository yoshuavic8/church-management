'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/Layout';
import { apiClient } from '../../lib/api-client';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface District {
  id: string;
  name: string;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

function CreateCellGroupContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    district_id: '',
    leader_id: '',
    assistant_leader_id: '',
    meeting_day: '',
    meeting_time: '',
    meeting_location: ''
  });

  const [districts, setDistricts] = useState<District[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const meetingDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch districts and available members (without cell groups) in parallel
      const [districtsResponse, membersResponse] = await Promise.all([
        apiClient.getDistricts(),
        apiClient.getMembers({ page: 1, limit: 1000, no_cell_group: true })
      ]);

      if (districtsResponse.success) {
        setDistricts(districtsResponse.data || []);
      }

      if (membersResponse.success) {
        setMembers(membersResponse.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // If selecting a leader and it's the same as assistant leader, clear assistant leader
      if (name === 'leader_id' && value && value === prev.assistant_leader_id) {
        newData.assistant_leader_id = '';
      }
      
      // If selecting an assistant leader and it's the same as leader, clear it
      if (name === 'assistant_leader_id' && value && value === prev.leader_id) {
        newData.assistant_leader_id = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Authentication required. Please login.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Cell group name is required.');
      return;
    }

    if (formData.leader_id && formData.assistant_leader_id && formData.leader_id === formData.assistant_leader_id) {
      setError('Leader and Assistant Leader cannot be the same person.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Clean up empty string values
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = value.trim() === '' ? null : value.trim();
        return acc;
      }, {} as any);

      const response = await apiClient.createCellGroup(cleanedData);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create cell group');
      }

      alert('Cell group created successfully!');
      router.push('/cell-groups');
    } catch (error: any) {
      console.error('Error creating cell group:', error);
      setError(error.message || 'Failed to create cell group');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/cell-groups');
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Cell Group</h1>
          <p className="text-gray-600 mt-1">Fill out the information below to create a new cell group.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cell Group Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Cell Group Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter cell group name"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter cell group description"
              />
            </div>

            {/* District */}
            <div>
              <label htmlFor="district_id" className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                id="district_id"
                name="district_id"
                value={formData.district_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a district</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Leader */}
            <div>
              <label htmlFor="leader_id" className="block text-sm font-medium text-gray-700 mb-2">
                Leader
                <span className="text-xs text-gray-500 ml-1">(Only members without cell groups)</span>
              </label>
              <select
                id="leader_id"
                name="leader_id"
                value={formData.leader_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a leader</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Assistant Leader */}
            <div>
              <label htmlFor="assistant_leader_id" className="block text-sm font-medium text-gray-700 mb-2">
                Assistant Leader
                <span className="text-xs text-gray-500 ml-1">(Only members without cell groups, excluding selected leader)</span>
              </label>
              <select
                id="assistant_leader_id"
                name="assistant_leader_id"
                value={formData.assistant_leader_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select an assistant leader</option>
                {members
                  .filter(member => member.id !== formData.leader_id) // Exclude selected leader
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} ({member.email})
                    </option>
                  ))}
              </select>
            </div>

            {/* Meeting Day */}
            <div>
              <label htmlFor="meeting_day" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Day
              </label>
              <select
                id="meeting_day"
                name="meeting_day"
                value={formData.meeting_day}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select meeting day</option>
                {meetingDays.map((day) => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Time */}
            <div>
              <label htmlFor="meeting_time" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Time
              </label>
              <input
                type="time"
                id="meeting_time"
                name="meeting_time"
                value={formData.meeting_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Meeting Location */}
            <div className="md:col-span-2">
              <label htmlFor="meeting_location" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Location
              </label>
              <input
                type="text"
                id="meeting_location"
                name="meeting_location"
                value={formData.meeting_location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter meeting location"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Cell Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateCellGroupPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <CreateCellGroupContent />
      </Layout>
    </ProtectedRoute>
  );
}
