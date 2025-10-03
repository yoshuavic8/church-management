'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Search, File, Image, Eye, ExternalLink } from 'lucide-react';

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

interface FileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fileUrl: string) => void;
  allowUpload?: boolean;
  fileTypes?: string[];
  title?: string;
}

export default function FileManagerModal({
  isOpen,
  onClose,
  onSelect,
  allowUpload = true,
  fileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  title = 'Pilih Gambar'
}: FileManagerModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, searchTerm]);

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
        console.log('Files received:', result.data.files);
        console.log('Sample file URL:', result.data.files[0]?.url);
        if (reset) {
          setFiles(result.data.files);
        } else {
          setFiles(prev => [...prev, ...result.data.files]);
        }
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
    if (!fileTypes.includes(file.type)) {
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
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert(result.error?.message || 'Upload gagal');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus file ini?')) {
      return;
    }

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

  const handleSelectFile = (file: UploadedFile) => {
    // Use the relative URL for consistency with the proxy
    onSelect(file.url);
    onClose();
  };

  const handlePreviewFile = (file: UploadedFile) => {
    setPreviewFile(file);
    // Prevent body scroll when preview is open
    document.body.style.overflow = 'hidden';
  };

  const closePreview = () => {
    setPreviewFile(null);
    // Restore body scroll when preview is closed
    document.body.style.overflow = 'hidden'; // Keep modal scroll disabled
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-screen h-screen overflow-y-auto"
      style={{ 
        zIndex: 50000,
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      {/* Full screen backdrop that covers everything including sidebar */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-gray-900 bg-opacity-50" 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh'
        }}
      />
      
      {/* Centered modal container */}
      <div 
        className="relative flex items-center justify-center min-h-screen px-2 sm:px-4 py-4" 
        style={{ 
          zIndex: 50001,
          width: '100vw',
          minHeight: '100vh'
        }}
      >
        <div className="w-full max-w-6xl bg-white shadow-xl rounded-lg overflow-hidden mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 border-b border-gray-200">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Upload Button */}
            {allowUpload && (
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={fileTypes.join(',')}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex rounded-md border border-gray-300">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} transition-colors`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} transition-colors border-l border-gray-300`}
              >
                List
              </button>
            </div>
          </div>

          {/* Files */}
          <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto p-4 sm:p-6">
            {loading && files.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada file</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {allowUpload ? 'Upload file pertama Anda.' : 'Belum ada file yang tersedia.'}
                </p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          selectedFile === file.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedFile(file.id)}
                        onDoubleClick={() => handleSelectFile(file)}
                      >
                        <div className="w-full h-32 bg-gray-50 relative overflow-hidden">
                          {file.mimeType.startsWith('image/') ? (
                            <img
                              src={file.url}
                              alt={file.originalName}
                              className="w-full h-full object-cover"
                              onLoad={(e) => {
                                console.log('✅ Grid image loaded:', file.url);
                                const img = e.target as HTMLImageElement;
                                console.log('Image size:', img.naturalWidth, 'x', img.naturalHeight);
                              }}
                              onError={(e) => {
                                console.error('❌ Grid image error:', file.url);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full bg-red-100 flex items-center justify-center"><span class="text-red-500 text-xs">Failed to load</span></div>';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <File className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Overlay - hanya muncul saat hover */}
                        <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-30 transition-all flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewFile(file);
                                }}
                                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors pointer-events-auto"
                                title="Preview file"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file.id);
                                }}
                                className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                title="Hapus file"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent text-white p-1.5">
                          <p className="text-xs truncate" title={file.originalName}>
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-300">
                            {formatFileSize(file.fileSize)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedFile === file.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedFile(file.id)}
                        onDoubleClick={() => handleSelectFile(file)}
                      >
                        <div className="w-12 h-12 flex-shrink-0 bg-white rounded">
                          {file.mimeType.startsWith('image/') ? (
                            <img
                              src={file.url}
                              alt={file.originalName}
                              className="w-full h-full object-cover rounded"
                              onLoad={() => console.log('List image loaded:', file.url)}
                              onError={(e) => {
                                console.error('List image load error:', file.url);
                                console.log('File object:', file);
                                // Hide broken image and show placeholder
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center" style={{display: file.mimeType.startsWith('image/') ? 'none' : 'flex'}}>
                            <File className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.originalName}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewFile(file);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Preview file"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Hapus file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 transition-colors"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {selectedFile && (
                <>File terpilih: {files.find(f => f.id === selectedFile)?.originalName}</>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const file = files.find(f => f.id === selectedFile);
                  if (file) {
                    handleSelectFile(file);
                  }
                }}
                disabled={!selectedFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Pilih File
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div 
          className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-90 flex items-center justify-center"
          style={{ 
            zIndex: 60000,
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePreview();
            }
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center p-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={closePreview}
              className="absolute top-8 right-8 z-10 p-3 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Display */}
            {previewFile.mimeType.startsWith('image/') ? (
              <img
                src={previewFile.url}
                alt={previewFile.originalName}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  width: 'auto',
                  height: 'auto'
                }}
              />
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {previewFile.originalName}
                </h3>
                <p className="text-gray-500 mb-4">
                  {formatFileSize(previewFile.fileSize)} • {new Date(previewFile.createdAt).toLocaleDateString('id-ID')}
                </p>
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka File
                </a>
              </div>
            )}

            {/* File Info Overlay */}
            <div className="absolute bottom-8 left-8 right-8 bg-black bg-opacity-70 text-white p-4 rounded-lg">
              <h3 className="font-medium mb-1 text-lg">{previewFile.originalName}</h3>
              <p className="text-sm opacity-90">
                {formatFileSize(previewFile.fileSize)} • {new Date(previewFile.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
