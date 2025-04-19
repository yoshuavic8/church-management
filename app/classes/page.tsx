'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Class, ClassCategory } from '../types/class';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Fetch classes with level count and student count
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          level_count:class_levels(count),
          student_count:class_enrollments(count)
        `)
        .order('name');

      if (error) throw error;

      setClasses(data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  // Filter classes based on search term and filter
  const filteredClasses = classes.filter(cls => {
    // Filter by search term
    if (searchTerm && !cls.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by status or category
    if (filter === 'all') return true;
    if (filter === 'upcoming' && cls.status === 'upcoming') return true;
    if (filter === 'active' && cls.status === 'active') return true;
    if (filter === 'completed' && cls.status === 'completed') return true;
    if (filter === cls.category) return true;

    return false;
  });

  // Get category label
  const getCategoryLabel = (category: ClassCategory) => {
    switch (category) {
      case 'bible_study':
        return 'Bible Study';
      case 'counseling':
        return 'Counseling';
      case 'discipleship':
        return 'Discipleship';
      case 'leadership':
        return 'Leadership';
      case 'other':
        return 'Other';
      default:
        return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): 'success' | 'primary' | 'secondary' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Classes</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage church classes and courses</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/classes/add">
            <Button variant="primary">
              Add New Class
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'active' ? 'primary' : 'outline'}
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              size="sm"
              variant={filter === 'upcoming' ? 'primary' : 'outline'}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              size="sm"
              variant={filter === 'completed' ? 'primary' : 'outline'}
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
            <Button
              size="sm"
              variant={filter === 'bible_study' ? 'primary' : 'outline'}
              onClick={() => setFilter('bible_study')}
            >
              Bible Study
            </Button>
            <Button
              size="sm"
              variant={filter === 'counseling' ? 'primary' : 'outline'}
              onClick={() => setFilter('counseling')}
            >
              Counseling
            </Button>
          </div>
        </div>
      </Card>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded border border-error-200 bg-error-50 px-4 py-3 text-error-700 dark:border-error-700 dark:bg-error-900/50 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <Card>
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-500"></div>
          </div>
        </Card>
      ) : (
        <>
          {/* No results */}
          {filteredClasses.length === 0 && (
            <Card>
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No classes found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filter to find what you\'re looking for.'
                    : 'Get started by creating a new class.'}
                </p>
                <div className="mt-6">
                  <Link href="/classes/add">
                    <Button variant="primary">Add New Class</Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Class grid */}
          {filteredClasses.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((cls) => (
                <Card key={cls.id} className="hover:shadow-theme-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{cls.name}</h2>
                    <Badge
                      variant={getStatusBadgeVariant(cls.status)}
                      size="sm"
                    >
                      {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {getCategoryLabel(cls.category as ClassCategory)}
                    </span>
                  </div>

                  {cls.description && (
                    <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-2">{cls.description}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>{cls.level_count?.count || 0} Levels</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{cls.student_count?.count || 0} Students</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link href={`/classes/${cls.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
