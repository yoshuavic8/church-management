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
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assistant_leader_id?: string;
  assistant_leader?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  district_id?: string;
  district?: {
    id: string;
    name: string;
  };
  meeting_day?: string;
  meeting_time?: string;
  meeting_location?: string;
  cell_group_members?: {
    member: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      status: string;
    };
  }[];
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
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [districts, setDistricts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cellGroupToDelete, setCellGroupToDelete] = useState<CellGroup | null>(null);

  const fetchCellGroups = async (page: number, search?: string, districtId?: string) => {
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

      if (districtId) {
        params.district_id = districtId;
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

  // Fetch districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await apiClient.getDistricts();
        if (response.success && response.data) {
          setDistricts(response.data);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };

    fetchDistricts();
  }, []);

  // Fetch cell groups
  useEffect(() => {
    if (user) {
      fetchCellGroups(currentPage, searchTerm, selectedDistrictId);
    }
  }, [user, currentPage, recordsPerPage, selectedDistrictId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCellGroups(1, searchTerm, selectedDistrictId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === '') {
      setCurrentPage(1);
      fetchCellGroups(1, '', selectedDistrictId);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSelectedDistrictId(districtId);
    setCurrentPage(1);
    fetchCellGroups(1, searchTerm, districtId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCellGroups(page, searchTerm, selectedDistrictId);
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

    // First page button (if not in visible range)
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300">
            ...
          </span>
        );
      }
    }

    // Page numbers in visible range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            i === currentPage
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
          } ${i === startPage && startPage === 1 ? 'rounded-l-md' : ''} ${i === endPage && endPage === pagination.totalPages ? 'rounded-r-md' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page button (if not in visible range)
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(
          <span key="dots2" className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key={pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {pagination.totalPages}
        </button>
      );
    }

    return (
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between items-center sm:hidden">
            {/* Mobile pagination */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>

          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(currentPage - 1) * recordsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * recordsPerPage, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {pages}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                    currentPage === pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
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
            <Link
              href="/cell-groups/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Cell Group
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-5">
            <form onSubmit={handleSearch}>
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
                  placeholder="Search cell groups by name or description..."
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                      fetchCellGroups(1, '', selectedDistrictId);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* District Filter */}
          <div className="md:col-span-4">
            <label htmlFor="districtFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by District
            </label>
            <div className="relative">
              <select
                id="districtFilter"
                value={selectedDistrictId}
                onChange={handleDistrictChange}
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white"
              >
                <option value="">All Districts</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Records Per Page */}
          <div className="md:col-span-3">
            <label htmlFor="recordsPerPage" className="block text-sm font-medium text-gray-700 mb-1">
              Show per page
            </label>
            <div className="relative">
              <select
                id="recordsPerPage"
                value={recordsPerPage}
                onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer"
              >
                <option value={10}>10 records</option>
                <option value={20}>20 records</option>
                <option value={50}>50 records</option>
                <option value={100}>100 records</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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

                  {cellGroup.assistant_leader && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Assistant: {cellGroup.assistant_leader.first_name} {cellGroup.assistant_leader.last_name}
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

                  {cellGroup.cell_group_members && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      Members: {cellGroup.cell_group_members.length}
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
        </>
      )}

      {/* Pagination Card */}
      {cellGroups.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          {renderPagination()}
        </div>
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
