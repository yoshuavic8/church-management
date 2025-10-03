'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import Layout from '../../../components/layout/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import CurrencyInput from '../../../components/ui/CurrencyInput';
import ImageSelector from '../../../components/ImageSelector';
import { parseCurrency } from '../../../utils/currencyFormatter';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Client-side component for add project
function AddProjectContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    event_date: '',
    target_amount: '',
    status: 'draft',
    is_published: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.event_date || !formData.target_amount) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate target amount
      const targetAmount = typeof formData.target_amount === 'string' 
        ? parseCurrency(formData.target_amount) 
        : parseFloat(formData.target_amount);
      if (isNaN(targetAmount) || targetAmount <= 0) {
        setError('Target amount must be a valid positive number');
        setLoading(false);
        return;
      }

      const projectData = {
        ...formData,
        target_amount: targetAmount,
        event_date: new Date(formData.event_date).toISOString()
      };

      const response = await apiClient.createProject(projectData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/projects');
        }, 2000);
      } else {
        setError(response.error?.message || 'Failed to create project');
      }
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project Created Successfully!</h3>
        <p className="text-gray-600 mb-4">Redirecting to projects list...</p>
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Create New Project
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Add a new fundraising project for the church
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter project title"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the project and its purpose..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={loading}
              />
            </div>

            {/* Project Image */}
            <div className="md:col-span-2">
              <ImageSelector
                value={formData.image_url}
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                label="Project Image"
                placeholder="Enter image URL or select from gallery"
                showFileManager={true}
                allowManualUrl={true}
              />
            </div>

            {/* Event Date */}
            <div>
              <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <Input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            {/* Target Amount */}
            <div>
              <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount (IDR) *
              </label>
              <CurrencyInput
                id="target_amount"
                name="target_amount"
                value={formData.target_amount}
                onValueChange={(value, formattedValue) => {
                  setFormData(prev => ({
                    ...prev,
                    target_amount: formattedValue
                  }));
                }}
                placeholder="1.000.000"
                required
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Is Published */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Publish immediately (visible to members)
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function AddProjectPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <Layout>
        <AddProjectContent />
      </Layout>
    </ProtectedRoute>
  );
}
