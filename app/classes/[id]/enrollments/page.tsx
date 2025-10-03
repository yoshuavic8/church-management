"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/api-client";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import Layout from "../../../components/layout/Layout";
import ProtectedRoute from "../../../components/ProtectedRoute";
import BatchEnrollmentModal from "../../../components/BatchEnrollmentModal";

interface Class {
  id: string;
  name: string;
  description?: string;
  category: string;
  has_levels: boolean;
  status: string;
  levels?: ClassLevel[];
  _count?: {
    enrollments: number;
  };
}

interface ClassLevel {
  id: string;
  name: string;
  order: number;
  order_number: number;
}

interface Enrollment {
  id: string;
  status: string;
  enrolled_at: string;
  completed_at?: string;
  member: {
    id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  level?: ClassLevel;
}

export default function ClassEnrollmentsPage() {
  const params = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState<Class | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBatchEnrollment, setShowBatchEnrollment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const classId = params.id as string;

  useEffect(() => {
    if (classId) {
      loadClassData();
      loadEnrollments();
    }
  }, [classId]);

  // Helper function for status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case "enrolled":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "dropped":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Filter enrollments based on search term and status
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = !searchTerm || 
      enrollment.member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || enrollment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const loadClassData = async () => {
    try {
      const response = await apiClient.getClass(classId);
      if (response.success && response.data) {
        setClassData(response.data);
      } else {
        throw new Error("Failed to load class");
      }
    } catch (error) {
      console.error("Error loading class:", error);
      alert("Failed to load class details");
    }
  };

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const params = {
        ...(statusFilter && { status: statusFilter }),
      };
      
      const response = await apiClient.getClassEnrollments(classId, params);
      if (response.success && response.data) {
        setEnrollments(response.data.enrollments || response.data);
      } else {
        throw new Error("Failed to load enrollments");
      }
    } catch (error) {
      console.error("Error loading enrollments:", error);
      alert("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMembers = async () => {
    // This function is no longer needed - BatchEnrollmentModal handles member search
  };

  const handleEnrollmentComplete = (result: any) => {
    // Reload enrollments when batch enrollment completes
    loadEnrollments();
  };

  const handleUpdateEnrollment = async (enrollmentId: string, status: string) => {
    try {
      const response = await apiClient.updateEnrollment(enrollmentId, { status });
      
      if (response.success) {
        alert("Enrollment updated successfully");
        loadEnrollments();
      } else {
        throw new Error("Failed to update enrollment");
      }
    } catch (error) {
      console.error("Error updating enrollment:", error);
      alert("Failed to update enrollment");
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this class?`)) {
      return;
    }

    try {
      const response = await apiClient.deleteEnrollment(enrollmentId);
      
      if (response.success) {
        alert("Member removed from class");
        loadEnrollments();
      } else {
        throw new Error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  };

  if (!classData) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/2 mb-6"></div>
          <div className="h-48 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href={`/classes/${classId}`}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
              Class Enrollments
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-600">{classData.name}</span>
              <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                {enrollments.length} enrolled
              </span>
              {classData.has_levels && (
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-1" />
                  Multi-level (Access to all levels)
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowBatchEnrollment(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Members
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              loadEnrollments();
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="enrolled">Enrolled</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
          
          <div></div> {/* Spacer */}
        </div>
      </div>

      {/* Enrollments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading enrollments...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-6 text-center">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter
                ? "Try adjusting your search or filters"
                : "This class doesn't have any enrolled members yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.member.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enrollment.member.email}
                        </div>
                        {enrollment.member.phone && (
                          <div className="text-sm text-gray-500">
                            {enrollment.member.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(enrollment.status)}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <select
                          value={enrollment.status}
                          onChange={(e) => handleUpdateEnrollment(enrollment.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="enrolled">Enrolled</option>
                          <option value="completed">Completed</option>
                          <option value="dropped">Dropped</option>
                        </select>
                        <button
                          onClick={() => handleDeleteEnrollment(enrollment.id, enrollment.member.full_name)}
                          className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                          title="Remove from class"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Batch Enrollment Modal */}
      {showBatchEnrollment && classData && (
        <BatchEnrollmentModal
          classId={classData.id}
          levels={classData.levels || []}
          hasLevels={classData.has_levels}
          onEnrollmentComplete={handleEnrollmentComplete}
          onClose={() => setShowBatchEnrollment(false)}
        />
      )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
