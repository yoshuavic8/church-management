'use client';

import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { getDateRange } from '../utils/attendanceUtils';

type ChartData = {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  visitors: number;
};

type AttendanceTrendChartProps = {
  timeRange: 'week' | 'month' | 'quarter' | 'year' | 'all';
  eventCategory?: string;
};

export default function AttendanceTrendChart({
  timeRange = 'month',
  eventCategory
}: AttendanceTrendChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = getSupabaseClient();
        const { startDate, endDate } = getDateRange(timeRange);

        // Step 1: Get all meetings in the date range
        let meetingsQuery = supabase
          .from('attendance_meetings')
          .select('id, meeting_date, event_category')
          .gte('meeting_date', startDate.toISOString().split('T')[0])
          .lte('meeting_date', endDate.toISOString().split('T')[0])
          .order('meeting_date', { ascending: true });

        // Add category filter if provided
        if (eventCategory && eventCategory !== 'all') {
          meetingsQuery = meetingsQuery.eq('event_category', eventCategory);
        }

        const { data: meetings, error: meetingsError } = await meetingsQuery;

        if (meetingsError) throw meetingsError;
        if (!meetings || meetings.length === 0) {
          setChartData([]);
          setLoading(false);
          return;
        }

        // Process data for chart
        const processedData: Record<string, ChartData> = {};

        // Initialize data structure grouped by date
        meetings.forEach(meeting => {
          const date = new Date(meeting.meeting_date).toLocaleDateString();

          if (!processedData[date]) {
            processedData[date] = {
              date,
              present: 0,
              absent: 0,
              late: 0,
              total: 0,
              visitors: 0
            };
          }
        });

        // Step 2: For each meeting, get the participants separately
        for (const meeting of meetings) {
          const date = new Date(meeting.meeting_date).toLocaleDateString();

          // Get participants for this meeting
          const { data: participants, error: participantsError } = await supabase
            .from('attendance_participants')
            .select('status')
            .eq('meeting_id', meeting.id);

          if (participantsError) {
            continue; // Skip this meeting but continue with others
          }

          if (participants && participants.length > 0) {
            // Count attendance statuses
            participants.forEach(participant => {
              processedData[date].total++;

              if (participant.status === 'present') {
                processedData[date].present++;
              } else if (participant.status === 'absent') {
                processedData[date].absent++;
              } else if (participant.status === 'late') {
                processedData[date].late++;
              }
            });
          }

          // Get visitors for this meeting
          const { count: visitorCount, error: visitorError } = await supabase
            .from('attendance_visitors')
            .select('*', { count: 'exact', head: true })
            .eq('meeting_id', meeting.id);

          if (!visitorError && visitorCount) {
            processedData[date].visitors += visitorCount;
          }
        }

        // Convert to array and sort by date
        const chartDataArray = Object.values(processedData).sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setChartData(chartDataArray);
        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to load attendance data');
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [timeRange, eventCategory]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
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

  if (chartData.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        No attendance data available for the selected time period.
      </div>
    );
  }

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.present, d.absent, d.late, d.total))
  );

  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-4">Attendance Trend</h2>

      <div className="h-64 w-full">
        {/* Chart Legend */}
        <div className="flex flex-wrap gap-4 mb-4 justify-center">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm">Absent</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm">Late</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm">Total</span>
          </div>
        </div>

        {/* Simple Chart Implementation */}
        <div className="relative h-48">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
            <div>{maxValue}</div>
            <div>{Math.round(maxValue * 0.75)}</div>
            <div>{Math.round(maxValue * 0.5)}</div>
            <div>{Math.round(maxValue * 0.25)}</div>
            <div>0</div>
          </div>

          {/* Chart grid */}
          <div className="absolute left-10 right-0 top-0 bottom-0 border-l border-b border-gray-300">
            {/* Horizontal grid lines */}
            <div className="absolute left-0 right-0 top-0 h-px bg-gray-200"></div>
            <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-200"></div>
            <div className="absolute left-0 right-0 top-2/4 h-px bg-gray-200"></div>
            <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-200"></div>

            {/* Chart bars */}
            <div className="absolute left-0 right-0 top-0 bottom-0 flex items-end">
              {chartData.map((data, index) => {
                const barWidth = `${100 / chartData.length}%`;
                const presentHeight = `${(data.present / maxValue) * 100}%`;
                const absentHeight = `${(data.absent / maxValue) * 100}%`;
                const lateHeight = `${(data.late / maxValue) * 100}%`;
                const totalHeight = `${(data.total / maxValue) * 100}%`;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center justify-end relative group"
                    style={{ maxWidth: barWidth }}
                  >
                    {/* Total line */}
                    <div
                      className="absolute w-full border-t-2 border-dashed border-gray-400 z-10"
                      style={{ bottom: totalHeight }}
                    ></div>

                    {/* Present bar */}
                    <div
                      className="w-1/2 bg-green-500 rounded-t"
                      style={{ height: presentHeight }}
                    ></div>

                    {/* Absent bar */}
                    <div
                      className="w-1/2 bg-red-500 rounded-t ml-px"
                      style={{ height: absentHeight }}
                    ></div>

                    {/* Late bar */}
                    <div
                      className="w-1/2 bg-yellow-500 rounded-t ml-px"
                      style={{ height: lateHeight }}
                    ></div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-white p-2 rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <p className="font-bold">{data.date}</p>
                      <p className="text-green-600">Present: {data.present}</p>
                      <p className="text-red-600">Absent: {data.absent}</p>
                      <p className="text-yellow-600">Late: {data.late}</p>
                      <p className="text-gray-600">Total: {data.total}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="absolute left-10 right-0 bottom-0 mt-1 flex justify-between text-xs text-gray-500 transform translate-y-4">
            {chartData.map((data, index) => (
              <div key={index} className="text-center" style={{ width: `${100 / chartData.length}%` }}>
                {index % Math.max(1, Math.floor(chartData.length / 5)) === 0 && (
                  <span className="inline-block transform -rotate-45 origin-top-left">
                    {data.date}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
