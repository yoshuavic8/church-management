'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';
import MinistryForm from '../../components/MinistryForm';
import { Ministry } from '../../../types/ministry';

function EditMinistryContent() {
  const params = useParams();
  const id = params.id as string;
  
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMinistry = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
          .from('ministries')
          .select(`
            *,
            leader:leader_id (
              id,
              first_name,
              last_name
            )
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Process ministry data
        const processedMinistry = {
          ...data,
          leader: Array.isArray(data.leader) ? data.leader[0] : data.leader
        };
        
        setMinistry(processedMinistry);
      } catch (error: any) {
        
        setError(error.message || 'Failed to fetch ministry');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMinistry();
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

  if (!ministry) {
    return (
      <div className="text-center py-12 text-gray-500">
        Ministry not found
      </div>
    );
  }

  return (
    <div>
      <Header 
        title={`Edit Ministry: ${ministry.name}`}
        backTo={`/ministries/${id}`}
        backLabel="Ministry Details"
      />
      
      <MinistryForm ministry={ministry} isEdit={true} />
    </div>
  );
}

export default function EditMinistryPage() {
  return (
    <Suspense fallback={<div className="p-4 flex justify-center items-center h-screen">Loading...</div>}>
      <EditMinistryContent />
    </Suspense>
  );
}
