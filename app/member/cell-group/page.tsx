'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';

export default function MemberCellGroup() {
  const [loading, setLoading] = useState(true);
  const [cellGroup, setCellGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalMeetings: 0,
    averageAttendance: 0,
    upcomingMeetings: 0
  });

  useEffect(() => {
    fetchCellGroupData();
  }, []);

  const fetchCellGroupData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get member's cell group
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('cell_group_id')
        .eq('id', user.id)
        .single();
        
      if (memberError) throw memberError;
      
      if (!memberData.cell_group_id) {
        // Member is not assigned to any cell group
        setLoading(false);
        return;
      }
      
      // Get cell group details
      const { data: cellGroupData, error: cellGroupError } = await supabase
        .from('cell_groups')
        .select(`
          *,
          district:district_id (name),
          leader:leader_id (first_name, last_name)
        `)
        .eq('id', memberData.cell_group_id)
        .single();
        
      if (cellGroupError) throw cellGroupError;
      
      setCellGroup(cellGroupData);
      
      // Get cell group members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, first_name, last_name, status, role')
        .eq('cell_group_id', memberData.cell_group_id)
        .order('first_name', { ascending: true });
        
      if (membersError) throw membersError;
      
      setMembers(membersData || []);
      
      // Get recent and upcoming meetings
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('attendance_meetings')
        .select(`
          id,
          meeting_date,
          meeting_type,
          topic,
          is_realtime,
          attendance_participants (
            status
          )
        `)
        .eq('cell_group_id', memberData.cell_group_id)
        .eq('event_category', 'cell_group')
        .gte('meeting_date', threeMonthsAgo.toISOString())
        .order('meeting_date', { ascending: false });
        
      if (meetingsError) throw meetingsError;
      
      // Process meetings data
      const processedMeetings = meetingsData.map((meeting: any) => {
        const totalAttendees = meeting.attendance_participants.length;
        const presentAttendees = meeting.attendance_participants.filter(
          (p: any) => p.status === 'present' || p.status === 'late'
        ).length;
        
        return {
          ...meeting,
          totalAttendees,
          presentAttendees,
          attendanceRate: totalAttendees > 0 ? Math.round((presentAttendees / totalAttendees) * 100) : 0,
          isPast: new Date(meeting.meeting_date) < today
        };
      });
      
      setMeetings(processedMeetings || []);
      
      // Calculate statistics
      const pastMeetings = processedMeetings.filter(m => m.isPast);
      const upcomingMeetings = processedMeetings.filter(m => !m.isPast);
      
      const totalAttendanceRates = pastMeetings.reduce((sum, meeting) => sum + meeting.attendanceRate, 0);
      const averageAttendance = pastMeetings.length > 0 
        ? Math.round(totalAttendanceRates / pastMeetings.length) 
        : 0;
      
      setStats({
        totalMembers: membersData.length,
        totalMeetings: pastMeetings.length,
        averageAttendance,
        upcomingMeetings: upcomingMeetings.length
      });
      
    } catch (error) {
      console.error('Error fetching cell group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMeetingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'regular': 'Regular Meeting',
      'special': 'Special Meeting',
      'outreach': 'Outreach',
      'prayer': 'Prayer Meeting',
      'other': 'Other'
    };
    return labels[type] || type.replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cellGroup) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">You're not assigned to a cell group yet</h2>
        <p className="text-gray-500 mb-6">Please contact your church administrator to be assigned to a cell group.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cell Group Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{cellGroup.name}</h2>
        <div className="flex flex-wrap gap-y-2 text-sm text-gray-500">
          <div className="mr-6">
            <span className="font-medium">District:</span> {cellGroup.district?.name || 'None'}
          </div>
          <div className="mr-6">
            <span className="font-medium">Leader:</span> {cellGroup.leader 
              ? `${cellGroup.leader.first_name} ${cellGroup.leader.last_name}` 
              : 'Not assigned'}
          </div>
          <div>
            <span className="font-medium">Meeting Day:</span> {cellGroup.meeting_day || 'Not set'}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Total Meetings</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalMeetings}</p>
          <p className="text-xs text-gray-500">Last 3 months</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Average Attendance</p>
          <p className="text-2xl font-bold text-gray-900">{stats.averageAttendance}%</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Upcoming Meetings</p>
          <p className="text-2xl font-bold text-gray-900">{stats.upcomingMeetings}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="md:col-span-1 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Members ({members.length})</h3>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-medium">
                  {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {member.role === 'leader' ? 'Leader' : member.status}
                  </p>
                </div>
              </div>
            ))}
            
            {members.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No members found</p>
            )}
          </div>
        </div>

        {/* Meetings List */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent & Upcoming Meetings</h3>
          <div className="space-y-4">
            {meetings.length > 0 ? (
              meetings.map((meeting) => (
                <div 
                  key={meeting.id} 
                  className={`border-l-4 ${
                    meeting.isPast 
                      ? 'border-gray-300' 
                      : 'border-primary'
                  } pl-4 py-2`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {meeting.topic || getMeetingTypeLabel(meeting.meeting_type)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(meeting.meeting_date)}
                      </p>
                    </div>
                    {meeting.isPast ? (
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {meeting.attendanceRate}% Attendance
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {meeting.presentAttendees} of {meeting.totalAttendees} present
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No meetings found in the last 3 months</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cell Group Description */}
      {cellGroup.description && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">About this Cell Group</h3>
          <p className="text-gray-700">{cellGroup.description}</p>
        </div>
      )}
    </div>
  );
}
