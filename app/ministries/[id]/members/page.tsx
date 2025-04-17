'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';
import { Ministry, MinistryMember } from '../../../types/ministry';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  is_member: boolean;
};

function ManageMinistryMembersContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [members, setMembers] = useState<MinistryMember[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        // Fetch ministry details
        const { data: ministryData, error: ministryError } = await supabase
          .from('ministries')
          .select('*')
          .eq('id', id)
          .single();

        if (ministryError) throw ministryError;
        setMinistry(ministryData);

        // Fetch current ministry members
        const { data: ministryMembers, error: ministryMembersError } = await supabase
          .from('ministry_members')
          .select(`
            *,
            member:member_id (
              id,
              first_name,
              last_name,
              email,
              phone,
              status
            )
          `)
          .eq('ministry_id', id)
          .order('joined_date', { ascending: false });

        if (ministryMembersError) throw ministryMembersError;

        // Process members data
        const processedMembers = (ministryMembers || []).map(item => ({
          ...item,
          member: Array.isArray(item.member) ? item.member[0] : item.member
        }));

        setMembers(processedMembers);

        // Fetch all active members
        const { data: allMembers, error: allMembersError } = await supabase
          .from('members')
          .select('id, first_name, last_name, email, phone, status')
          .eq('status', 'active')
          .order('last_name', { ascending: true });

        if (allMembersError) throw allMembersError;

        // Create a set of current member IDs for quick lookup
        const currentMemberIds = new Set(ministryMembers?.map(m => m.member_id) || []);

        // Mark members as being part of the ministry or not
        const processedAllMembers = allMembers?.map(member => ({
          ...member,
          is_member: currentMemberIds.has(member.id)
        })) || [];

        // Set available members (those not already in the ministry)
        setAvailableMembers(processedAllMembers.filter(m => !m.is_member));
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = getSupabaseClient();

      // Create entries for new members
      const memberEntries = selectedMembers.map(memberId => ({
        ministry_id: id,
        member_id: memberId,
        joined_date: new Date().toISOString().split('T')[0],
        status: 'active'
      }));

      // Insert new members
      const { data, error } = await supabase
        .from('ministry_members')
        .insert(memberEntries)
        .select();

      if (error) throw error;

      // Update the UI
      const newMembers = await Promise.all(
        selectedMembers.map(async (memberId) => {
          const { data: memberData } = await supabase
            .from('members')
            .select('id, first_name, last_name, email, phone, status')
            .eq('id', memberId)
            .single();

          const ministryMember = data.find(m => m.member_id === memberId);

          return {
            ...ministryMember,
            member: memberData
          };
        })
      );

      setMembers([...newMembers, ...members]);
      setAvailableMembers(availableMembers.filter(m => !selectedMembers.includes(m.id)));
      setSelectedMembers([]);
      setSuccess(`${newMembers.length} member(s) added to ministry`);
    } catch (error: any) {
      console.error('Error adding members:', error);
      setError(error.message || 'Failed to add members');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = getSupabaseClient();

      // Remove member from ministry
      const { error } = await supabase
        .from('ministry_members')
        .delete()
        .eq('ministry_id', id)
        .eq('member_id', memberId);

      if (error) throw error;

      // Update the UI without a full page reload
      const removedMember = members.find(m => m.member_id === memberId);
      if (removedMember && removedMember.member) {
        setMembers(members.filter(m => m.member_id !== memberId));
        setAvailableMembers([
          ...availableMembers,
          {
            id: removedMember.member.id,
            first_name: removedMember.member.first_name,
            last_name: removedMember.member.last_name,
            email: removedMember.member.email,
            phone: removedMember.member.phone,
            status: removedMember.member.status,
            is_member: false
          }
        ]);
        setSuccess('Member removed from ministry');
      }
    } catch (error: any) {
      console.error('Error removing member:', error);
      setError(error.message || 'Failed to remove member');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    setSaving(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Update member role
      const { error } = await supabase
        .from('ministry_members')
        .update({ role })
        .eq('ministry_id', id)
        .eq('member_id', memberId);

      if (error) throw error;

      // Update the UI
      setMembers(
        members.map(m =>
          m.member_id === memberId ? { ...m, role } : m
        )
      );
    } catch (error: any) {
      console.error('Error updating role:', error);
      setError(error.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const filteredAvailableMembers = availableMembers.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.first_name.toLowerCase().includes(searchLower) ||
      member.last_name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower)
    );
  });

  // Define action buttons for the header
  const actionButtons = (
    <Link href={`/ministries/${id}`} className="btn-secondary">
      Back to Ministry
    </Link>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ministry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Ministry not found</p>
        <Link href="/ministries" className="btn-primary">
          Back to Ministries
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={`Manage ${ministry.name} Members`}
        actions={actionButtons}
        backTo={`/ministries/${id}`}
        backLabel="Ministry Details"
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Members */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Current Members ({members.length})</h2>

          {members.length === 0 ? (
            <p className="text-gray-500">No members in this ministry yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((memberItem) => (
                    <tr key={memberItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {memberItem.member && (
                          <Link
                            href={`/members/${memberItem.member.id}`}
                            className="text-primary hover:underline"
                          >
                            {memberItem.member.first_name} {memberItem.member.last_name}
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          className="input-field py-1 px-2 text-sm"
                          value={memberItem.role || ''}
                          onChange={(e) => handleUpdateRole(memberItem.member_id, e.target.value)}
                          placeholder="Add role..."
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(memberItem.joined_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemoveMember(memberItem.member_id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={saving}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Members */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Add Members</h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search members..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mb-4 max-h-96 overflow-y-auto border rounded-md">
            {filteredAvailableMembers.length === 0 ? (
              <p className="text-gray-500 p-4">No members available to add.</p>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredAvailableMembers.map((member) => (
                  <div key={member.id} className="p-3 flex items-center">
                    <input
                      type="checkbox"
                      id={`member-${member.id}`}
                      checked={selectedMembers.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, member.id]);
                        } else {
                          setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                        }
                      }}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor={`member-${member.id}`} className="ml-3 block">
                      <span className="text-sm font-medium text-gray-700">
                        {member.first_name} {member.last_name}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        {member.email}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddMembers}
              disabled={selectedMembers.length === 0 || saving}
              className={`btn-primary ${(selectedMembers.length === 0 || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? 'Adding...' : `Add Selected (${selectedMembers.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ManageMinistryMembersPage() {
  return (
    <Suspense fallback={<div className="p-4 flex justify-center items-center h-screen">Loading...</div>}>
      <ManageMinistryMembersContent />
    </Suspense>
  );
}
