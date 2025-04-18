'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';

type District = {
  id: string;
  name: string;
  leader1_id: string;
  leader2_id: string;
  status: string;
};

type Leader = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type CellGroup = {
  id: string;
  name: string;
  meeting_day: string;
  meeting_time: string;
  location: string;
  status: string;
  member_count: number;
};

export default function DistrictDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [district, setDistrict] = useState<District | null>(null);
  const [leader1, setLeader1] = useState<Leader | null>(null);
  const [leader2, setLeader2] = useState<Leader | null>(null);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistrict = async () => {
      try {
        const supabase = getSupabaseClient();

        // Fetch district
        const { data: districtData, error: districtError } = await supabase
          .from('districts')
          .select('*')
          .eq('id', id)
          .single();

        if (districtError) throw districtError;

        setDistrict(districtData);

        // Fetch leader 1 if exists
        if (districtData.leader1_id) {
          const { data: leader1Data, error: leader1Error } = await supabase
            .from('members')
            .select('id, first_name, last_name, email, phone')
            .eq('id', districtData.leader1_id)
            .single();

          if (leader1Error) {
            
          } else {
            setLeader1(leader1Data);
          }
        }

        // Fetch leader 2 if exists
        if (districtData.leader2_id) {
          const { data: leader2Data, error: leader2Error } = await supabase
            .from('members')
            .select('id, first_name, last_name, email, phone')
            .eq('id', districtData.leader2_id)
            .single();

          if (leader2Error) {
            
          } else {
            setLeader2(leader2Data);
          }
        }

        // Fetch cell groups in this district
        const { data: cellGroupsData, error: cellGroupsError } = await supabase
          .from('cell_groups')
          .select('id, name, meeting_day, meeting_time, location, status')
          .eq('district_id', id)
          .order('name', { ascending: true });

        if (cellGroupsError) throw cellGroupsError;

        // For each cell group, get the member count
        const cellGroupsWithCounts = await Promise.all((cellGroupsData || []).map(async (group) => {
          const { count, error } = await supabase
            .from('cell_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('cell_group_id', group.id);

          return {
            ...group,
            member_count: count || 0
          };
        }));

        setCellGroups(cellGroupsWithCounts);
      } catch (error: any) {
        
        setError(error.message || 'Failed to fetch district data');
      } finally {
        setLoading(false);
      }
    };

    fetchDistrict();
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

  if (!district) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        District not found
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
    <Link href={`/districts/edit/${district.id}`} className="btn-secondary">
      Edit
    </Link>
  );

  return (
    <div>
      <Header
        title="District Details"
        actions={actionButtons}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{district.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    district.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {district.status.charAt(0).toUpperCase() + district.status.slice(1)}
                  </span>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Cell Groups</h3>
                <p className="mt-1">{cellGroups.length}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
                <p className="mt-1">{cellGroups.reduce((sum, group) => sum + group.member_count, 0)}</p>
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">District Leaders</h2>
            </div>

            {!leader1 && !leader2 ? (
              <p className="text-gray-500">No leaders assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {leader1 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        <Link href={`/members/${leader1.id}`} className="text-primary hover:underline">
                          {leader1.first_name} {leader1.last_name}
                        </Link>
                      </h3>
                      <span className="text-sm text-gray-500">Leader 1</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{leader1.email}</p>
                    <p className="text-sm text-gray-600">{leader1.phone}</p>
                  </div>
                )}

                {leader2 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        <Link href={`/members/${leader2.id}`} className="text-primary hover:underline">
                          {leader2.first_name} {leader2.last_name}
                        </Link>
                      </h3>
                      <span className="text-sm text-gray-500">Leader 2</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{leader2.email}</p>
                    <p className="text-sm text-gray-600">{leader2.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cell Groups ({cellGroups.length})</h2>
              <Link href={`/cell-groups/add?district=${district.id}`} className="text-primary hover:underline text-sm">
                Add Cell Group
              </Link>
            </div>

            {cellGroups.length === 0 ? (
              <p className="text-gray-500">No cell groups in this district yet.</p>
            ) : (
              <div className="space-y-4">
                {cellGroups.map(group => (
                  <div key={group.id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
                    <Link href={`/cell-groups/${group.id}`} className="font-medium text-primary hover:underline">
                      {group.name}
                    </Link>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Members: {group.member_count}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          group.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                        </span>
                      </div>
                      {group.meeting_day && (
                        <p className="mt-1">
                          {group.meeting_day}s at {formatTime(group.meeting_time)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <Link href={`/cell-groups/add?district=${district.id}`} className="text-primary hover:underline block">
                Add Cell Group
              </Link>
              <Link href={`/districts/edit/${district.id}`} className="text-primary hover:underline block">
                Edit District
              </Link>
              <Link href={`/reports/district/${district.id}`} className="text-primary hover:underline block">
                Generate Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
