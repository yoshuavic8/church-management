'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface RealtimeAttendanceStatsProps {
  meetingId: string;
}

type AttendanceStats = {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  visitorCount: number;
  totalCount: number;
  presentPercentage: number;
};

const RealtimeAttendanceStats = ({ meetingId }: RealtimeAttendanceStatsProps) => {
  const [stats, setStats] = useState<AttendanceStats>({
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    visitorCount: 0,
    totalCount: 0,
    presentPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Fetch attendance participants
        const { data: participants, error: participantsError } = await supabase
          .from('attendance_participants')
          .select('status')
          .eq('meeting_id', meetingId);
          
        if (participantsError) throw participantsError;
        
        // Fetch visitors
        const { data: visitors, error: visitorsError } = await supabase
          .from('attendance_visitors')
          .select('id')
          .eq('meeting_id', meetingId);
          
        if (visitorsError) throw visitorsError;
        
        // Calculate stats
        const presentCount = participants?.filter(p => p.status === 'present').length || 0;
        const absentCount = participants?.filter(p => p.status === 'absent').length || 0;
        const lateCount = participants?.filter(p => p.status === 'late').length || 0;
        const excusedCount = participants?.filter(p => p.status === 'excused').length || 0;
        const visitorCount = visitors?.length || 0;
        const totalCount = participants?.length || 0;
        const presentPercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
        
        setStats({
          presentCount,
          absentCount,
          lateCount,
          excusedCount,
          visitorCount,
          totalCount,
          presentPercentage,
        });
        
        setLastUpdate(new Date());
      } catch (error: any) {
        console.error('Error fetching attendance stats:', error);
        setError(error.message || 'Failed to fetch attendance stats');
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchStats();
    
    // Set up realtime subscription
    const supabase = getSupabaseClient();
    const subscription = supabase
      .channel('attendance-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance_participants',
        filter: `meeting_id=eq.${meetingId}`,
      }, () => {
        // Refetch stats when changes occur
        fetchStats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance_visitors',
        filter: `meeting_id=eq.${meetingId}`,
      }, () => {
        // Refetch stats when changes occur
        fetchStats();
      })
      .subscribe();
      
    // Cleanup subscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [meetingId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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

  return (
    <div className="realtime-stats">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Live Attendance</h3>
        {lastUpdate && (
          <div className="text-xs text-gray-500 flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Present</div>
          <div className="mt-1 flex justify-between items-end">
            <div className="text-2xl font-semibold text-green-600">{stats.presentCount}</div>
            <div className="text-sm text-gray-500">{stats.presentPercentage}%</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Absent</div>
          <div className="mt-1 flex justify-between items-end">
            <div className="text-2xl font-semibold text-red-600">{stats.absentCount}</div>
            <div className="text-sm text-gray-500">
              {stats.totalCount > 0 ? Math.round((stats.absentCount / stats.totalCount) * 100) : 0}%
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Late</div>
          <div className="mt-1 flex justify-between items-end">
            <div className="text-2xl font-semibold text-yellow-600">{stats.lateCount}</div>
            <div className="text-sm text-gray-500">
              {stats.totalCount > 0 ? Math.round((stats.lateCount / stats.totalCount) * 100) : 0}%
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Excused</div>
          <div className="mt-1 flex justify-between items-end">
            <div className="text-2xl font-semibold text-blue-600">{stats.excusedCount}</div>
            <div className="text-sm text-gray-500">
              {stats.totalCount > 0 ? Math.round((stats.excusedCount / stats.totalCount) * 100) : 0}%
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Visitors</div>
          <div className="mt-1 flex justify-between items-end">
            <div className="text-2xl font-semibold text-purple-600">{stats.visitorCount}</div>
            <div className="text-sm text-gray-500">&nbsp;</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Members</div>
          <div className="mt-1 flex justify-between items-end">
            <div className="text-2xl font-semibold">{stats.totalCount}</div>
            <div className="text-sm text-gray-500">&nbsp;</div>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Attendance Progress</span>
          <span>{stats.presentCount} of {stats.totalCount} members</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full" 
            style={{ width: `${stats.presentPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeAttendanceStats;
