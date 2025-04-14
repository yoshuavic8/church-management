'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';

type Meeting = {
  id: string;
  cell_group_id: string;
  cell_group: {
    name: string;
  };
  meeting_date: string;
  meeting_type: string;
  topic: string;
  notes: string;
  location: string;
  created_at: string;
  offering: number | null;
};

type Participant = {
  id: string;
  member_id: string;
  status: string;
  member: {
    first_name: string;
    last_name: string;
  };
};

type Visitor = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  notes: string;
  converted_to_member_id: string | null;
};

export default function AttendanceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    visitors: 0,
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        // Fetch meeting details
        const { data: meetingData, error: meetingError } = await supabase
          .from('attendance_meetings')
          .select(`
            *,
            cell_group:cell_group_id (name)
          `)
          .eq('id', id)
          .single();

        if (meetingError) throw meetingError;
        setMeeting(meetingData);

        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('attendance_participants')
          .select(`
            *,
            member:member_id (
              first_name,
              last_name
            )
          `)
          .eq('meeting_id', id);

        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);

        // Fetch visitors
        const { data: visitorsData, error: visitorsError } = await supabase
          .from('attendance_visitors')
          .select('*')
          .eq('meeting_id', id);

        if (visitorsError) throw visitorsError;
        setVisitors(visitorsData || []);

        // Calculate stats
        if (participantsData) {
          const presentCount = participantsData.filter(p => p.status === 'present').length;
          const absentCount = participantsData.filter(p => p.status === 'absent').length;
          const lateCount = participantsData.filter(p => p.status === 'late').length;
          const excusedCount = participantsData.filter(p => p.status === 'excused').length;

          setStats({
            total: participantsData.length,
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            excused: excusedCount,
            visitors: visitorsData ? visitorsData.length : 0,
          });
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching attendance data:', error);
        setError(error.message || 'Failed to load attendance data');
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConvertToMember = async (visitorId: string) => {
    router.push(`/members/add?from_visitor=${visitorId}`);
  };

  if (loading) {
    return (
      <div>
        <Header title="Attendance Details" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Attendance Details" />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div>
        <Header title="Attendance Details" />
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Attendance record not found
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Attendance Details" />

      <div className="card mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{meeting.cell_group.name}</h2>
            <p className="text-gray-600">{formatDate(meeting.meeting_date)}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getMeetingTypeLabel(meeting.meeting_type)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {meeting.topic && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Topic/Theme</h3>
              <p className="mt-1">{meeting.topic}</p>
            </div>
          )}

          {meeting.location && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1">{meeting.location}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500">Recorded On</h3>
            <p className="mt-1">{new Date(meeting.created_at).toLocaleString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Offering</h3>
            <p className="mt-1">
              {meeting.offering !== null ? (
                <span className="font-medium text-green-600">
                  Rp {meeting.offering.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-gray-400">No offering recorded</span>
              )}
            </p>
          </div>

          {meeting.notes && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <p className="mt-1">{meeting.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="card bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="card bg-green-50 p-4 text-center">
          <p className="text-sm text-green-600">Present</p>
          <p className="text-2xl font-bold text-green-700">{stats.present}</p>
          <p className="text-xs text-green-600">
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
          </p>
        </div>

        <div className="card bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">Absent</p>
          <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
          <p className="text-xs text-red-600">
            {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%
          </p>
        </div>

        <div className="card bg-yellow-50 p-4 text-center">
          <p className="text-sm text-yellow-600">Late</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
          <p className="text-xs text-yellow-600">
            {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%
          </p>
        </div>

        <div className="card bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-600">Visitors</p>
          <p className="text-2xl font-bold text-blue-700">{stats.visitors}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Members Attendance</h2>

          {participants.length === 0 ? (
            <p className="text-gray-500">No members recorded for this meeting.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/members/${participant.member_id}`} className="text-primary hover:underline">
                          {participant.member.first_name} {participant.member.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(participant.status)}`}>
                          {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Visitors</h2>

          {visitors.length === 0 ? (
            <p className="text-gray-500">No visitors recorded for this meeting.</p>
          ) : (
            <div className="space-y-4">
              {visitors.map((visitor) => (
                <div key={visitor.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{visitor.first_name} {visitor.last_name}</h3>
                    {!visitor.converted_to_member_id && (
                      <button
                        onClick={() => handleConvertToMember(visitor.id)}
                        className="text-primary hover:underline text-sm"
                      >
                        Convert to Member
                      </button>
                    )}
                    {visitor.converted_to_member_id && (
                      <Link href={`/members/${visitor.converted_to_member_id}`} className="text-green-600 hover:underline text-sm">
                        View Member
                      </Link>
                    )}
                  </div>

                  {(visitor.phone || visitor.email) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {visitor.phone && <span className="mr-3">{visitor.phone}</span>}
                      {visitor.email && <span>{visitor.email}</span>}
                    </p>
                  )}

                  {visitor.notes && (
                    <p className="text-sm text-gray-500 mt-2">{visitor.notes}</p>
                  )}

                  {visitor.converted_to_member_id && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Converted to member
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Link href="/attendance" className="btn-secondary">
          Back to Attendance List
        </Link>
      </div>
    </div>
  );
}
