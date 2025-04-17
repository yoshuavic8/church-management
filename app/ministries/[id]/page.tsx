'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';
import { Ministry, MinistryMember } from '../../types/ministry';

function MinistryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [members, setMembers] = useState<MinistryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMinistryData = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        // Fetch ministry details
        const { data: ministryData, error: ministryError } = await supabase
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

        if (ministryError) throw ministryError;

        // Process ministry data
        const processedMinistry = {
          ...ministryData,
          leader: Array.isArray(ministryData.leader) ? ministryData.leader[0] : ministryData.leader
        };

        setMinistry(processedMinistry);

        // Fetch ministry members
        const { data: membersData, error: membersError } = await supabase
          .from('ministry_members')
          .select(`
            *,
            member:member_id (
              id,
              first_name,
              last_name,
              email,
              phone,
              status
            )
          `)
          .eq('ministry_id', id)
          .order('joined_date', { ascending: false });

        if (membersError) throw membersError;

        // Process members data
        const processedMembers = (membersData || []).map(item => ({
          ...item,
          member: Array.isArray(item.member) ? item.member[0] : item.member
        }));

        setMembers(processedMembers);
      } catch (error: any) {
        console.error('Error fetching ministry data:', error);
        setError(error.message || 'Failed to fetch ministry data');
      } finally {
        setLoading(false);
      }
    };

    fetchMinistryData();
  }, [id]);

  // Define action buttons for the header
  const actionButtons = ministry && (
    <div className="flex space-x-2">
      <Link href={`/ministries/edit/${id}`} className="btn-secondary">
        Edit Ministry
      </Link>
      <Link href={`/ministries/${id}/members`} className="btn-primary">
        Manage Members
      </Link>
    </div>
  );

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
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Ministry not found</p>
        <Link href="/ministries" className="btn-primary">
          Back to Ministries
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Ministry Details"
        actions={actionButtons}
        backTo="/ministries"
        backLabel="Ministries"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">{ministry.name}</h2>
            
            {ministry.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700">{ministry.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  ministry.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {ministry.status.charAt(0).toUpperCase() + ministry.status.slice(1)}
                </span>
              </div>
              
              {ministry.leader && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Leader</h3>
                  <Link 
                    href={`/members/${ministry.leader.id}`}
                    className="text-primary hover:underline"
                  >
                    {ministry.leader.first_name} {ministry.leader.last_name}
                  </Link>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Created: {new Date(ministry.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Last Updated: {new Date(ministry.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card p-6">
            <h3 className="text-lg font-medium mb-4">Ministry Members</h3>
            <p className="text-gray-700 mb-4">
              Total Members: <span className="font-bold">{members.length}</span>
            </p>
            
            <Link 
              href={`/ministries/${id}/members`}
              className="btn-primary w-full text-center"
            >
              Manage Members
            </Link>
          </div>
          
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link 
                href={`/attendance/record?ministry=${id}`}
                className="btn-secondary w-full text-center block"
              >
                Record Attendance
              </Link>
              <Link 
                href={`/attendance?ministry=${id}`}
                className="btn-secondary w-full text-center block"
              >
                View Attendance History
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Members</h3>
          <Link href={`/ministries/${id}/members`} className="text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {members.length === 0 ? (
          <p className="text-gray-500">No members in this ministry yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.slice(0, 5).map((memberItem) => (
                  <tr key={memberItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {memberItem.member && (
                        <Link 
                          href={`/members/${memberItem.member.id}`}
                          className="text-primary hover:underline"
                        >
                          {memberItem.member.first_name} {memberItem.member.last_name}
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {memberItem.role || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(memberItem.joined_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        memberItem.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {memberItem.status.charAt(0).toUpperCase() + memberItem.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function MinistryDetailPage() {
  return (
    <Suspense fallback={<div className="p-4 flex justify-center items-center h-screen">Loading ministry details...</div>}>
      <MinistryDetailContent />
    </Suspense>
  );
}
