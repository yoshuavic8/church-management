'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase';
import Header from '../components/Header';

type AttendanceRecord = {
  id: string;
  meeting_date: string;
  meeting_type: string;
  cell_group_id: string;
  cell_group: {
    name: string;
  };
  topic: string;
  notes: string;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  visitor_count: number;
  total_count: number;
  offering: number | null;
};

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get('member');

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [memberName, setMemberName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        const supabase = getSupabaseClient();

        // If memberId is provided, fetch member name
        if (memberId) {
          const { data: memberData, error: memberError } = await supabase
            .from('members')
            .select('first_name, last_name')
            .eq('id', memberId)
            .single();

          if (memberError) throw memberError;

          if (memberData) {
            setMemberName(`${memberData.first_name} ${memberData.last_name}`);
          }
        }

        // Fetch attendance meetings with cell group info
        let query = supabase
          .from('attendance_meetings')
          .select(`
            id,
            meeting_date,
            meeting_type,
            topic,
            notes,
            offering,
            cell_group_id,
            cell_group:cell_group_id (name)
          `)
          .order('meeting_date', { ascending: false });

        // If memberId is provided, filter meetings where this member participated
        if (memberId) {
          // First get all meetings where this member participated
          const { data: participationData, error: participationError } = await supabase
            .from('attendance_participants')
            .select('meeting_id')
            .eq('member_id', memberId);

          if (participationError) throw participationError;

          if (participationData && participationData.length > 0) {
            const meetingIds = participationData.map(p => p.meeting_id);
            query = query.in('id', meetingIds);
          } else {
            // If no participation records found, return empty array
            setRecords([]);
            setLoading(false);
            return;
          }
        }

        const { data: meetingsData, error: meetingsError } = await query;

        if (meetingsError) throw meetingsError;

        // For each meeting, get attendance stats
        const recordsWithStats = await Promise.all((meetingsData || []).map(async (meeting) => {
          // Get present count
          const { count: presentCount, error: presentError } = await supabase
            .from('attendance_participants')
            .select('*', { count: 'exact', head: true })
            .eq('meeting_id', meeting.id)
            .eq('status', 'present');

          if (presentError) throw presentError;

          // Get absent count
          const { count: absentCount, error: absentError } = await supabase
            .from('attendance_participants')
            .select('*', { count: 'exact', head: true })
            .eq('meeting_id', meeting.id)
            .eq('status', 'absent');

          if (absentError) throw absentError;

          // Get late count
          const { count: lateCount, error: lateError } = await supabase
            .from('attendance_participants')
            .select('*', { count: 'exact', head: true })
            .eq('meeting_id', meeting.id)
            .eq('status', 'late');

          if (lateError) throw lateError;

          // Get excused count
          const { count: excusedCount, error: excusedError } = await supabase
            .from('attendance_participants')
            .select('*', { count: 'exact', head: true })
            .eq('meeting_id', meeting.id)
            .eq('status', 'excused');

          if (excusedError) throw excusedError;

          // Get visitor count
          const { count: visitorCount, error: visitorError } = await supabase
            .from('attendance_visitors')
            .select('*', { count: 'exact', head: true })
            .eq('meeting_id', meeting.id);

          if (visitorError) throw visitorError;

          // Calculate total count (all participants)
          const totalCount = (presentCount || 0) + (absentCount || 0) + (lateCount || 0) + (excusedCount || 0);

          // Extract cell group name from the array if it exists
          const cellGroupData = Array.isArray(meeting.cell_group) && meeting.cell_group.length > 0
            ? { name: meeting.cell_group[0]?.name || 'Unknown' }
            : { name: 'Unknown' };

          return {
            id: meeting.id,
            meeting_date: meeting.meeting_date,
            meeting_type: meeting.meeting_type,
            topic: meeting.topic,
            notes: meeting.notes,
            offering: meeting.offering,
            cell_group_id: meeting.cell_group_id,
            cell_group: cellGroupData,
            present_count: presentCount || 0,
            absent_count: absentCount || 0,
            late_count: lateCount || 0,
            excused_count: excusedCount || 0,
            visitor_count: visitorCount || 0,
            total_count: totalCount,
          };
        }));

        setRecords(recordsWithStats);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [memberId]);

  const filteredRecords = records.filter(record => {
    if (filter === 'all') return true;
    if (filter === record.meeting_type) return true;
    return false;
  });

  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case 'regular':
        return 'Regular Meeting';
      case 'special':
        return 'Special Meeting';
      case 'outreach':
        return 'Outreach';
      case 'prayer':
        return 'Prayer Meeting';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Define the action button for the header
  const actionButton = (
    <Link href="/attendance/record" className="btn-primary">
      Record Attendance
    </Link>
  );

  return (
    <div>
      <Header
        title={memberId ? `Attendance History for ${memberName}` : "Attendance"}
        actions={!memberId ? actionButton : undefined}
      />

      {memberId && (
        <div className="mb-4">
          <Link href={`/members/${memberId}`} className="text-primary hover:underline">
            &larr; Back to Member Profile
          </Link>
        </div>
      )}

      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('regular')}
            className={`px-3 py-1 rounded-md ${
              filter === 'regular'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Regular Meeting
          </button>
          <button
            onClick={() => setFilter('special')}
            className={`px-3 py-1 rounded-md ${
              filter === 'special'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Special Meeting
          </button>
          <button
            onClick={() => setFilter('outreach')}
            className={`px-3 py-1 rounded-md ${
              filter === 'outreach'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Outreach
          </button>
          <button
            onClick={() => setFilter('prayer')}
            className={`px-3 py-1 rounded-md ${
              filter === 'prayer'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Prayer Meeting
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Cell Group</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Topic</th>
                <th className="py-3 px-4 text-right">Present</th>
                <th className="py-3 px-4 text-right">Absent</th>
                <th className="py-3 px-4 text-right">Late</th>
                <th className="py-3 px-4 text-right">Visitors</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Offering</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {new Date(record.meeting_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{record.cell_group.name}</td>
                  <td className="py-3 px-4">{getMeetingTypeLabel(record.meeting_type)}</td>
                  <td className="py-3 px-4">{record.topic || '-'}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">{record.present_count}</td>
                  <td className="py-3 px-4 text-right text-red-600">{record.absent_count}</td>
                  <td className="py-3 px-4 text-right text-yellow-600">{record.late_count}</td>
                  <td className="py-3 px-4 text-right text-blue-600">{record.visitor_count}</td>
                  <td className="py-3 px-4 text-right font-medium">{record.total_count}</td>
                  <td className="py-3 px-4 text-right">
                    {record.offering !== null ? (
                      <span className="font-medium text-green-600">
                        Rp {record.offering.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/attendance/${record.id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-4 px-4 text-center text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredRecords.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="card bg-primary/10">
            <h3 className="text-lg font-semibold text-primary mb-2">Average Attendance</h3>
            <p className="text-3xl font-bold">
              {Math.round(filteredRecords.reduce((sum, record) => sum + record.present_count, 0) / filteredRecords.length)}
            </p>
          </div>

          <div className="card bg-green-100">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Attendance Rate</h3>
            <p className="text-3xl font-bold text-green-700">
              {Math.round(filteredRecords.reduce((sum, record) => sum + record.present_count, 0) / filteredRecords.reduce((sum, record) => sum + record.total_count, 0) * 100)}%
            </p>
            <p className="text-sm text-gray-600">Present members</p>
          </div>

          <div className="card bg-blue-100">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Total Visitors</h3>
            <p className="text-3xl font-bold text-blue-700">
              {filteredRecords.reduce((sum, record) => sum + record.visitor_count, 0)}
            </p>
          </div>

          <div className="card bg-yellow-100">
            <h3 className="text-lg font-semibold text-yellow-700 mb-2">Total Offering</h3>
            <p className="text-3xl font-bold text-yellow-700">
              Rp {filteredRecords.reduce((sum, record) => sum + (record.offering || 0), 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="card bg-gray-100">
            <h3 className="text-lg font-semibold mb-2">Total Meetings</h3>
            <p className="text-3xl font-bold">{filteredRecords.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
