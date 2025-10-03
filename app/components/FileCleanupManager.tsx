'use client';

import { useState } from 'react';

interface FileStats {
  summary: {
    totalFiles: number;
    usedFiles: number;
    orphanedFiles: number;
    recentFiles: number;
    totalSize: number;
    orphanedSize: number;
    potentialSavings: string;
  };
  orphanedFiles: Array<{
    filename: string;
    filePath: string;
    size: number;
    createdAt: string;
  }>;
}

interface CleanupResult {
  message: string;
  deletedCount: number;
  deletedFiles: Array<{
    filename: string;
    filePath: string;
  }>;
  totalFiles: number;
  remainingFiles: number;
}

export default function FileCleanupManager() {
  const [stats, setStats] = useState<FileStats | null>(null);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/files/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Failed to fetch file statistics');
      console.error('Fetch stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    if (!confirm('Are you sure you want to cleanup orphaned files? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setCleanupResult(null);

    try {
      const response = await fetch('/api/files/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setCleanupResult(result.data);
        // Refresh stats after cleanup
        setTimeout(fetchStats, 1000);
      } else {
        setError(result.error?.message || 'Failed to cleanup files');
      }
    } catch (err) {
      setError('Failed to cleanup files');
      console.error('Cleanup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🧹 File Cleanup Manager
        </h2>
        <p className="text-gray-600">
          Manage and cleanup orphaned images that are no longer used in your content.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {cleanupResult && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <div className="font-semibold">{cleanupResult.message}</div>
          <div className="mt-2 text-sm">
            <div>Files deleted: {cleanupResult.deletedCount}</div>
            <div>Remaining files: {cleanupResult.remainingFiles}</div>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : '📊 Get File Statistics'}
        </button>

        {stats && stats.summary.orphanedFiles > 0 && (
          <button
            onClick={runCleanup}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Cleaning...' : `🗑️ Cleanup ${stats.summary.orphanedFiles} Files`}
          </button>
        )}
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.summary.totalFiles}</div>
              <div className="text-sm text-blue-800">Total Files</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.summary.usedFiles}</div>
              <div className="text-sm text-green-800">Used Files</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.summary.recentFiles}</div>
              <div className="text-sm text-yellow-800">Recent Files</div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.summary.orphanedFiles}</div>
              <div className="text-sm text-red-800">Orphaned Files</div>
            </div>
          </div>

          {/* Storage Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Storage Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Storage:</span>
                <span className="ml-2 font-semibold">{formatFileSize(stats.summary.totalSize)}</span>
              </div>
              <div>
                <span className="text-gray-600">Orphaned Size:</span>
                <span className="ml-2 font-semibold text-red-600">{formatFileSize(stats.summary.orphanedSize)}</span>
              </div>
              <div>
                <span className="text-gray-600">Potential Savings:</span>
                <span className="ml-2 font-semibold text-green-600">{stats.summary.potentialSavings}</span>
              </div>
            </div>
          </div>

          {/* Orphaned Files List */}
          {stats.orphanedFiles.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Orphaned Files ({stats.orphanedFiles.length})
              </h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Filename
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Size
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.orphanedFiles.map((file, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                            {file.filename}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {formatDate(file.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {stats.orphanedFiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              🎉 No orphaned files found! Your storage is clean.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
