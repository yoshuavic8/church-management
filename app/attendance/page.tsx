'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { apiClient } from '../lib/api-client';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

import EditMeetingModal from '../components/EditMeetingModal';
import DeleteMeetingModal from '../components/DeleteMeetingModal';
import AddMeetingModal from '../components/AddMeetingModal';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Define types 
type AttendanceMeeting = {
  id: string;
  event_category: 'cell_group' | 'ministry' | 'sunday_service' | 'special_event' | 'prayer' | 'class' | 'other';
  meeting_date: string;
  meeting_type: 'regular' | 'special' | 'outreach' | 'training';
  topic: string;
  location: string;
  offering?: number;
  is_realtime: boolean;
  created_at: string;
  cell_group?: {
    id: string;
    name: string;
  };
  ministry?: {
    id: string;
    name: string;
  };
  class_sessions?: {
    id: string;
    title: string;
    class?: {
      id: string;
      name: string;
    };
    level?: {
      id: string;
      name: string;
    };
  }[];
  _count: {
    participants: number;
    visitors: number;
  };
};

// Client-side component for attendance
function AttendanceContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [meetings, setMeetings] = useState<AttendanceMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Date filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal state
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [isEditMeetingModalOpen, setIsEditMeetingModalOpen] = useState(false);
  const [isDeleteMeetingModalOpen, setIsDeleteMeetingModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [selectedMeetingForDelete, setSelectedMeetingForDelete] = useState<any>(null);

  // Check for edit parameter in URL
  useEffect(() => {
    const editMeetingId = searchParams.get('edit');
    if (editMeetingId) {
      setSelectedMeetingId(editMeetingId);
      setIsEditMeetingModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);

        if (!user) {
          throw new Error('Authentication required. Please login.');
        }

        // Build API parameters
        const params: any = {
          page: currentPage,
          limit: recordsPerPage,
        };
        
        if (selectedCategory !== 'all') {
          params.event_category = selectedCategory;
        }
        
        if (startDate) {
          params.date_from = startDate;
        }
        
        if (endDate) {
          params.date_to = endDate;
        }

        const response = await apiClient.getAttendanceMeetings(params);

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch attendance meetings');
        }

        setMeetings(response.data || []);
        
        // Set pagination info from API response
        if (response.pagination) {
          setTotalRecords(response.pagination.total);
          setTotalPages(response.pagination.totalPages);
        }
        
        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch attendance meetings');
        setLoading(false);
      }
    };

    if (user) {
      fetchMeetings();
    }
  }, [user, currentPage, recordsPerPage, selectedCategory, startDate, endDate]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, startDate, endDate, recordsPerPage]);

  // Handle edit meeting
  const handleEditMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setIsEditMeetingModalOpen(true);
  };

  // Handle delete meeting
  const handleDeleteMeeting = (meeting: any) => {
    setSelectedMeetingForDelete(meeting);
    setIsDeleteMeetingModalOpen(true);
  };

  // Handle successful modal operations
  const handleModalSuccess = () => {
    // Force refresh by updating a dependency that triggers useEffect
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {
          page: currentPage,
          limit: recordsPerPage,
        };
        
        if (selectedCategory !== 'all') {
          params.event_category = selectedCategory;
        }
        
        if (startDate) {
          params.date_from = startDate;
        }
        
        if (endDate) {
          params.date_to = endDate;
        }

        const response = await apiClient.getAttendanceMeetings(params);

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch attendance meetings');
        }

        setMeetings(response.data || []);
        
        // Set pagination info from API response
        if (response.pagination) {
          setTotalRecords(response.pagination.total);
          setTotalPages(response.pagination.totalPages);
        }
        
        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch attendance meetings');
        setLoading(false);
      }
    };

    // Immediately refresh data
    if (user) {
      fetchMeetings();
    }
    
    // Clear edit parameter from URL if present
    if (searchParams.get('edit')) {
      window.history.replaceState({}, '', '/attendance');
    }
  };

  // Handle modal close
  const handleCloseEditModal = () => {
    setIsEditMeetingModalOpen(false);
    setSelectedMeetingId(null);
    // Clear edit parameter from URL if present
    if (searchParams.get('edit')) {
      window.history.replaceState({}, '', '/attendance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading attendance meetings</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600 mt-1">
              Track and manage attendance for church meetings and events
            </p>
          </div>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => setIsAddMeetingModalOpen(true)}
          >
            New Meeting
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="cell_group">Cell Groups</option>
              <option value="ministry">Ministries</option>
              <option value="class">Classes</option>
              <option value="sunday_service">Sunday Service</option>
              <option value="special_event">Special Events</option>
              <option value="prayer">Prayer Meetings</option>
            </select>
          </div>
          
          {/* Start Date Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          {/* End Date Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          {/* Records Per Page */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Records per page:</label>
            <select
              value={recordsPerPage}
              onChange={(e) => setRecordsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        {/* Filter Summary */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Showing {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)} to{' '}
              {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords} meetings
            </span>
          </div>
          
          {(selectedCategory !== 'all' || startDate || endDate) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Current Page</h3>
              <p className="text-2xl font-bold text-indigo-600">{meetings.length}</p>
              <p className="text-xs text-gray-400">of {totalRecords} total</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Total Participants</h3>
              <p className="text-2xl font-bold text-green-600">
                {meetings.reduce((sum, meeting) => sum + meeting._count.participants, 0)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Total Visitors</h3>
              <p className="text-2xl font-bold text-purple-600">
                {meetings.reduce((sum, meeting) => sum + meeting._count.visitors, 0)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Avg Attendance</h3>
              <p className="text-2xl font-bold text-blue-600">
                {meetings.length > 0 
                  ? Math.round((meetings.reduce((sum, meeting) => sum + meeting._count.participants + meeting._count.visitors, 0) / meetings.length) * 10) / 10
                  : 0
                }
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Meetings</h3>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              {selectedCategory === 'all' ? 'No meetings found' : `No ${selectedCategory.replace('_', ' ')} meetings found`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCategory === 'all' 
                ? 'Get started by creating a new meeting'
                : 'Try selecting a different category or clear the filter'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meeting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {meeting.topic}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(meeting.meeting_date).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {meeting.event_category.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {meeting.cell_group?.name || 
                           meeting.ministry?.name || 
                           (meeting.class_sessions && meeting.class_sessions.length > 0 
                             ? `${meeting.class_sessions[0].class?.name}${meeting.class_sessions[0].level ? ` - ${meeting.class_sessions[0].level.name}` : ''}`
                             : '-')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{meeting.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 mr-2">
                          {meeting._count.participants} attended
                        </div>
                        {meeting._count.visitors > 0 && (
                          <div className="text-sm text-gray-500">
                            + {meeting._count.visitors} visitors
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        meeting.meeting_type === 'regular' 
                          ? 'bg-blue-100 text-blue-800'
                          : meeting.meeting_type === 'special'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {meeting.meeting_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/attendance/${meeting.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View Details
                      </Link>
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={() => handleEditMeeting(meeting.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteMeeting(meeting)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  // Adjust start page if we're near the end
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          i === currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Meeting Modal */}
      <AddMeetingModal
        isOpen={isAddMeetingModalOpen}
        onClose={() => setIsAddMeetingModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Edit Meeting Modal */}
      {selectedMeetingId && (
        <EditMeetingModal
          isOpen={isEditMeetingModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleModalSuccess}
          meetingId={selectedMeetingId}
        />
      )}

      {/* Delete Meeting Modal */}
      <DeleteMeetingModal
        isOpen={isDeleteMeetingModalOpen}
        onClose={() => {
          setIsDeleteMeetingModalOpen(false);
          setSelectedMeetingForDelete(null);
        }}
        onSuccess={handleModalSuccess}
        meeting={selectedMeetingForDelete}
      />
    </div>
  );
}

export default function AttendancePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }>
          <AttendanceContent />
        </Suspense>
      </Layout>
    </ProtectedRoute>
  );
}
