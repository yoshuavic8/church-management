'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MemberLayout from '../../components/layout/MemberLayout';
import { apiClient } from '../../lib/api-client';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type CellGroup = {
  id: string;
  name: string;
  description?: string;
  leader_name?: string;
  assistant_leader_name?: string;
  meeting_day?: string;
  meeting_time?: string;
  meeting_location?: string;
  district_name?: string;
  member_count: number;
  status: string;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  cell_group_id?: string;
};

function MemberCellGroupContent() {
  const { user } = useAuth();
  const [memberCellGroup, setMemberCellGroup] = useState<CellGroup | null>(null);
  const [availableCellGroups, setAvailableCellGroups] = useState<CellGroup[]>([]);
  const [memberData, setMemberData] = useState<Member | null>(null);
  const [currentCellGroupId, setCurrentCellGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchCellGroupData = async () => {
      try {
        setLoading(true);

        if (!user) {
          throw new Error('Authentication required. Please login.');
        }

        // Fetch member data to check current cell group
        const memberResponse = await apiClient.getMember(user.id);
        setMemberData(memberResponse.data);
        console.log('Member data for cell group page:', memberResponse.data); // Debug log

        // Check for current cell group membership - handle both old and new structures
        let detectedCellGroupId = null;
        
        // Check direct cell_group_id (old structure)
        if (memberResponse.data?.cell_group_id) {
          detectedCellGroupId = memberResponse.data.cell_group_id;
        }
        // Check cell_group_memberships (new structure)
        else if (memberResponse.data?.cell_group_memberships && 
                 memberResponse.data.cell_group_memberships.length > 0) {
          const activeMembership = memberResponse.data.cell_group_memberships.find(
            (membership: any) => membership.status === 'active'
          );
          if (activeMembership?.cell_group) {
            detectedCellGroupId = activeMembership.cell_group.id;
          }
        }
        // Check direct cell_group object (included in response)
        else if (memberResponse.data?.cell_group) {
          detectedCellGroupId = memberResponse.data.cell_group.id;
        }

        setCurrentCellGroupId(detectedCellGroupId);

        // If member has a cell group, fetch its details
        if (detectedCellGroupId) {
          try {
            const cellGroupResponse = await apiClient.getCellGroup(detectedCellGroupId);
            setMemberCellGroup(cellGroupResponse.data);
          } catch (cellGroupError) {
            console.warn('Could not fetch member cell group:', cellGroupError);
            setMemberCellGroup(null);
          }
        } else {
          setMemberCellGroup(null);
        }

        // Fetch available cell groups
        const params: any = { 
          page: currentPage, 
          limit: itemsPerPage,
          status: 'active'
        };

        if (searchQuery) params.search = searchQuery;

        const cellGroupsResponse = await apiClient.getCellGroups(params);
        setAvailableCellGroups(cellGroupsResponse.data || []);
        setTotalPages(cellGroupsResponse.pagination?.totalPages || 1);

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch cell group data');
        setLoading(false);
      }
    };

    if (user) {
      fetchCellGroupData();
    }
  }, [user, currentPage, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      default:
        return status;
    }
  };

  const formatMeetingDay = (day: string) => {
    const days = {
      'monday': 'Senin',
      'tuesday': 'Selasa',
      'wednesday': 'Rabu',
      'thursday': 'Kamis',
      'friday': 'Jumat',
      'saturday': 'Sabtu',
      'sunday': 'Minggu'
    };
    return days[day as keyof typeof days] || day;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cell group data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading cell group data</p>
            <p className="text-sm">{error}</p>
          </div>
          <Link 
            href="/member/dashboard"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cell Group</h1>
            <p className="text-gray-600">Informasi tentang cell group Anda dan cell group yang tersedia</p>
          </div>
          <Link
            href="/member/dashboard"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {/* My Cell Group */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Cell Group Saya
        </h2>

        {memberCellGroup ? (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{memberCellGroup.name}</h3>
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(memberCellGroup.status)}`}>
                    {getStatusText(memberCellGroup.status)}
                  </span>
                </div>

                {memberCellGroup.description && (
                  <p className="text-gray-700 mb-4">{memberCellGroup.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Pemimpin</p>
                        <p className="font-medium text-gray-900">{memberCellGroup.leader_name || 'Belum ditentukan'}</p>
                      </div>
                    </div>

                    {memberCellGroup.assistant_leader_name && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Asisten Pemimpin</p>
                          <p className="font-medium text-gray-900">{memberCellGroup.assistant_leader_name}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Jumlah Anggota</p>
                        <p className="font-medium text-gray-900">{memberCellGroup.member_count} orang</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {memberCellGroup.meeting_day && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Hari Pertemuan</p>
                          <p className="font-medium text-gray-900">{formatMeetingDay(memberCellGroup.meeting_day)}</p>
                        </div>
                      </div>
                    )}

                    {memberCellGroup.meeting_time && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Waktu</p>
                          <p className="font-medium text-gray-900">{memberCellGroup.meeting_time}</p>
                        </div>
                      </div>
                    )}

                    {memberCellGroup.meeting_location && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Lokasi Pertemuan</p>
                          <p className="font-medium text-gray-900">{memberCellGroup.meeting_location}</p>
                        </div>
                      </div>
                    )}

                    {memberCellGroup.district_name && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Distrik</p>
                          <p className="font-medium text-gray-900">{memberCellGroup.district_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Belum bergabung dengan Cell Group</h3>
            <p className="mt-2 text-sm text-gray-500">
              Anda belum bergabung dengan cell group manapun. Lihat cell group yang tersedia di bawah ini.
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Cari Cell Group
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari berdasarkan nama atau distrik..."
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Available Cell Groups */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cell Group Tersedia</h2>
          <p className="text-sm text-gray-600">Jelajahi cell group yang tersedia di gereja</p>
        </div>
        
        {availableCellGroups.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCellGroups.map((cellGroup) => (
                <div key={cellGroup.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 text-lg">{cellGroup.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(cellGroup.status)}`}>
                      {getStatusText(cellGroup.status)}
                    </span>
                  </div>
                  
                  {cellGroup.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{cellGroup.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm mb-4">
                    {cellGroup.leader_name && (
                      <div className="flex items-center text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {cellGroup.leader_name}
                      </div>
                    )}

                    {cellGroup.district_name && (
                      <div className="flex items-center text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Distrik: {cellGroup.district_name}
                      </div>
                    )}

                    {cellGroup.meeting_day && cellGroup.meeting_time && (
                      <div className="flex items-center text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatMeetingDay(cellGroup.meeting_day)}, {cellGroup.meeting_time}
                      </div>
                    )}

                    {cellGroup.meeting_location && (
                      <div className="flex items-center text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {cellGroup.meeting_location}
                      </div>
                    )}

                    <div className="flex items-center text-gray-600">
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {cellGroup.member_count} anggota
                    </div>
                  </div>

                  {/* Join/Info */}
                  <div className="pt-3 border-t border-gray-200">
                    {currentCellGroupId === cellGroup.id ? (
                      <div className="bg-green-50 text-green-800 px-3 py-2 rounded text-sm font-medium text-center">
                        ✓ Cell Group Anda
                      </div>
                    ) : (
                      <div className="bg-gray-50 text-gray-600 px-3 py-2 rounded text-sm text-center">
                        Hubungi pemimpin untuk bergabung
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ← Sebelumnya
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak ada cell group ditemukan</h3>
            <p className="mt-2 text-sm text-gray-500">
              Coba ubah kata kunci pencarian atau hubungi admin gereja.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberCellGroupPage() {
  return (
    <ProtectedRoute>
      <MemberLayout>
        <MemberCellGroupContent />
      </MemberLayout>
    </ProtectedRoute>
  );
}
