'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../../../../lib/supabase';
import Layout from '../../../../../../components/layout/Layout';
import Card from '../../../../../../components/ui/Card';
import Button from '../../../../../../components/ui/Button';
import Input from '../../../../../../components/ui/Input';
import Select from '../../../../../../components/ui/Select';
import { Class, ClassLevel } from '../../../../../../types/class';

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
}

export default function AddClassSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { id: classId, levelId } = params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [classData, setClassData] = useState<Class | null>(null);
  const [levelData, setLevelData] = useState<ClassLevel | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

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
  }, [classId, levelId]);

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

      // Fetch level details
      const { data: levelData, error: levelError } = await supabase
        .from('class_levels')
        .select('*')
        .eq('id', levelId)
        .single();

      if (levelError) throw levelError;

      setLevelData(levelData);

      // Fetch existing sessions to determine next order number
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('class_sessions')
        .select('order_number')
        .eq('level_id', levelId)
        .order('order_number', { ascending: false })
        .limit(1);

      if (sessionsError) throw sessionsError;

      if (sessionsData && sessionsData.length > 0) {
        setFormData(prev => ({ ...prev, order_number: sessionsData[0].order_number + 1 }));
      }

      // Fetch potential instructors (all members)
      const { data: instructorsData, error: instructorsError } = await supabase
        .from('members')
        .select('id, first_name, last_name')
        .eq('status', 'active')
        .order('first_name');

      if (instructorsError) throw instructorsError;

      setInstructors(instructorsData || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const supabase = getSupabaseClient();
      
      // Create attendance meeting if requested
      let attendanceMeetingId = null;
      
      if (formData.create_attendance) {
        const { data: meetingData, error: meetingError } = await supabase
          .from('attendance_meetings')
          .insert({
            date: formData.session_date,
            event_category: 'class',
            topic: formData.title,
            location: formData.location,
          })
          .select()
          .single();
        
        if (meetingError) throw meetingError;
        
        attendanceMeetingId = meetingData.id;
      }
      
      // Prepare data for submission
      const sessionData = {
        level_id: levelId,
        title: formData.title,
        description: formData.description || null,
        session_date: formData.session_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location || null,
        instructor_id: formData.instructor_id || null,
        order_number: parseInt(formData.order_number.toString()),
        attendance_meeting_id: attendanceMeetingId,
      };
      
      // Insert session record
      const { data, error } = await supabase
        .from('class_sessions')
        .insert(sessionData)
        .select()
        .single();
      
      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to level details page after a short delay
      setTimeout(() => {
        router.push(`/classes/${classId}/levels/${levelId}`);
      }, 1500);
      
    } catch (error: any) {
      setError(error.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
        </div>
      </Layout>
    );
  }

  if (!classData || !levelData) {
    return (
      <Layout>
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Class or Level Not Found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The class or level you're trying to add a session to doesn't exist.
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
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/classes/${classId}/levels/${levelId}`} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {classData.name} - {levelData.name}
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Add New Session</h1>
          <p className="text-gray-500 dark:text-gray-400">Create a new session for {levelData.name}</p>
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
              Redirecting to level details page...
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
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-brand-500 dark:focus:ring-brand-500"
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="Session Date"
                name="session_date"
                type="date"
                value={formData.session_date}
                onChange={handleChange}
                required
                disabled={submitting}
              />

              <Input
                label="Order Number"
                name="order_number"
                type="number"
                min="1"
                value={formData.order_number.toString()}
                onChange={handleChange}
                required
                disabled={submitting}
                helperText="Sequence number for this session"
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
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={submitting}
              />

              <Select
                label="Instructor"
                name="instructor_id"
                value={formData.instructor_id}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select an instructor' },
                  ...instructors.map(instructor => ({
                    value: instructor.id,
                    label: `${instructor.first_name} ${instructor.last_name}`
                  }))
                ]}
                disabled={submitting}
              />
            </div>

            <div className="flex items-center">
              <input
                id="create_attendance"
                name="create_attendance"
                type="checkbox"
                checked={formData.create_attendance}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-brand-500"
              />
              <label htmlFor="create_attendance" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Create attendance record for this session
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/classes/${classId}/levels/${levelId}`)}
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
}
