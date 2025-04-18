'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';
import Header from '../components/Header';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  join_date: string;
  status: string;
  gender?: string;
  marital_status?: string;
  baptism_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [memberToDeactivate, setMemberToDeactivate] = useState<{id: string, name: string} | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('last_name', { ascending: true });

        if (error) throw error;

        if (data) {
          setMembers(data);
        } else {
          setMembers([]);
        }
      } catch (error: any) {
        
        setError(error.message || 'Failed to fetch members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.first_name.toLowerCase().includes(searchLower) ||
      member.last_name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.phone.includes(searchTerm)
    );
  });

  // Define the action button for the header
  // Function to handle member deactivation
  const handleDeactivateMember = (id: string, firstName: string, lastName: string) => {
    setMemberToDeactivate({ id, name: `${firstName} ${lastName}` });
    setShowConfirmModal(true);
  };

  // Function to confirm deactivation
  const confirmDeactivation = async () => {
    if (!memberToDeactivate) return;

    try {
      setDeactivating(true);
      const supabase = getSupabaseClient();

      // Update member status to 'inactive' instead of deleting
      const { error } = await supabase
        .from('members')
        .update({ status: 'inactive' })
        .eq('id', memberToDeactivate.id);

      if (error) throw error;

      // Update the UI
      setMembers(members.map(member =>
        member.id === memberToDeactivate.id
          ? { ...member, status: 'inactive' }
          : member
      ));

      // Close modal
      setShowConfirmModal(false);
      setMemberToDeactivate(null);
    } catch (error: any) {
      
      setError(error.message || 'Failed to deactivate member');
    } finally {
      setDeactivating(false);
    }
  };

  // Function to cancel deactivation
  const cancelDeactivation = () => {
    setShowConfirmModal(false);
    setMemberToDeactivate(null);
  };

  const actionButton = (
    <Link href="/members/add" className="btn-primary">
      Add New Member
    </Link>
  );

  return (
    <div>
      <Header
        title="Members"
        actions={actionButton}
      />

      <div className="card mb-6">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search members..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Join Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td className="py-3 px-4">
                    {member.first_name} {member.last_name}
                  </td>
                  <td className="py-3 px-4">{member.email}</td>
                  <td className="py-3 px-4">{member.phone}</td>
                  <td className="py-3 px-4">{new Date(member.join_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link
                        href={`/members/${member.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                      <Link
                        href={`/members/edit/${member.id}`}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        Edit
                      </Link>
                      {member.status === 'active' && (
                        <button
                          onClick={() => handleDeactivateMember(member.id, member.first_name, member.last_name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && memberToDeactivate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Deactivation</h3>
            <p className="mb-6">Are you sure you want to deactivate {memberToDeactivate.name}? This will hide them from active lists but preserve their attendance history.</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeactivation}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={deactivating}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivation}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={deactivating}
              >
                {deactivating ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
