'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/api-client';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

type District = {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  leader1?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  leader2?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  _count: {
    cell_groups: number;
    members: number;
  };
};

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch districts from API
        const response = await apiClient.getDistricts();

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch districts');
        }

        if (response.data) {
          setDistricts(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching districts:', error);
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
                    <p>{district.leader1 ? `${district.leader1.first_name} ${district.leader1.last_name}` : 'No primary leader assigned'}</p>
                    <p>{district.leader2 ? `${district.leader2.first_name} ${district.leader2.last_name}` : 'No assistant leader assigned'}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cell Groups</h3>
                    <p className="mt-1 text-2xl font-bold text-brand-500 dark:text-brand-400">{district._count.cell_groups}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Members</h3>
                    <p className="mt-1 text-2xl font-bold text-brand-500 dark:text-brand-400">{district._count.members}</p>
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
