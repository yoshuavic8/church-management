'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';
import { EventCategory } from '../../types/ministry';

export default function AdminEvents() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>(['cell_group', 'prayer', 'ministry', 'service', 'other']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const eventsPerPage = 10;
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, searchQuery, currentPage, dateRange]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Calculate pagination
      const from = (currentPage - 1) * eventsPerPage;
      const to = from + eventsPerPage - 1;

      // Build query
      let query = supabase
        .from('attendance_meetings')
        .select(`
          id,
          meeting_date,
          meeting_type,
          event_category,
          topic,
          location,
          is_realtime,
          cell_group_id,
          ministry_id
        `, { count: 'exact' })
        .gte('meeting_date', dateRange.start)
        .lte('meeting_date', dateRange.end)
        .order('meeting_date', { ascending: false });

      // Get the data first without trying to join related tables
      const { data: meetingsData, error: meetingsError, count } = await query.range(from, to);

      if (meetingsError) throw meetingsError;

      // Now fetch related cell groups and ministries separately
      const cellGroupIds = meetingsData
        ?.filter(m => m.cell_group_id)
        .map(m => m.cell_group_id) || [];

      const ministryIds = meetingsData
        ?.filter(m => m.ministry_id)
        .map(m => m.ministry_id) || [];

      // Fetch cell groups
      let cellGroups = {};
      if (cellGroupIds.length > 0) {
        const { data: cellGroupsData } = await supabase
          .from('cell_groups')
          .select('id, name')
          .in('id', cellGroupIds);

        if (cellGroupsData) {
          cellGroups = cellGroupsData.reduce((acc, cg) => {
            acc[cg.id] = cg;
            return acc;
          }, {});
        }
      }

      // Fetch ministries
      let ministries = {};
      if (ministryIds.length > 0) {
        try {
          const { data: ministriesData } = await supabase
            .from('ministries')
            .select('id, name')
            .in('id', ministryIds);

          if (ministriesData) {
            ministries = ministriesData.reduce((acc, m) => {
              acc[m.id] = m;
              return acc;
            }, {});
          }
        } catch (error) {
          console.warn('Error fetching ministries:', error);
          // Continue without ministry data
        }
      }

      // Combine the data
      const events = meetingsData?.map(meeting => {
        return {
          ...meeting,
          cell_group: meeting.cell_group_id ? cellGroups[meeting.cell_group_id] : null,
          ministry: meeting.ministry_id ? ministries[meeting.ministry_id] : null
        };
      }) || [];

      // Filter events based on category if needed
      let filteredEvents = events;
      if (selectedCategory !== 'all') {
        filteredEvents = events.filter(event => event.event_category === selectedCategory);
      }

      // Filter events based on search query if provided
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredEvents = filteredEvents.filter(event =>
          (event.topic && event.topic.toLowerCase().includes(query)) ||
          (event.location && event.location.toLowerCase().includes(query))
        );
      }

      setEvents(filteredEvents);
      setTotalPages(count ? Math.ceil(count / eventsPerPage) : 1);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchEvents();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page on date range change
  };

  const getEventTypeLabel = (event: any) => {
    if (event.event_category === 'cell_group' && event.cell_group) {
      return `${event.cell_group.name} (Cell Group)`;
    } else if (event.event_category === 'ministry' && event.ministry) {
      return `${event.ministry.name} (Ministry)`;
    } else {
      return event.event_category.replace('_', ' ');
    }
  };

  // Define the action button for the header
  const actionButton = (
    <Link href="/admin/events/add" className="btn-primary">
      Add New Event
    </Link>
  );

  return (
    <div>
      <Header
        title="Manage Events"
        backTo="/admin"
        backLabel="Admin Dashboard"
        actions={actionButton}
      />

      {/* Filters and Search */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          {/* Date Range Filter */}
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="input-field flex-1"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="input-field flex-1"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-grow">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field flex-grow"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Events</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Loading events...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Realtime
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(event.meeting_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event.topic || event.meeting_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {getEventTypeLabel(event)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {event.location || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.is_realtime
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.is_realtime ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/attendance/${event.id}`} className="text-primary hover:underline mr-3">
                            View
                          </Link>
                          <Link href={`/attendance/${event.id}/edit`} className="text-primary hover:underline mr-3">
                            Edit
                          </Link>
                          <Link href={`/attendance/${event.id}/realtime`} className="text-primary hover:underline">
                            Attendance
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No events found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * eventsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * eventsPerPage, events.length + (currentPage - 1) * eventsPerPage)}
                      </span>{' '}
                      of <span className="font-medium">{totalPages * eventsPerPage}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </button>
                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === page
                              ? 'z-10 bg-primary border-primary text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
