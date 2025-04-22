'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CellGroupForm from '../../../components/CellGroupForm';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';

export default function EditCellGroupPage() {
  const { id } = useParams();
  const [cellGroup, setCellGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCellGroup = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('cell_groups')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCellGroup(data);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch cell group data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCellGroup();
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Edit Cell Group"
        backTo={`/cell-groups/${id}`}
        backLabel="Cell Group Details"
      />
      <div className="card">
        {cellGroup && <CellGroupForm initialData={cellGroup} mode="edit" />}
      </div>
    </div>
  );
}
