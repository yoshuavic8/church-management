'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import { getUserRoleContext, ContextType } from '../../lib/role-utils';
import Header from '../../components/Header';

type CellGroup = {
  id: string;
  name: string;
  meeting_day: string;
  meeting_time: string;
  location: string;
  member_count: number;
  last_meeting_date: string | null;
};

type MeetingSummary = {
  id: string;
  meeting_date: string;
  cell_group_id: string;
  cell_group_name: string;
  attendee_count: number;
  visitor_count: number;
};

export default function CellGroupLeaderDashboard() {
  const [loading, setLoading] = useState(true);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<MeetingSummary[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingSummary[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCellGroups: 0,
    totalMeetings: 0,
    totalAttendees: 0,
    averageAttendance: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      // Get user's role context to determine which cell groups they lead
      const roleContext = await getUserRoleContext();
      
      if (!roleContext || !roleContext[ContextType.CellGroup]) {
        throw new Error('You do not have any cell groups assigned');
      }
      
      const cellGroupIds = roleContext[ContextType.CellGroup];
      
      // Fetch cell groups
      const { data: cellGroupsData, error: cellGroupsError } = await supabase
        .from('cell_groups')
        .select('id, name, meeting_day, meeting_time, location')
        .in('id', cellGroupIds)
        .order('name', { ascending: true });
        
      if (cellGroupsError) throw cellGroupsError;
      
      // Fetch member count for each cell group
      const cellGroupsWithCounts = await Promise.all((cellGroupsData || []).map(async (cellGroup) => {
        // Get member count
        const { count: memberCount, error: memberCountError } = await supabase
          .from('cell_group_members')
          .select('*', { count: 'exact', head: true })
          .eq('cell_group_id', cellGroup.id);
          
        if (memberCountError) throw memberCountError;
        
        // Get last meeting date
        const { data: lastMeeting, error: lastMeetingError } = await supabase
          .from('attendance_meetings')
          .select('meeting_date')
          .eq('cell_group_id', cellGroup.id)
          .order('meeting_date', { ascending: false })
          .limit(1);
          
        if (lastMeetingError) throw lastMeetingError;
        
        return {
          ...cellGroup,
          member_count: memberCount || 0,
          last_meeting_date: lastMeeting && lastMeeting.length > 0 ? lastMeeting[0].meeting_date : null
        };
      }));
      
      setCellGroups(cellGroupsWithCounts);
      
      // Fetch recent meetings
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      
      const { data: recentMeetingsData, error: recentMeetingsError } = await supabase
        .from('attendance_meetings')
        .select(`
          id,
          meeting_date,
          cell_group_id,
          cell_groups (name)
        `)
        .in('cell_group_id', cellGroupIds)
        .gte('meeting_date', oneMonthAgo.toISOString())
        .lte('meeting_date', today.toISOString())
        .order('meeting_date', { ascending: false })
        .limit(5);
        
      if (recentMeetingsError) throw recentMeetingsError;
      
      // Fetch attendee and visitor counts for each meeting
      const recentMeetingsWithCounts = await Promise.all((recentMeetingsData || []).map(async (meeting) => {
        // Get attendee count
        const { count: attendeeCount, error: attendeeCountError } = await supabase
          .from('attendance_participants')
          .select('*', { count: 'exact', head: true })
          .eq('meeting_id', meeting.id);
          
        if (attendeeCountError) throw attendeeCountError;
        
        // Get visitor count
        const { count: visitorCount, error: visitorCountError } = await supabase
          .from('attendance_visitors')
          .select('*', { count: 'exact', head: true })
          .eq('meeting_id', meeting.id);
          
        if (visitorCountError) throw visitorCountError;
        
        return {
          id: meeting.id,
          meeting_date: meeting.meeting_date,
          cell_group_id: meeting.cell_group_id,
          cell_group_name: meeting.cell_groups?.name || 'Unknown',
          attendee_count: attendeeCount || 0,
          visitor_count: visitorCount || 0
        };
      }));
      
      setRecentMeetings(recentMeetingsWithCounts);
      
      // Fetch upcoming meetings
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      
      const { data: upcomingMeetingsData, error: upcomingMeetingsError } = await supabase
        .from('attendance_meetings')
        .select(`
          id,
          meeting_date,
          cell_group_id,
          cell_groups (name)
        `)
        .in('cell_group_id', cellGroupIds)
        .gt('meeting_date', today.toISOString())
        .lte('meeting_date', nextMonth.toISOString())
        .order('meeting_date', { ascending: true })
        .limit(5);
        
      if (upcomingMeetingsError) throw upcomingMeetingsError;
      
      setUpcomingMeetings(upcomingMeetingsData.map(meeting => ({
        id: meeting.id,
        meeting_date: meeting.meeting_date,
        cell_group_id: meeting.cell_group_id,
        cell_group_name: meeting.cell_groups?.name || 'Unknown',
        attendee_count: 0,
        visitor_count: 0
      })));
      
      // Calculate statistics
      const totalMembers = cellGroupsWithCounts.reduce((sum, cg) => sum + cg.member_count, 0);
      const totalCellGroups = cellGroupsWithCounts.length;
      
      // Get total meetings in the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      
      const { count: totalMeetings, error: totalMeetingsError } = await supabase
        .from('attendance_meetings')
        .select('*', { count: 'exact', head: true })
        .in('cell_group_id', cellGroupIds)
        .gte('meeting_date', threeMonthsAgo.toISOString());
        
      if (totalMeetingsError) throw totalMeetingsError;
      
      // Get total attendees in the last 3 months
      const { data: meetingIds, error: meetingIdsError } = await supabase
        .from('attendance_meetings')
        .select('id')
        .in('cell_group_id', cellGroupIds)
        .gte('meeting_date', threeMonthsAgo.toISOString());
        
      if (meetingIdsError) throw meetingIdsError;
      
      let totalAttendees = 0;
      let averageAttendance = 0;
      
      if (meetingIds && meetingIds.length > 0) {
        const meetingIdValues = meetingIds.map(m => m.id);
        
        const { count: attendeeCount, error: attendeeCountError } = await supabase
          .from('attendance_participants')
          .select('*', { count: 'exact', head: true })
          .in('meeting_id', meetingIdValues);
          
        if (attendeeCountError) throw attendeeCountError;
        
        totalAttendees = attendeeCount || 0;
        averageAttendance = totalMeetings ? Math.round((totalAttendees / totalMeetings) * 10) / 10 : 0;
      }
      
      setStats({
        totalMembers,
        totalCellGroups,
        totalMeetings: totalMeetings || 0,
        totalAttendees,
        averageAttendance
      });
    } catch (error: any) {
      
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <Header
        title="Cell Group Leader Dashboard"
        backTo="/"
        backLabel="Home"
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm font-medium text-gray-500">Total Cell Groups</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalCellGroups}</div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm font-medium text-gray-500">Total Members</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalMembers}</div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm font-medium text-gray-500">Meetings (3 months)</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalMeetings}</div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm font-medium text-gray-500">Total Attendees</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalAttendees}</div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm font-medium text-gray-500">Avg. Attendance</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.averageAttendance}</div>
            </div>
          </div>
          
          {/* Cell Groups */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">My Cell Groups</h2>
              <Link href="/cell-groups/manage" className="text-primary hover:underline">
                Manage Cell Groups
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meeting Schedule
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Meeting
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cellGroups.length > 0 ? (
                    cellGroups.map((cellGroup) => (
                      <tr key={cellGroup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {cellGroup.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {cellGroup.meeting_day || 'N/A'} {cellGroup.meeting_time ? `at ${cellGroup.meeting_time}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {cellGroup.location || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {cellGroup.member_count}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {cellGroup.last_meeting_date ? formatDate(cellGroup.last_meeting_date) : 'No meetings yet'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/cell-groups/${cellGroup.id}`} className="text-primary hover:underline mr-3">
                            View
                          </Link>
                          <Link href={`/attendance/record?cell_group=${cellGroup.id}`} className="text-primary hover:underline">
                            Record Attendance
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No cell groups found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Recent and Upcoming Meetings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Meetings */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Meetings</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cell Group
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendees
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visitors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentMeetings.length > 0 ? (
                      recentMeetings.map((meeting) => (
                        <tr key={meeting.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(meeting.meeting_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {meeting.cell_group_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {meeting.attendee_count}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {meeting.visitor_count}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No recent meetings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Upcoming Meetings */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Upcoming Meetings</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cell Group
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingMeetings.length > 0 ? (
                      upcomingMeetings.map((meeting) => (
                        <tr key={meeting.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(meeting.meeting_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {meeting.cell_group_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/attendance/record?meeting=${meeting.id}`} className="text-primary hover:underline">
                              Prepare Attendance
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          No upcoming meetings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
