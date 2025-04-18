'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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

            if (cellGroupError) {
              console.error('Error fetching cell group count:', cellGroupError);
            }

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

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Districts</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage church districts</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/districts/add">
            <Button variant="primary">
              Add New District
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Card>
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
          </div>
        </Card>
      ) : error ? (
        <div className="mb-4 rounded border border-error-200 bg-error-50 px-4 py-3 text-error-700 dark:border-error-700 dark:bg-error-900/50 dark:text-error-400">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {districts.map((district) => (
            <Card key={district.id} className="hover:shadow-theme-md transition-shadow">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{district.name}</h2>
                <Badge
                  variant={district.status === 'active' ? 'success' : 'danger'}
                  size="sm"
                  dot
                >
                  {district.status.charAt(0).toUpperCase() + district.status.slice(1)}
                </Badge>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">District Leaders</h3>
                  <div className="mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                    <p>{district.leader1_name || 'No primary leader assigned'}</p>
                    <p>{district.leader2_name || 'No assistant leader assigned'}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cell Groups</h3>
                    <p className="mt-1 text-2xl font-bold text-brand-500 dark:text-brand-400">{district.cell_group_count}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Members</h3>
                    <p className="mt-1 text-2xl font-bold text-brand-500 dark:text-brand-400">{district.member_count}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Link href={`/districts/${district.id}`} className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">
                  View Details
                </Link>
              </div>
            </Card>
          ))}

          {districts.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
              No districts found
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
