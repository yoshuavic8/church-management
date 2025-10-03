'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api-client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Form data interface
interface MinistryFormData {
  name: string;
  description: string;
  leader_id: string;
}

// Member type
type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

function CreateMinistryContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const [formData, setFormData] = useState<MinistryFormData>({
    name: '',
    description: '',
    leader_id: '',
  });

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch all active members for leader selection
      const membersResponse = await apiClient.getMembers({ page: 1, limit: 1000 });

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Authentication required. Please login.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Ministry name is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        leader_id: formData.leader_id || null,
      };

      const response = await apiClient.createMinistry(submitData);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create ministry');
      }

      setSuccess('Ministry created successfully!');
      
      // Redirect to ministry detail page after a short delay
      setTimeout(() => {
        if (response.data?.id) {
          router.push(`/ministries/${response.data.id}`);
        } else {
          router.push('/ministries');
        }
      }, 2000);

    } catch (error: any) {
      console.error('Error creating ministry:', error);
      setError(error.message || 'Failed to create ministry');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Ministry</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new ministry to organize church activities and members
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Ministry Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Ministry Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Worship Ministry, Youth Ministry, Media Ministry"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of the ministry's purpose and activities"
              />
            </div>

            {/* Leader */}
            <div>
              <label htmlFor="leader_id" className="block text-sm font-medium text-gray-700 mb-2">
                Leader (Optional)
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
              <p className="mt-1 text-xs text-gray-500">
                You can add members and assign roles after creating the ministry
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/ministries')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Ministry'}
              </button>
            </div>
          </form>
        </div>

        {/* Information Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Ministries</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Members can join multiple ministries (unlike cell groups)</li>
                  <li>Each ministry can have different roles for members</li>
                  <li>Ministries can schedule meetings and track attendance</li>
                  <li>You can manage members and their roles after creating the ministry</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function CreateMinistryPage() {
  return (
    <ProtectedRoute>
      <CreateMinistryContent />
    </ProtectedRoute>
  );
}
