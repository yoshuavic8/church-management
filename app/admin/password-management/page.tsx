'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Link from 'next/link';
import { authenticatedFetch } from '../../utils/client-auth-helpers';
import { useAuth } from '../../contexts/AuthContext';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

export default function PasswordManagement() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('reset');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load members when component mounts or when member selection is shown
  useEffect(() => {
    if (!authLoading && isAdmin && user && showMemberSelection) {
      fetchMembers();
    }
  }, [authLoading, isAdmin, user, showMemberSelection]);

  // Refetch members when search term changes
  useEffect(() => {
    if (!authLoading && isAdmin && user && showMemberSelection && searchTerm !== undefined) {
      const delayedSearch = setTimeout(() => {
        fetchMembers();
      }, 300); // Debounce search for 300ms

      return () => clearTimeout(delayedSearch);
    }
  }, [searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      
      // Use a large limit to get all members and support search
      const params = new URLSearchParams({
        limit: '1000', // Get up to 1000 members
        search: searchTerm || '' // Include search term if available
      });
      
      const response = await authenticatedFetch(`/api/members?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []); // Backend returns members in data.data, not data.members
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch members');
      }
    } catch (error: any) {
      console.error('Fetch members error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Terjadi error saat memuat data member'
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAllMembers = () => {
    const filteredMembers = getFilteredMembers();
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const getFilteredMembers = () => {
    // Since we're now sending search to backend, just return all members
    // Backend already filters them based on searchTerm
    return members;
  };

  const handleResetPasswords = async (type: 'all' | 'selected') => {
    if (type === 'all' && resetConfirmation !== 'RESET ALL PASSWORDS') {
      setMessage({
        type: 'error',
        text: 'Please type "RESET ALL PASSWORDS" to confirm'
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await authenticatedFetch('/api/admin/reset-passwords', {
        method: 'POST',
        body: JSON.stringify({
          type,
          memberIds: type === 'selected' ? selectedMembers : undefined
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Password reset berhasil! ${result.count} member diupdate.`
        });
        setResetConfirmation('');
        setSelectedMembers([]);
      } else {
        throw new Error(result.error || 'Failed to reset passwords');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Terjadi error saat reset password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasswords = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await authenticatedFetch('/api/admin/verify-passwords', {
        method: 'GET',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'info',
          text: `Verifikasi selesai: ${result.correct} password benar, ${result.incorrect} password salah, ${result.missing} tanpa password.`
        });
      } else {
        throw new Error(result.error || 'Failed to verify passwords');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Terjadi error saat verifikasi password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePasswordList = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await authenticatedFetch('/api/admin/password-list', {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `password-reference-list-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setMessage({
          type: 'success',
          text: 'Daftar password berhasil didownload!'
        });
      } else {
        throw new Error('Failed to generate password list');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Terjadi error saat generate daftar password'
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // Show error if not admin
  if (!isAdmin || !user) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800">Akses Ditolak</h2>
          <p className="text-red-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Password Management</h1>
              <p className="text-gray-600">Kelola password member dengan format DDMMYYYY</p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`rounded-lg p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' :
            message.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('reset')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reset'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reset Password
              </button>
              <button
                onClick={() => setActiveTab('verify')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'verify'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Verifikasi Password
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'generate'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Generate List
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Reset Password Tab */}
            {activeTab === 'reset' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Password Members</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-sm text-yellow-800">
                          <strong>Perhatian:</strong> Tindakan ini akan mereset password semua member ke format DDMMYYYY (berdasarkan tanggal lahir) atau "church123" jika tidak ada tanggal lahir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Reset All Passwords */}
                  <div className="border border-red-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Reset Semua Password</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Reset password untuk semua member ke format DDMMYYYY
                    </p>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ketik "RESET ALL PASSWORDS" untuk konfirmasi:
                      </label>
                      <input
                        type="text"
                        value={resetConfirmation}
                        onChange={(e) => setResetConfirmation(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="RESET ALL PASSWORDS"
                      />
                    </div>

                    <button
                      onClick={() => handleResetPasswords('all')}
                      disabled={loading || resetConfirmation !== 'RESET ALL PASSWORDS'}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Reset Semua Password'}
                    </button>
                  </div>

                  {/* Reset Selected Members */}
                  <div className="border border-orange-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Reset Password Terpilih</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Pilih member tertentu untuk direset passwordnya
                    </p>
                    
                    <div className="mb-4">
                      <button
                        onClick={() => setShowMemberSelection(!showMemberSelection)}
                        className="w-full bg-orange-100 text-orange-800 px-4 py-2 rounded-md hover:bg-orange-200 border border-orange-300"
                      >
                        {showMemberSelection ? 'Tutup Pilihan Member' : 'Pilih Member'}
                        <span className="ml-2">
                          {selectedMembers.length > 0 && `(${selectedMembers.length} dipilih)`}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleResetPasswords('selected')}
                      disabled={loading || selectedMembers.length === 0}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : `Reset ${selectedMembers.length} Password`}
                    </button>
                  </div>

                  {/* Password Format Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Format Password</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Jika ada tanggal lahir:</strong> DDMMYYYY</p>
                      <p className="ml-4 text-xs">• Contoh: 31 Des 2000 → 31122000</p>
                      <p className="ml-4 text-xs">• Contoh: 05 Mar 1995 → 05031995</p>
                      
                      <p><strong>Jika tidak ada tanggal lahir:</strong> church123</p>
                      
                      <p className="mt-4 pt-4 border-t border-blue-200">
                        <strong>Catatan:</strong> Semua member akan diminta mengganti password saat login pertama.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member Selection Modal */}
                {showMemberSelection && (
                  <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Pilih Member untuk Reset Password</h4>
                      <button
                        onClick={() => setShowMemberSelection(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Search and Select All */}
                    <div className="space-y-4 mb-4">
                      <input
                        type="text"
                        placeholder="Cari member berdasarkan nama atau email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      
                      <button
                        onClick={handleSelectAllMembers}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedMembers.length === getFilteredMembers().length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    {/* Member List */}
                    <div className="max-h-60 overflow-y-auto">
                      {loadingMembers ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">Memuat data member...</p>
                        </div>
                      ) : getFilteredMembers().length === 0 ? (
                        <p className="text-sm text-gray-600 text-center py-4">
                          {searchTerm ? 'Tidak ada member yang cocok dengan pencarian' : 'Tidak ada data member'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {getFilteredMembers().map((member) => (
                            <label key={member.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedMembers.includes(member.id)}
                                onChange={() => handleMemberToggle(member.id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {member.first_name} {member.last_name}
                                </p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                member.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {member.status}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Verify Password Tab */}
            {activeTab === 'verify' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Verifikasi Password Members</h3>
                  <p className="text-gray-600 mb-6">
                    Cek apakah password member sudah sesuai dengan format DDMMYYYY
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-md font-medium text-gray-900">Verifikasi Format Password</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Periksa konsistensi password dengan format yang diharapkan
                      </p>
                    </div>
                    <button
                      onClick={handleVerifyPasswords}
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      {loading ? 'Verifying...' : 'Mulai Verifikasi'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Generate List Tab */}
            {activeTab === 'generate' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Password Reference List</h3>
                  <p className="text-gray-600 mb-6">
                    Download daftar password untuk semua member aktif (untuk referensi admin)
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-md font-medium text-gray-900">Download Password List</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        File berisi nama member dan password default mereka
                      </p>
                    </div>
                    <button
                      onClick={handleGeneratePasswordList}
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300"
                    >
                      {loading ? 'Generating...' : 'Download List'}
                    </button>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <p><strong>File akan berisi:</strong></p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Nama lengkap member</li>
                      <li>Email member</li>
                      <li>Password default (DDMMYYYY atau church123)</li>
                      <li>Status admin (jika ada)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
