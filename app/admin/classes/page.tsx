'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';

type Class = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  has_levels: boolean;
  max_students: number | null;
  created_at: string;
  level_count?: { count: number };
  student_count?: { count: number };
};

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Filter classes based on search query and status filter
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (classItem.description && classItem.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || classItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bible_study':
        return 'Bible Study';
      case 'discipleship':
        return 'Discipleship';
      case 'leadership':
        return 'Leadership';
      case 'marriage':
        return 'Marriage';
      case 'parenting':
        return 'Parenting';
      case 'finance':
        return 'Finance';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  return (
    <div>
      <Header title="Class Management" />
      
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Classes</h1>
          <div className="flex space-x-2">
            <Link href="/classes/add" className="btn-secondary">
              Add New Class
            </Link>
            <Link href="/admin/classes/enrollments" className="btn-primary">
              Manage Enrollments
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="btn-secondary"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Classes List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No classes found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Levels
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((classItem) => (
                  <tr key={classItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {classItem.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCategoryLabel(classItem.category)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(classItem.status)}`}>
                        {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {classItem.has_levels ? (classItem.level_count?.count || 0) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {classItem.student_count?.count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/classes/${classItem.id}`} className="text-indigo-600 hover:text-indigo-900">
                          View
                        </Link>
                        <Link href={`/classes/${classItem.id}/edit`} className="text-blue-600 hover:text-blue-900">
                          Edit
                        </Link>
                        <Link 
                          href={`/admin/classes/enrollments?class=${classItem.id}`} 
                          className="text-green-600 hover:text-green-900"
                        >
                          Enrollments
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
