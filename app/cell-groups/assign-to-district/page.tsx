'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../../../app/lib/supabase';
import Header from '../../components/Header';

type CellGroup = {
  id: string;
  name: string;
  description: string | null;
  district_id: string | null;
  leader_id: string | null;
  assistant_leader_id: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
  meeting_location: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function AssignCellGroupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const districtId = searchParams.get('district_id');
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCellGroups = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('cell_groups')
          .select('*')
          .is('district_id', null);

        if (error) throw error;
        setCellGroups(data as CellGroup[]);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCellGroups();
  }, []);

  const handleAssignCellGroup = async (cellGroupId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('cell_groups')
        .update({ district_id: districtId })
        .eq('id', cellGroupId);

      if (error) throw error;
      router.push(`/districts/${districtId}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
    }
  };

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

  return (
    <div>
      <Header title="Assign Cell Group to District" />
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Select a Cell Group to Assign</h2>
        {cellGroups.length === 0 ? (
          <p className="text-gray-500">No cell groups available to assign.</p>
        ) : (
          <div className="space-y-4">
            {cellGroups.map((group) => (
              <div key={group.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{group.name}</p>
                  <p className="text-sm text-gray-600">{group.meeting_day} at {group.meeting_time}</p>
                </div>
                <button
                  onClick={() => handleAssignCellGroup(group.id)}
                  className="btn-primary"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssignCellGroupToDistrictPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <AssignCellGroupContent />
    </Suspense>
  );
} 