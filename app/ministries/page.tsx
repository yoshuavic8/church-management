'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Ministry } from '../types/ministry';

function MinistriesContent() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMinistries = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        // Fetch ministries with leader info and member count
        const { data, error } = await supabase
          .from('ministries')
          .select(`
            *,
            leader:leader_id (
              id,
              first_name,
              last_name
            ),
            member_count:ministry_members(count)
          `)
          .order('name', { ascending: true });

        if (error) throw error;

        // Process the data to handle nested objects and counts
        const processedData = (data || []).map(ministry => ({
          ...ministry,
          leader: Array.isArray(ministry.leader) ? ministry.leader[0] : ministry.leader,
          member_count: ministry.member_count ? ministry.member_count.length : 0
        }));

        setMinistries(processedData);
      } catch (error: any) {

        setError(error.message || 'Failed to fetch ministries');
      } finally {
        setLoading(false);
      }
    };

    fetchMinistries();
  }, []);

  const filteredMinistries = ministries.filter(ministry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ministry.name.toLowerCase().includes(searchLower) ||
      (ministry.description && ministry.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Ministries</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage church ministries</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/ministries/add">
            <Button variant="primary">
              Add New Ministry
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Search ministries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
      </Card>

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
          {filteredMinistries.map((ministry) => (
            <Card key={ministry.id} className="hover:shadow-theme-md transition-shadow">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">{ministry.name}</h3>
                {ministry.description && (
                  <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">{ministry.description}</p>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <Badge
                    variant={ministry.status === 'active' ? 'success' : 'danger'}
                    size="sm"
                    dot
                  >
                    {ministry.status.charAt(0).toUpperCase() + ministry.status.slice(1)}
                  </Badge>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {ministry.member_count} members
                  </div>
                </div>

                {ministry.leader && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Leader:</span>
                    <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                      {ministry.leader.first_name} {ministry.leader.last_name}
                    </span>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Link
                    href={`/ministries/${ministry.id}`}
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    View
                  </Link>
                  <Link
                    href={`/ministries/edit/${ministry.id}`}
                    className="text-warning-500 hover:text-warning-600 dark:text-warning-400 dark:hover:text-warning-300"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </Card>
          ))}

          {filteredMinistries.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
              No ministries found
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

// Main component with Suspense boundary
export default function MinistriesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center p-4 text-gray-600 dark:text-gray-400">Loading ministries...</div>}>
      <MinistriesContent />
    </Suspense>
  );
}
