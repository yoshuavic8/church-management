'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';
import Layout from '../../../../components/layout/Layout';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import CurrencyInput from '../../../../components/ui/CurrencyInput';
import ImageSelector from '../../../../components/ImageSelector';
import { parseCurrency, formatInputCurrency } from '../../../../utils/currencyFormatter';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Project = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_date: string;
  target_amount: number;
  current_amount: number;
  progress: number;
  status: string;
  is_published: boolean;
  donations_count: number;
  creator: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
};

// Client-side component for edit project
function EditProjectContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProject(projectId);
      
      if (response.success) {
        const projectData = response.data;
        setProject(projectData);
        setFormData({
          title: projectData.title,
          description: projectData.description,
          image_url: projectData.image_url || '',
          event_date: new Date(projectData.event_date).toISOString().split('T')[0],
          target_amount: formatInputCurrency(projectData.target_amount.toString()),
          status: projectData.status,
          is_published: projectData.is_published
        });
      } else {
        setError(response.error?.message || 'Failed to fetch project');
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.event_date || !formData.target_amount) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      // Validate target amount
      const targetAmount = typeof formData.target_amount === 'string' 
        ? parseCurrency(formData.target_amount) 
        : parseFloat(formData.target_amount);
      if (isNaN(targetAmount) || targetAmount <= 0) {
        setError('Target amount must be a valid positive number');
        setSaving(false);
        return;
      }

      const projectData = {
        ...formData,
        target_amount: targetAmount,
        event_date: new Date(formData.event_date).toISOString()
      };

      const response = await apiClient.updateProject(projectId, projectData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/admin/projects/${projectId}`);
        }, 2000);
      } else {
        setError(response.error?.message || 'Failed to update project');
      }
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.deleteProject(projectId);

      if (response.success) {
        alert('Project deleted successfully!');
        router.push('/admin/projects');
      } else {
        alert(response.error?.message || 'Failed to delete project');
      }
    } catch (err: any) {
      console.error('Error deleting project:', err);
      alert(err.message || 'Failed to delete project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project Updated Successfully!</h3>
        <p className="text-gray-600 mb-4">Redirecting to project details...</p>
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
            Edit Project
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Update project information and settings
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={saving}
          >
            Delete Project
          </Button>
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
              {project && (
                <p className="mt-1 text-sm text-gray-500">
                  Current raised: {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(project.current_amount)} ({project.donations_count} donations)
                </p>
              )}
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
                disabled={saving}
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
                  disabled={saving}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Publish (visible to members)
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
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saving}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function EditProjectPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <Layout>
        <EditProjectContent />
      </Layout>
    </ProtectedRoute>
  );
}
