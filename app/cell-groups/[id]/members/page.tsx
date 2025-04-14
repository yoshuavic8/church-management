'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_member: boolean;
};

type CellGroup = {
  id: string;
  name: string;
};

export default function CellGroupMembersPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cellGroup, setCellGroup] = useState<CellGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = getSupabaseClient();

        // Fetch cell group details
        const { data: cellGroupData, error: cellGroupError } = await supabase
          .from('cell_groups')
          .select('id, name')
          .eq('id', id)
          .single();

        if (cellGroupError) throw cellGroupError;

        setCellGroup(cellGroupData);

        // Fetch all members
        const { data: allMembers, error: membersError } = await supabase
          .from('members')
          .select('id, first_name, last_name, email, phone')
          .order('last_name', { ascending: true });

        if (membersError) throw membersError;

        // Fetch current cell group members
        const { data: cellGroupMembers, error: cellGroupMembersError } = await supabase
          .from('cell_group_members')
          .select('member_id')
          .eq('cell_group_id', id);

        if (cellGroupMembersError) throw cellGroupMembersError;

        // Create a set of current member IDs for quick lookup
        const currentMemberIds = new Set(cellGroupMembers?.map(m => m.member_id) || []);

        // Mark members as being part of the cell group or not
        const processedMembers = allMembers?.map(member => ({
          ...member,
          is_member: currentMemberIds.has(member.id)
        })) || [];

        // Set current members and available members
        setMembers(processedMembers.filter(m => m.is_member));
        setAvailableMembers(processedMembers.filter(m => !m.is_member));
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

    try {
      const supabase = getSupabaseClient();

      // Create entries for new members
      const memberEntries = selectedMembers.map(memberId => ({
        cell_group_id: id,
        member_id: memberId
      }));

      // Insert new members
      const { error } = await supabase
        .from('cell_group_members')
        .insert(memberEntries);

      if (error) throw error;

      // Refresh the page
      router.refresh();

      // Update the UI without a full page reload
      const newMembers = availableMembers.filter(m => selectedMembers.includes(m.id));
      setMembers([...members, ...newMembers.map(m => ({ ...m, is_member: true }))]);
      setAvailableMembers(availableMembers.filter(m => !selectedMembers.includes(m.id)));
      setSelectedMembers([]);
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

    try {
      const supabase = getSupabaseClient();

      // Remove member from cell group
      const { error } = await supabase
        .from('cell_group_members')
        .delete()
        .eq('cell_group_id', id)
        .eq('member_id', memberId);

      if (error) throw error;

      // Update the UI without a full page reload
      const removedMember = members.find(m => m.id === memberId);
      if (removedMember) {
        setMembers(members.filter(m => m.id !== memberId));
        setAvailableMembers([...availableMembers, { ...removedMember, is_member: false }]);
      }
    } catch (error: any) {
      console.error('Error removing member:', error);
      setError(error.message || 'Failed to remove member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (!cellGroup) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        Cell group not found
      </div>
    );
  }

  // Define the action buttons for the header
  const actionButtons = (
    <Link href={`/cell-groups/${id}`} className="btn-secondary">
      Back to Cell Group
    </Link>
  );

  return (
    <div>
      <Header
        title="Manage Cell Group Members"
        actions={actionButtons}
      />

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">{cellGroup.name}</h2>
        <p className="text-gray-600">
          Manage the members of this cell group by adding or removing them below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Members */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Current Members ({members.length})</h3>

          {members.length === 0 ? (
            <p className="text-gray-500">No members in this cell group yet.</p>
          ) : (
            <div className="space-y-4">
              {members.map(member => (
                <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{member.first_name} {member.last_name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-sm text-gray-600">{member.phone}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-800"
                    disabled={saving}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Members */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Add Members</h3>

          {availableMembers.length === 0 ? (
            <p className="text-gray-500">No more members available to add.</p>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="members" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Members to Add
                </label>
                <select
                  id="members"
                  multiple
                  className="input-field h-64"
                  value={selectedMembers}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedMembers(options);
                  }}
                >
                  {availableMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} - {member.phone}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple members</p>
              </div>

              <button
                onClick={handleAddMembers}
                className="btn-primary w-full"
                disabled={selectedMembers.length === 0 || saving}
              >
                {saving ? 'Adding...' : `Add Selected Members (${selectedMembers.length})`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
