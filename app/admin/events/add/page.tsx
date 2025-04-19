'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';
import { EventCategory } from '../../../types/ministry';
import EventCategorySelector from '../../../attendance/components/EventCategorySelector';

export default function AddEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cellGroups, setCellGroups] = useState<any[]>([]);
  const [ministries, setMinistries] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    eventCategory: 'cell_group' as EventCategory,
    contextId: '',
    meetingDate: new Date().toISOString().split('T')[0],
    meetingType: 'regular',
    topic: '',
    location: '',
    notes: '',
    offering: '',
    isRecurring: false,
    recurrencePattern: 'weekly',
    recurrenceEndDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
    isRealtime: false
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchContexts();
  }, [formData.eventCategory]);

  const fetchContexts = async () => {
    try {
      const supabase = getSupabaseClient();

      if (formData.eventCategory === 'cell_group') {
        const { data, error } = await supabase
          .from('cell_groups')
          .select('id, name')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setCellGroups(data || []);
      } else if (formData.eventCategory === 'ministry') {
        try {
          const { data, error } = await supabase
            .from('ministries')
            .select('id, name')
            .eq('status', 'active')
            .order('name');

          if (error) {
            console.warn('Error fetching ministries:', error);
            setMinistries([]);
          } else {
            setMinistries(data || []);
          }
        } catch (error) {
          console.warn('Error fetching ministries:', error);
          setMinistries([]);
        }
      }
    } catch (error) {
      console.error('Error fetching contexts:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEventCategoryChange = (category: EventCategory) => {
    setFormData(prev => ({
      ...prev,
      eventCategory: category,
      contextId: '' // Reset context when category changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Parse offering value to float if provided
      const offeringValue = formData.offering ? parseFloat(formData.offering) : null;

      // Prepare base meeting record
      const baseMeetingRecord: any = {
        event_category: formData.eventCategory,
        meeting_type: formData.meetingType,
        topic: formData.topic,
        location: formData.location,
        notes: formData.notes,
        offering: offeringValue,
        is_realtime: formData.isRealtime
      };

      // Add the appropriate context ID based on event category
      if (formData.eventCategory === 'cell_group') {
        baseMeetingRecord.cell_group_id = formData.contextId;
      } else if (formData.eventCategory === 'ministry') {
        baseMeetingRecord.ministry_id = formData.contextId;
      }

      if (formData.isRecurring) {
        // Generate recurring events
        const events = generateRecurringEvents(
          formData.meetingDate,
          formData.recurrenceEndDate,
          formData.recurrencePattern,
          baseMeetingRecord
        );

        // Insert all events
        const { error } = await supabase
          .from('attendance_meetings')
          .insert(events);

        if (error) throw error;
      } else {
        // Insert single event
        const { error } = await supabase
          .from('attendance_meetings')
          .insert({
            ...baseMeetingRecord,
            meeting_date: formData.meetingDate
          });

        if (error) throw error;
      }

      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/events');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  // Function to generate recurring events
  const generateRecurringEvents = (startDate: string, endDate: string, pattern: string, baseRecord: any) => {
    const events = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let currentDate = new Date(start);

    while (currentDate <= end) {
      events.push({
        ...baseRecord,
        meeting_date: new Date(currentDate).toISOString().split('T')[0]
      });

      // Increment date based on pattern
      if (pattern === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (pattern === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (pattern === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (pattern === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return events;
  };

  return (
    <div>
      <Header
        title="Add New Event"
        backTo="/admin/events"
        backLabel="Events"
      />

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          Event created successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Category *
              </label>
              <EventCategorySelector
                value={formData.eventCategory}
                onChange={handleEventCategoryChange}
                disabled={loading}
              />
            </div>

            {/* Context Selection (Cell Group or Ministry) */}
            {(formData.eventCategory === 'cell_group' || formData.eventCategory === 'ministry') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.eventCategory === 'cell_group' ? 'Cell Group' : 'Ministry'} *
                </label>
                <select
                  name="contextId"
                  value={formData.contextId}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                  disabled={loading}
                >
                  <option value="">Select {formData.eventCategory === 'cell_group' ? 'a cell group' : 'a ministry'}</option>
                  {formData.eventCategory === 'cell_group'
                    ? cellGroups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))
                    : ministries.map(ministry => (
                        <option key={ministry.id} value={ministry.id}>
                          {ministry.name}
                        </option>
                      ))
                  }
                </select>
              </div>
            )}

            {/* Meeting Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="meetingDate"
                value={formData.meetingDate}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={loading}
              />
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type *
              </label>
              <select
                name="meetingType"
                value={formData.meetingType}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={loading}
              >
                <option value="regular">Regular</option>
                <option value="special">Special</option>
                <option value="training">Training</option>
                <option value="outreach">Outreach</option>
                <option value="fellowship">Fellowship</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Event topic or title"
                disabled={loading}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Event location"
                disabled={loading}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field w-full min-h-[100px]"
                placeholder="Additional notes about the event"
                disabled={loading}
              />
            </div>

            {/* Offering */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offering
              </label>
              <input
                type="number"
                name="offering"
                value={formData.offering}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Offering amount (if applicable)"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>

            {/* Realtime Attendance */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRealtime"
                name="isRealtime"
                checked={formData.isRealtime}
                onChange={(e) => setFormData(prev => ({ ...prev, isRealtime: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isRealtime" className="ml-2 block text-sm text-gray-700">
                Enable realtime attendance tracking
              </label>
            </div>

            {/* Recurring Event */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                  This is a recurring event
                </label>
              </div>

              {formData.isRecurring && (
                <div className="pl-6 space-y-4 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recurrence Pattern *
                    </label>
                    <select
                      name="recurrencePattern"
                      value={formData.recurrencePattern}
                      onChange={handleChange}
                      className="input-field w-full"
                      required
                      disabled={loading}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="recurrenceEndDate"
                      value={formData.recurrenceEndDate}
                      onChange={handleChange}
                      className="input-field w-full"
                      required
                      disabled={loading}
                      min={formData.meetingDate}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
