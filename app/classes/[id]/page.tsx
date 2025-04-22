'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { Class, ClassLevel, ClassCategory } from '../../types/class';

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);
  const [levels, setLevels] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [activeTab, setActiveTab] = useState('levels');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchClassData();
  }, [id]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Fetch class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();

      if (classError) throw classError;

      setClassData(classData);

      if (classData.has_levels) {
        // Fetch class levels
        const { data: levelsData, error: levelsError } = await supabase
          .from('class_levels')
          .select(`
            *,
            session_count:class_sessions(count),
            student_count:class_enrollments(count)
          `)
          .eq('class_id', id)
          .order('order_number');

        if (levelsError) throw levelsError;

        setLevels(levelsData || []);

        // Get total student count
        const { count, error: countError } = await supabase
          .from('class_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', id);

        if (countError) throw countError;

        setStudentCount(count || 0);
      } else {
        // Fetch direct sessions for classes without levels
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('class_sessions')
          .select(`
            *,
            instructor:instructor_id(first_name, last_name)
          `)
          .eq('class_id', id)
          .is('level_id', null)
          .order('session_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (sessionsError) throw sessionsError;

        setSessions(sessionsData || []);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch class data');
    } finally {
      setLoading(false);
    }
  };

  // Handle class deletion
  const handleDeleteClass = async () => {
    try {
      setDeleting(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Delete the class (cascade delete will handle related records)
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Redirect to classes list
      router.push('/classes');
    } catch (error) {
      setError(error.message || 'Failed to delete class');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Get category label
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'bible_study':
        return 'Bible Study';
      case 'counseling':
        return 'Counseling';
      case 'discipleship':
        return 'Discipleship';
      case 'leadership':
        return 'Leadership';
      case 'other':
        return 'Other';
      default:
        return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'primary';
      default:
        return 'secondary';
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

  if (error || !classData) {
    return (
      <Layout>
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Error Loading Class</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {error || 'Class not found'}
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

  // Render main content
  const renderMainContent = () => {
    return (
      <Layout>
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/classes" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Classes
                </span>
              </Link>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">{classData.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(classData.status)}>
                {classData.status.charAt(0).toUpperCase() + classData.status.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getCategoryLabel(classData.category)}
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-2 sm:mt-0">
            <Link href={`/classes/${id}/edit`}>
              <Button variant="outline">
                Edit Class
              </Button>
            </Link>
            {classData.has_levels ? (
              <Link href={`/classes/${id}/levels/add`}>
                <Button variant="primary">
                  Add Level
                </Button>
              </Link>
            ) : (
              <Link href={`/classes/${id}/sessions/add`}>
                <Button variant="primary">
                  Add Session
                </Button>
              </Link>
            )}
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Class
            </Button>
          </div>
        </div>

        {/* Class Info */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">Class Information</h2>
              {classData.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">{classData.description}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
                <p className="text-gray-800 dark:text-white/90">{getCategoryLabel(classData.category)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                <p className="text-gray-800 dark:text-white/90">{classData.status.charAt(0).toUpperCase() + classData.status.slice(1)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Students</h3>
                <p className="text-gray-800 dark:text-white/90">{classData.max_students || 'Unlimited'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Students</h3>
                <p className="text-gray-800 dark:text-white/90">{studentCount}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap -mb-px">
            {classData.has_levels ? (
              <div className="flex">
                <button
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                    activeTab === 'levels'
                      ? 'border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setActiveTab('levels')}
                >
                  Levels ({levels.length})
                </button>
                <button
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                    activeTab === 'students'
                      ? 'border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setActiveTab('students')}
                >
                  Students ({studentCount})
                </button>
              </div>
            ) : (
              <button
                className="inline-flex items-center px-4 py-2 border-b-2 border-brand-500 text-brand-500 text-sm font-medium dark:border-brand-400 dark:text-brand-400"
              >
                Sessions
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {classData.has_levels ? (
          <div>
            {activeTab === 'levels' && (
              <Card>
                {levels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Levels Added Yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by adding the first level to this class.
                    </p>
                    <div className="mt-6">
                      <Link href={`/classes/${id}/levels/add`}>
                        <Button variant="primary">Add First Level</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell header>Level</TableCell>
                        <TableCell header>Name</TableCell>
                        <TableCell header>Sessions</TableCell>
                        <TableCell header>Students</TableCell>
                        <TableCell header>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {levels.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell>{level.order_number}</TableCell>
                          <TableCell>{level.name}</TableCell>
                          <TableCell>{level.session_count?.count || 0}</TableCell>
                          <TableCell>{level.student_count?.count || 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/classes/${id}/levels/${level.id}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                              <Link href={`/classes/${id}/levels/${level.id}/sessions/add`}>
                                <Button variant="outline" size="sm">Add Session</Button>
                              </Link>
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
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Student Management</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Students are enrolled in specific levels. Please select a level to manage its students.
                  </p>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <div className="py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">This is a simple class without levels. Sessions can be added directly to the class.</p>

              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell header>Date</TableCell>
                      <TableCell header>Title</TableCell>
                      <TableCell header>Time</TableCell>
                      <TableCell header>Location</TableCell>
                      <TableCell header>Instructor</TableCell>
                      <TableCell header>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="py-4 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No sessions have been added to this class yet.</p>
                            <div className="mt-4">
                              <Link href={`/classes/${id}/sessions/add`}>
                                <Button variant="primary">Add First Session</Button>
                              </Link>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{new Date(session.session_date).toLocaleDateString()}</TableCell>
                          <TableCell>{session.title}</TableCell>
                          <TableCell>{`${session.start_time} - ${session.end_time}`}</TableCell>
                          <TableCell>{session.location || '-'}</TableCell>
                          <TableCell>
                            {session.instructor ? `${session.instructor.first_name} ${session.instructor.last_name}` : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {session.attendance_meeting_id ? (
                                <Link href={`/attendance/meetings/${session.attendance_meeting_id}`}>
                                  <Button variant="outline" size="sm">Attendance</Button>
                                </Link>
                              ) : (
                                <Button variant="outline" size="sm" disabled>No Attendance</Button>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this session?')) {
                                    // Delete session logic will be implemented later
                                    const supabase = getSupabaseClient();
                                    supabase
                                      .from('class_sessions')
                                      .delete()
                                      .eq('id', session.id)
                                      .then(() => {
                                        setSessions(sessions.filter(s => s.id !== session.id));
                                      });
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Confirm Deletion</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Are you sure you want to delete <strong>{classData?.name}</strong>? This will permanently remove the class and all its levels, sessions, and enrollments. This action cannot be undone.
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
                  onClick={handleDeleteClass}
                  disabled={deleting}
                  isLoading={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Class'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    );
  };

  return renderMainContent();
}
