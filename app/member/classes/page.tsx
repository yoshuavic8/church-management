'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { ClassEnrollment } from '../../types/class';

export default function MemberClassesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchEnrollments();
    }
  }, [user?.id]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Fetch member's class enrollments
      const { data, error } = await supabase
        .from('class_enrollments')
        .select(`
          *,
          level:level_id(
            id,
            name,
            order_number
          ),
          class:class_id(
            id,
            name,
            category
          )
        `)
        .eq('member_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEnrollments(data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): 'success' | 'primary' | 'secondary' | 'error' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'enrolled':
        return 'primary';
      case 'dropped':
        return 'error';
      default:
        return 'secondary';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-600">View your enrolled classes and progress</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-error-200 bg-error-50 px-4 py-3 text-error-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      ) : (
        <>
          {enrollments.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Classes Enrolled</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You are not currently enrolled in any classes.
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Please contact the church office to enroll in available classes.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">{enrollment.class?.name}</h2>
                    <Badge
                      variant={getStatusBadgeVariant(enrollment.status)}
                      size="sm"
                    >
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="mt-2">
                    <span className="text-gray-600 font-medium">Level {enrollment.level?.order_number}: </span>
                    <span className="text-gray-600">{enrollment.level?.name}</span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Enrolled: {formatDate(enrollment.enrollment_date)}</span>
                    </div>

                    {enrollment.completion_date && (
                      <div className="flex items-center">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Completed: {formatDate(enrollment.completion_date)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Link href={`/member/classes/${enrollment.id}`} className="text-primary hover:underline">
                      View Details
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
