'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';
import Layout from '../../../../components/layout/Layout';
import RichTextEditor from '../../../../components/RichTextEditor';
import ImageSelector from '../../../../components/ImageSelector';

export default function EditArticle() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    newCategory: '',
    image_url: '',
    status: 'draft',
    featured: false
  });

  useEffect(() => {
    fetchCategories();
    fetchArticleDetails();
  }, [articleId]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getArticleCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const createNewCategory = async () => {
    if (!formData.newCategory.trim()) return;
    
    setCreatingCategory(true);
    try {
      const response = await apiClient.createArticleCategory({
        name: formData.newCategory.trim()
      });
      
      if (response.success) {
        // Refresh categories
        await fetchCategories();
        // Select the newly created category
        setFormData(prev => ({
          ...prev,
          category: formData.newCategory.trim(),
          newCategory: ''
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to create category');
      }
    } catch (error: any) {
      setError(`Failed to create category: ${error.message}`);
    } finally {
      setCreatingCategory(false);
    }
  };

  const fetchArticleDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getArticle(articleId);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch article');
      }

      if (!response.data) {
        throw new Error('Article not found');
      }

      const article = response.data;
      setFormData({
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
        category: article.category || '',
        newCategory: '',
        image_url: article.image_url || '',
        status: article.status || 'draft',
        featured: article.featured || false
      });

    } catch (error: any) {
      setError(error.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }

      // Determine category
      const category = formData.category === 'new' && formData.newCategory
        ? formData.newCategory.trim()
        : formData.category;

      if (!category) {
        throw new Error('Please select or enter a category');
      }

      // Create article data with proper data types
      const articleData: any = {
        title: formData.title.trim(),
        content: formData.content,
        category: category,
        status: formData.status,
        featured: Boolean(formData.featured), // Ensure boolean type
      };

      // Only include summary if it's not empty
      if (formData.summary.trim()) {
        articleData.summary = formData.summary.trim();
      }

      // Only include image_url if it's not empty
      if (formData.image_url.trim()) {
        articleData.image_url = formData.image_url.trim();
      }

      const response = await apiClient.updateArticle(articleId, articleData);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update article');
      }

      setSuccess(true);

      // Redirect to articles list after a short delay
      setTimeout(() => {
        router.push('/admin/articles');
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-gray-500">Loading article data...</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !formData.title) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-gray-500">Error loading article</p>
          </div>
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Article</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => router.push('/admin/articles')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/articles')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Articles
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-gray-500">Update article information and content</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Article updated successfully! Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Enter article title"
            />
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
              Summary
            </label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Brief summary of the article (optional)"
            />
            <p className="mt-1 text-xs text-gray-500">
              A short summary that will be displayed in article listings
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Write your article content here..."
              minHeight="300px"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use the formatting toolbar to style your content
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="input-field"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
              <option value="new">+ Add new category</option>
            </select>
          </div>

          {/* New Category (conditional) */}
          {formData.category === 'new' && (
            <div className="space-y-2">
              <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700 mb-1">
                New Category Name <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="newCategory"
                  name="newCategory"
                  value={formData.newCategory}
                  onChange={handleInputChange}
                  placeholder="Enter new category name"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={createNewCategory}
                  disabled={!formData.newCategory.trim() || creatingCategory}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                >
                  {creatingCategory ? 'Creating...' : 'Create Category'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                This will create a new category that can be reused for other articles
              </p>
            </div>
          )}

          {/* Image */}
          <ImageSelector
            value={formData.image_url}
            onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
            label="Article Image"
            placeholder="Enter image URL or select from gallery"
            showFileManager={true}
            allowManualUrl={true}
          />

          {/* Status and Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Draft articles are not visible to members
              </p>
            </div>

            <div className="flex items-center h-full pt-6">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Feature this article
              </label>
              <p className="ml-6 text-xs text-gray-500">
                Featured articles appear prominently on the news page
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </Layout>
  );
}
