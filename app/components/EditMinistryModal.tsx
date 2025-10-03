'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
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
  };
  status: string;
};

interface EditMinistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ministry: Ministry | null;
  onMinistryUpdated: () => void;
}

export default function EditMinistryModal({ 
  isOpen, 
  onClose, 
  ministry, 
  onMinistryUpdated 
}: EditMinistryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader_id: ''
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && ministry) {
      // Set form data from ministry
      setFormData({
        name: ministry.name,
        description: ministry.description || '',
        leader_id: ministry.leader_id || ''
      });
      
      // Load members for leader selection
      loadMembers();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, ministry]);

  const loadMembers = async () => {
    try {
      const response = await apiClient.getMembers({ 
        page: 1, 
        limit: 1000
      });
      
      if (response.success && response.data) {
        // Filter active members and sort by name for easier selection
        const activeMembers = response.data
          .filter(member => member.status === 'active')
          .sort((a, b) => {
            const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
            const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
            return nameA.localeCompare(nameB);
          });
        setMembers(activeMembers);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ministry) return;

    // Basic validation
    if (!formData.name.trim()) {
      setError('Ministry name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        leader_id: formData.leader_id || undefined
      };

      const response = await apiClient.updateMinistry(ministry.id, updateData);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update ministry');
      }

      setSuccess('Ministry updated successfully!');
      setTimeout(() => {
        onMinistryUpdated();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('Error updating ministry:', error);
      setError(error.message || 'Failed to update ministry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !ministry) return null;

  return (
    <div className="fixed inset-0 z-99999 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Edit Ministry
                  </h3>
                  
                  {/* Success Message */}
                  {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                      {success}
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {/* Ministry Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Ministry Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="Enter ministry name"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="Enter ministry description (optional)"
                      />
                    </div>

                    {/* Leader Selection */}
                    <div>
                      <label htmlFor="leader_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Ministry Leader
                      </label>
                      <select
                        id="leader_id"
                        name="leader_id"
                        value={formData.leader_id}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Select a leader (optional)</option>
                        {members.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.first_name} {member.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Ministry'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
