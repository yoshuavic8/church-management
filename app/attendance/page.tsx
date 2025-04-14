'use client';

import { useState, useEffect, Suspense } from 'react';
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

          // Process cell group data properly
          let cellGroupName = 'Unknown';

          // Handle if cell_group is an array
          if (Array.isArray(meeting.cell_group) && meeting.cell_group.length > 0) {
            cellGroupName = meeting.cell_group[0]?.name || 'Unknown';
          }
          // Handle if cell_group is an object
          else if (meeting.cell_group && typeof meeting.cell_group === 'object') {
            cellGroupName = meeting.cell_group.name || 'Unknown';
          }

          // If still unknown, try to fetch the cell group name directly
          if (cellGroupName === 'Unknown' && meeting.cell_group_id) {
            try {
              const { data: cellGroupData } = await supabase
                .from('cell_groups')
                .select('name')
                .eq('id', meeting.cell_group_id)
                .single();

              if (cellGroupData && cellGroupData.name) {
                cellGroupName = cellGroupData.name;
              }
            } catch (error) {
              console.error('Error fetching cell group name:', error);
            }
          }

          const cellGroupData = { name: cellGroupName };

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

        // Calculate statistics for filtered data
        calculateStats(recordsWithStats);

        // Calculate statistics for current month only
        calculateCurrentMonthStats(recordsWithStats);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
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
  }, [timeFilter, filter, cellGroupFilter, records]);

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

    // Apply cell group filter
    if (cellGroupFilter) {
      filteredRecords = filteredRecords.filter(record =>
        record.cell_group.name.toLowerCase().includes(cellGroupFilter.toLowerCase())
      );
    }

    // Calculate basic statistics
    const totalMeetings = filteredRecords.length;
    const totalAttendance = filteredRecords.reduce((sum, record) => sum + record.present_count, 0);
    const averageAttendance = totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0;
    const totalVisitors = filteredRecords.reduce((sum, record) => sum + record.visitor_count, 0);
    const totalOffering = filteredRecords.reduce((sum, record) => sum + (record.offering || 0), 0);

    // Calculate advanced statistics

    // 1. Most active cell group (most meetings)
    const cellGroupMeetingCounts = filteredRecords.reduce((counts, record) => {
      const cellGroupName = record.cell_group.name;
      counts[cellGroupName] = (counts[cellGroupName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    let mostActiveCellGroup = { name: '', count: 0 };
    Object.entries(cellGroupMeetingCounts).forEach(([name, count]) => {
      if (count > mostActiveCellGroup.count) {
        mostActiveCellGroup = { name, count };
      }
    });

    // 2. Cell group with most visitors
    const cellGroupVisitorCounts = filteredRecords.reduce((counts, record) => {
      const cellGroupName = record.cell_group.name;
      counts[cellGroupName] = (counts[cellGroupName] || 0) + record.visitor_count;
      return counts;
    }, {} as Record<string, number>);

    let mostVisitorsCellGroup = { name: '', count: 0 };
    Object.entries(cellGroupVisitorCounts).forEach(([name, count]) => {
      if (count > mostVisitorsCellGroup.count) {
        mostVisitorsCellGroup = { name, count };
      }
    });

    // 3. Cell group with highest attendance rate
    const cellGroupAttendanceRates = filteredRecords.reduce((rates, record) => {
      const cellGroupName = record.cell_group.name;
      if (!rates[cellGroupName]) {
        rates[cellGroupName] = { present: 0, total: 0 };
      }
      rates[cellGroupName].present += record.present_count;
      rates[cellGroupName].total += record.total_count;
      return rates;
    }, {} as Record<string, { present: number, total: number }>);

    let highestAttendanceRate = { name: '', rate: 0 };
    Object.entries(cellGroupAttendanceRates).forEach(([name, data]) => {
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

    // Use the same logic as isWithinTimeFilter to ensure consistency
    return records.filter(record => isWithinTimeFilter(record.meeting_date, filter));
  };
  // Apply all filters to records
  const filteredRecords = records.filter(record => {
    // Apply meeting type filter
    const meetingTypeMatch = filter === 'all' || filter === record.meeting_type;

    // Apply time filter
    const timeFilterMatch = timeFilter === 'all' || isWithinTimeFilter(record.meeting_date, timeFilter);

    // Apply cell group filter
    const cellGroupMatch = !cellGroupFilter ||
      record.cell_group.name.toLowerCase().includes(cellGroupFilter.toLowerCase());

    return meetingTypeMatch && timeFilterMatch && cellGroupMatch;
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
  }, [filter, timeFilter, cellGroupFilter]);

  // Helper function to check if a date is within the selected time filter
  function isWithinTimeFilter(dateString: string, filter: string): boolean {
    if (filter === 'all') return true;

    const recordDate = new Date(dateString);
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    // Check if the record date is in the future
    if (recordDate > now) {
      console.log('Future date detected:', dateString);
      return false; // Don't show future dates in time filters
    }

    switch (filter) {
      case 'week':
        // Last 7 days from today
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;

      case 'month':
        // Previous month (1st day to last day)
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 1st day of previous month
        endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
        break;

      case 'year':
        // Last 365 days
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;

      case 'quarter':
        // Last 3 months
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;

      default:
        return true;
    }

    // Check if the record date is within the date range
    return recordDate >= startDate && recordDate <= endDate;
  }

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

      {/* Statistics Dashboard */}
      <div className="mb-6 card p-6">
        <h2 className="text-xl font-semibold mb-4">Attendance Dashboard</h2>

        {/* Tabs for different statistics views */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className="border-primary text-primary font-medium border-b-2 py-2 px-1"
                aria-current="page"
              >
                Overview
              </button>
            </nav>
          </div>
        </div>

        {/* Current Month Statistics */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Current Month Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="card p-4 bg-blue-50">
              <h3 className="text-sm font-medium text-blue-700">Total Meetings</h3>
              <p className="text-2xl font-bold text-blue-900">{currentMonthStats.totalMeetings}</p>
            </div>
            <div className="card p-4 bg-green-50">
              <h3 className="text-sm font-medium text-green-700">Total Attendance</h3>
              <p className="text-2xl font-bold text-green-900">{currentMonthStats.totalAttendance}</p>
            </div>
            <div className="card p-4 bg-indigo-50">
              <h3 className="text-sm font-medium text-indigo-700">Average Attendance</h3>
              <p className="text-2xl font-bold text-indigo-900">{currentMonthStats.averageAttendance}</p>
            </div>
            <div className="card p-4 bg-purple-50">
              <h3 className="text-sm font-medium text-purple-700">Total Visitors</h3>
              <p className="text-2xl font-bold text-purple-900">{currentMonthStats.totalVisitors}</p>
            </div>
            <div className="card p-4 bg-yellow-50">
              <h3 className="text-sm font-medium text-yellow-700">Total Offering</h3>
              <p className="text-2xl font-bold text-yellow-900">Rp {currentMonthStats.totalOffering.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Filtered Statistics */}
        {(filter !== 'all' || timeFilter !== 'all' || cellGroupFilter) && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Filtered Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="card p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">Total Meetings</h3>
                <p className="text-2xl font-bold">{stats.totalMeetings}</p>
              </div>
              <div className="card p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">Total Attendance</h3>
                <p className="text-2xl font-bold">{stats.totalAttendance}</p>
              </div>
              <div className="card p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">Average Attendance</h3>
                <p className="text-2xl font-bold">{stats.averageAttendance}</p>
                {stats.totalMeetings > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {Math.round(stats.totalAttendance / stats.totalMeetings * 100)}% attendance rate
                  </p>
                )}
              </div>
              <div className="card p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">Total Visitors</h3>
                <p className="text-2xl font-bold">{stats.totalVisitors}</p>
              </div>
              <div className="card p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">Total Offering</h3>
                <p className="text-2xl font-bold">Rp {stats.totalOffering.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cell Group Insights */}
        {stats.mostActiveCellGroup.name && (
          <div className="mb-2">
            <h3 className="text-lg font-medium mb-3">Cell Group Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4 bg-blue-50">
                <h3 className="text-sm font-medium text-blue-700">Most Active Cell Group</h3>
                <p className="text-xl font-bold text-blue-900">{stats.mostActiveCellGroup.name}</p>
                <p className="text-sm text-blue-700 mt-1">{stats.mostActiveCellGroup.count} meetings</p>
              </div>

              <div className="card p-4 bg-green-50">
                <h3 className="text-sm font-medium text-green-700">Most Visitors</h3>
                <p className="text-xl font-bold text-green-900">{stats.mostVisitorsCellGroup.name}</p>
                <p className="text-sm text-green-700 mt-1">{stats.mostVisitorsCellGroup.count} visitors</p>
              </div>

              <div className="card p-4 bg-purple-50">
                <h3 className="text-sm font-medium text-purple-700">Highest Attendance Rate</h3>
                <p className="text-xl font-bold text-purple-900">{stats.highestAttendanceRate.name}</p>
                <p className="text-sm text-purple-700 mt-1">{stats.highestAttendanceRate.rate}% attendance</p>
              </div>

              <div className="card p-4 bg-yellow-50">
                <h3 className="text-sm font-medium text-yellow-700">Growth Potential</h3>
                <p className="text-xl font-bold text-yellow-900">{stats.highestGrowthCellGroup.name}</p>
                <p className="text-sm text-yellow-700 mt-1">Based on visitor count</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cell Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cell Group</label>
              <input
                type="text"
                placeholder="Search cell group..."
                className="input-field"
                value={cellGroupFilter}
                onChange={(e) => setCellGroupFilter(e.target.value)}
              />
            </div>

            {/* Time Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
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
          </div>
        </div>

        <h3 className="text-lg font-medium mb-2">Meeting Type</h3>
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

      {/* Active Filters Summary with Statistics */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Active Filters:</span>

          {filter !== 'all' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Type: {getMeetingTypeLabel(filter)}
            </span>
          )}

          {timeFilter !== 'all' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Time: {timeFilter === 'week' ? 'Last 7 Days' :
                    timeFilter === 'month' ? 'Previous Month' :
                    timeFilter === 'quarter' ? 'Last 3 Months' : 'Last 365 Days'}
            </span>
          )}

          {cellGroupFilter && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              Cell Group: {cellGroupFilter}
            </span>
          )}

          {(filter !== 'all' || timeFilter !== 'all' || cellGroupFilter) && (
            <button
              onClick={() => {
                setFilter('all');
                setTimeFilter('all');
                setCellGroupFilter('');
              }}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600 mt-2">
          Showing {filteredRecords.length} of {records.length} records
        </p>
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
              {currentRecords.map((record) => (
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
                    <p className="mb-2">No attendance records found with the current filters.</p>
                    {(filter !== 'all' || timeFilter !== 'all' || cellGroupFilter) && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            setFilter('all');
                            setTimeFilter('all');
                            setCellGroupFilter('');
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastRecord, filteredRecords.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredRecords.length}</span> results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  className="input-field py-1 px-2 text-sm"
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
                    className={`px-3 py-1 rounded-l-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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
                          className={`px-3 py-1 ${currentPage === pageNum ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Current page indicator for mobile */}
                  <div className="sm:hidden px-3 py-1 bg-gray-100">
                    {currentPage} / {totalPages}
                  </div>

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-3 py-1 rounded-r-md ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No additional statistics needed at the bottom */}
    </div>
  );
}

// Main component with Suspense boundary
export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="p-4 flex justify-center items-center h-screen">Loading attendance data...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
