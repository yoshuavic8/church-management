'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Link from 'next/link';
import { authenticatedFetch } from '../../utils/client-auth-helpers';
import { useAuth } from '../../contexts/AuthContext';

interface Admin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export default function AdminManagement() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [newAdmin, setNewAdmin] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [editAdmin, setEditAdmin] = useState({
    first_name: '',
    last_name: '',
    email: '',
    status: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!authLoading && isAdmin && user) {
      fetchAdmins();
    }
  }, [authLoading, isAdmin, user]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/admin/administrators');
      const result = await response.json();
      
      if (response.ok) {
        setAdmins(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch admins');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error fetching administrators'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Password dan konfirmasi password tidak cocok'
      });
      return;
    }

    if (newAdmin.password.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password minimal 8 karakter'
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await authenticatedFetch('/api/admin/administrators', {
        method: 'POST',
        body: JSON.stringify({
          first_name: newAdmin.first_name,
          last_name: newAdmin.last_name,
          email: newAdmin.email,
          password: newAdmin.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Administrator baru berhasil ditambahkan!'
        });
        setNewAdmin({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setShowAddForm(false);
        fetchAdmins();
      } else {
        throw new Error(result.error || 'Failed to create administrator');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error creating administrator'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setEditAdmin({
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      status: admin.status,
      password: '',
      confirmPassword: ''
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAdmin) return;

    // Validate password if provided
    if (editAdmin.password || editAdmin.confirmPassword) {
      if (editAdmin.password !== editAdmin.confirmPassword) {
        setMessage({
          type: 'error',
          text: 'Password dan konfirmasi password tidak cocok'
        });
        return;
      }

      if (editAdmin.password.length < 8) {
        setMessage({
          type: 'error',
          text: 'Password minimal 8 karakter'
        });
        return;
      }
    }

    try {
      setLoading(true);
      setMessage(null);

      const updateData: any = {
        first_name: editAdmin.first_name,
        last_name: editAdmin.last_name,
        email: editAdmin.email,
        status: editAdmin.status
      };

      // Only include password if it's provided
      if (editAdmin.password && editAdmin.password.trim() !== '') {
        updateData.password = editAdmin.password;
      }

      console.log('Sending update request:', { adminId: editingAdmin.id, updateData });

      const response = await authenticatedFetch(`/api/admin/administrators/${editingAdmin.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editAdmin.password ? 'Administrator dan password berhasil diperbarui!' : 'Administrator berhasil diperbarui!'
        });
        setShowEditForm(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || 'Failed to update administrator';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error updating administrator:', error);
      const errorMessage = typeof error === 'string'
        ? error
        : error.message || 'Error updating administrator';
      setMessage({
        type: 'error',
        text: errorMessage
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
              <h1 className="text-2xl font-bold text-gray-900">Kelola Administrator</h1>
              <p className="text-gray-600">Tambah dan kelola akun administrator sistem</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setShowEditForm(false);
                  setEditingAdmin(null);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showAddForm ? 'Batal' : '+ Tambah Admin'}
              </button>
              <Link
                href="/admin"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                ← Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`rounded-lg p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Edit Admin Form */}
        {showEditForm && editingAdmin && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Administrator: {editingAdmin.first_name} {editingAdmin.last_name}</h2>
            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Depan *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdmin.first_name}
                    onChange={(e) => setEditAdmin({...editAdmin, first_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Belakang *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdmin.last_name}
                    onChange={(e) => setEditAdmin({...editAdmin, last_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={editAdmin.email}
                  onChange={(e) => setEditAdmin({...editAdmin, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  required
                  value={editAdmin.status}
                  onChange={(e) => setEditAdmin({...editAdmin, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Non-aktif</option>
                </select>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Ubah Password (Opsional)</h3>
                <p className="text-xs text-gray-500 mb-3">Kosongkan jika tidak ingin mengubah password</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      minLength={8}
                      value={editAdmin.password}
                      onChange={(e) => setEditAdmin({...editAdmin, password: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Minimal 8 karakter"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={editAdmin.confirmPassword}
                      onChange={(e) => setEditAdmin({...editAdmin, confirmPassword: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingAdmin(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  {loading ? 'Memperbarui...' : 'Perbarui Administrator'}
                </button>
              </div>
            </form>
          </div>
        )}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tambah Administrator Baru</h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Depan *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdmin.first_name}
                    onChange={(e) => setNewAdmin({...newAdmin, first_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Belakang *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdmin.last_name}
                    onChange={(e) => setNewAdmin({...newAdmin, last_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdmin.confirmPassword}
                    onChange={(e) => setNewAdmin({...newAdmin, confirmPassword: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  {loading ? 'Menambahkan...' : 'Tambah Administrator'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Administrators List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Daftar Administrator</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Administrator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.first_name} {admin.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Administrator
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.status === 'active' ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admin.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditAdmin(admin)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {admins.length === 0 && !loading && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada administrator</h3>
                  <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan administrator baru.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
