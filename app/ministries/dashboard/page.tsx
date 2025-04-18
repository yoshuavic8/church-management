'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import { getUserRoleContext, ContextType } from '../../lib/role-utils';
import Header from '../../components/Header';

type Ministry = {
  id: string;
  name: string;
  description: string;
  member_count: number;
  last_meeting_date: string | null;
};

type MeetingSummary = {
  id: string;
  meeting_date: string;
  ministry_id: string;
  ministry_name: string;
  attendee_count: number;
};

export default function MinistryLeaderDashboard() {
  const [loading, setLoading] = useState(true);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<MeetingSummary[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingSummary[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalMinistries: 0,
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
      
      // Get user's role context to determine which ministries they lead
      const roleContext = await getUserRoleContext();
      
      if (!roleContext || !roleContext[ContextType.Ministry]) {
        throw new Error('You do not have any ministries assigned');
      }
      
      const ministryIds = roleContext[ContextType.Ministry];
      
      // Fetch ministries
      const { data: ministriesData, error: ministriesError } = await supabase
        .from('ministries')
        .select('id, name, description')
        .in('id', ministryIds)
        .order('name', { ascending: true });
        
      if (ministriesError) throw ministriesError;
      
      // Fetch member count for each ministry
      const ministriesWithCounts = await Promise.all((ministriesData || []).map(async (ministry) => {
        // Get member count
        const { count: memberCount, error: memberCountError } = await supabase
          .from('ministry_members')
          .select('*', { count: 'exact', head: true })
          .eq('ministry_id', ministry.id);
          
        if (memberCountError) throw memberCountError;
        
        // Get last meeting date
        const { data: lastMeeting, error: lastMeetingError } = await supabase
          .from('ministry_meetings')
          .select('meeting_date')
          .eq('ministry_id', ministry.id)
          .order('meeting_date', { ascending: false })
          .limit(1);
          
        if (lastMeetingError) throw lastMeetingError;
        
        return {
          ...ministry,
          member_count: memberCount || 0,
          last_meeting_date: lastMeeting && lastMeeting.length > 0 ? lastMeeting[0].meeting_date : null
        };
      }));
      
      setMinistries(ministriesWithCounts);
      
      // Fetch recent meetings
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      
      const { data: recentMeetingsData, error: recentMeetingsError } = await supabase
        .from('ministry_meetings')
        .select(`
          id,
          meeting_date,
          ministry_id,
          ministries (name)
        `)
        .in('ministry_id', ministryIds)
        .gte('meeting_date', oneMonthAgo.toISOString())
        .lte('meeting_date', today.toISOString())
        .order('meeting_date', { ascending: false })
        .limit(5);
        
      if (recentMeetingsError) throw recentMeetingsError;
      
      // Fetch attendee counts for each meeting
      const recentMeetingsWithCounts = await Promise.all((recentMeetingsData || []).map(async (meeting) => {
        // Get attendee count
        const { count: attendeeCount, error: attendeeCountError } = await supabase
          .from('ministry_attendance')
          .select('*', { count: 'exact', head: true })
          .eq('meeting_id', meeting.id);
          
        if (attendeeCountError) throw attendeeCountError;
        
        return {
          id: meeting.id,
          meeting_date: meeting.meeting_date,
          ministry_id: meeting.ministry_id,
          ministry_name: meeting.ministries?.name || 'Unknown',
          attendee_count: attendeeCount || 0
        };
      }));
      
      setRecentMeetings(recentMeetingsWithCounts);
      
      // Fetch upcoming meetings
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      
      const { data: upcomingMeetingsData, error: upcomingMeetingsError } = await supabase
        .from('ministry_meetings')
        .select(`
          id,
          meeting_date,
          ministry_id,
          ministries (name)
        `)
        .in('ministry_id', ministryIds)
        .gt('meeting_date', today.toISOString())
        .lte('meeting_date', nextMonth.toISOString())
        .order('meeting_date', { ascending: true })
        .limit(5);
        
      if (upcomingMeetingsError) throw upcomingMeetingsError;
      
      setUpcomingMeetings(upcomingMeetingsData.map(meeting => ({
        id: meeting.id,
        meeting_date: meeting.meeting_date,
        ministry_id: meeting.ministry_id,
        ministry_name: meeting.ministries?.name || 'Unknown',
        attendee_count: 0
      })));
      
      // Calculate statistics
      const totalMembers = ministriesWithCounts.reduce((sum, m) => sum + m.member_count, 0);
      const totalMinistries = ministriesWithCounts.length;
      
      // Get total meetings in the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      
      const { count: totalMeetings, error: totalMeetingsError } = await supabase
        .from('ministry_meetings')
        .select('*', { count: 'exact', head: true })
        .in('ministry_id', ministryIds)
        .gte('meeting_date', threeMonthsAgo.toISOString());
        
      if (totalMeetingsError) throw totalMeetingsError;
      
      // Get total attendees in the last 3 months
      const { data: meetingIds, error: meetingIdsError } = await supabase
        .from('ministry_meetings')
        .select('id')
        .in('ministry_id', ministryIds)
        .gte('meeting_date', threeMonthsAgo.toISOString());
        
      if (meetingIdsError) throw meetingIdsError;
      
      let totalAttendees = 0;
      let averageAttendance = 0;
      
      if (meetingIds && meetingIds.length > 0) {
        const meetingIdValues = meetingIds.map(m => m.id);
        
        const { count: attendeeCount, error: attendeeCountError } = await supabase
          .from('ministry_attendance')
          .select('*', { count: 'exact', head: true })
          .in('meeting_id', meetingIdValues);
          
        if (attendeeCountError) throw attendeeCountError;
        
        totalAttendees = attendeeCount || 0;
        averageAttendance = totalMeetings ? Math.round((totalAttendees / totalMeetings) * 10) / 10 : 0;
      }
      
      setStats({
        totalMembers,
        totalMinistries,
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
        title="Ministry Leader Dashboard"
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
              <div className="text-sm font-medium text-gray-500">Total Ministries</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalMinistries}</div>
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
          
          {/* Ministries */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">My Ministries</h2>
              <Link href="/ministries/manage" className="text-primary hover:underline">
                Manage Ministries
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
                      Description
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
                  {ministries.length > 0 ? (
                    ministries.map((ministry) => (
                      <tr key={ministry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {ministry.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {ministry.description || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {ministry.member_count}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {ministry.last_meeting_date ? formatDate(ministry.last_meeting_date) : 'No meetings yet'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/ministries/${ministry.id}`} className="text-primary hover:underline mr-3">
                            View
                          </Link>
                          <Link href={`/ministries/${ministry.id}/attendance`} className="text-primary hover:underline">
                            Record Attendance
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No ministries found
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
                        Ministry
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendees
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
                              {meeting.ministry_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {meeting.attendee_count}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
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
                        Ministry
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
                              {meeting.ministry_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/ministries/${meeting.ministry_id}/attendance?meeting=${meeting.id}`} className="text-primary hover:underline">
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
