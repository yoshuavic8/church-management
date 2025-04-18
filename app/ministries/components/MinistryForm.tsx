import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../lib/supabase';
import { Ministry } from '../../types/ministry';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
};

type MinistryFormProps = {
  ministry?: Ministry;
  isEdit?: boolean;
};

export default function MinistryForm({ ministry, isEdit = false }: MinistryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(ministry?.name || '');
  const [description, setDescription] = useState(ministry?.description || '');
  const [leaderId, setLeaderId] = useState(ministry?.leader_id || '');
  const [status, setStatus] = useState(ministry?.status || 'active');
  
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('members')
          .select('id, first_name, last_name')
          .eq('status', 'active')
          .order('last_name', { ascending: true });

        if (error) throw error;
        setMembers(data || []);
      } catch (error: any) {
        
        setError('Failed to load members. Please try again.');
      }
    };

    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Ministry name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const supabase = getSupabaseClient();
      
      const ministryData = {
        name,
        description: description || null,
        leader_id: leaderId || null,
        status,
        updated_at: new Date().toISOString()
      };
      
      if (isEdit && ministry) {
        // Update existing ministry
        const { error } = await supabase
          .from('ministries')
          .update(ministryData)
          .eq('id', ministry.id);
          
        if (error) throw error;
        
        setSuccess('Ministry updated successfully');
        setTimeout(() => router.push(`/ministries/${ministry.id}`), 1500);
      } else {
        // Create new ministry
        const { data, error } = await supabase
          .from('ministries')
          .insert(ministryData)
          .select();
          
        if (error) throw error;
        
        setSuccess('Ministry created successfully');
        setTimeout(() => router.push(`/ministries/${data[0].id}`), 1500);
      }
    } catch (error: any) {
      
      setError(error.message || 'Failed to save ministry');
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
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      <div className="card p-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Ministry Name *
          </label>
          <input
            type="text"
            id="name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="input-field min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="leader" className="block text-sm font-medium text-gray-700 mb-1">
            Ministry Leader
          </label>
          <select
            id="leader"
            className="input-field"
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
          >
            <option value="">-- Select Leader --</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            className="input-field"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Ministry' : 'Create Ministry'}
        </button>
      </div>
    </form>
  );
}
