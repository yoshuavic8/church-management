'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../lib/supabase';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { ClassCategory } from '../../types/class';

export default function AddClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'bible_study' as ClassCategory,
    max_students: '',
    status: 'upcoming',
    has_levels: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();

      // Prepare data for submission
      const classData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        max_students: formData.max_students ? parseInt(formData.max_students) : null,
        status: formData.status,
        has_levels: formData.has_levels,
      };

      // Insert class record
      const { data, error } = await supabase
        .from('classes')
        .insert(classData)
        .select()
        .single();

      if (error) throw error;

      setSuccess(true);

      // Redirect to class details page after a short delay
      setTimeout(() => {
        router.push(`/classes/${data.id}`);
      }, 1500);

    } catch (error: any) {
      setError(error.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Add New Class</h1>
          <p className="text-gray-500 dark:text-gray-400">Create a new class or course</p>
        </div>
      </div>

      <Card>
        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-success-100 p-3">
              <svg className="h-8 w-8 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Class Created Successfully</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Redirecting to class details page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded border border-error-200 bg-error-50 px-4 py-3 text-error-700 dark:border-error-700 dark:bg-error-900/50 dark:text-error-400">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Class Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-brand-500 dark:focus:ring-brand-500"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={[
                  { value: 'bible_study', label: 'Bible Study' },
                  { value: 'counseling', label: 'Counseling' },
                  { value: 'discipleship', label: 'Discipleship' },
                  { value: 'leadership', label: 'Leadership' },
                  { value: 'other', label: 'Other' },
                ]}
                disabled={loading}
              />

              <Input
                label="Maximum Students"
                name="max_students"
                type="number"
                value={formData.max_students}
                onChange={handleChange}
                helperText="Leave empty for unlimited"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                ]}
                disabled={loading}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class Structure
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="has-levels-true"
                      name="has_levels"
                      checked={formData.has_levels === true}
                      onChange={() => setFormData(prev => ({ ...prev, has_levels: true }))}
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:focus:ring-brand-500"
                      disabled={loading}
                    />
                    <label htmlFor="has-levels-true" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Multi-level class (with levels and sessions)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="has-levels-false"
                      name="has_levels"
                      checked={formData.has_levels === false}
                      onChange={() => setFormData(prev => ({ ...prev, has_levels: false }))}
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:focus:ring-brand-500"
                      disabled={loading}
                    />
                    <label htmlFor="has-levels-false" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Simple class (sessions only, no levels)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/classes')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
              >
                Create Class
              </Button>
            </div>
          </form>
        )}
      </Card>
    </Layout>
  );
}
