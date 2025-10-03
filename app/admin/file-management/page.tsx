'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Search, File, Image, Eye, ExternalLink, Grid, List } from 'lucide-react';
import Layout from '../../components/layout/Layout';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploader?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function FileManagementPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [searchTerm]);

  const fetchFiles = async (pageNum = 1, reset = true) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/files?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        // Process files to ensure correct URL format
        const processedFiles = result.data.files.map((file: any) => ({
          ...file,
          // Convert absolute URLs to relative if they contain backend host
          url: file.url.includes('localhost:3001') || file.url.includes('://') 
            ? file.url.replace(/https?:\/\/[^\/]+/, '') // Remove protocol and host, keep path
            : file.url // Use as-is if already relative
        }));

        if (reset) {
          setFiles(processedFiles);
        } else {
          setFiles(prev => [...prev, ...processedFiles]);
        }
        console.log('Files fetched with processed URLs:', processedFiles); // Debug log
        setHasMore(pageNum < result.data.pagination.pages);
        setPage(pageNum);
      } else {
        console.error('Failed to fetch files:', result.error);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Tipe file tidak didukung. Pilih file gambar yang valid.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Add new file to the beginning of the list
        setFiles(prev => [result.data, ...prev]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert(result.error?.message || 'Gagal upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Yakin ingin menghapus file ini?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        if (selectedFile === fileId) {
          setSelectedFile(null);
        }
      } else {
        alert(result.error?.message || 'Gagal menghapus file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan saat menghapus file');
    }
  };

  const handlePreviewFile = (file: UploadedFile) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const handleQuickCleanup = async () => {
    if (!confirm('Cleanup orphaned files? This will remove images that are no longer used in any content. This action cannot be undone.')) {
      return;
    }

    setCleaningUp(true);
    try {
      const response = await fetch('/api/files/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Cleanup completed! ${result.data.deletedCount} orphaned files deleted.`);
        // Refresh file list
        fetchFiles(1, true);
      } else {
        alert(`❌ Cleanup failed: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('❌ Failed to cleanup files. Please try again.');
    } finally {
      setCleaningUp(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchFiles(page + 1, false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📁 File Management</h1>
          <p className="mt-2 text-gray-600">
            Manage uploaded files, cleanup orphaned images, and monitor storage usage.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <File className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <Image className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-gray-900">{selectedFile ? '1' : '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(files.reduce((total, file) => total + file.fileSize, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 border-b border-gray-200">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  
                  <button
                    onClick={handleQuickCleanup}
                    disabled={cleaningUp || uploading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                    title="Remove orphaned files that are no longer used"
                  >
                    <Trash2 className="w-4 h-4" />
                    {cleaningUp ? 'Cleaning...' : 'Cleanup'}
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex rounded-md border border-gray-300">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm font-medium ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } rounded-l-md transition-colors`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm font-medium ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } rounded-r-md border-l transition-colors`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* File List Content */}
              <div className="p-6">
                {loading && files.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading files...</div>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'Try adjusting your search term.' : 'Upload your first file to get started.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Grid View */}
                    {viewMode === 'grid' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                              selectedFile === file.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedFile(file.id)}
                          >
                            <div className="aspect-square rounded-t-lg overflow-hidden">
                              <img
                                src={file.url}
                                alt={file.originalName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-image.svg';
                                  console.error('Image load error for:', file.url);
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', file.url);
                                }}
                              />
                            </div>
                            <div className="p-2">
                              <div className="text-xs font-medium text-gray-900 truncate" title={file.originalName}>
                                {file.originalName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatFileSize(file.fileSize)}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviewFile(file);
                                  }}
                                  className="p-1 bg-white rounded shadow hover:bg-gray-50"
                                  title="Preview"
                                >
                                  <Eye className="w-3 h-3 text-gray-600" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFile(file.id);
                                  }}
                                  className="p-1 bg-white rounded shadow hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Preview
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Size
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Uploaded
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {files.map((file) => (
                              <tr
                                key={file.id}
                                className={`hover:bg-gray-50 cursor-pointer ${
                                  selectedFile === file.id ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => setSelectedFile(file.id)}
                              >
                                <td className="px-4 py-3">
                                  <img
                                    src={file.url}
                                    alt={file.originalName}
                                    className="w-10 h-10 object-cover rounded"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder-image.svg';
                                    }}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {file.originalName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {file.filename}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {formatFileSize(file.fileSize)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {new Date(file.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePreviewFile(file);
                                      }}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Preview"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFile(file.id);
                                      }}
                                      className="text-red-600 hover:text-red-800"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Load More */}
                    {hasMore && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={loadMore}
                          disabled={loading}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                        >
                          {loading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">💡 File Management Tips</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">🔍 Search Files</p>
              <p>Use the search bar to quickly find files by name</p>
            </div>
            <div>
              <p className="font-medium mb-1">👁️ Preview Images</p>
              <p>Click the eye icon to preview images before using them</p>
            </div>
            <div>
              <p className="font-medium mb-1">🧹 Regular Cleanup</p>
              <p>Run cleanup periodically to remove orphaned files</p>
            </div>
            <div>
              <p className="font-medium mb-1">📁 File Organization</p>
              <p>Use descriptive names when uploading files</p>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{previewFile.originalName}</h3>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={previewFile.url}
                  alt={previewFile.originalName}
                  className="max-w-full max-h-[60vh] object-contain mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.svg';
                  }}
                />
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <span className="ml-2">{formatFileSize(previewFile.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2">{previewFile.mimeType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="ml-2">{new Date(previewFile.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">URL:</span>
                    <span className="ml-2 text-blue-600 truncate">{previewFile.url}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
}
