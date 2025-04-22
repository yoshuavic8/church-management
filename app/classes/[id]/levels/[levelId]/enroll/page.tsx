'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../../../lib/supabase';
import Layout from '../../../../../components/layout/Layout';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Input from '../../../../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../../../../../components/ui/Table';
import { Class, ClassLevel } from '../../../../../types/class';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  selected?: boolean;
}

export default function EnrollStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const { id: classId, levelId } = params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [classData, setClassData] = useState<Class | null>(null);
  const [levelData, setLevelData] = useState<ClassLevel | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);

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

      // Get already enrolled members
      const { data: enrolledData, error: enrolledError } = await supabase
        .from('class_enrollments')
        .select('member_id')
        .eq('level_id', levelId);

      if (enrolledError) throw enrolledError;

      const enrolledMemberIds = enrolledData?.map(e => e.member_id) || [];

      // Fetch members who are not already enrolled
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone')
        .eq('status', 'active')
        .not('id', 'in', `(${enrolledMemberIds.length > 0 ? enrolledMemberIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)
        .order('first_name');

      if (membersError) throw membersError;

      setMembers(membersData?.map(m => ({ ...m, selected: false })) || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleSelectMember = (id: string) => {
    setMembers(prev =>
      prev.map(member => {
        if (member.id === id) {
          return { ...member, selected: !member.selected };
        }
        return member;
      })
    );
  };

  const toggleSelectAll = () => {
    const allSelected = members.every(m => m.selected);
    setMembers(prev =>
      prev.map(member => ({ ...member, selected: !allSelected }))
    );
  };

  // Update selected count when members change
  useEffect(() => {
    setSelectedCount(members.filter(m => m.selected).length);
  }, [members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const supabase = getSupabaseClient();

      const selectedMembers = members.filter(m => m.selected);

      if (selectedMembers.length === 0) {
        setError('Please select at least one member to enroll');
        return;
      }

      // Prepare enrollment data
      const enrollmentData = selectedMembers.map(member => ({
        member_id: member.id,
        level_id: levelId,
        class_id: classId,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'enrolled',
      }));

      // Insert enrollment records
      const { data, error } = await supabase
        .from('class_enrollments')
        .insert(enrollmentData);

      if (error) throw error;

      setSuccess(true);

      // Redirect to level details page after a short delay
      setTimeout(() => {
        router.push(`/classes/${classId}/levels/${levelId}`);
      }, 1500);

    } catch (error: any) {
      setError(error.message || 'Failed to enroll students');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const email = member.email?.toLowerCase() || '';
    const phone = member.phone?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || phone.includes(search);
  });

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
              The class or level you're trying to enroll students to doesn't exist.
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
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Enroll Students</h1>
          <p className="text-gray-500 dark:text-gray-400">Add students to {levelData.name}</p>
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
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Students Enrolled Successfully</h3>
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

            <div className="mb-6">
              <Input
                label="Search Members"
                name="search"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name, email, or phone"
                leftIcon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Members Available</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  All active members are already enrolled in this level.
                </p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Results Found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No members match your search criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="select-all"
                      type="checkbox"
                      checked={members.length > 0 && members.every(m => m.selected)}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-brand-500"
                    />
                    <label htmlFor="select-all" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Select All
                    </label>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCount} member{selectedCount !== 1 ? 's' : ''} selected
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell header>Select</TableCell>
                        <TableCell header>Name</TableCell>
                        <TableCell header>Email</TableCell>
                        <TableCell header>Phone</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={member.selected}
                              onChange={() => toggleSelectMember(member.id)}
                              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-brand-500"
                            />
                          </TableCell>
                          <TableCell>{member.first_name} {member.last_name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.phone}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

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
                disabled={selectedCount === 0 || submitting}
              >
                Enroll Selected Members
              </Button>
            </div>
          </form>
        )}
      </Card>
    </Layout>
  );
}
