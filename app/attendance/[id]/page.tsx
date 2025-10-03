'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { apiClient } from '../../lib/api-client';
import ProtectedRoute from '../../components/ProtectedRoute';
import ConvertVisitorModal, { ConvertVisitorData } from '../../components/ConvertVisitorModal';
import EditMeetingModal from '../../components/EditMeetingModal';
import { LiveAttendanceControl } from '../../components/LiveAttendanceControl';
import { useAuth } from '../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Define types
type AttendanceMeeting = {
  id: string;
  event_category: 'cell_group' | 'ministry' | 'sunday_service' | 'special_event';
  meeting_date: string;
  meeting_type: 'regular' | 'special' | 'outreach';
  topic: string;
  location: string;
  offering?: number;
  is_realtime: boolean;
  created_at: string;
  cell_group?: {
    id: string;
    name: string;
  };
  ministry?: {
    id: string;
    name: string;
  };
  participants?: Array<{
    id: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
    member: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  }>;
  visitors?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
    notes?: string;
    converted_to_member_id?: string;
  }>;
  _count?: {
    participants: number;
    visitors: number;
  };
};

// Client-side component for attendance meeting details
function AttendanceMeetingDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<AttendanceMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
  } | null>(null);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);

      if (!user) {
        throw new Error('Authentication required. Please login.');
      }

      // Fetch meeting details
      const meetingResponse = await apiClient.getAttendanceMeeting(meetingId);
      if (!meetingResponse.success) {
        throw new Error(meetingResponse.error?.message || 'Failed to fetch meeting details');
      }

      setMeeting(meetingResponse.data);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch meeting data');
      setLoading(false);
    }
  };

  useEffect(() => {

    if (user && meetingId) {
      fetchMeetingData();
    }
  }, [user, meetingId]);

  const handleEditSuccess = () => {
    // Refresh meeting data after successful edit
    fetchMeetingData();
  };

  const handleConvertVisitor = async (data: ConvertVisitorData) => {
    if (!selectedVisitor || !user) return;

    try {
      console.log('Converting visitor with user:', {
        userRole: user.role,
        userRoleLevel: user.role_level,
        selectedVisitor: selectedVisitor.id,
        data
      });

      // Check if user has admin privileges
      if (user.role !== 'admin' && (user.role_level || 0) < 4) {
        throw new Error('Admin privileges required to convert visitor to member.');
      }

      // Use apiClient which handles token management and refresh automatically
      const response = await apiClient.convertVisitorToMember(selectedVisitor.id, data);

      console.log('Convert visitor response:', response);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to convert visitor');
      }

      // Update the meeting data to reflect the conversion
      if (meeting) {
        const updatedVisitors = meeting.visitors?.map(visitor => 
          visitor.id === selectedVisitor.id 
            ? { ...visitor, converted_to_member_id: response.data!.member.id }
            : visitor
        );
        setMeeting({ ...meeting, visitors: updatedVisitors });
      }

      alert('Visitor successfully converted to member!');
    } catch (error: any) {
      console.error('Error converting visitor:', error);
      alert(error.message || 'Failed to convert visitor');
      throw error;
    }
  };

  const openConvertModal = (visitor: any) => {
    setSelectedVisitor({
      id: visitor.id,
      first_name: visitor.first_name,
      last_name: visitor.last_name,
      phone: visitor.phone,
      email: visitor.email,
    });
    setConvertModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading meeting details</p>
            <p className="text-sm">{error}</p>
          </div>
          <Link 
            href="/attendance"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Attendance
          </Link>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">Meeting not found</p>
            <p className="text-sm">The requested meeting could not be found.</p>
          </div>
          <Link 
            href="/attendance"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Attendance
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <Link
                href="/attendance"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{meeting.topic}</h1>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  meeting.meeting_type === 'regular' 
                    ? 'bg-blue-100 text-blue-800'
                    : meeting.meeting_type === 'special'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {meeting.meeting_type}
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              {new Date(meeting.meeting_date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          {user && (user.role === 'admin' || (user.role_level || 0) >= 3) && (
            <button
              onClick={() => setEditModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Edit Meeting
            </button>
          )}
        </div>
      </div>

      {/* Meeting Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Meeting Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p className="text-sm text-gray-900 capitalize">
                {meeting.event_category.replace('_', ' ')}
              </p>
            </div>

            {meeting.cell_group && (
              <div>
                <label className="text-sm font-medium text-gray-500">Cell Group</label>
                <p className="text-sm text-gray-900">{meeting.cell_group.name}</p>
              </div>
            )}

            {meeting.ministry && (
              <div>
                <label className="text-sm font-medium text-gray-500">Ministry</label>
                <p className="text-sm text-gray-900">{meeting.ministry.name}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-sm text-gray-900">{meeting.location}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Meeting Type</label>
              <p className="text-sm text-gray-900 capitalize">{meeting.meeting_type}</p>
            </div>

            {meeting.offering && (
              <div>
                <label className="text-sm font-medium text-gray-500">Offering</label>
                <p className="text-sm text-gray-900">
                  Rp {meeting.offering.toLocaleString('id-ID')}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Real-time Recording</label>
              <p className="text-sm text-gray-900">{meeting.is_realtime ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h2>
          {meeting._count ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Participants</span>
                <span className="text-2xl font-bold text-green-600">
                  {meeting._count.participants}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Visitors</span>
                <span className="text-2xl font-bold text-purple-600">
                  {meeting._count.visitors}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm font-medium text-gray-700">Total Attendance</span>
                <span className="text-3xl font-bold text-indigo-600">
                  {meeting._count.participants + meeting._count.visitors}
                </span>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Members</span>
                  <span>Visitors</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-l-full"
                    style={{
                      width: `${(meeting._count.participants / (meeting._count.participants + meeting._count.visitors)) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{meeting._count.participants} ({Math.round((meeting._count.participants / (meeting._count.participants + meeting._count.visitors)) * 100)}%)</span>
                  <span>{meeting._count.visitors} ({Math.round((meeting._count.visitors / (meeting._count.participants + meeting._count.visitors)) * 100)}%)</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No attendance data available</p>
          )}
        </div>
      </div>

      {/* Live Attendance Control */}
      <LiveAttendanceControl
        meetingId={meeting.id}
        meetingTopic={meeting.topic}
        onAttendanceUpdate={(participant) => {
          // Refresh meeting data when someone checks in
          fetchMeetingData();
        }}
      />

      {/* Participants and Visitors Details */}
      {meeting.participants && meeting.participants.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Participants</h2>
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
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meeting.participants.map((participant, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {participant.member.first_name} {participant.member.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{participant.member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        participant.status === 'present' 
                          ? 'bg-green-100 text-green-800'
                          : participant.status === 'absent'
                          ? 'bg-red-100 text-red-800' 
                          : participant.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {participant.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {meeting.visitors && meeting.visitors.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Visitors</h2>
            <div className="text-sm text-gray-500">
              {meeting.visitors.length} visitor{meeting.visitors.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meeting.visitors.map((visitor, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {visitor.first_name} {visitor.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {visitor.phone && (
                          <div>📞 {visitor.phone}</div>
                        )}
                        {visitor.email && (
                          <div>📧 {visitor.email}</div>
                        )}
                        {!visitor.phone && !visitor.email && (
                          <span className="text-gray-500">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {visitor.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {visitor.converted_to_member_id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Converted to Member
                        </span>
                      ) : (
                        <button
                          onClick={() => openConvertModal(visitor)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                        >
                          Convert to Member
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
        <div className="flex space-x-4">
          <Link
            href={`/attendance?edit=${meeting.id}`}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Meeting
          </Link>
          
          <Link
            href="/attendance"
            className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to List
          </Link>
        </div>
      </div>

      {/* Convert Visitor Modal */}
      <ConvertVisitorModal
        isOpen={convertModalOpen}
        onClose={() => {
          setConvertModalOpen(false);
          setSelectedVisitor(null);
        }}
        visitor={selectedVisitor}
        meeting={meeting ? {
          cell_group: meeting.cell_group,
          ministry: meeting.ministry
        } : undefined}
        onConvert={handleConvertVisitor}
      />

      {/* Edit Meeting Modal */}
      <EditMeetingModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        meetingId={meetingId}
      />
    </div>
  );
}

export default function AttendanceMeetingDetailPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <AttendanceMeetingDetailContent />
      </Layout>
    </ProtectedRoute>
  );
}
