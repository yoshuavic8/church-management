'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';
import Link from 'next/link';
import { createEnrollment, updateEnrollmentStatus, deleteEnrollment } from './api-client';

type Class = {
  id: string;
  name: string;
  description: string;
  status: string;
};

type ClassLevel = {
  id: string;
  name: string;
  class_id: string;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
};

type Enrollment = {
  id: string;
  member_id: string;
  class_id: string;
  level_id: string | null;
  status: 'enrolled' | 'completed' | 'dropped';
  enrollment_date: string;
  member: Member;
};

export default function ClassEnrollmentsPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [levels, setLevels] = useState<ClassLevel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [enrollmentStatus, setEnrollmentStatus] = useState<'enrolled' | 'completed' | 'dropped'>('enrolled');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('name');

        if (error) throw error;

        setClasses(data || []);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching classes:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch levels when a class is selected
  useEffect(() => {
    const fetchLevels = async () => {
      if (!selectedClassId) {
        setLevels([]);
        return;
      }

      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
          .from('class_levels')
          .select('*')
          .eq('class_id', selectedClassId)
          .order('name');

        if (error) throw error;

        setLevels(data || []);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching levels:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchLevels();
  }, [selectedClassId]);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
          .from('members')
          .select('id, first_name, last_name, status')
          .eq('status', 'active')
          .order('first_name');

        if (error) throw error;

        setMembers(data || []);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching members:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Fetch enrollments when class or level changes
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!selectedClassId) {
        setEnrollments([]);
        return;
      }

      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        let query = supabase
          .from('class_enrollments')
          .select(`
            id,
            member_id,
            class_id,
            level_id,
            status,
            enrollment_date,
            member:member_id (
              id,
              first_name,
              last_name,
              status
            )
          `)
          .eq('class_id', selectedClassId);

        // If level is selected, filter by level
        if (selectedLevelId) {
          query = query.eq('level_id', selectedLevelId);
        }

        const { data, error } = await query.order('enrollment_date', { ascending: false });

        if (error) throw error;

        setEnrollments(data || []);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching enrollments:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [selectedClassId, selectedLevelId]);

  // Handle class selection
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(e.target.value);
    setSelectedLevelId(''); // Reset level when class changes
  };

  // Handle level selection
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevelId(e.target.value);
  };

  // Handle member selection
  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMemberId(e.target.value);
  };

  // Handle enrollment status change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEnrollmentStatus(e.target.value as 'enrolled' | 'completed' | 'dropped');
  };

  // Handle enrollment submission
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassId || !selectedMemberId) {
      setError('Please select a class and a member');
      return;
    }

    try {
      setLoading(true);

      // Create enrollment record using API client
      const enrollmentData: any = {
        class_id: selectedClassId,
        member_id: selectedMemberId,
        status: enrollmentStatus,
        enrollment_date: new Date().toISOString().split('T')[0]
      };

      // Only add level_id if it's selected
      if (selectedLevelId) {
        enrollmentData.level_id = selectedLevelId;
      }

      // Call the API to create enrollment
      const response = await createEnrollment(enrollmentData);

      // Refresh enrollments
      const supabase = getSupabaseClient();
      const { data: updatedEnrollments, error: refreshError } = await supabase
        .from('class_enrollments')
        .select(`
          id,
          member_id,
          class_id,
          level_id,
          status,
          enrollment_date,
          member:member_id (
            id,
            first_name,
            last_name,
            status
          )
        `)
        .eq('class_id', selectedClassId)
        .order('enrollment_date', { ascending: false });

      if (refreshError) throw refreshError;

      setEnrollments(updatedEnrollments || []);
      setSuccess('Member enrolled successfully');
      setSelectedMemberId(''); // Reset member selection
      setLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error enrolling member:', error);
      setError(error.message || 'Failed to enroll member');
      setLoading(false);
    }
  };

  // Handle enrollment status update
  const handleUpdateStatus = async (enrollmentId: string, newStatus: 'enrolled' | 'completed' | 'dropped') => {
    try {
      setLoading(true);

      // Call the API to update enrollment status
      await updateEnrollmentStatus(enrollmentId, newStatus);

      // Update local state
      setEnrollments(prev =>
        prev.map(enrollment =>
          enrollment.id === enrollmentId
            ? { ...enrollment, status: newStatus }
            : enrollment
        )
      );

      setSuccess('Enrollment status updated successfully');
      setLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error updating enrollment status:', error);
      setError(error.message || 'Failed to update enrollment status');
      setLoading(false);
    }
  };

  // Handle enrollment deletion
  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }

    try {
      setLoading(true);

      // Call the API to delete enrollment
      await deleteEnrollment(enrollmentId);

      // Update local state
      setEnrollments(prev => prev.filter(enrollment => enrollment.id !== enrollmentId));

      setSuccess('Enrollment deleted successfully');
      setLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting enrollment:', error);
      setError(error.message || 'Failed to delete enrollment');
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Class Enrollments" />

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              className="float-right font-bold"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Class Enrollments</h1>
          <Link href="/admin/classes" className="btn-secondary">
            Back to Classes
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Class and Level Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Select Class</h2>

            <div className="mb-4">
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                id="class"
                value={selectedClassId}
                onChange={handleClassChange}
                className="input-field"
                disabled={loading}
              >
                <option value="">Select a Class</option>
                {classes.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            {levels.length > 0 && (
              <div className="mb-4">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Level (Optional)
                </label>
                <select
                  id="level"
                  value={selectedLevelId}
                  onChange={handleLevelChange}
                  className="input-field"
                  disabled={loading}
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Enrollment Form */}
          {selectedClassId && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Enroll Member</h2>

              <form onSubmit={handleEnroll}>
                <div className="mb-4">
                  <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">
                    Member *
                  </label>
                  <select
                    id="member"
                    value={selectedMemberId}
                    onChange={handleMemberChange}
                    className="input-field"
                    disabled={loading}
                    required
                  >
                    <option value="">Select a Member</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={enrollmentStatus}
                    onChange={handleStatusChange}
                    className="input-field"
                    disabled={loading}
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading || !selectedMemberId}
                >
                  {loading ? 'Processing...' : 'Enroll Member'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Enrollments List */}
        {selectedClassId && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              Current Enrollments
              {selectedLevelId && levels.find(l => l.id === selectedLevelId) &&
                ` - ${levels.find(l => l.id === selectedLevelId)?.name}`
              }
            </h2>

            {enrollments.length === 0 ? (
              <p className="text-gray-500">No enrollments found for this class.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.map(enrollment => {
                      const memberData = Array.isArray(enrollment.member)
                        ? enrollment.member[0]
                        : enrollment.member;

                      return (
                        <tr key={enrollment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {memberData?.first_name} {memberData?.last_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {enrollment.level_id
                                ? levels.find(l => l.id === enrollment.level_id)?.name || 'Unknown Level'
                                : 'No Level'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${enrollment.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                                enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'}`}>
                              {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(enrollment.enrollment_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateStatus(enrollment.id, 'enrolled')}
                                className={`text-xs px-2 py-1 rounded ${
                                  enrollment.status === 'enrolled'
                                    ? 'bg-green-100 text-green-800 cursor-default'
                                    : 'bg-gray-100 hover:bg-green-100 text-gray-800 hover:text-green-800'
                                }`}
                                disabled={enrollment.status === 'enrolled' || loading}
                              >
                                Enrolled
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(enrollment.id, 'completed')}
                                className={`text-xs px-2 py-1 rounded ${
                                  enrollment.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800 cursor-default'
                                    : 'bg-gray-100 hover:bg-blue-100 text-gray-800 hover:text-blue-800'
                                }`}
                                disabled={enrollment.status === 'completed' || loading}
                              >
                                Completed
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(enrollment.id, 'dropped')}
                                className={`text-xs px-2 py-1 rounded ${
                                  enrollment.status === 'dropped'
                                    ? 'bg-red-100 text-red-800 cursor-default'
                                    : 'bg-gray-100 hover:bg-red-100 text-gray-800 hover:text-red-800'
                                }`}
                                disabled={enrollment.status === 'dropped' || loading}
                              >
                                Dropped
                              </button>
                              <button
                                onClick={() => handleDeleteEnrollment(enrollment.id)}
                                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-red-100 text-gray-800 hover:text-red-800"
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
