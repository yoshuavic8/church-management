'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
};

type DistrictFormProps = {
  initialData?: {
    id?: string;
    name?: string;
    leader1_id?: string;
    leader2_id?: string;
    status?: string;
  };
  mode: 'add' | 'edit';
};

export default function DistrictForm({ initialData = {}, mode }: DistrictFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    leader1_id: initialData.leader1_id || '',
    leader2_id: initialData.leader2_id || '',
    status: initialData.status || 'active',
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const supabase = getSupabaseClient();

        // Fetch members
        const { data, error } = await supabase
          .from('members')
          .select('id, first_name, last_name')
          .order('last_name', { ascending: true });

        if (error) throw error;

        setMembers(data || []);
      } catch (error: any) {

        setError(error.message || 'Failed to load members');
      }
    };

    fetchMembers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Create a copy of formData with proper handling for empty leader IDs
      const dataToSubmit = {
        ...formData,
        // Convert empty strings to null for leader IDs
        leader1_id: formData.leader1_id || null,
        leader2_id: formData.leader2_id || null
      };

      if (mode === 'add') {
        // Insert new district
        const { error } = await supabase
          .from('districts')
          .insert([dataToSubmit]);

        if (error) throw error;


      } else {
        // Update existing district
        const { error } = await supabase
          .from('districts')
          .update(dataToSubmit)
          .eq('id', initialData.id!);

        if (error) throw error;


      }

      // Redirect to districts list
      router.push('/districts');
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
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            District Name *
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
          <label htmlFor="leader1_id" className="block text-sm font-medium text-gray-700 mb-1">
            Leader 1 (Optional)
          </label>
          <select
            id="leader1_id"
            name="leader1_id"
            value={formData.leader1_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Leader</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">You can assign a leader later if needed</p>
        </div>

        <div>
          <label htmlFor="leader2_id" className="block text-sm font-medium text-gray-700 mb-1">
            Leader 2 (Optional)
          </label>
          <select
            id="leader2_id"
            name="leader2_id"
            value={formData.leader2_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Leader</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">You can assign a second leader later if needed</p>
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
          {loading ? 'Saving...' : mode === 'add' ? 'Add District' : 'Update District'}
        </button>
      </div>
    </form>
  );
}
