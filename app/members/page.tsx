'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/api-client';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  cell_group?: {
    id: string;
    name: string;
  };
  district?: {
    id: string;
    name: string;
  };
};

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function MembersContent() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const fetchMembers = async (page: number, search?: string) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: recordsPerPage,
        ...(search && { search })
      };

      const response = await apiClient.getMembers(params);
      
      if (response.success && response.data) {
        setMembers(response.data);
        setPagination(response.pagination || null);
      } else {
        setMembers([]);
        setPagination(null);
        setError(response.error?.message || 'Failed to fetch members');
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      setError(error.message || 'Failed to fetch members');
      setMembers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMembers(1);
      setCurrentPage(1);
    }
  }, [user, recordsPerPage]);

  // Handle search
  const handleSearch = () => {
    if (user) {
      setCurrentPage(1);
      fetchMembers(1, searchTerm || undefined);
    }
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
      fetchMembers(newPage, searchTerm || undefined);
    }
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (newLimit: number) => {
    setRecordsPerPage(newLimit);
    setCurrentPage(1);
  };

  // Handle delete member
  const handleDeleteMember = (member: Member) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  };

  // Confirm delete member
  const confirmDeleteMember = async () => {
    if (!memberToDelete || !user) return;

    try {
      const response = await apiClient.deleteMember(memberToDelete.id);
      
      if (response.success) {
        // Refresh the current page
        fetchMembers(currentPage, searchTerm || undefined);
        setDeleteModalOpen(false);
        setMemberToDelete(null);
        alert(`Member ${memberToDelete.first_name} ${memberToDelete.last_name} has been deleted successfully.`);
      } else {
        alert(response.error?.message || 'Failed to delete member');
      }
    } catch (error: any) {
      console.error('Error deleting member:', error);
      alert(error.message || 'Failed to delete member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error loading members</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-2">
            Manage church members - Total: {pagination?.total || 0} members
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/members/add"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Member
          </Link>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Members
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="search"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Search
              </button>
            </div>
          </div>
          
          <div className="min-w-0">
            <label htmlFor="recordsPerPage" className="block text-sm font-medium text-gray-700 mb-2">
              Records per page
            </label>
            <select
              id="recordsPerPage"
              value={recordsPerPage}
              onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
              className="w-36 border border-gray-300 rounded-md px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Members ({members.length} of {pagination?.total || 0})
            </h2>
            {pagination && (
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {members.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-500">
                {searchTerm ? 'No members found matching your search.' : 'No members found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </h3>
                    <div className="flex space-x-1">
                      <Link
                        href={`/members/${member.id}`}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/members/${member.id}/edit`}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                        title="Edit Member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                        title="Delete Member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  {member.phone && (
                    <p className="text-sm text-gray-600">{member.phone}</p>
                  )}
                  {member.cell_group && (
                    <p className="text-sm text-blue-600">
                      Cell Group: {member.cell_group.name}
                    </p>
                  )}
                  {member.district && (
                    <p className="text-sm text-green-600">
                      District: {member.district.name}
                    </p>
                  )}
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} members
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          pageNum === currentPage
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && memberToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Delete Member
              </h2>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this member? This action cannot be undone.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  {memberToDelete.first_name} {memberToDelete.last_name}
                </p>
                <p className="text-sm text-gray-600">{memberToDelete.email}</p>
                {memberToDelete.phone && (
                  <p className="text-sm text-gray-600">{memberToDelete.phone}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMember}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <MembersContent />
      </Layout>
    </ProtectedRoute>
  );
}
