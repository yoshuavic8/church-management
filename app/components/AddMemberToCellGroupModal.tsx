'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
}

interface AddMemberToCellGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cellGroupId: string;
  cellGroupName: string;
  currentMemberIds: string[];
}

export default function AddMemberToCellGroupModal({
  isOpen,
  onClose,
  onSuccess,
  cellGroupId,
  cellGroupName,
  currentMemberIds
}: AddMemberToCellGroupModalProps) {
  const { user } = useAuth();
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchAvailableMembers();
    }
  }, [isOpen, user]);

  const fetchAvailableMembers = async () => {
    try {
      setFetchingMembers(true);
      setError(null);

      // Get members yang belum memiliki cell group
      const response = await apiClient.getMembers({ 
        page: 1, 
        limit: 1000,
        no_cell_group: true
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch members');
      }

      // Filter hanya member yang aktif
      const available = (response.data || []).filter(
        (member: Member) => member.status === 'active'
      );

      setAvailableMembers(available);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      setError(error.message || 'Failed to fetch members');
    } finally {
      setFetchingMembers(false);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async () => {
    if (selectedMemberIds.length === 0) {
      alert('Please select at least one member to add.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.addMembersToCellGroup(cellGroupId, selectedMemberIds);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to add members');
      }

      alert(`Successfully added ${selectedMemberIds.length} member(s) to ${cellGroupName}`);
      setSelectedMemberIds([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding members:', error);
      setError(error.message || 'Failed to add members to cell group');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = availableMembers.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add Members to {cellGroupName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing members who don't have a cell group yet
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Member List */}
        <div className="mb-6 max-h-96 overflow-y-auto border border-gray-200 rounded-md">
          {fetchingMembers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading members...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 
                'No members found matching your search.' : 
                'No members available. All active members already have cell groups.'
              }
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleMemberToggle(member.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(member.id)}
                      onChange={() => handleMemberToggle(member.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      {member.phone && (
                        <p className="text-sm text-gray-500">{member.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Count */}
        {selectedMemberIds.length > 0 && (
          <div className="mb-4 text-sm text-indigo-600">
            {selectedMemberIds.length} member(s) selected
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedMemberIds.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : `Add ${selectedMemberIds.length || ''} Member${selectedMemberIds.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
