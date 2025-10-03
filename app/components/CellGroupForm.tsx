'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';

type District = {
  id: string;
  name: string;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
};

type CellGroupFormProps = {
  initialData?: {
    id?: string;
    name?: string;
    meeting_day?: string;
    meeting_time?: string;
    meeting_location?: string;
    district_id?: string;
    status?: string;
  };
  mode: 'add' | 'edit';
};

export default function CellGroupForm({ initialData = {}, mode }: CellGroupFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    meeting_day: initialData.meeting_day || '',
    meeting_time: initialData.meeting_time || '',
    meeting_location: initialData.meeting_location || '',
    district_id: initialData.district_id || '',
    status: initialData.status || 'active',
  });
  const [districts, setDistricts] = useState<District[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedLeaders, setSelectedLeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch districts
        const districtsResponse = await apiClient.getDistricts();
        if (districtsResponse.success && districtsResponse.data) {
          setDistricts(districtsResponse.data);
        }

        // Fetch members
        const membersResponse = await apiClient.getMembers();
        if (membersResponse.success && membersResponse.data) {
          setMembers(membersResponse.data);
        }

        // If editing, fetch current leaders
        if (mode === 'edit' && initialData.id) {
          const cellGroupResponse = await apiClient.getCellGroup(initialData.id);
          if (cellGroupResponse.success && cellGroupResponse.data?.leaders) {
            setSelectedLeaders(cellGroupResponse.data.leaders.map((leader: any) => leader.member_id));
          }
        }
        
        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to load form data');
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData.id, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLeaderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedLeaders(selectedOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'add') {
        // Create new cell group with leaders
        const cellGroupData = {
          ...formData,
          leaders: selectedLeaders
        };
        
        const response = await apiClient.createCellGroup(cellGroupData);
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to create cell group');
        }
      } else {
        // Update existing cell group
        const cellGroupData = {
          ...formData,
          leaders: selectedLeaders
        };
        
        const response = await apiClient.updateCellGroup(initialData.id!, cellGroupData);
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to update cell group');
        }
      }

      // Redirect to cell groups list
      router.push('/cell-groups');
    } catch (error: any) {
      setError(error.message || 'An error occurred while saving the cell group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Cell Group Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="district_id" className="block text-sm font-medium text-gray-700 mb-1">
            District *
          </label>
          <select
            id="district_id"
            name="district_id"
            required
            value={formData.district_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select District</option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="meeting_day" className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Day
          </label>
          <select
            id="meeting_day"
            name="meeting_day"
            value={formData.meeting_day}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Day</option>
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
          <label htmlFor="meeting_time" className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Time
          </label>
          <input
            id="meeting_time"
            name="meeting_time"
            type="time"
            value={formData.meeting_time}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="meeting_location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="meeting_location"
            name="meeting_location"
            type="text"
            value={formData.meeting_location}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="input-field"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="leaders" className="block text-sm font-medium text-gray-700 mb-1">
            Leaders (1-2 people)
          </label>
          <select
            id="leaders"
            multiple
            value={selectedLeaders}
            onChange={handleLeaderChange}
            className="input-field h-32"
          >
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple leaders</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : mode === 'add' ? 'Add Cell Group' : 'Update Cell Group'}
        </button>
      </div>
    </form>
  );
}
