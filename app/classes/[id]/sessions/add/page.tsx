'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../../lib/supabase';
import Layout from '../../../../components/layout/Layout';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Class } from '../../../../types/class';

// Define Instructor type
interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
}

export default function AddClassSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { id: classId } = params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [classData, setClassData] = useState(null);
  const [instructors, setInstructors] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    session_date: '',
    start_time: '',
    end_time: '',
    location: '',
    instructor_id: '',
    order_number: 1,
    create_attendance: true,
  });

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Fetch class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      setClassData(classData);

      // Fetch instructors (members who can be instructors)
      const { data: instructorsData, error: instructorsError } = await supabase
        .from('members')
        .select('id, first_name, last_name')
        .eq('status', 'active')
        .order('first_name');

      if (instructorsError) throw instructorsError;

      setInstructors(instructorsData || []);

      // Get next order number
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('class_sessions')
        .select('order_number')
        .eq('class_id', classId)
        .is('level_id', null)
        .order('order_number', { ascending: false })
        .limit(1);

      if (sessionsError) throw sessionsError;

      const nextOrderNumber = sessionsData && sessionsData.length > 0
        ? sessionsData[0].order_number + 1
        : 1;

      setFormData(prev => ({ ...prev, order_number: nextOrderNumber }));
    } catch (error) {
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const supabase = getSupabaseClient();

      // Prepare session data
      const sessionDataToInsert = {
        class_id: classId,
        level_id: null, // This is a direct class session (no level)
        title: formData.title,
        description: formData.description || null,
        session_date: formData.session_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location || null,
        instructor_id: formData.instructor_id || null,
        order_number: formData.order_number,
      };

      // Insert session
      const { data: sessionData, error: sessionError } = await supabase
        .from('class_sessions')
        .insert(sessionDataToInsert)
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create attendance meeting if requested
      if (formData.create_attendance) {
        const meetingDataToInsert = {
          title: `${classData?.name} - ${formData.title}`,
          event_date: formData.session_date,
          meeting_date: formData.session_date, // Add meeting_date to satisfy NOT NULL constraint
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location || null,
          event_type: 'class',
          event_category: 'class',
          meeting_type: 'class', // Add meeting_type for backward compatibility
          notes: formData.description || null,
          leader_id: formData.instructor_id || null,
        };

        const { data: meetingData, error: meetingError } = await supabase
          .from('attendance_meetings')
          .insert(meetingDataToInsert)
          .select()
          .single();

        if (meetingError) throw meetingError;

        // Link attendance meeting to session
        const { error: updateError } = await supabase
          .from('class_sessions')
          .update({ attendance_meeting_id: meetingData.id })
          .eq('id', sessionData.id);

        if (updateError) throw updateError;
      }

      setSuccess(true);

      // Redirect to class details page after a short delay
      setTimeout(() => {
        router.push(`/classes/${classId}`);
      }, 1500);

    } catch (error) {
      setError(error.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading state
  const renderLoading = () => {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-brand-600"></div>
        </div>
      </Layout>
    );
  };

  // Render error state
  const renderError = () => {
    return (
      <Layout>
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Class Not Found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The class you're trying to add a session to doesn't exist.
            </p>
            <div className="mt-6">
              <Link href="/classes">
                <Button variant="primary">Back to Classes</Button>
              </Link>
            </div>
          </div>
        </Card>
      </Layout>
    );
  };

  // Render main form
  const renderForm = () => {
    return (
      <Layout>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/classes/${classId}`} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Class
                </span>
              </Link>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Add Session to {classData.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">Create a new session for this class</p>
          </div>
        </div>

        <Card>
          {success ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-success-100 p-3">
                <svg className="h-8 w-8 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Session Created Successfully</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Redirecting to class details page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded border border-error-200 bg-error-50 px-4 py-3 text-error-700 dark:border-error-700 dark:bg-error-900/50 dark:text-error-400">
                  {error}
                </div>
              )}

              <div>
                <Input
                  label="Session Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-brand-500 dark:focus:ring-brand-500"
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Date"
                  name="session_date"
                  type="date"
                  value={formData.session_date}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />

                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Start Time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />

                <Input
                  label="End Time"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Select
                  label="Instructor"
                  name="instructor_id"
                  value={formData.instructor_id}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Instructor (Optional)' },
                    ...instructors.map(instructor => ({
                      value: instructor.id,
                      label: `${instructor.first_name} ${instructor.last_name}`
                    }))
                  ]}
                  disabled={submitting}
                />

                <Input
                  label="Order Number"
                  name="order_number"
                  type="number"
                  value={formData.order_number.toString()}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center">
                <input
                  id="create-attendance"
                  name="create_attendance"
                  type="checkbox"
                  checked={formData.create_attendance}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:focus:ring-brand-500"
                  disabled={submitting}
                />
                <label htmlFor="create-attendance" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Create attendance meeting for this session
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/classes/${classId}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                >
                  Create Session
                </Button>
              </div>
            </form>
          )}
        </Card>
      </Layout>
    );
  };

  if (loading) {
    return renderLoading();
  }

  if (!classData) {
    return renderError();
  }

  return renderForm();
}
