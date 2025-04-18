'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';

export default function AddArticle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
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
  }, []);

  const fetchCategories = async () => {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('articles')
        .select('category')
        .order('category', { ascending: true });
        
      if (error) throw error;
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      
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
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const supabase = getSupabaseClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create an article');
      }
      
      // Determine category
      const category = formData.category === 'new' && formData.newCategory 
        ? formData.newCategory.trim() 
        : formData.category;
        
      if (!category) {
        throw new Error('Please select or enter a category');
      }
      
      // If setting to featured, first unfeature all other articles
      if (formData.featured) {
        await supabase
          .from('articles')
          .update({ featured: false })
          .eq('featured', true);
      }
      
      // Create article
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          category,
          image_url: formData.image_url,
          status: formData.status,
          featured: formData.featured,
          author_id: user.id,
          published_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        summary: '',
        content: '',
        category: '',
        newCategory: '',
        image_url: '',
        status: 'draft',
        featured: false
      });
      
      // Redirect to articles list after a short delay
      setTimeout(() => {
        router.push('/admin/articles');
      }, 2000);
      
    } catch (error: any) {
      
      setError(error.message || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Add New Article"
        backTo="/admin/articles"
        backLabel="Back to Articles"
      />
      
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
                  Article created successfully! Redirecting...
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
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={10}
              className="input-field"
              placeholder="Write your article content here..."
            ></textarea>
            <p className="mt-1 text-xs text-gray-500">
              Use line breaks to separate paragraphs
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
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ Add new category</option>
            </select>
          </div>
          
          {/* New Category (conditional) */}
          {formData.category === 'new' && (
            <div>
              <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700 mb-1">
                New Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="newCategory"
                name="newCategory"
                value={formData.newCategory}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter new category name"
              />
            </div>
          )}
          
          {/* Image URL */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL to an image for this article (optional)
            </p>
          </div>
          
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
              disabled={loading}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? 'Creating...' : 'Create Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
