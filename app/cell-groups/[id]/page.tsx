'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';

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
};

type Leader = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
};

export default function CellGroupDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cellGroup, setCellGroup] = useState<CellGroup | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCellGroup = async () => {
      try {
        const supabase = getSupabaseClient();

        // Fetch cell group with district information
        const { data: cellGroupData, error: cellGroupError } = await supabase
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
          .eq('id', id)
          .single();

        if (cellGroupError) throw cellGroupError;

        // Fix the district property if it's an array
        const processedCellGroup = {
          ...cellGroupData,
          district: Array.isArray(cellGroupData.district)
            ? cellGroupData.district[0]
            : cellGroupData.district
        };

        setCellGroup(processedCellGroup);

        // Fetch leaders
        const { data: leadersData, error: leadersError } = await supabase
          .from('cell_group_leaders')
          .select(`
            member_id,
            members:member_id (
              id,
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .eq('cell_group_id', id);

        if (leadersError) throw leadersError;

        // Extract and process member data from the nested structure
        const processedLeaders = (leadersData || []).map(item => {
          // Handle if item.members is an array or an object
          const memberData = Array.isArray(item.members) ? item.members[0] : item.members;
          return {
            id: memberData.id,
            first_name: memberData.first_name,
            last_name: memberData.last_name,
            email: memberData.email,
            phone: memberData.phone
          } as Leader;
        });

        setLeaders(processedLeaders);

        // Fetch members (excluding leaders)
        const { data: membersData, error: membersError } = await supabase
          .from('cell_group_members')
          .select(`
            member_id,
            members:member_id (
              id,
              first_name,
              last_name
            )
          `)
          .eq('cell_group_id', id);

        if (membersError) throw membersError;

        // Extract and process member data from the nested structure
        const processedMembers = (membersData || []).map(item => {
          // Handle if item.members is an array or an object
          const memberData = Array.isArray(item.members) ? item.members[0] : item.members;
          return {
            id: memberData.id,
            first_name: memberData.first_name,
            last_name: memberData.last_name
          } as Member;
        });

        // Filter out leaders from the members list
        const leaderIds = new Set(processedLeaders.map(leader => leader.id));
        const filteredMembers = processedMembers.filter(member => !leaderIds.has(member.id));

        setMembers(filteredMembers);
      } catch (error: any) {
        console.error('Error fetching cell group:', error);
        setError(error.message || 'Failed to fetch cell group data');
      } finally {
        setLoading(false);
      }
    };

    fetchCellGroup();
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

  if (!cellGroup) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        Cell group not found
      </div>
    );
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not set';
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10));
      time.setMinutes(parseInt(minutes, 10));
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  // Define the action buttons for the header
  const actionButtons = (
    <Link href={`/cell-groups/edit/${cellGroup.id}`} className="btn-secondary">
      Edit
    </Link>
  );

  return (
    <div>
      <Header
        title="Cell Group Details"
        actions={actionButtons}
        backTo="/cell-groups"
        backLabel="Cell Groups List"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{cellGroup.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">District</h3>
                <p className="mt-1">
                  <Link href={`/districts/${cellGroup.district_id}`} className="text-primary hover:underline">
                    {cellGroup.district?.name || 'Unknown District'}
                  </Link>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    cellGroup.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cellGroup.status.charAt(0).toUpperCase() + cellGroup.status.slice(1)}
                  </span>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Meeting Day</h3>
                <p className="mt-1">{cellGroup.meeting_day || 'Not set'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Meeting Time</h3>
                <p className="mt-1">{formatTime(cellGroup.meeting_time)}</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1">{cellGroup.location || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Leaders</h2>
            </div>

            {leaders.length === 0 ? (
              <p className="text-gray-500">No leaders assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {leaders.map(leader => (
                  <div key={leader.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        <Link href={`/members/${leader.id}`} className="text-primary hover:underline">
                          {leader.first_name} {leader.last_name}
                        </Link>
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{leader.email}</p>
                    <p className="text-sm text-gray-600">{leader.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Members ({members.length})</h2>
              <Link href={`/cell-groups/${cellGroup.id}/members`} className="text-primary hover:underline text-sm">
                Manage Members
              </Link>
            </div>

            {members.length === 0 ? (
              <p className="text-gray-500">No members in this cell group yet.</p>
            ) : (
              <div className="space-y-2">
                {members.map(member => (
                  <div key={member.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <Link href={`/members/${member.id}`} className="text-primary hover:underline">
                      {member.first_name} {member.last_name}
                    </Link>
                  </div>
                ))}

                {members.length > 10 && (
                  <Link href={`/cell-groups/${cellGroup.id}/members`} className="text-primary hover:underline block text-center mt-4">
                    View All Members
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <Link href={`/cell-groups/${cellGroup.id}/members`} className="text-primary hover:underline block">
                Manage Members
              </Link>
              <Link href={`/cell-groups/edit/${cellGroup.id}`} className="text-primary hover:underline block">
                Edit Cell Group
              </Link>
              <Link href={`/attendance/record?cell_group=${cellGroup.id}`} className="text-primary hover:underline block">
                Record Attendance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
