'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';

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
  baptism_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
  status: string;
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setMember(data as Member);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch member data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMember();
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

  // Define the action buttons for the header
  const actionButtons = (
    <Link href={`/members/edit/${member.id}`} className="btn-secondary">
      Edit
    </Link>
  );

  return (
    <div>
      <Header
        title="Member Details"
        actions={actionButtons}
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
                <h3 className="text-sm font-medium text-gray-500">Baptism Status</h3>
                <p className="mt-1">
                  {member.baptism_date ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Baptized on {formatDate(member.baptism_date)}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      Not Baptized
                    </span>
                  )}
                </p>
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
            <p className="text-gray-700">Faith Builders</p>
            <Link href={`/cell-groups/1`} className="text-primary hover:underline mt-2 block">
              View Cell Group
            </Link>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <Link href={`/pastoral/visit/new?member=${member.id}`} className="text-primary hover:underline block">
                Schedule Pastoral Visit
              </Link>
              <Link href={`/attendance/record?member=${member.id}`} className="text-primary hover:underline block">
                Record Attendance
              </Link>
              <Link href={`/admin/documents/generate?member=${member.id}`} className="text-primary hover:underline block">
                Generate Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
