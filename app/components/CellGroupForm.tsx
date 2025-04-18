'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase';

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
        const supabase = getSupabaseClient();

        // Fetch districts
        const { data: districtsData, error: districtsError } = await supabase
          .from('districts')
          .select('id, name')
          .order('name', { ascending: true });

        if (districtsError) throw districtsError;

        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('id, first_name, last_name')
          .order('last_name', { ascending: true });

        if (membersError) throw membersError;

        setDistricts(districtsData || []);
        setMembers(membersData || []);

        // If editing, fetch current leaders
        if (mode === 'edit' && initialData.id) {
          const { data: leadersData, error: leadersError } = await supabase
            .from('cell_group_leaders')
            .select('member_id')
            .eq('cell_group_id', initialData.id);

          if (leadersError) throw leadersError;

          if (leadersData) {
            setSelectedLeaders(leadersData.map(leader => leader.member_id));
          }
        }
      } catch (error: any) {

        setError(error.message || 'Failed to load form data');
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
      const supabase = getSupabaseClient();

      if (mode === 'add') {
        // Insert new cell group
        const { data: cellGroupData, error: cellGroupError } = await supabase
          .from('cell_groups')
          .insert([formData])
          .select();

        if (cellGroupError) throw cellGroupError;

        if (cellGroupData && cellGroupData.length > 0) {
          const cellGroupId = cellGroupData[0].id;

          // Add leaders
          if (selectedLeaders.length > 0) {
            const leaderEntries = selectedLeaders.map(memberId => ({
              cell_group_id: cellGroupId,
              member_id: memberId,
              role: 'leader'
            }));

            const { error: leadersError } = await supabase
              .from('cell_group_leaders')
              .insert(leaderEntries);

            if (leadersError) throw leadersError;
          }
        }


      } else {
        // Update existing cell group
        const { error: cellGroupError } = await supabase
          .from('cell_groups')
          .update(formData)
          .eq('id', initialData.id!);

        if (cellGroupError) throw cellGroupError;

        // Delete existing leaders
        const { error: deleteLeadersError } = await supabase
          .from('cell_group_leaders')
          .delete()
          .eq('cell_group_id', initialData.id!);

        if (deleteLeadersError) throw deleteLeadersError;

        // Add new leaders
        if (selectedLeaders.length > 0) {
          const leaderEntries = selectedLeaders.map(memberId => ({
            cell_group_id: initialData.id!,
            member_id: memberId,
            role: 'leader'
          }));

          const { error: leadersError } = await supabase
            .from('cell_group_leaders')
            .insert(leaderEntries);

          if (leadersError) throw leadersError;
        }


      }

      // Redirect to cell groups list
      router.push('/cell-groups');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
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
