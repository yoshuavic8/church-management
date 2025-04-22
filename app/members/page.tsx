'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../components/ui/Table';

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

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Members</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage church members</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/members/add">
            <Button variant="primary">
              Add New Member
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
          </div>
        </Card>
      ) : error ? (
        <div className="mb-4 rounded border border-error-200 bg-error-50 px-4 py-3 text-error-700 dark:border-error-700 dark:bg-error-900/50 dark:text-error-400">
          {error}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>Name</TableCell>
                <TableCell header>Email</TableCell>
                <TableCell header>Phone</TableCell>
                <TableCell header>Join Date</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.first_name} {member.last_name}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{new Date(member.join_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={member.status === 'active' ? 'success' : 'danger'}
                      size="sm"
                      dot
                    >
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link
                        href={`/members/${member.id}`}
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        View
                      </Link>
                      <Link
                        href={`/members/edit/${member.id}`}
                        className="text-warning-500 hover:text-warning-600 dark:text-warning-400 dark:hover:text-warning-300"
                      >
                        Edit
                      </Link>
                      {member.status === 'active' && (
                        <button
                          onClick={() => handleDeactivateMember(member.id, member.first_name, member.last_name)}
                          className="text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center text-gray-500 dark:text-gray-400">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && memberToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Confirm Deactivation</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">Are you sure you want to deactivate {memberToDeactivate.name}? This will hide them from active lists but preserve their attendance history.</p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelDeactivation}
                disabled={deactivating}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeactivation}
                disabled={deactivating}
                isLoading={deactivating}
              >
                {deactivating ? 'Deactivating...' : 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
