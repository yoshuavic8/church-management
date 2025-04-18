'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';

export default function MemberAttendance() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0
  });
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'quarter' | 'year'>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [timeFilter]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Calculate date range based on filter
      const today = new Date();
      let startDate = new Date();
      
      if (timeFilter === 'month') {
        startDate.setMonth(today.getMonth() - 1);
      } else if (timeFilter === 'quarter') {
        startDate.setMonth(today.getMonth() - 3);
      } else if (timeFilter === 'year') {
        startDate.setFullYear(today.getFullYear() - 1);
      } else {
        // All time - set to a far past date
        startDate = new Date(2000, 0, 1);
      }
      
      // Fetch attendance records
      const { data, error } = await supabase
        .from('attendance_participants')
        .select(`
          id,
          status,
          meeting:meeting_id (
            id,
            meeting_date,
            meeting_type,
            topic,
            event_category,
            cell_group:cell_group_id (name),
            ministry:ministry_id (name)
          )
        `)
        .eq('member_id', user.id)
        .gte('meeting.meeting_date', startDate.toISOString())
        .lte('meeting.meeting_date', today.toISOString())
        .order('meeting.meeting_date', { ascending: false });
        
      if (error) throw error;
      
      // Process records
      const processedRecords = data.map((record: any) => ({
        id: record.id,
        meeting_id: record.meeting.id,
        meeting_date: record.meeting.meeting_date,
        meeting_type: record.meeting.meeting_type,
        topic: record.meeting.topic,
        event_category: record.meeting.event_category,
        context_name: getContextName(record.meeting),
        status: record.status
      }));
      
      setRecords(processedRecords);
      
      // Calculate statistics
      const total = processedRecords.length;
      const present = processedRecords.filter(r => r.status === 'present').length;
      const absent = processedRecords.filter(r => r.status === 'absent').length;
      const late = processedRecords.filter(r => r.status === 'late').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      setStats({
        total,
        present,
        absent,
        late,
        percentage
      });
      
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const getContextName = (meeting: any) => {
    if (meeting.event_category === 'cell_group' && meeting.cell_group) {
      return meeting.cell_group.name;
    } else if (meeting.event_category === 'ministry' && meeting.ministry) {
      return meeting.ministry.name;
    } else {
      return meeting.event_category.replace('_', ' ');
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'regular': 'Regular Meeting',
      'special': 'Special Meeting',
      'outreach': 'Outreach',
      'prayer': 'Prayer Meeting',
      'service': 'Church Service',
      'training': 'Training',
      'other': 'Other'
    };
    return labels[type] || type.replace('_', ' ');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string, color: string }> = {
      'present': { label: 'Present', color: 'bg-green-100 text-green-800' },
      'absent': { label: 'Absent', color: 'bg-red-100 text-red-800' },
      'late': { label: 'Late', color: 'bg-yellow-100 text-yellow-800' },
      'excused': { label: 'Excused', color: 'bg-blue-100 text-blue-800' }
    };
    return labels[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Attendance History</h2>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total Meetings</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-green-600">Present</p>
            <p className="text-2xl font-bold text-green-700">{stats.present}</p>
            <p className="text-xs text-green-600">
              {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-sm text-red-600">Absent</p>
            <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
            <p className="text-xs text-red-600">
              {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-sm text-yellow-600">Late</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
            <p className="text-xs text-yellow-600">
              {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-600">Attendance Rate</p>
            <p className="text-2xl font-bold text-blue-700">{stats.percentage}%</p>
          </div>
        </div>
        
        {/* Time Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Time Period</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'month' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Last Month
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
              Last Year
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All Time
            </button>
          </div>
        </div>
        
        {/* Attendance Records */}
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
                  <th className="py-3 px-4 text-left">Context</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRecords.length > 0 ? (
                  currentRecords.map((record) => {
                    const statusInfo = getStatusLabel(record.status);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(record.meeting_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{record.context_name}</div>
                          {record.topic && (
                            <div className="text-xs text-gray-500">{record.topic}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">{getMeetingTypeLabel(record.meeting_type)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No attendance records found</p>
                        <p className="text-sm text-gray-400 mb-4">Try selecting a different time period</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {records.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 pt-4">
                <div className="mb-4 sm:mb-0">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastRecord, records.length)}
                    </span>{' '}
                    of <span className="font-medium">{records.length}</span> results
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
                  </select>
                  
                  <nav className="flex items-center">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 rounded-md ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      &laquo; Prev
                    </button>
                    
                    <span className="px-3 py-1">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 rounded-md ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Next &raquo;
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Quick Check-in Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-medium text-gray-900">Need to check in?</h2>
            <p className="text-sm text-gray-500 mt-1">
              Use our self check-in feature to quickly record your attendance
            </p>
          </div>
          <Link 
            href="/self-checkin" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            Go to Self Check-in
          </Link>
        </div>
      </div>
    </div>
  );
}
