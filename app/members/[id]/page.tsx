'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient, isAdmin } from '../../lib/supabase';
import Header from '../../components/Header';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import { useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  join_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
  status: string;
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [cellGroup, setCellGroup] = useState<{id: string, name: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const [isAdminUser, setIsAdminUser] = useState(false);
  const { isAdmin: authIsAdmin } = useAuth();

  useEffect(() => {
    // Set admin status from auth context
    setIsAdminUser(authIsAdmin);
  }, [authIsAdmin]);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const supabase = getSupabaseClient();

        // Fetch member data
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();

        if (memberError) throw memberError;
        setMember(memberData as Member);

        // Fetch cell group data for this member
        const { data: cellGroupMemberData, error: cellGroupMemberError } = await supabase
          .from('cell_group_members')
          .select('cell_group_id')
          .eq('member_id', id);

        if (cellGroupMemberError) throw cellGroupMemberError;

        // Also check if member is a cell group leader
        const { data: cellGroupLeaderData, error: cellGroupLeaderError } = await supabase
          .from('cell_group_leaders')
          .select('cell_group_id')
          .eq('member_id', id);

        if (cellGroupLeaderError) throw cellGroupLeaderError;

        // Combine cell group IDs from both member and leader tables
        const cellGroupIds = [
          ...(cellGroupMemberData || []).map(item => item.cell_group_id),
          ...(cellGroupLeaderData || []).map(item => item.cell_group_id)
        ];

        // If member belongs to any cell group, fetch the cell group details
        if (cellGroupIds.length > 0) {
          const { data: cellGroupData, error: cellGroupError } = await supabase
            .from('cell_groups')
            .select('id, name')
            .eq('id', cellGroupIds[0]) // For now, just use the first cell group
            .single();

          if (cellGroupError) throw cellGroupError;
          setCellGroup(cellGroupData);
        }
      } catch (error: any) {

        setError(error.message || 'Failed to fetch member data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemberData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!member) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Member not found
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleResetPassword = async () => {
    if (!member.email) {
      setResetPasswordError('This member does not have an email address. Please add an email address first.');
      return;
    }

    setResetPasswordLoading(true);
    setResetPasswordSuccess(false);
    setResetPasswordError(null);

    try {
      const supabase = getSupabaseClient();

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(
        member.email,
        { redirectTo: `${window.location.origin}/auth/reset-password` }
      );

      if (error) throw error;

      setResetPasswordSuccess(true);
    } catch (error: any) {
      setResetPasswordError(error.message || 'Failed to send password reset email');
    } finally {
      setResetPasswordLoading(false);
    }
  };



  // Define the action buttons for the header
  const actionButtons = (
    <div className="flex space-x-2">
      <Link href={`/members/edit/${member.id}`} className="btn-secondary">
        Edit
      </Link>
    </div>
  );

  return (
    <div>
      <Header
        title="Member Details"
        actions={actionButtons}
        backTo="/members"
        backLabel="Members List"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1">{member.first_name} {member.last_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{member.email || 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{member.phone}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                <p className="mt-1">{formatDate(member.date_of_birth)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                <p className="mt-1">{member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Marital Status</h3>
                <p className="mt-1">{member.marital_status ? member.marital_status.charAt(0).toUpperCase() + member.marital_status.slice(1) : 'N/A'}</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1">{member.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Church Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
                <p className="mt-1">{formatDate(member.join_date)}</p>
              </div>



              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1">{member.emergency_contact_name || 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{member.emergency_contact_phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-line">{member.notes || 'No notes available'}</p>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Cell Group</h2>
            {cellGroup ? (
              <>
                <p className="text-gray-700">{cellGroup.name}</p>
                <Link href={`/cell-groups/${cellGroup.id}`} className="text-primary hover:underline mt-2 block">
                  View Cell Group
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-500">Not assigned to any cell group</p>
                <Link href={`/cell-groups?add_member=${member.id}`} className="text-primary hover:underline mt-2 block">
                  Add to Cell Group
                </Link>
              </>
            )}
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Member QR Code</h2>
            <div className="flex flex-col items-center">
              <QRCodeGenerator
                value={member.id}
                size={180}
                level="H"
                className="mb-3"
              />
              <p className="text-sm text-gray-500 text-center mb-2">Scan this code for quick attendance</p>
              <button
                onClick={() => window.print()}
                className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print QR Code
              </button>
            </div>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <Link href={`/pastoral/visit/new?member=${member.id}`} className="text-primary hover:underline block">
                Schedule Pastoral Visit
              </Link>
              <Link href={`/attendance?member=${member.id}`} className="text-primary hover:underline block">
                View Attendance History
              </Link>
              <Link href={`/scan?member=${member.id}`} className="text-primary hover:underline block font-medium">
                Quick Attendance Check-in
              </Link>
              <Link href={`/admin/documents/generate?member=${member.id}`} className="text-primary hover:underline block">
                Generate Documents
              </Link>


              {member.email && (
                <button
                  onClick={handleResetPassword}
                  disabled={resetPasswordLoading}
                  className="text-primary hover:underline block w-full text-left"
                >
                  {resetPasswordLoading ? 'Sending...' : 'Send Password Reset Email'}
                </button>
              )}

              {resetPasswordSuccess && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded">
                  Password reset email sent successfully to {member.email}
                </div>
              )}

              {resetPasswordError && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded">
                  {resetPasswordError}
                </div>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
