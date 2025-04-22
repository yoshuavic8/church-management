'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPageClient() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('documents');
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);

  // Documents state
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  // Church settings state
  const [churchSettings, setChurchSettings] = useState({
    name: 'Grace Community Church',
    email: 'info@gracechurch.org',
    phone: '123-456-7890',
    website: 'https://gracechurch.org',
    address: '123 Main St, City, State 12345'
  });
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Load data when the component mounts or tab changes
  useEffect(() => {
    if (activeTab === 'content') {
      fetchRecentArticles();
    } else if (activeTab === 'documents') {
      fetchRecentDocuments();
    } else if (activeTab === 'settings') {
      fetchChurchSettings();
    }
  }, [activeTab]);

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



  // Fetch recent documents
  const fetchRecentDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setDocumentError(null);
      const supabase = getSupabaseClient();

      // Since we don't have a documents table yet, we'll fetch baptized members
      // to simulate recent baptism certificates
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, baptism_date, is_baptized')
        .eq('is_baptized', true)
        .order('baptism_date', { ascending: false })
        .limit(3);

      if (error) throw error;

      // Transform the data to simulate document records
      const documents = data?.map(member => ({
        id: member.id,
        type: 'Baptism Certificate',
        member_name: `${member.first_name} ${member.last_name}`,
        generated_by: 'System Administrator',
        generated_date: member.baptism_date,
      })) || [];

      setRecentDocuments(documents);
    } catch (error: any) {
      console.error('Error fetching recent documents:', error);
      setDocumentError(error.message || 'Failed to load recent documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Fetch church settings
  const fetchChurchSettings = async () => {
    try {
      setLoadingSettings(true);
      // In a real implementation, we would fetch settings from a settings table
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use default settings or fetch from API in the future
      setLoadingSettings(false);
    } catch (error: any) {
      console.error('Error fetching church settings:', error);
      setLoadingSettings(false);
    }
  };

  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/auth/login');
      } else if (!isAdmin) {
        // Not an admin, redirect to member dashboard
        router.push('/member/dashboard');
      }
    }
  }, [user, loading, isAdmin, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render anything
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Administration</h1>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap border-b border-gray-200">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'documents'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'content'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('content')}
              >
                Content Management
              </button>

              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>

          {activeTab === 'documents' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Document Generation</h2>
          <p className="text-gray-600 mb-6">
            Generate and manage official church documents and certificates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link href="/admin/documents/baptism" className="card p-4 hover:bg-gray-50 transition-colors">
              <h3 className="text-lg font-medium mb-2">Baptism Certificate</h3>
              <p className="text-gray-600 text-sm">Generate official baptism certificates for church members.</p>
            </Link>
            <Link href="/admin/documents/membership" className="card p-4 hover:bg-gray-50 transition-colors">
              <h3 className="text-lg font-medium mb-2">Membership Certificate</h3>
              <p className="text-gray-600 text-sm">Create membership certificates for new church members.</p>
            </Link>
            <Link href="/admin/documents/marriage" className="card p-4 hover:bg-gray-50 transition-colors">
              <h3 className="text-lg font-medium mb-2">Marriage Certificate</h3>
              <p className="text-gray-600 text-sm">Issue official marriage certificates for church weddings.</p>
            </Link>
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
                  {loadingDocuments ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
                      </td>
                    </tr>
                  ) : documentError ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-red-500">
                        {documentError}
                      </td>
                    </tr>
                  ) : recentDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        No documents found. Generate your first document using the options above.
                      </td>
                    </tr>
                  ) : (
                    recentDocuments.map(doc => (
                      <tr key={doc.id}>
                        <td className="py-3 px-4">{doc.type}</td>
                        <td className="py-3 px-4">{doc.member_name}</td>
                        <td className="py-3 px-4">{doc.generated_by}</td>
                        <td className="py-3 px-4">{doc.generated_date ? new Date(doc.generated_date).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4">
                          <button className="text-primary hover:underline">Download</button>
                        </td>
                      </tr>
                    ))
                  )}
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
              Manage website content, articles, and announcements.
            </p>

            <div className="flex flex-wrap justify-end mb-4 gap-2">
              <Link href="/admin/articles/add" className="btn-primary">
                Add New Article
              </Link>
              <Link href="/admin/classes" className="btn-secondary">
                Manage Classes
              </Link>
              <Link href="/admin/classes/enrollments" className="btn-secondary">
                Class Enrollments
              </Link>
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
          </div>
          </div>
        </div>
      )}



          {activeTab === 'settings' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p className="text-gray-600 mb-6">
            Configure church information and system settings.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Church Information</h3>
              {loadingSettings ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="church_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Church Name
                    </label>
                    <input
                      id="church_name"
                      type="text"
                      className="input-field"
                      value={churchSettings.name}
                      onChange={(e) => setChurchSettings({...churchSettings, name: e.target.value})}
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
                      value={churchSettings.email}
                      onChange={(e) => setChurchSettings({...churchSettings, email: e.target.value})}
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
                      value={churchSettings.phone}
                      onChange={(e) => setChurchSettings({...churchSettings, phone: e.target.value})}
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
                      value={churchSettings.website}
                      onChange={(e) => setChurchSettings({...churchSettings, website: e.target.value})}
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
                      value={churchSettings.address}
                      onChange={(e) => setChurchSettings({...churchSettings, address: e.target.value})}
                    />
                  </div>
                </div>
              )
              }
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
  );
}
