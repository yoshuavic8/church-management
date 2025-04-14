'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase';
import Header from '../components/Header';

type CellGroup = {
  id: string;
  name: string;
  meeting_day: string;
  meeting_time: string;
  location: string;
  district_id: string;
  district: {
    name: string;
  };
  status: string;
  leader_count?: number;
  member_count?: number;
};

// Wrapper component to handle search params
function CellGroupsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addMemberId = searchParams.get('add_member');

  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [memberToAdd, setMemberToAdd] = useState<{id: string, name: string} | null>(null);
  const [addingMember, setAddingMember] = useState(false);

  // Fetch member data if add_member parameter is present
  useEffect(() => {
    const fetchMemberData = async () => {
      if (addMemberId) {
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from('members')
            .select('id, first_name, last_name')
            .eq('id', addMemberId)
            .single();

          if (error) throw error;

          if (data) {
            setMemberToAdd({
              id: data.id,
              name: `${data.first_name} ${data.last_name}`
            });
          }
        } catch (error: any) {
          console.error('Error fetching member data:', error);
          setError(error.message || 'Failed to fetch member data');
        }
      }
    };

    fetchMemberData();
  }, [addMemberId]);

  useEffect(() => {
    const fetchCellGroups = async () => {
      try {
        const supabase = getSupabaseClient();

        // Fetch cell groups with district information
        const { data: cellGroupsData, error: cellGroupsError } = await supabase
          .from('cell_groups')
          .select(`
            id,
            name,
            meeting_day,
            meeting_time,
            location,
            district_id,
            status,
            district:district_id (name)
          `)
          .order('name', { ascending: true });

        if (cellGroupsError) throw cellGroupsError;

        if (cellGroupsData) {
          // Fetch leader counts for each cell group
          const cellGroupsWithCounts = await Promise.all(cellGroupsData.map(async (group) => {
            // Get leader count
            const { count: leaderCount, error: leaderError } = await supabase
              .from('cell_group_leaders')
              .select('*', { count: 'exact', head: true })
              .eq('cell_group_id', group.id);

            // Get member count
            const { count: memberCount, error: memberError } = await supabase
              .from('cell_group_members')
              .select('*', { count: 'exact', head: true })
              .eq('cell_group_id', group.id);

            if (leaderError) console.error('Error fetching leader count:', leaderError);
            if (memberError) console.error('Error fetching member count:', memberError);

            // Fix the district property if it's an array
            const processedDistrict = Array.isArray(group.district)
              ? group.district[0]
              : group.district;

            return {
              ...group,
              district: processedDistrict,
              leader_count: leaderCount || 0,
              member_count: memberCount || 0,
              district_name: processedDistrict?.name || 'Unknown District'
            };
          }));

          setCellGroups(cellGroupsWithCounts);
        } else {
          setCellGroups([]);
        }
      } catch (error: any) {
        console.error('Error fetching cell groups:', error);
        setError(error.message || 'Failed to fetch cell groups');
      } finally {
        setLoading(false);
      }
    };

    fetchCellGroups();
  }, []);

  const filteredCellGroups = cellGroups.filter(group => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.district_name?.toLowerCase().includes(searchLower) ||
      group.meeting_day?.toLowerCase().includes(searchLower)
    );
  });

  // Function to add a member to a cell group
  const handleAddMemberToCellGroup = async (cellGroupId: string) => {
    if (!memberToAdd) return;

    try {
      setAddingMember(true);
      const supabase = getSupabaseClient();

      // Check if member is already in this cell group
      const { data: existingMember, error: checkError } = await supabase
        .from('cell_group_members')
        .select('id')
        .eq('cell_group_id', cellGroupId)
        .eq('member_id', memberToAdd.id);

      if (checkError) throw checkError;

      if (existingMember && existingMember.length > 0) {
        setError(`${memberToAdd.name} is already a member of this cell group`);
        setAddingMember(false);
        return;
      }

      // Add member to cell group
      const { error: insertError } = await supabase
        .from('cell_group_members')
        .insert({
          cell_group_id: cellGroupId,
          member_id: memberToAdd.id
        });

      if (insertError) throw insertError;

      // Redirect to member detail page
      router.push(`/members/${memberToAdd.id}?success=added_to_cell_group`);
    } catch (error: any) {
      console.error('Error adding member to cell group:', error);
      setError(error.message || 'Failed to add member to cell group');
      setAddingMember(false);
    }
  };

  // Define the action button for the header
  const actionButton = (
    <Link href="/cell-groups/add" className="btn-primary">
      Add New Cell Group
    </Link>
  );

  return (
    <div>
      <Header
        title="Cell Groups"
        actions={actionButton}
      />

      {memberToAdd && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Select a cell group to add {memberToAdd.name} to:</p>
        </div>
      )}

      <div className="card mb-6">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search cell groups..."
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
          {filteredCellGroups.map((group) => (
            <div key={group.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{group.name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  group.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                </span>
              </div>

              {memberToAdd && group.status === 'active' && (
                <div className="mt-4">
                  <button
                    onClick={() => handleAddMemberToCellGroup(group.id)}
                    disabled={addingMember}
                    className="btn-primary w-full"
                  >
                    {addingMember ? 'Adding...' : `Add ${memberToAdd.name} to this group`}
                  </button>
                </div>
              )}

              <p className="text-gray-600 mt-2">District: {group.district_name}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{group.meeting_day}s at {group.meeting_time}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>{group.location}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>{group.leader_count} leaders, {group.member_count} members</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Link href={`/cell-groups/${group.id}`} className="text-primary hover:underline">
                  View Details
                </Link>
              </div>
            </div>
          ))}

          {filteredCellGroups.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No cell groups found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main component with Suspense boundary
export default function CellGroupsPage() {
  return (
    <Suspense fallback={<div className="p-4 flex justify-center items-center h-screen">Loading cell groups...</div>}>
      <CellGroupsContent />
    </Suspense>
  );
}
