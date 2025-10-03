"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/api-client";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
  UserGroupIcon,
  DocumentTextIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Layout from "../../components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import BatchEnrollmentModal from "../../components/BatchEnrollmentModal";

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
  requirements?: string;
  materials?: string;
  created_at: string;
  levels?: ClassLevel[];
  sessions?: ClassSession[];
  _count?: {
    enrollments: number;
  };
}

interface ClassLevel {
  id: string;
  name: string;
  description?: string;
  order: number;
  order_number: number;
  topics?: ClassTopic[];
  _count?: {
    enrollments: number;
  };
}

interface ClassTopic {
  id: string;
  name: string;
  description?: string;
  order_number: number;
  duration_minutes?: number;
}

interface ClassSession {
  id: string;
  title: string;
  description?: string;
  order_number: number;
  duration_minutes?: number;
  session_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  instructor?: {
    first_name: string;
    last_name: string;
  };
}

interface Enrollment {
  id: string;
  status: string;
  enrolled_at: string;
  completed_at?: string;
  member: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  level?: {
    id: string;
    name: string;
  };
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState<Class | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "enrollments">("overview");
  const [showBatchEnrollment, setShowBatchEnrollment] = useState(false);

  const classId = params.id as string;

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  useEffect(() => {
    if (activeTab === "enrollments" && classData) {
      loadEnrollments();
    }
  }, [activeTab, classData]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getClass(classId);

      if (response.success && response.data) {
        setClassData(response.data);
      } else {
        const errorMessage = (response.error && typeof response.error === 'object' && 'message' in response.error) 
          ? response.error.message 
          : response.error || "Failed to load class";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error loading class:", error);
      alert("Failed to load class details");
      router.push("/classes");
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    if (!classData) return;

    try {
      setEnrollmentsLoading(true);
      const response = await apiClient.getClassEnrollments(classData.id);

      if (response.success && response.data) {
        setEnrollments(response.data.enrollments || response.data);
      } else {
        const errorMessage = (response.error && typeof response.error === 'object' && 'message' in response.error) 
          ? response.error.message 
          : response.error || "Failed to load enrollments";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error loading enrollments:", error);
      alert("Failed to load enrollments");
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const handleEnrollmentComplete = (result: any) => {
    // Reload enrollments and class data to reflect new enrollment counts
    if (activeTab === "enrollments") {
      loadEnrollments();
    }
    loadClassData(); // Refresh class data to update enrollment count
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
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEnrollmentStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "active":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "completed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "dropped":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded-md"></div>
            </div>
            <div>
              <div className="h-48 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Class not found</h2>
        <p className="text-gray-600 mb-4">The class you're looking for doesn't exist.</p>
        <Link href="/classes" className="text-blue-600 hover:text-blue-700">
          Back to Classes
        </Link>
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
            href="/classes"
            className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
              {classData.name}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                {classData.category}
              </span>
              <span className={getStatusBadge(classData.status)}>
                {getStatusIcon(classData.status)}
                <span className="ml-2 capitalize">{classData.status}</span>
              </span>
              {classData.has_levels && (
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-1" />
                  Multi-level Class
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link
            href={`/classes/${classData.id}/enrollments`}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Manage Enrollments
          </Link>
          <Link
            href={`/classes/${classData.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Class
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "enrollments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Enrollments ({classData._count?.enrollments || 0})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {classData.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{classData.description}</p>
              </div>
            )}

            {/* Levels */}
            {classData.has_levels && classData.levels && classData.levels.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Class Structure
                </h2>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Enrollment:</strong> Members are enrolled in the entire class and have access to all levels below.
                  </p>
                </div>
                <div className="space-y-4">
                  {classData.levels
                    .sort((a, b) => a.order - b.order)
                    .map((level, index) => (
                      <div
                        key={level.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                              Level {index + 1}
                            </span>
                            {level.name}
                          </h3>
                        </div>
                        {level.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {level.description}
                          </p>
                        )}
                        
                        {/* Topics for this level */}
                        {level.topics && level.topics.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Topics:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {level.topics
                                .sort((a, b) => a.order_number - b.order_number)
                                .map((topic, topicIndex) => (
                                  <div key={topic.id} className="bg-gray-50 rounded-md p-3 border">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h5 className="text-sm font-medium text-gray-900 flex items-center">
                                          <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 text-gray-600 text-xs rounded-full mr-2">
                                            {topicIndex + 1}
                                          </span>
                                          {topic.name}
                                        </h5>
                                        {topic.description && (
                                          <p className="text-xs text-gray-600 mt-1 pl-7">
                                            {topic.description}
                                          </p>
                                        )}
                                      </div>
                                      {topic.duration_minutes && (
                                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded ml-2">
                                          {topic.duration_minutes}m
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Sessions for single-level classes */}
            {!classData.has_levels && classData.sessions && classData.sessions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
                  Class Sessions
                </h2>
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Single-Level Class:</strong> All sessions are part of the main curriculum.
                  </p>
                </div>
                <div className="space-y-3">
                  {classData.sessions
                    .sort((a, b) => a.order_number - b.order_number)
                    .map((session, index) => (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 flex items-center">
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                              Session {index + 1}
                            </span>
                            {session.title}
                          </h3>
                          {session.duration_minutes && (
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {session.duration_minutes}m
                            </span>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-gray-600 text-sm leading-relaxed mb-2 pl-7">
                            {session.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Requirements & Materials */}
            {(classData.requirements || classData.materials) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="space-y-4">
                  {classData.requirements && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Requirements
                      </h3>
                      <p className="text-gray-700 leading-relaxed pl-7">
                        {classData.requirements}
                      </p>
                    </div>
                  )}
                  {classData.materials && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                        <BookOpenIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Materials
                      </h3>
                      <p className="text-gray-700 leading-relaxed pl-7">
                        {classData.materials}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Enrolled</div>
                    <div className="font-medium">
                      {classData._count?.enrollments || 0}
                      {classData.max_participants && ` / ${classData.max_participants}`}
                    </div>
                  </div>
                </div>

                {classData.instructor && (
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Instructor</div>
                      <div className="font-medium">{classData.instructor}</div>
                    </div>
                  </div>
                )}

                {classData.schedule && (
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Schedule</div>
                      <div className="font-medium">{classData.schedule}</div>
                    </div>
                  </div>
                )}

                {classData.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div className="font-medium">{classData.location}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Start Date</div>
                    <div className="font-medium">{formatDate(classData.start_date)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">End Date</div>
                    <div className="font-medium">{formatDate(classData.end_date)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="font-medium">{formatDate(classData.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Enrollments Tab
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Class Enrollments</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {enrollments.length} member{enrollments.length !== 1 ? 's' : ''} enrolled
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBatchEnrollment(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Add Members
                </button>
                <Link
                  href={`/classes/${classData.id}/enrollments`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Manage Enrollments
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            {enrollmentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading enrollments...</p>
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments yet</h3>
                <p className="text-gray-600">
                  This class doesn't have any enrolled members yet.
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
                        Enrolled
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.member.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.member.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getEnrollmentStatusBadge(enrollment.status)}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(enrollment.enrolled_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enrollment.completed_at ? formatDate(enrollment.completed_at) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
      </Layout>
    </ProtectedRoute>
  );
}
