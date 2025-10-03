'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
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
  leader1?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } | null;
  leader2?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } | null;
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
        const response = await apiClient.getDistrict(id as string);
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch district');
        }
        
        setDistrict(response.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDistrict();
    }
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
    leader1_id: district.leader1?.id || district.leader1_id || undefined,
    leader2_id: district.leader2?.id || district.leader2_id || undefined,
    status: district.status
  } : undefined;

  return (
    <div>
      <Header title="Edit District" />
      <DistrictForm initialData={formData} mode="edit" />
    </div>
  );
} 