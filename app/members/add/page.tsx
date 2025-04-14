'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MemberForm from '../../components/MemberForm';
import Header from '../../components/Header';
import { getSupabaseClient } from '../../lib/supabase';

export default function AddMemberPage() {
  const searchParams = useSearchParams();
  const visitorId = searchParams.get('from_visitor');
  const [visitorData, setVisitorData] = useState<any>(null);
  const [loading, setLoading] = useState(!!visitorId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have a visitor ID, fetch the visitor data
    if (visitorId) {
      const fetchVisitorData = async () => {
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from('attendance_visitors')
            .select('*')
            .eq('id', visitorId)
            .single();

          if (error) throw error;
          setVisitorData(data);
        } catch (error: any) {
          console.error('Error fetching visitor data:', error);
          setError(error.message || 'Failed to fetch visitor data');
        } finally {
          setLoading(false);
        }
      };

      fetchVisitorData();
    }
  }, [visitorId]);

  // Prepare initial data from visitor if available
  const initialData = visitorData ? {
    first_name: visitorData.first_name,
    last_name: visitorData.last_name,
    email: visitorData.email || '',
    phone: visitorData.phone || '',
    notes: visitorData.notes || '',
    visitor_id: visitorData.id, // Pass the visitor ID to track conversion
  } : {};

  const title = visitorId ? 'Convert Visitor to Member' : 'Add New Member';

  return (
    <div>
      <Header title={title} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="card">
          {visitorId && visitorData && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700">
                You are converting a visitor to a member. Some information has been pre-filled from the visitor record.
              </p>
            </div>
          )}
          <MemberForm mode="add" initialData={initialData} />
        </div>
      )}
    </div>
  );
}
