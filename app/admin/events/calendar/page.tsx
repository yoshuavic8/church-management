'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';
import Link from 'next/link';

export default function EventCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Calculate first and last day of the month
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Get meetings without joins
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('attendance_meetings')
        .select(`
          id,
          meeting_date,
          meeting_type,
          event_category,
          topic,
          location,
          cell_group_id,
          ministry_id
        `)
        .gte('meeting_date', firstDay.toISOString().split('T')[0])
        .lte('meeting_date', lastDay.toISOString().split('T')[0])
        .order('meeting_date');

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

      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: Date, dayEvents: any[]) => {
    setSelectedDate(date);
    setSelectedEvents(dayEvents);
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

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  // Calendar rendering logic
  const renderCalendar = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);

    // Adjust start date to begin on Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // Adjust end date to end on Saturday
    const endDayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

    const rows = [];
    let days = [];
    let day = new Date(startDate);

    // Day names header
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate calendar rows
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dateStr = cloneDay.toISOString().split('T')[0];
        const dayEvents = events.filter(event => event.meeting_date === dateStr);

        days.push(
          <div
            key={dateStr}
            className={`
              p-2 border border-gray-200 min-h-[100px] cursor-pointer
              ${cloneDay.getMonth() !== currentMonth.getMonth() ? 'bg-gray-100' : ''}
              ${dateStr === new Date().toISOString().split('T')[0] ? 'bg-blue-50' : ''}
              ${selectedDate && dateStr === selectedDate.toISOString().split('T')[0] ? 'ring-2 ring-primary' : ''}
            `}
            onClick={() => handleDateClick(cloneDay, dayEvents)}
          >
            <div className="flex justify-between">
              <span className={`text-sm font-medium ${cloneDay.getMonth() !== currentMonth.getMonth() ? 'text-gray-400' : ''}`}>
                {cloneDay.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <span className="text-xs bg-primary text-white rounded-full px-2 py-0.5">
                  {dayEvents.length}
                </span>
              )}
            </div>
            <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
              {dayEvents.slice(0, 3).map(event => (
                <div key={event.id} className="text-xs p-1 rounded bg-gray-100 truncate">
                  {event.topic || getEventTypeLabel(event)}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </div>
        );

        day.setDate(day.getDate() + 1);
      }

      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-7">
          {dayNames.map(name => (
            <div key={name} className="p-2 text-center font-medium text-gray-700 bg-gray-100">
              {name}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  return (
    <div>
      <Header
        title="Event Calendar"
        backTo="/admin/events"
        backLabel="Events"
        actions={
          <Link href="/admin/events/add" className="btn-primary">
            Add New Event
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  &larr; Prev
                </button>
                <button
                  onClick={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(null);
                    setSelectedEvents([]);
                  }}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  Today
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                renderCalendar()
              )}
            </div>
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {selectedDate
                  ? selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  : 'Select a date to view events'}
              </h2>
            </div>
            <div className="p-4">
              {selectedDate ? (
                selectedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEvents.map(event => (
                      <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <h3 className="font-medium text-gray-900">
                          {event.topic || event.meeting_type}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {getEventTypeLabel(event)}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-500 mt-1">
                            Location: {event.location}
                          </p>
                        )}
                        <div className="mt-3 flex space-x-2">
                          <Link href={`/attendance/${event.id}`} className="text-xs text-primary hover:underline">
                            View
                          </Link>
                          <Link href={`/attendance/${event.id}/edit`} className="text-xs text-primary hover:underline">
                            Edit
                          </Link>
                          <Link href={`/attendance/${event.id}/realtime`} className="text-xs text-primary hover:underline">
                            Attendance
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No events scheduled for this date
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Click on a date to view events
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
