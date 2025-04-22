'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../../lib/supabase';
import Layout from '../../../../components/layout/Layout';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Class, ClassLevel } from '../../../../types/class';

export default function AddClassLevelPage() {
  const params = useParams();
  const router = useRouter();
  const { id: classId } = params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [classData, setClassData] = useState<Class | null>(null);
  const [existingLevels, setExistingLevels] = useState<ClassLevel[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prerequisite_level_id: '',
    order_number: 1,
  });

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Fetch class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      setClassData(classData);

      // Fetch existing levels
      const { data: levelsData, error: levelsError } = await supabase
        .from('class_levels')
        .select('*')
        .eq('class_id', classId)
        .order('order_number');

      if (levelsError) throw levelsError;

      setExistingLevels(levelsData || []);

      // Set default order number to be the next in sequence
      if (levelsData && levelsData.length > 0) {
        const maxOrderNumber = Math.max(...levelsData.map(level => level.order_number));
        setFormData(prev => ({ ...prev, order_number: maxOrderNumber + 1 }));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch class data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const supabase = getSupabaseClient();
      
      // Prepare data for submission
      const levelData = {
        class_id: classId,
        name: formData.name,
        description: formData.description || null,
        prerequisite_level_id: formData.prerequisite_level_id || null,
        order_number: parseInt(formData.order_number.toString()),
      };
      
      // Insert level record
      const { data, error } = await supabase
        .from('class_levels')
        .insert(levelData)
        .select()
        .single();
      
      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to class details page after a short delay
      setTimeout(() => {
        router.push(`/classes/${classId}`);
      }, 1500);
      
    } catch (error: any) {
      setError(error.message || 'Failed to create level');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
        </div>
      </Layout>
    );
  }

  if (!classData) {
    return (
      <Layout>
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Class Not Found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The class you're trying to add a level to doesn't exist.
            </p>
            <div className="mt-6">
              <Link href="/classes">
                <Button variant="primary">Back to Classes</Button>
              </Link>
            </div>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/classes/${classId}`} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {classData.name}
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Add New Level</h1>
          <p className="text-gray-500 dark:text-gray-400">Create a new level for {classData.name}</p>
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
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Level Created Successfully</h3>
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
                label="Level Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Select
                label="Prerequisite Level"
                name="prerequisite_level_id"
                value={formData.prerequisite_level_id}
                onChange={handleChange}
                options={[
                  { value: '', label: 'None (First Level)' },
                  ...existingLevels.map(level => ({
                    value: level.id,
                    label: `${level.order_number}. ${level.name}`
                  }))
                ]}
                disabled={submitting}
                helperText="Students must complete this level before enrolling"
              />

              <Input
                label="Order Number"
                name="order_number"
                type="number"
                min="1"
                value={formData.order_number.toString()}
                onChange={handleChange}
                required
                disabled={submitting}
                helperText="Sequence number for this level"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/classes/${classId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
              >
                Create Level
              </Button>
            </div>
          </form>
        )}
      </Card>
    </Layout>
  );
}
