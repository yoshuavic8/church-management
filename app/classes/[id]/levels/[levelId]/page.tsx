'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../../lib/supabase';
import Layout from '../../../../components/layout/Layout';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../../../../components/ui/Table';
import { Class, ClassLevel, ClassSession, ClassEnrollment } from '../../../../types/class';

export default function ClassLevelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id: classId, levelId } = params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [levelData, setLevelData] = useState<ClassLevel | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [activeTab, setActiveTab] = useState<'sessions' | 'students'>('sessions');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ClassSession | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<ClassEnrollment | null>(null);
  const [deletingEnrollment, setDeletingEnrollment] = useState(false);

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

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('class_sessions')
        .select(`
          *,
          instructor:instructor_id(first_name, last_name)
        `)
        .eq('level_id', levelId)
        .order('session_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (sessionsError) throw sessionsError;

      setSessions(sessionsData || []);

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('class_enrollments')
        .select(`
          *,
          member:member_id(first_name, last_name, email, phone)
        `)
        .eq('level_id', levelId)
        .eq('class_id', classId)
        .order('enrollment_date', { ascending: false });

      if (enrollmentsError) throw enrollmentsError;

      setEnrollments(enrollmentsData || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Handle level deletion
  const handleDeleteLevel = async () => {
    try {
      setDeleting(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Delete the level (cascade delete will handle related records)
      const { error } = await supabase
        .from('class_levels')
        .delete()
        .eq('id', levelId);

      if (error) throw error;

      // Redirect to class details page
      router.push(`/classes/${classId}`);
    } catch (error: any) {
      setError(error.message || 'Failed to delete level');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle session deletion
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      setDeletingSession(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Delete the session
      const { error } = await supabase
        .from('class_sessions')
        .delete()
        .eq('id', sessionToDelete.id);

      if (error) throw error;

      // Update the sessions list
      setSessions(sessions.filter(session => session.id !== sessionToDelete.id));
      setSessionToDelete(null);
    } catch (error: any) {
      setError(error.message || 'Failed to delete session');
    } finally {
      setDeletingSession(false);
    }
  };

  // Handle enrollment deletion
  const handleDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return;

    try {
      setDeletingEnrollment(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Delete the enrollment
      const { error } = await supabase
        .from('class_enrollments')
        .delete()
        .eq('id', enrollmentToDelete.id);

      if (error) throw error;

      // Update the enrollments list
      setEnrollments(enrollments.filter(enrollment => enrollment.id !== enrollmentToDelete.id));
      setEnrollmentToDelete(null);
    } catch (error: any) {
      setError(error.message || 'Failed to delete enrollment');
    } finally {
      setDeletingEnrollment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    // Format time from "HH:MM:SS" to "HH:MM AM/PM"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

  if (error || !classData || !levelData) {
    return (
      <Layout>
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Error Loading Level</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {error || 'Level not found'}
            </p>
            <div className="mt-6">
              <Link href={`/classes/${classId}`}>
                <Button variant="primary">Back to Class</Button>
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
            <Link href={`/classes/${classId}`} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {classData.name}
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">{levelData.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">Level {levelData.order_number}</p>
        </div>
        <div className="mt-4 flex gap-2 sm:mt-0">
          <Link href={`/classes/${classId}/levels/${levelId}/edit`}>
            <Button variant="outline">
              Edit Level
            </Button>
          </Link>
          <Link href={`/classes/${classId}/levels/${levelId}/sessions/add`}>
            <Button variant="primary">
              Add Session
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Level
          </Button>
        </div>
      </div>

      {/* Level Info */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">Level Information</h2>
            {levelData.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">{levelData.description}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Number</h3>
              <p className="text-gray-800 dark:text-white/90">{levelData.order_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sessions</h3>
              <p className="text-gray-800 dark:text-white/90">{sessions.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Students</h3>
              <p className="text-gray-800 dark:text-white/90">{enrollments.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Prerequisite</h3>
              <p className="text-gray-800 dark:text-white/90">
                {levelData.prerequisite_level_id ? 'Yes' : 'None'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
              activeTab === 'sessions'
                ? 'border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions ({sessions.length})
          </button>
          <button
            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
              activeTab === 'students'
                ? 'border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('students')}
          >
            Students ({enrollments.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'sessions' && (
        <Card>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Sessions Added Yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding the first session to this level.
              </p>
              <div className="mt-6">
                <Link href={`/classes/${classId}/levels/${levelId}/sessions/add`}>
                  <Button variant="primary">Add First Session</Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>#</TableCell>
                  <TableCell header>Title</TableCell>
                  <TableCell header>Date</TableCell>
                  <TableCell header>Time</TableCell>
                  <TableCell header>Location</TableCell>
                  <TableCell header>Instructor</TableCell>
                  <TableCell header>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session, index) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.order_number}</TableCell>
                    <TableCell>{session.title}</TableCell>
                    <TableCell>{formatDate(session.session_date)}</TableCell>
                    <TableCell>{formatTime(session.start_time)} - {formatTime(session.end_time)}</TableCell>
                    <TableCell>{session.location || '-'}</TableCell>
                    <TableCell>
                      {session.instructor
                        ? `${session.instructor.first_name} ${session.instructor.last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {session.attendance_meeting_id ? (
                          <Link href={`/attendance/meetings/${session.attendance_meeting_id}`}>
                            <Button variant="outline" size="sm">Attendance</Button>
                          </Link>
                        ) : (
                          <Link href={`/classes/${classId}/levels/${levelId}/sessions/${session.id}/attendance`}>
                            <Button variant="outline" size="sm">Record Attendance</Button>
                          </Link>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setSessionToDelete(session)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {activeTab === 'students' && (
        <Card>
          {enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Students Enrolled Yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enroll students to this level to get started.
              </p>
              <div className="mt-6">
                <Link href={`/classes/${classId}/levels/${levelId}/enroll`}>
                  <Button variant="primary">Enroll Students</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-end">
                <Link href={`/classes/${classId}/levels/${levelId}/enroll`}>
                  <Button variant="outline" size="sm">
                    Enroll More Students
                  </Button>
                </Link>
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell header>Name</TableCell>
                    <TableCell header>Email</TableCell>
                    <TableCell header>Phone</TableCell>
                    <TableCell header>Enrollment Date</TableCell>
                    <TableCell header>Status</TableCell>
                    <TableCell header>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        {enrollment.member
                          ? `${enrollment.member.first_name} ${enrollment.member.last_name}`
                          : '-'}
                      </TableCell>
                      <TableCell>{enrollment.member?.email || '-'}</TableCell>
                      <TableCell>{enrollment.member?.phone || '-'}</TableCell>
                      <TableCell>{formatDate(enrollment.enrollment_date)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          enrollment.status === 'completed'
                            ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                            : enrollment.status === 'dropped'
                            ? 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400'
                            : 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400'
                        }`}>
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/members/${enrollment.member_id}`}>
                            <Button variant="outline" size="sm">View Member</Button>
                          </Link>
                          <Link href={`/classes/${classId}/levels/${levelId}/enrollments/${enrollment.id}`}>
                            <Button variant="outline" size="sm">Update Status</Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setEnrollmentToDelete(enrollment)}
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Card>
      )}

      {/* Delete Level Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Confirm Deletion</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete <strong>{levelData?.name}</strong> (Level {levelData?.order_number})? This will permanently remove the level and all its sessions and enrollments. This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteLevel}
                disabled={deleting}
                isLoading={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Level'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Session Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Confirm Session Deletion</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete the session <strong>{sessionToDelete.title}</strong> scheduled for {formatDate(sessionToDelete.session_date)}? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setSessionToDelete(null)}
                disabled={deletingSession}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteSession}
                disabled={deletingSession}
                isLoading={deletingSession}
              >
                {deletingSession ? 'Deleting...' : 'Delete Session'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Enrollment Confirmation Modal */}
      {enrollmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Confirm Student Removal</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to remove <strong>{enrollmentToDelete.member ? `${enrollmentToDelete.member.first_name} ${enrollmentToDelete.member.last_name}` : 'this student'}</strong> from this level? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setEnrollmentToDelete(null)}
                disabled={deletingEnrollment}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteEnrollment}
                disabled={deletingEnrollment}
                isLoading={deletingEnrollment}
              >
                {deletingEnrollment ? 'Removing...' : 'Remove Student'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
