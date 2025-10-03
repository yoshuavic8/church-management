'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { apiClient } from '../lib/api-client';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Define the cell group type
type CellGroup = {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  leader?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  district_id?: string;
  district?: {
    name: string;
  };
  meeting_day?: string;
  meeting_time?: string;
  meeting_location?: string;
  member_count?: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Client-side component for cell groups
function CellGroupsContent() {
  const { user } = useAuth();
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cellGroupToDelete, setCellGroupToDelete] = useState<CellGroup | null>(null);

  const fetchCellGroups = async (page: number, search?: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Authentication required. Please login.');
      }

      const params: any = {
        page,
        limit: recordsPerPage,
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiClient.getCellGroups(params);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch cell groups');
      }

      setCellGroups(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      
    } catch (error: any) {
      console.error('Error fetching cell groups:', error);
      setError(error.message || 'Failed to fetch cell groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCellGroups(currentPage, searchTerm);
    }
  }, [user, currentPage, recordsPerPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCellGroups(1, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === '') {
      setCurrentPage(1);
      fetchCellGroups(1, '');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCellGroups(page, searchTerm);
  };

  const handleRecordsPerPageChange = (newLimit: number) => {
    setRecordsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleDeleteClick = (cellGroup: CellGroup) => {
    setCellGroupToDelete(cellGroup);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cellGroupToDelete || !user) return;

    try {
      const response = await apiClient.deleteCellGroup(cellGroupToDelete.id);
      
      if (response.success) {
        alert(`Cell group "${cellGroupToDelete.name}" has been deleted successfully.`);
        setDeleteModalOpen(false);
        setCellGroupToDelete(null);
        // Refresh the current page
        fetchCellGroups(currentPage, searchTerm);
      } else {
        alert(response.error?.message || 'Failed to delete cell group');
      }
    } catch (error: any) {
      console.error('Error deleting cell group:', error);
      alert(error.message || 'Failed to delete cell group');
    }
  };

  if (loading && cellGroups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cell groups...</p>
        </div>
      </div>
    );
  }

  if (error && cellGroups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading cell groups</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 text-sm rounded-md ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm rounded-md ${
            i === currentPage
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pagination.totalPages}
        className={`px-3 py-2 text-sm rounded-md ${
          currentPage === pagination.totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Next
      </button>
    );

    return (
      <div className="flex items-center justify-center space-x-1 mt-8">
        {pages}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cell Groups</h1>
            <p className="text-gray-600 mt-1">
              {pagination ? `${pagination.total} total cell groups` : 'Manage and view all cell groups'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              onClick={() => {
                // TODO: Implement add cell group functionality
                alert('Add Cell Group functionality coming soon!');
              }}
            >
              Add Cell Group
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search cell groups..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </form>
          
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

      {/* Cell Groups Grid */}
      {cellGroups.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No cell groups found' : 'No cell groups'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? `No cell groups match "${searchTerm}". Try adjusting your search.`
              : 'Get started by creating a new cell group.'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
                fetchCellGroups(1, '');
              }}
              className="mt-3 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cellGroups.map((cellGroup) => (
              <div
                key={cellGroup.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {cellGroup.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cellGroup.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cellGroup.status}
                  </span>
                </div>

                {cellGroup.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {cellGroup.description}
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  {cellGroup.leader && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Leader: {cellGroup.leader.first_name} {cellGroup.leader.last_name}
                    </div>
                  )}

                  {cellGroup.district && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      District: {cellGroup.district.name}
                    </div>
                  )}

                  {cellGroup.member_count !== undefined && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      Members: {cellGroup.member_count}
                    </div>
                  )}

                  {cellGroup.meeting_day && cellGroup.meeting_time && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Meets: {cellGroup.meeting_day}s at {cellGroup.meeting_time}
                    </div>
                  )}

                  {cellGroup.meeting_location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location: {cellGroup.meeting_location}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/cell-groups/${cellGroup.id}`}
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/cell-groups/${cellGroup.id}/edit`}
                      className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(cellGroup)}
                      className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}

          {/* Show current page info */}
          {pagination && (
            <div className="text-center text-sm text-gray-600 mt-4">
              Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, pagination.total)} of {pagination.total} cell groups
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && cellGroupToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Delete Cell Group
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
                Are you sure you want to delete this cell group? This action cannot be undone.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{cellGroupToDelete.name}</p>
                {cellGroupToDelete.description && (
                  <p className="text-sm text-gray-600 mt-1">{cellGroupToDelete.description}</p>
                )}
                {cellGroupToDelete.leader && (
                  <p className="text-sm text-gray-600 mt-1">
                    Leader: {cellGroupToDelete.leader.first_name} {cellGroupToDelete.leader.last_name}
                  </p>
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
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Delete Cell Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CellGroupsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <CellGroupsContent />
      </Layout>
    </ProtectedRoute>
  );
}
