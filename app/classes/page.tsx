"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/api-client";
import Link from "next/link";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  BookOpenIcon,
} from "@heroicons/react/24/solid";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

interface Class {
  id: string;
  name: string;
  description?: string;
  category: string;
  has_levels: boolean;
  status: string;
  instructor?: string;
  start_date?: string;
  end_date?: string;
  max_participants?: number;
  schedule?: string;
  location?: string;
  created_at: string;
  levels?: ClassLevel[];
  _count?: {
    enrollments: number;
  };
}

interface ClassLevel {
  id: string;
  name: string;
  description?: string;
  order: number;
  _count?: {
    enrollments: number;
  };
}

function ClassesContent() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = [
    "Discipleship",
    "Leadership",
    "Music",
    "Children",
    "Youth",
    "Adult",
    "Marriage",
    "Evangelism",
    "Biblical Studies",
    "Spiritual Growth",
    "Ministry Training",
  ];

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    setCurrentPage(page);
    setSearchTerm(search);
    setCategoryFilter(category);
    setStatusFilter(status);

    loadClasses(page, search, category, status);
  }, [searchParams]);

  const loadClasses = async (
    page: number = 1,
    search: string = "",
    category: string = "",
    status: string = ""
  ) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(category && { category }),
        ...(status && { status }),
      };

      const response = await apiClient.getClasses(params);

      if (response.success && response.data) {
        setClasses(response.data.classes || response.data);
        setTotalPages(response.data.totalPages || 1);
        setTotalClasses(response.data.total || response.data.length);
      } else {
        const errorMessage = (response.error && typeof response.error === 'object' && 'message' in response.error) 
          ? response.error.message 
          : response.error || "Failed to load classes";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      alert("Failed to load classes");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change (except when updating page itself)
    if (!updates.page) {
      params.set("page", "1");
    }

    router.push(`/classes?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchTerm });
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    updateUrl({ category });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    updateUrl({ status });
  };

  const handlePageChange = (page: number) => {
    updateUrl({ page: page.toString() });
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the class "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiClient.deleteClass(id);
      if (response.success) {
        alert("Class deleted successfully");
        loadClasses(currentPage, searchTerm, categoryFilter, statusFilter);
      } else {
        const errorMessage = (response.error && typeof response.error === 'object' && 'message' in response.error) 
          ? response.error.message 
          : response.error || "Failed to delete class";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Failed to delete class");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case "cancelled":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "active":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "completed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
            Classes
          </h1>
          <p className="text-gray-600 mt-1">
            Manage educational classes and member enrollment
          </p>
        </div>
        <Link
          href="/classes/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Class
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          </form>

          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {totalClasses} classes
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter || statusFilter
              ? "Try adjusting your search or filters"
              : "Get started by creating your first class"}
          </p>
          {!searchTerm && !categoryFilter && !statusFilter && (
            <Link
              href="/classes/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add First Class
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {classItem.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
                        {classItem.category}
                      </span>
                      <span className={getStatusBadge(classItem.status)}>
                        {getStatusIcon(classItem.status)}
                        <span className="ml-1 capitalize">{classItem.status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {classItem.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {classItem.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {classItem.instructor && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Instructor:</span>
                      {classItem.instructor}
                    </div>
                  )}
                  
                  {classItem.schedule && (
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {classItem.schedule}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      {classItem._count?.enrollments || 0} enrolled
                      {classItem.max_participants && ` / ${classItem.max_participants}`}
                    </div>
                    
                    {classItem.has_levels && (
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        Multi-level
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Link
                      href={`/classes/${classItem.id}`}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
                      title="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/classes/${classItem.id}/edit`}
                      className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50 transition-colors"
                      title="Edit class"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete class"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <Link
                    href={`/classes/${classItem.id}/enrollments`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Manage Enrollments
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    pageNum === currentPage
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default function ClassesPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    }>
      <ClassesContent />
    </Suspense>
  );
}
