'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/app/components/layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { getSupabaseClient } from '../lib/supabase';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('documents');
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);

  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Fetch recent articles from Supabase
  const fetchRecentArticles = async () => {
    try {
      setLoadingArticles(true);
      setArticleError(null);
      const supabase = getSupabaseClient();

      // Get the 5 most recent articles
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, status, category, published_at')
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentArticles(data || []);
    } catch (error: any) {
      console.error('Error fetching recent articles:', error);
      setArticleError(error.message || 'Failed to load recent articles');
    } finally {
      setLoadingArticles(false);
    }
  };

  // Handle article deletion
  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      // Refresh the articles list
      fetchRecentArticles();

    } catch (error: any) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article: ' + (error.message || 'Unknown error'));
    }
  };

  // Load recent articles when the component mounts
  useEffect(() => {
    if (activeTab === 'content') {
      fetchRecentArticles();
    } else if (activeTab === 'users') {
      fetchRecentUsers();
    }
  }, [activeTab]);

  // Fetch recent users from Supabase
  const fetchRecentUsers = async () => {
    try {
      setLoadingUsers(true);
      setUserError(null);
      const supabase = getSupabaseClient();

      // Get the 5 most recent users
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, role, role_level, status')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching recent users:', error);
      setUserError(error.message || 'Failed to load recent users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Get role name based on role level
  const getRoleName = (roleLevel: number) => {
    switch (roleLevel) {
      case 4:
        return 'Administrator';
      case 3:
        return 'Ministry Leader';
      case 2:
        return 'Cell Leader';
      case 1:
      default:
        return 'Member';
    }
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <Layout>
        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Administration</h1>
          </div>

          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-primary text-primary dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-primary text-primary dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Content Management
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-primary text-primary dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-primary text-primary dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {activeTab === 'documents' && (
            <div>
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Generate Documents</h2>
            <p className="text-gray-600 mb-6">
              Generate official church documents for members. Select a document type below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/documents/baptism"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                </svg>
                <h3 className="font-medium">Baptism Certificate</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate baptism certificates for members
                </p>
              </Link>

              <Link
                href="/admin/documents/child-dedication"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <h3 className="font-medium">Child Dedication</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate child dedication certificates
                </p>
              </Link>

              <Link
                href="/admin/documents/marriage"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <h3 className="font-medium">Marriage Certificate</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate marriage certificates
                </p>
              </Link>

              <Link
                href="/admin/documents/membership"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <h3 className="font-medium">Membership Certificate</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate church membership certificates
                </p>
              </Link>

              <Link
                href="/admin/documents/recommendation"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <h3 className="font-medium">Recommendation Letter</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate recommendation letters for members
                </p>
              </Link>

              <Link
                href="/admin/documents/custom"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <h3 className="font-medium">Custom Document</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create a custom document or letter
                </p>
              </Link>
            </div>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated By</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4">Baptism Certificate</td>
                    <td className="py-3 px-4">John Doe</td>
                    <td className="py-3 px-4">Pastor Jane Smith</td>
                    <td className="py-3 px-4">Apr 10, 2023</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline">Download</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Membership Certificate</td>
                    <td className="py-3 px-4">Jane Smith</td>
                    <td className="py-3 px-4">Pastor John Doe</td>
                    <td className="py-3 px-4">Apr 8, 2023</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline">Download</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Marriage Certificate</td>
                    <td className="py-3 px-4">Michael & Sarah Johnson</td>
                    <td className="py-3 px-4">Pastor Jane Smith</td>
                    <td className="py-3 px-4">Apr 5, 2023</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline">Download</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

          {activeTab === 'content' && (
            <div>
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Content Management</h2>
            <p className="text-gray-600 mb-6">
              Manage content for the church website and member portal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/articles"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                </svg>
                <h3 className="font-medium">News & Articles</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage news articles and announcements
                </p>
              </Link>

              <Link
                href="/admin/events"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <h3 className="font-medium">Events</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage church events and calendar
                </p>
              </Link>

              <Link
                href="/admin/events/calendar"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <h3 className="font-medium">Event Calendar</h3>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage events in calendar view
                </p>
              </Link>

              <Link
                href="/admin/media"
                className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center"
              >
                <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <h3 className="font-medium">Media Library</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage images, videos, and sermons
                </p>
              </Link>
            </div>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Articles</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loadingArticles ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading articles...</p>
                      </td>
                    </tr>
                  ) : articleError ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-red-500">
                        {articleError}
                      </td>
                    </tr>
                  ) : recentArticles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        No articles found. <Link href="/admin/articles/add" className="text-primary hover:underline">Create your first article</Link>
                      </td>
                    </tr>
                  ) : (
                    recentArticles.map(article => (
                      <tr key={article.id}>
                        <td className="py-3 px-4">{article.title}</td>
                        <td className="py-3 px-4">{article.category}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {article.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {article.status === 'published' && article.published_at
                            ? new Date(article.published_at).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/articles/edit/${article.id}`} className="text-primary hover:underline mr-2">Edit</Link>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-center">
              <Link href="/admin/articles" className="text-primary hover:underline">
                View All Articles →
              </Link>
            </div>
          </div>
        </div>
      )}

          {activeTab === 'users' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600 mb-6">
            Manage user accounts and permissions for the church management system.
          </p>

          <div className="flex justify-end mb-4 space-x-2">
            <Link href="/admin/users" className="btn-secondary">
              Manage Users
            </Link>
            <Link href="/admin/users/permissions" className="btn-secondary">
              User Permissions
            </Link>
            <Link href="/admin/roles" className="btn-secondary">
              Manage Roles
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                    </td>
                  </tr>
                ) : userError ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-red-500">
                      {userError}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td className="py-3 px-4">{user.first_name} {user.last_name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{getRoleName(user.role_level)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/users/edit/${user.id}`} className="text-primary hover:underline mr-2">Edit</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center">
            <Link href="/admin/users" className="text-primary hover:underline">
              View All Users →
            </Link>
          </div>
        </div>
      )}

          {activeTab === 'settings' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <p className="text-gray-600 mb-6">
            Configure system settings for the church management application.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Church Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="church_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Church Name
                  </label>
                  <input
                    id="church_name"
                    type="text"
                    className="input-field"
                    defaultValue="Grace Community Church"
                  />
                </div>

                <div>
                  <label htmlFor="church_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="church_email"
                    type="email"
                    className="input-field"
                    defaultValue="info@gracechurch.org"
                  />
                </div>

                <div>
                  <label htmlFor="church_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="church_phone"
                    type="tel"
                    className="input-field"
                    defaultValue="123-456-7890"
                  />
                </div>

                <div>
                  <label htmlFor="church_website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    id="church_website"
                    type="url"
                    className="input-field"
                    defaultValue="https://gracechurch.org"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="church_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    id="church_address"
                    type="text"
                    className="input-field"
                    defaultValue="123 Main St, City, State 12345"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">System Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="email_notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-700">
                    Enable email notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="sms_notifications"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="sms_notifications" className="ml-2 block text-sm text-gray-700">
                    Enable SMS notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="auto_backup"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="auto_backup" className="ml-2 block text-sm text-gray-700">
                    Enable automatic daily backups
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="btn-primary">Save Settings</button>
            </div>
          </div>
        </div>
      )}
          </div>
      </Layout>
    </ProtectedRoute>
  );
}
