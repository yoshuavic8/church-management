'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../../../../../lib/supabase';
import Layout from '../../../../../../../components/layout/Layout';
import Card from '../../../../../../../components/ui/Card';
import Button from '../../../../../../../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../../../../../../../components/ui/Table';
import { Class, ClassLevel, ClassSession } from '../../../../../../../types/class';

interface Enrollment {
  id: string;
  member_id: string;
  member: {
    first_name: string;
    last_name: string;
  };
  status: string;
  attendance_status?: 'present' | 'absent' | 'late' | 'excused';
}

export default function SessionAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const { id: classId, levelId, sessionId } = params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [classData, setClassData] = useState<Class | null>(null);
  const [levelData, setLevelData] = useState<ClassLevel | null>(null);
  const [sessionData, setSessionData] = useState<ClassSession | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceMeetingId, setAttendanceMeetingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [classId, levelId, sessionId]);

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

      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('class_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      setSessionData(sessionData);
      setAttendanceMeetingId(sessionData.attendance_meeting_id);

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('class_enrollments')
        .select(`
          id,
          member_id,
          status,
          member:member_id(first_name, last_name)
        `)
        .eq('level_id', levelId)
        .eq('class_id', classId)
        .eq('status', 'enrolled')
        .order('id');

      if (enrollmentsError) throw enrollmentsError;

      // If attendance meeting already exists, fetch attendance records
      if (sessionData.attendance_meeting_id) {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_participants')
          .select('member_id, status')
          .eq('meeting_id', sessionData.attendance_meeting_id);

        if (attendanceError) throw attendanceError;

        // Merge attendance data with enrollments
        const enrollmentsWithAttendance = enrollmentsData.map((enrollment: any) => {
          const attendanceRecord = attendanceData?.find(a => a.member_id === enrollment.member_id);
          return {
            ...enrollment,
            attendance_status: attendanceRecord?.status || 'absent'
          };
        });

        setEnrollments(enrollmentsWithAttendance);
      } else {
        // No attendance meeting yet, set default status to 'present'
        setEnrollments(enrollmentsData.map((enrollment: any) => ({
          ...enrollment,
          attendance_status: 'present'
        })));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (memberId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setEnrollments(prev =>
      prev.map(enrollment => {
        if (enrollment.member_id === memberId) {
          return { ...enrollment, attendance_status: status };
        }
        return enrollment;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const supabase = getSupabaseClient();

      let meetingId = attendanceMeetingId;

      // Create attendance meeting if it doesn't exist
      if (!meetingId) {
        const { data: meetingData, error: meetingError } = await supabase
          .from('attendance_meetings')
          .insert({
            date: sessionData?.session_date,
            event_category: 'class',
            topic: sessionData?.title,
            location: sessionData?.location,
          })
          .select()
          .single();

        if (meetingError) throw meetingError;

        meetingId = meetingData.id;

        // Update session with attendance meeting id
        const { error: updateError } = await supabase
          .from('class_sessions')
          .update({ attendance_meeting_id: meetingId })
          .eq('id', sessionId);

        if (updateError) throw updateError;
      } else {
        // Delete existing attendance records
        const { error: deleteError } = await supabase
          .from('attendance_participants')
          .delete()
          .eq('meeting_id', meetingId);

        if (deleteError) throw deleteError;
      }

      // Prepare attendance data
      const attendanceData = enrollments.map(enrollment => ({
        meeting_id: meetingId,
        member_id: enrollment.member_id,
        status: enrollment.attendance_status,
      }));

      // Insert attendance records
      const { error: insertError } = await supabase
        .from('attendance_participants')
        .insert(attendanceData);

      if (insertError) throw insertError;

      setSuccess(true);

      // Redirect to session details page after a short delay
      setTimeout(() => {
        router.push(`/classes/${classId}/levels/${levelId}`);
      }, 1500);

    } catch (error: any) {
      setError(error.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  if (error || !classData || !levelData || !sessionData) {
    return (
      <Layout>
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Error Loading Session</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {error || 'Session not found'}
            </p>
            <div className="mt-6">
              <Link href={`/classes/${classId}/levels/${levelId}`}>
                <Button variant="primary">Back to Level</Button>
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
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Record Attendance</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Session: {sessionData.title} ({formatDate(sessionData.session_date)})
          </p>
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
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Attendance Recorded Successfully</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Redirecting to level details page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded border border-error-200 bg-error-50 px-4 py-3 text-error-700 dark:border-error-700 dark:bg-error-900/50 dark:text-error-400">
                {error}
              </div>
            )}

            {enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Students Enrolled</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  There are no students enrolled in this level to record attendance for.
                </p>
                <div className="mt-6">
                  <Link href={`/classes/${classId}/levels/${levelId}/enroll`}>
                    <Button variant="primary">Enroll Students</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">Student Attendance</h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {enrollments.length} student{enrollments.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell header>Name</TableCell>
                      <TableCell header>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          {enrollment.member.first_name} {enrollment.member.last_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(enrollment.member_id, 'present')}
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                enrollment.attendance_status === 'present'
                                  ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(enrollment.member_id, 'absent')}
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                enrollment.attendance_status === 'absent'
                                  ? 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(enrollment.member_id, 'late')}
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                enrollment.attendance_status === 'late'
                                  ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(enrollment.member_id, 'excused')}
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                enrollment.attendance_status === 'excused'
                                  ? 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 flex justify-end space-x-3">
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
                    Save Attendance
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </Card>
    </Layout>
  );
}
