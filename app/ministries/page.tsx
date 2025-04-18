'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';
import Header from '../components/Header';
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

  // Define the action button for the header
  const actionButton = (
    <Link href="/ministries/add" className="btn-primary">
      Add New Ministry
    </Link>
  );

  return (
    <div>
      <Header
        title="Ministries"
        actions={actionButton}
        backTo="/dashboard"
        backLabel="Dashboard"
      />

      <div className="card mb-6">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search ministries..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

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
          {filteredMinistries.map((ministry) => (
            <div key={ministry.id} className="card hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{ministry.name}</h3>
                {ministry.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{ministry.description}</p>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      ministry.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ministry.status.charAt(0).toUpperCase() + ministry.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {ministry.member_count} members
                  </div>
                </div>
                
                {ministry.leader && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Leader:</span>
                    <span className="ml-2 font-medium">
                      {ministry.leader.first_name} {ministry.leader.last_name}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Link
                    href={`/ministries/${ministry.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                  <Link
                    href={`/ministries/edit/${ministry.id}`}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredMinistries.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No ministries found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main component with Suspense boundary
export default function MinistriesPage() {
  return (
    <Suspense fallback={<div className="p-4 flex justify-center items-center h-screen">Loading ministries...</div>}>
      <MinistriesContent />
    </Suspense>
  );
}
