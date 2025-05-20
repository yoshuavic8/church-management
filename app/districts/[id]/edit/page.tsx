'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../../lib/supabase';
import DistrictForm from '../../../components/DistrictForm';
import Header from '../../../components/Header';

type District = {
  id: string;
  name: string;
  description: string | null;
  leader1_id: string | null;
  leader2_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type DistrictFormData = {
  id?: string;
  name?: string;
  leader1_id?: string;
  leader2_id?: string;
  status?: string;
};

export default function EditDistrictPage() {
  const { id } = useParams();
  const router = useRouter();
  const [district, setDistrict] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistrict = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('districts')
          .select('*')
          .eq('id', id as string)
          .single();

        if (error) throw error;
        setDistrict(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDistrict();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  const formData: DistrictFormData | undefined = district ? {
    id: district.id,
    name: district.name,
    leader1_id: district.leader1_id || undefined,
    leader2_id: district.leader2_id || undefined,
    status: district.status
  } : undefined;

  return (
    <div>
      <Header title="Edit District" />
      <DistrictForm initialData={formData} mode="edit" />
    </div>
  );
} 