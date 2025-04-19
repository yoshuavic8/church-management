'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { EventCategory } from '../types/ministry';
import {
  getContextName,
  getMeetingTypeLabel,
  formatShortDate,
  exportToCSV,
  getDateRange,
  getCategoryContextLabel
} from './utils/attendanceUtils';
import AttendanceTrendChart from './components/AttendanceTrendChart';

type AttendanceRecord = {
  id: string;
  meeting_date: string;
  meeting_type: string;
  event_category: EventCategory;
  cell_group_id: string | null;
  ministry_id: string | null;
  cell_group?: {
    name: string;
  };
  ministry?: {
    name: string;
  };
  context_name: string; // Unified name for the context (cell group, ministry, etc.)
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

// Content component that uses searchParams
function AttendanceContent() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get('member');

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [memberName, setMemberName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'week', 'month', 'quarter', 'year'
  const [cellGroupFilter, setCellGroupFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Stats summary for filtered data
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalAttendance: 0,
    averageAttendance: 0,
    totalVisitors: 0,
    totalOffering: 0,
    // Advanced stats
    mostActiveCellGroup: { name: '', count: 0 },
    mostVisitorsCellGroup: { name: '', count: 0 },
    highestAttendanceRate: { name: '', rate: 0 },
    highestGrowthCellGroup: { name: '', growth: 0 }
  });

  // Stats summary for current month only (fixed)
  const [currentMonthStats, setCurrentMonthStats] = useState({
    totalMeetings: 0,
    totalAttendance: 0,
    averageAttendance: 0,
    totalVisitors: 0,
    totalOffering: 0
  });

  // UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

        // Fetch attendance meetings with context info (cell group or ministry)
        let query = supabase
          .from('attendance_meetings')
          .select(`
            id,
            meeting_date,
            meeting_type,
            event_category,
            topic,
            notes,
            offering,
            cell_group_id,
            ministry_id,
            cell_group:cell_group_id (name),
            ministry:ministry_id (name)
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

          // Process context data (cell group or ministry)
          let contextName = 'Unknown';
          let cellGroupData = null;
          let ministryData = null;

          // Determine event category, defaulting to 'cell_group' for backward compatibility
          const eventCategory = meeting.event_category || 'cell_group';

          if (eventCategory === 'cell_group' && meeting.cell_group_id) {
            // Process cell group data
            if (Array.isArray(meeting.cell_group) && meeting.cell_group.length > 0) {
              contextName = meeting.cell_group[0]?.name || 'Unknown';
              cellGroupData = { name: contextName };
            } else if (meeting.cell_group && typeof meeting.cell_group === 'object') {
              contextName = meeting.cell_group.name || 'Unknown';
              cellGroupData = { name: contextName };
            } else {
              // If still unknown, try to fetch the cell group name directly
              try {
                const { data: cgData } = await supabase
                  .from('cell_groups')
                  .select('name')
                  .eq('id', meeting.cell_group_id)
                  .single();

                if (cgData && cgData.name) {
                  contextName = cgData.name;
                  cellGroupData = { name: contextName };
                }
              } catch (error) {

              }
            }
          } else if (eventCategory === 'ministry' && meeting.ministry_id) {
            // Process ministry data
            if (Array.isArray(meeting.ministry) && meeting.ministry.length > 0) {
              contextName = meeting.ministry[0]?.name || 'Unknown';
              ministryData = { name: contextName };
            } else if (meeting.ministry && typeof meeting.ministry === 'object') {
              contextName = meeting.ministry.name || 'Unknown';
              ministryData = { name: contextName };
            } else {
              // If still unknown, try to fetch the ministry name directly
              try {
                const { data: minData } = await supabase
                  .from('ministries')
                  .select('name')
                  .eq('id', meeting.ministry_id)
                  .single();

                if (minData && minData.name) {
                  contextName = minData.name;
                  ministryData = { name: contextName };
                }
              } catch (error) {

              }
            }
          } else {
            // For other event categories, use a generic name based on the meeting type
            contextName = getMeetingTypeLabel(meeting.meeting_type);
          }

          return {
            id: meeting.id,
            meeting_date: meeting.meeting_date,
            meeting_type: meeting.meeting_type,
            event_category: eventCategory as EventCategory,
            topic: meeting.topic,
            notes: meeting.notes,
            offering: meeting.offering,
            cell_group_id: meeting.cell_group_id,
            ministry_id: meeting.ministry_id,
            cell_group: cellGroupData,
            ministry: ministryData,
            context_name: contextName,
            present_count: presentCount || 0,
            absent_count: absentCount || 0,
            late_count: lateCount || 0,
            excused_count: excusedCount || 0,
            visitor_count: visitorCount || 0,
            total_count: totalCount,
          };
        }));

        setRecords(recordsWithStats);

        // Calculate statistics for filtered data
        calculateStats(recordsWithStats);

        // Calculate statistics for current month only
        calculateCurrentMonthStats(recordsWithStats);
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [memberId]);

  // Recalculate stats when filters change
  useEffect(() => {
    if (records.length > 0) {
      calculateStats(records);
    }
  }, [timeFilter, filter, cellGroupFilter, categoryFilter, records]);

  // Function to calculate statistics based on filtered records
  const calculateStats = (attendanceRecords: AttendanceRecord[]) => {
    // Apply all filters to records
    let filteredRecords = attendanceRecords;

    // Apply time filter
    if (timeFilter !== 'all') {
      filteredRecords = applyTimeFilter(filteredRecords, timeFilter);
    }

    // Apply meeting type filter
    if (filter !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.meeting_type === filter);
    }

    // Apply event category filter
    if (categoryFilter !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.event_category === categoryFilter);
    }

    // Apply context name filter (cell group or ministry)
    if (cellGroupFilter) {
      filteredRecords = filteredRecords.filter(record =>
        record.context_name.toLowerCase().includes(cellGroupFilter.toLowerCase())
      );
    }

    // Calculate basic statistics
    const totalMeetings = filteredRecords.length;
    const totalAttendance = filteredRecords.reduce((sum, record) => sum + record.present_count, 0);
    const averageAttendance = totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0;
    const totalVisitors = filteredRecords.reduce((sum, record) => sum + record.visitor_count, 0);
    const totalOffering = filteredRecords.reduce((sum, record) => sum + (record.offering || 0), 0);

    // Calculate advanced statistics

    // 1. Most active context (most meetings)
    const contextMeetingCounts = filteredRecords.reduce((counts, record) => {
      const contextName = record.context_name;
      counts[contextName] = (counts[contextName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    let mostActiveCellGroup = { name: '', count: 0 };
    Object.entries(contextMeetingCounts).forEach(([name, count]) => {
      if (count > mostActiveCellGroup.count) {
        mostActiveCellGroup = { name, count };
      }
    });

    // 2. Context with most visitors
    const contextVisitorCounts = filteredRecords.reduce((counts, record) => {
      const contextName = record.context_name;
      counts[contextName] = (counts[contextName] || 0) + record.visitor_count;
      return counts;
    }, {} as Record<string, number>);

    let mostVisitorsCellGroup = { name: '', count: 0 };
    Object.entries(contextVisitorCounts).forEach(([name, count]) => {
      if (count > mostVisitorsCellGroup.count) {
        mostVisitorsCellGroup = { name, count };
      }
    });

    // 3. Context with highest attendance rate
    const contextAttendanceRates = filteredRecords.reduce((rates, record) => {
      const contextName = record.context_name;
      if (!rates[contextName]) {
        rates[contextName] = { present: 0, total: 0 };
      }
      rates[contextName].present += record.present_count;
      rates[contextName].total += record.total_count;
      return rates;
    }, {} as Record<string, { present: number, total: number }>);

    let highestAttendanceRate = { name: '', rate: 0 };
    Object.entries(contextAttendanceRates).forEach(([name, data]) => {
      if (data.total > 0) {
        const rate = Math.round((data.present / data.total) * 100);
        if (rate > highestAttendanceRate.rate) {
          highestAttendanceRate = { name, rate };
        }
      }
    });

    // 4. Cell group with highest growth (most new visitors)
    // For simplicity, we'll just use visitor count as a proxy for growth potential
    const highestGrowthCellGroup = mostVisitorsCellGroup;

    setStats({
      totalMeetings,
      totalAttendance,
      averageAttendance,
      totalVisitors,
      totalOffering,
      mostActiveCellGroup,
      mostVisitorsCellGroup,
      highestAttendanceRate,
      highestGrowthCellGroup
    });
  };

  // Function to calculate statistics for current month only
  const calculateCurrentMonthStats = (attendanceRecords: AttendanceRecord[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter records for current month only
    const currentMonthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.meeting_date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    // Calculate statistics
    const totalMeetings = currentMonthRecords.length;
    const totalAttendance = currentMonthRecords.reduce((sum, record) => sum + record.present_count, 0);
    const averageAttendance = totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0;
    const totalVisitors = currentMonthRecords.reduce((sum, record) => sum + record.visitor_count, 0);
    const totalOffering = currentMonthRecords.reduce((sum, record) => sum + (record.offering || 0), 0);

    setCurrentMonthStats({
      totalMeetings,
      totalAttendance,
      averageAttendance,
      totalVisitors,
      totalOffering
    });
  };

  // Function to apply time filter to records
  const applyTimeFilter = (records: AttendanceRecord[], filter: string): AttendanceRecord[] => {
    if (filter === 'all') return records;

    const { startDate, endDate } = getDateRange(filter as 'week' | 'month' | 'quarter' | 'year' | 'all');

    return records.filter(record => {
      const recordDate = new Date(record.meeting_date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };
  // Apply all filters to records
  const filteredRecords = records.filter(record => {
    // Apply meeting type filter
    const meetingTypeMatch = filter === 'all' || filter === record.meeting_type;

    // Apply time filter
    const timeFilterMatch = timeFilter === 'all' || isWithinTimeFilter(record.meeting_date, timeFilter);

    // Apply event category filter
    const categoryMatch = categoryFilter === 'all' || record.event_category === categoryFilter;

    // Apply context name filter (cell group or ministry)
    const contextMatch = !cellGroupFilter ||
      record.context_name.toLowerCase().includes(cellGroupFilter.toLowerCase());

    return meetingTypeMatch && timeFilterMatch && categoryMatch && contextMatch;
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Function to change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, timeFilter, cellGroupFilter, categoryFilter]);

  // Helper function to check if a date is within the selected time filter
  function isWithinTimeFilter(dateString: string, filter: string): boolean {
    if (filter === 'all') return true;

    const { startDate, endDate } = getDateRange(filter as 'week' | 'month' | 'quarter' | 'year' | 'all');
    const recordDate = new Date(dateString);

    return recordDate >= startDate && recordDate <= endDate;
  }

  // Using utility function from attendanceUtils.ts

  const getCategoryLabel = (category: EventCategory | 'all') => {
    if (category === 'all') return 'All Categories';
    return getCategoryContextLabel(category as EventCategory);
  };

  // Helper to check if any filter is active
  const isFilterActive = filter !== 'all' || timeFilter !== 'all' || cellGroupFilter !== '' || categoryFilter !== 'all';

  // Helper to clear all filters
  const clearAllFilters = () => {
    setFilter('all');
    setTimeFilter('all');
    setCellGroupFilter('');
    setCategoryFilter('all');
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            {memberId ? `Attendance History for ${memberName}` : "Attendance"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage attendance records</p>
        </div>

        {!memberId && (
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
            <Link href="/scan">
              <Button variant="primary" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                Quick Scan
              </Button>
            </Link>
            <Link href="/attendance/record">
              <Button variant="primary">Record Attendance</Button>
            </Link>
          </div>
        )}
      </div>

      {memberId && (
        <div className="mb-4">
          <Link href={`/members/${memberId}`} className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 flex items-center">
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Member Profile
          </Link>
        </div>
      )}

      {/* Statistics Dashboard */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Attendance Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Month Statistics - Always visible */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 border-b pb-2 text-md font-medium text-gray-700 dark:text-gray-300">Current Month</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Meetings:</span>
                <span className="font-semibold text-blue-600">{currentMonthStats.totalMeetings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Attendance:</span>
                <span className="font-semibold text-green-600">{currentMonthStats.totalAttendance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Attendance:</span>
                <span className="font-semibold text-indigo-600">{currentMonthStats.averageAttendance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Visitors:</span>
                <span className="font-semibold text-purple-600">{currentMonthStats.totalVisitors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Offering:</span>
                <span className="font-semibold text-yellow-600">Rp {currentMonthStats.totalOffering.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Filtered Period Stats - Only show if filters are active */}
          {isFilterActive ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-3 border-b pb-2 text-md font-medium text-gray-700 dark:text-gray-300">Filtered Period</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Meetings:</span>
                  <span className="font-semibold">{stats.totalMeetings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Attendance:</span>
                  <span className="font-semibold">{stats.totalAttendance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Attendance:</span>
                  <span className="font-semibold">{stats.averageAttendance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Visitors:</span>
                  <span className="font-semibold">{stats.totalVisitors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Offering:</span>
                  <span className="font-semibold">Rp {stats.totalOffering.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="mb-2">Apply filters to see statistics for a specific period</p>
                <p className="text-sm">Use the filter controls below to select a time period, category, or context</p>
              </div>
            </div>
          )}

          {/* Cell Group Insights */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 border-b pb-2 text-md font-medium text-gray-700 dark:text-gray-300">Context Insights</h3>
            {stats.mostActiveCellGroup.name ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Most Active:</span>
                  <span className="font-semibold text-blue-600">{stats.mostActiveCellGroup.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Most Visitors:</span>
                  <span className="font-semibold text-green-600">{stats.mostVisitorsCellGroup.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Highest Attendance:</span>
                  <span className="font-semibold text-purple-600">{stats.highestAttendanceRate.name} ({stats.highestAttendanceRate.rate}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Growth Potential:</span>
                  <span className="font-semibold text-yellow-600">{stats.highestGrowthCellGroup.name}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6">
                <p>No data available for insights</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Filters</h2>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {showAdvancedFilters ? (
              <>
                <span className="mr-1">Hide Advanced Filters</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span className="mr-1">Show Advanced Filters</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Active Filter Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {timeFilter !== 'all' && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
              {timeFilter === 'week' ? 'Last 7 Days' :
               timeFilter === 'month' ? 'Previous Month' :
               timeFilter === 'quarter' ? 'Last 3 Months' : 'Last 365 Days'}
              <button
                onClick={() => setTimeFilter('all')}
                className="ml-2 text-blue-600 hover:text-blue-800"
                aria-label="Remove time filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {filter !== 'all' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
              Type: {getMeetingTypeLabel(filter)}
              <button
                onClick={() => setFilter('all')}
                className="ml-2 text-green-600 hover:text-green-800"
                aria-label="Remove meeting type filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {categoryFilter !== 'all' && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center">
              Category: {getCategoryLabel(categoryFilter)}
              <button
                onClick={() => setCategoryFilter('all')}
                className="ml-2 text-purple-600 hover:text-purple-800"
                aria-label="Remove category filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {cellGroupFilter && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center">
              Context: {cellGroupFilter}
              <button
                onClick={() => setCellGroupFilter('')}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
                aria-label="Remove context filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {isFilterActive && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 flex items-center"
            >
              Clear All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Basic Search Filter - Always visible */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search by Context Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search cell group, ministry, etc..."
              className="input-field pl-10"
              value={cellGroupFilter}
              onChange={(e) => setCellGroupFilter(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* Time Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1 rounded-md ${timeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-3 py-1 rounded-md ${timeFilter === 'week' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-3 py-1 rounded-md ${timeFilter === 'month' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Previous Month
                </button>
                <button
                  onClick={() => setTimeFilter('quarter')}
                  className={`px-3 py-1 rounded-md ${timeFilter === 'quarter' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Last 3 Months
                </button>
                <button
                  onClick={() => setTimeFilter('year')}
                  className={`px-3 py-1 rounded-md ${timeFilter === 'year' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Last 365 Days
                </button>
              </div>
            </div>

            {/* Event Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-md ${categoryFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All Categories
                </button>
                <button
                  onClick={() => setCategoryFilter('cell_group')}
                  className={`px-3 py-1 rounded-md ${categoryFilter === 'cell_group' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Cell Group
                </button>
                <button
                  onClick={() => setCategoryFilter('ministry')}
                  className={`px-3 py-1 rounded-md ${categoryFilter === 'ministry' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Ministry
                </button>
                <button
                  onClick={() => setCategoryFilter('prayer')}
                  className={`px-3 py-1 rounded-md ${categoryFilter === 'prayer' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Prayer Meeting
                </button>
                <button
                  onClick={() => setCategoryFilter('service')}
                  className={`px-3 py-1 rounded-md ${categoryFilter === 'service' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Church Service
                </button>
                <button
                  onClick={() => setCategoryFilter('other')}
                  className={`px-3 py-1 rounded-md ${categoryFilter === 'other' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Other Event
                </button>
              </div>
            </div>

            {/* Meeting Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setFilter('regular')}
                  className={`px-3 py-1 rounded-md ${filter === 'regular' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Regular Meeting
                </button>
                <button
                  onClick={() => setFilter('special')}
                  className={`px-3 py-1 rounded-md ${filter === 'special' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Special Meeting
                </button>
                <button
                  onClick={() => setFilter('outreach')}
                  className={`px-3 py-1 rounded-md ${filter === 'outreach' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Outreach
                </button>
                <button
                  onClick={() => setFilter('prayer')}
                  className={`px-3 py-1 rounded-md ${filter === 'prayer' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Prayer Meeting
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Attendance Trend Chart */}
      <div className="mb-6">
        <AttendanceTrendChart
          timeRange={timeFilter as 'week' | 'month' | 'quarter' | 'year' | 'all'}
          eventCategory={categoryFilter !== 'all' ? categoryFilter : undefined}
        />
      </div>

      {/* Records Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredRecords.length} of {records.length} records
        </p>
      </div>

      {/* Data Table Section */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Attendance Records</h2>

          <button
            onClick={() => exportToCSV(filteredRecords, 'attendance_records')}
            className="btn-secondary flex items-center"
            disabled={filteredRecords.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to CSV
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-lg bg-white dark:bg-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Context</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Present</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Visitors</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Total</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Offering</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">
                      {formatShortDate(record.meeting_date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-700 dark:text-gray-300">{record.context_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{getCategoryLabel(record.event_category)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getMeetingTypeLabel(record.meeting_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-medium text-success-600 dark:text-success-400">{record.present_count}</div>
                      <div className="text-xs text-gray-500">
                        {record.total_count > 0 ? Math.round((record.present_count / record.total_count) * 100) : 0}%
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-brand-600 dark:text-brand-400">{record.visitor_count}</div>
                      {record.visitor_count > 0 && (
                        <div className="text-xs text-gray-500">New</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-700 dark:text-gray-300">{record.total_count}</td>
                    <td className="py-3 px-4 text-right">
                      {record.offering !== null ? (
                        <span className="font-medium text-success-600 dark:text-success-400">
                          Rp {record.offering.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/attendance/${record.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">No attendance records found</p>
                        <p className="mb-4 text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters to find what you're looking for</p>
                        {isFilterActive && (
                          <button
                            onClick={clearAllFilters}
                            className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredRecords.length > 0 && (
              <div className="mt-6 flex flex-col items-center border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastRecord, filteredRecords.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredRecords.length}</span> results
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500"
                    value={recordsPerPage}
                    onChange={(e) => {
                      setRecordsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing records per page
                    }}
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>

                  <nav className="flex items-center">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`rounded-l-md px-3 py-1 ${currentPage === 1 ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    <div className="hidden sm:flex">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          // If 5 or fewer pages, show all
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          // If near start, show first 5 pages
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // If near end, show last 5 pages
                          pageNum = totalPages - 4 + i;
                        } else {
                          // Otherwise show current page and 2 pages on each side
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`px-3 py-1 ${currentPage === pageNum ? 'bg-brand-500 text-white dark:bg-brand-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Current page indicator for mobile */}
                    <div className="bg-gray-100 px-3 py-1 dark:bg-gray-700 dark:text-gray-300 sm:hidden">
                      {currentPage} / {totalPages}
                    </div>

                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`rounded-r-md px-3 py-1 ${currentPage === totalPages || totalPages === 0 ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* No additional statistics needed at the bottom */}
    </Layout>
  );
}

// Main component with Suspense boundary
export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center p-4 text-gray-600 dark:text-gray-400">Loading attendance data...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
