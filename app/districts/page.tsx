'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';
import Header from '../components/Header';

type District = {
  id: string;
  name: string;
  leader1_id: string;
  leader2_id: string;
  status: string;
  leader1_name?: string;
  leader2_name?: string;
  cell_group_count?: number;
  member_count?: number;
};

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const supabase = getSupabaseClient();

        // Fetch districts
        const { data: districtsData, error: districtsError } = await supabase
          .from('districts')
          .select('*')
          .order('name', { ascending: true });

        if (districtsError) throw districtsError;

        if (districtsData) {
          // Process each district to get leader names and counts
          const processedDistricts = await Promise.all(districtsData.map(async (district) => {
            let leader1Name = '';
            let leader2Name = '';

            // Get leader1 name if leader1_id exists
            if (district.leader1_id) {
              const { data: leader1Data } = await supabase
                .from('members')
                .select('first_name, last_name')
                .eq('id', district.leader1_id)
                .single();

              if (leader1Data) {
                leader1Name = `${leader1Data.first_name} ${leader1Data.last_name}`;
              }
            }

            // Get leader2 name if leader2_id exists
            if (district.leader2_id) {
              const { data: leader2Data } = await supabase
                .from('members')
                .select('first_name, last_name')
                .eq('id', district.leader2_id)
                .single();

              if (leader2Data) {
                leader2Name = `${leader2Data.first_name} ${leader2Data.last_name}`;
              }
            }

            // Get cell group count
            const { count: cellGroupCount, error: cellGroupError } = await supabase
              .from('cell_groups')
              .select('*', { count: 'exact', head: true })
              .eq('district_id', district.id);

            if (cellGroupError) 

            // Get member count (sum of all members in cell groups of this district)
            let memberCount = 0;

            // First get all cell groups in this district
            const { data: cellGroups } = await supabase
              .from('cell_groups')
              .select('id')
              .eq('district_id', district.id);

            if (cellGroups && cellGroups.length > 0) {
              // For each cell group, count members
              const memberCounts = await Promise.all(cellGroups.map(async (group) => {
                const { count, error } = await supabase
                  .from('cell_group_members')
                  .select('*', { count: 'exact', head: true })
                  .eq('cell_group_id', group.id);

                return count || 0;
              }));

              // Sum up all member counts
              memberCount = memberCounts.reduce((sum, count) => sum + count, 0);
            }

            return {
              ...district,
              leader1_name: leader1Name,
              leader2_name: leader2Name,
              cell_group_count: cellGroupCount || 0,
              member_count: memberCount
            };
          }));

          setDistricts(processedDistricts);
        } else {
          setDistricts([]);
        }
      } catch (error: any) {
        
        setError(error.message || 'Failed to fetch districts');
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  // Define the action button for the header
  const actionButton = (
    <Link href="/districts/add" className="btn-primary">
      Add New District
    </Link>
  );

  return (
    <div>
      <Header
        title="Districts"
        actions={actionButton}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {districts.map((district) => (
            <div key={district.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{district.name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  district.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {district.status.charAt(0).toUpperCase() + district.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">District Leaders</h3>
                  <div className="mt-1 space-y-1">
                    <p>{district.leader1_name}</p>
                    <p>{district.leader2_name}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cell Groups</h3>
                    <p className="mt-1 text-2xl font-bold text-primary">{district.cell_group_count}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Members</h3>
                    <p className="mt-1 text-2xl font-bold text-primary">{district.member_count}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Link href={`/districts/${district.id}`} className="text-primary hover:underline">
                  View Details
                </Link>
              </div>
            </div>
          ))}

          {districts.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No districts found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
