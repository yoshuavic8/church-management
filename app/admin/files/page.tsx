'use client';

import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import FileManagerModal from '../../components/FileManagerModal';
import { Upload, FolderOpen, Image } from 'lucide-react';

export default function FileManagerPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                File Manager
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Kelola file gambar untuk artikel dan project
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Open File Manager
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
                  <p className="text-sm text-gray-500">
                    Upload gambar untuk artikel dan project
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Image className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Images</h3>
                  <p className="text-sm text-gray-500">
                    Kelola dan organisir gambar yang sudah diupload
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FolderOpen className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Reuse Files</h3>
                  <p className="text-sm text-gray-500">
                    Gunakan kembali gambar untuk multiple artikel
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Cara Menggunakan File Manager
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Upload Gambar</h3>
                  <p className="text-sm text-gray-500">
                    Klik "Open File Manager" lalu pilih "Upload" untuk mengunggah gambar baru. 
                    Ukuran maksimal 5MB dengan format JPG, PNG, WebP, atau GIF.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Browse dan Pilih</h3>
                  <p className="text-sm text-gray-500">
                    Browse gambar yang sudah diupload, gunakan fitur search untuk mencari file tertentu. 
                    Switch antara Grid dan List view sesuai preferensi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Gunakan di Artikel/Project</h3>
                  <p className="text-sm text-gray-500">
                    Saat membuat atau edit artikel/project, klik "Browse Gallery" di field gambar 
                    untuk memilih dari file yang sudah diupload.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Kelola File</h3>
                  <p className="text-sm text-gray-500">
                    Hapus file yang tidak terpakai untuk menghemat storage. File yang sedang digunakan 
                    di artikel/project sebaiknya tidak dihapus.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-3">Format File yang Didukung</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                JPEG (.jpg, .jpeg)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                PNG (.png)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                WebP (.webp)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                GIF (.gif)
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * Gambar akan dioptimasi secara otomatis untuk performa yang lebih baik
            </p>
          </div>
        </div>

        {/* File Manager Modal */}
        <FileManagerModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={(fileUrl) => {
            // Just close modal for standalone page
            setShowModal(false);
          }}
          title="File Manager"
          allowUpload={true}
        />
      </Layout>
    </ProtectedRoute>
  );
}
