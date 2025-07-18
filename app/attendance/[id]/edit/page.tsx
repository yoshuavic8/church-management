'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';
import EventCategorySelector from '../../components/EventCategorySelector';
import ContextSelector from '../../components/ContextSelector';
import { EventCategory } from '../../../types/ministry';
import DynamicAttendanceForm from '../../components/forms/DynamicAttendanceForm';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
};

type Participant = {
  member_id: string;
  first_name: string;
  last_name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  isRegistered: boolean;
};

type Visitor = {
  id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  notes: string;
};

type Meeting = {
  id: string;
  event_category: EventCategory;
  meeting_date: string;
  meeting_type: string;
  topic: string;
  notes: string;
  location: string;
  offering: number | null;
  cell_group_id: string | null;
  ministry_id: string | null;
};

export default function EditAttendancePage() {
  const { id } = useParams();
  const router = useRouter();
  
  // Meeting data
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [eventCategory, setEventCategory] = useState<EventCategory>('cell_group');
  const [contextId, setContextId] = useState<string>('');
  const [meetingDate, setMeetingDate] = useState<string>('');
  const [meetingType, setMeetingType] = useState<string>('regular');
  const [topic, setTopic] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [offering, setOffering] = useState<string>('');
  
  // Members and attendance data
  const [members, setMembers] = useState<Member[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [newVisitor, setNewVisitor] = useState<Visitor>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    notes: '',
  });
  
  // UI states
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchAttendanceData();
  }, [id]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Database connection failed');
      }

      // Convert id to string if it's an array
      const meetingId = Array.isArray(id) ? id[0] : id;

      // Fetch meeting details (use the same approach as the detail page)
      const { data: meetingData, error: meetingError } = await supabase
        .from('attendance_meetings' as any)
        .select('*')
        .eq('id', meetingId)
        .single();

      if (meetingError) throw meetingError;

      // Cast to any to bypass TypeScript issues
      const meeting = meetingData as any;

      setMeeting(meeting);
      setEventCategory(meeting.event_category);
      setContextId(meeting.cell_group_id || meeting.ministry_id || '');
      setMeetingDate(meeting.meeting_date);
      setMeetingType(meeting.meeting_type);
      setTopic(meeting.topic || '');
      setLocation(meeting.location || '');
      setNotes(meeting.notes || '');
      setOffering(meeting.offering ? meeting.offering.toString() : '');

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('attendance_participants' as any)
        .select(`
          *,
          member:member_id (
            id,
            first_name,
            last_name,
            status
          )
        `)
        .eq('meeting_id', meetingId);

      if (participantsError) throw participantsError;

      // Process participants data
      const processedParticipants = (participantsData || []).map((participant: any) => {
        const memberData = Array.isArray(participant.member) 
          ? participant.member[0] 
          : participant.member;
        return {
          member_id: participant.member_id,
          first_name: memberData?.first_name || '',
          last_name: memberData?.last_name || '',
          status: participant.status as 'present' | 'absent' | 'late' | 'excused',
          isRegistered: true,
        };
      });

      setParticipants(processedParticipants);

      // Fetch visitors
      const { data: visitorsData, error: visitorsError } = await supabase
        .from('attendance_visitors' as any)
        .select('*')
        .eq('meeting_id', meetingId);

      if (visitorsError) throw visitorsError;
      setVisitors((visitorsData as any) || []);

      // Fetch all members for the context to allow adding new participants
      if (meeting.cell_group_id) {
        await fetchCellGroupMembers(meeting.cell_group_id);
      } else if (meeting.ministry_id) {
        await fetchMinistryMembers(meeting.ministry_id);
      }

      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to load attendance data');
      setLoading(false);
    }
  };

  const fetchCellGroupMembers = async (cellGroupId: string) => {
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) return;

      // Get all members in this cell group
      const { data: cellGroupMembers, error: membersError } = await supabase
        .from('cell_group_members' as any)
        .select(`
          member_id,
          members:member_id (
            id,
            first_name,
            last_name,
            status
          )
        `)
        .eq('cell_group_id', cellGroupId);

      if (membersError) throw membersError;

      // Also get leaders of this cell group
      const { data: cellGroupLeaders, error: leadersError } = await supabase
        .from('cell_group_leaders' as any)
        .select(`
          member_id,
          members:member_id (
            id,
            first_name,
            last_name,
            status
          )
        `)
        .eq('cell_group_id', cellGroupId);

      if (leadersError) throw leadersError;

      // Combine and format members data
      const allMemberData = [
        ...(cellGroupMembers || []).map((item: any) => {
          const memberData = Array.isArray(item.members) ? item.members[0] : item.members;
          return {
            id: memberData?.id || '',
            first_name: memberData?.first_name || '',
            last_name: memberData?.last_name || '',
            status: memberData?.status || 'active'
          } as Member;
        }),
        ...(cellGroupLeaders || []).map((item: any) => {
          const memberData = Array.isArray(item.members) ? item.members[0] : item.members;
          return {
            id: memberData?.id || '',
            first_name: memberData?.first_name || '',
            last_name: memberData?.last_name || '',
            status: memberData?.status || 'active'
          } as Member;
        })
      ];

      // Remove duplicates (a leader might also be in the members list)
      const uniqueMembers = Array.from(
        new Map(allMemberData.map(item => [item.id, item])).values()
      ) as Member[];

      // Filter out inactive members
      const activeMembers = uniqueMembers.filter(member => member.status === 'active');
      setMembers(activeMembers);

    } catch (error: any) {
      console.error('Error fetching cell group members:', error);
    }
  };

  const fetchMinistryMembers = async (ministryId: string) => {
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) return;

      // Get all members in this ministry
      const { data: ministryMembers, error: membersError } = await supabase
        .from('ministry_members' as any)
        .select(`
          member_id,
          members:member_id (
            id,
            first_name,
            last_name,
            status
          )
        `)
        .eq('ministry_id', ministryId)
        .eq('status', 'active');

      if (membersError) throw membersError;

      // Format members data
      const allMemberData = (ministryMembers || []).map((item: any) => {
        const memberData = Array.isArray(item.members) ? item.members[0] : item.members;
        return {
          id: memberData?.id || '',
          first_name: memberData?.first_name || '',
          last_name: memberData?.last_name || '',
          status: memberData?.status || 'active'
        } as Member;
      });

      // Filter out inactive members
      const activeMembers = allMemberData.filter(member => member.status === 'active');
      setMembers(activeMembers);

    } catch (error: any) {
      console.error('Error fetching ministry members:', error);
    }
  };

  // Handle event category change (disabled in edit mode)
  const handleEventCategoryChange = (category: EventCategory) => {
    // Disabled in edit mode
  };

  // Handle context selection change (disabled in edit mode)
  const handleContextChange = (newContextId: string) => {
    // Disabled in edit mode
  };

  // Handle participant status change
  const handleParticipantStatusChange = (memberId: string, status: string) => {
    setParticipants(prev =>
      prev.map(p =>
        p.member_id === memberId ? { ...p, status: status as 'present' | 'absent' | 'late' | 'excused' } : p
      )
    );
  };

  // Add new participant from available members
  const addParticipant = (member: Member) => {
    // Check if member is already in participants
    const isAlreadyAdded = participants.some(p => p.member_id === member.id);
    if (isAlreadyAdded) return;

    const newParticipant: Participant = {
      member_id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      status: 'present',
      isRegistered: true,
    };

    setParticipants(prev => [...prev, newParticipant]);
  };

  // Remove participant
  const removeParticipant = (memberId: string) => {
    setParticipants(prev => prev.filter(p => p.member_id !== memberId));
  };

  // Get available members (not yet added as participants)
  const availableMembers = members.filter(member => 
    !participants.some(p => p.member_id === member.id)
  );

  // Handle new visitor input change
  const handleVisitorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewVisitor(prev => ({ ...prev, [name]: value }));
  };

  // Add new visitor
  const handleAddVisitor = () => {
    if (!newVisitor.first_name || !newVisitor.last_name) {
      setError('First name and last name are required for visitors');
      return;
    }

    setVisitors(prev => [...prev, { ...newVisitor }]);
    setNewVisitor({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      notes: '',
    });
    setError(null);
  };

  // Remove visitor
  const handleRemoveVisitor = (index: number) => {
    setVisitors(prev => prev.filter((_, i) => i !== index));
  };

  // Edit existing visitor
  const handleEditVisitor = (index: number, field: string, value: string) => {
    setVisitors(prev => prev.map((visitor, i) => 
      i === index ? { ...visitor, [field]: value } : visitor
    ));
  };

  // Save updated attendance record
  const handleSaveAttendance = async () => {
    if (!meeting) return;

    // Convert id to string if it's an array
    const meetingId = Array.isArray(id) ? id[0] : id;

    try {
      setSaving(true);
      setError(null);
      
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Database connection failed');
      }

      // Update meeting record
      const { error: meetingError } = await supabase
        .from('attendance_meetings' as any)
        .update({
          meeting_date: meetingDate,
          meeting_type: meetingType,
          topic: topic || null,
          notes: notes || null,
          location: location || null,
          offering: offering ? parseFloat(offering) : null,
        })
        .eq('id', meetingId);

      if (meetingError) throw meetingError;

      // Delete existing participants
      const { error: deleteParticipantsError } = await supabase
        .from('attendance_participants' as any)
        .delete()
        .eq('meeting_id', meetingId);

      if (deleteParticipantsError) throw deleteParticipantsError;

      // Insert updated participants
      if (participants.length > 0) {
        const participantRecords = participants.map(p => ({
          meeting_id: meetingId,
          member_id: p.member_id,
          status: p.status,
          notes: p.isRegistered ? 'Pre-registered member' : null,
        }));

        const { error: participantsError } = await supabase
          .from('attendance_participants' as any)
          .insert(participantRecords);
          
        if (participantsError) throw participantsError;
      }

      // Delete existing visitors
      const { error: deleteVisitorsError } = await supabase
        .from('attendance_visitors' as any)
        .delete()
        .eq('meeting_id', meetingId);

      if (deleteVisitorsError) throw deleteVisitorsError;

      // Insert updated visitors
      if (visitors.length > 0) {
        const visitorRecords = visitors.map(v => ({
          meeting_id: meetingId,
          first_name: v.first_name,
          last_name: v.last_name,
          phone: v.phone || null,
          email: v.email || null,
          notes: v.notes || null,
        }));

        const { error: visitorsError } = await supabase
          .from('attendance_visitors' as any)
          .insert(visitorRecords);

        if (visitorsError) throw visitorsError;
      }

      setSuccess(true);

      // Redirect to attendance detail page after a short delay
      setTimeout(() => {
        router.push(`/attendance/${meetingId}`);
      }, 1500);

    } catch (error: any) {
      setError(error.message || 'Failed to update attendance record');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header 
          title="Edit Attendance Record"
          backTo={`/attendance/${id}`}
          backLabel="Back to Details"
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div>
        <Header 
          title="Edit Attendance Record"
          backTo="/attendance"
          backLabel="Back to Attendance"
        />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Attendance record not found
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Edit Attendance Record"
        backTo={`/attendance/${id}`}
        backLabel="Back to Details"
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Attendance record updated successfully! Redirecting...
        </div>
      )}

      <div className="md:col-span-2 mb-4">
        <EventCategorySelector
          value={eventCategory}
          onChange={handleEventCategoryChange}
          disabled={true} // Disable in edit mode
        />
        <p className="text-sm text-gray-500 mt-1">
          Event category cannot be changed when editing
        </p>
      </div>

      <div className="md:col-span-2 mb-4">
        <ContextSelector
          category={eventCategory}
          value={contextId}
          onChange={handleContextChange}
          disabled={true} // Disable in edit mode
        />
        <p className="text-sm text-gray-500 mt-1">
          Context cannot be changed when editing
        </p>
      </div>

      <DynamicAttendanceForm
        eventCategory={eventCategory}
        contextId={contextId}
        meetingDate={meetingDate}
        setMeetingDate={setMeetingDate}
        meetingType={meetingType}
        setMeetingType={setMeetingType}
        location={location}
        setLocation={setLocation}
        topic={topic}
        setTopic={setTopic}
        notes={notes}
        setNotes={setNotes}
        offering={offering}
        setOffering={setOffering}
        participants={participants}
        handleParticipantStatusChange={handleParticipantStatusChange}
        newVisitor={newVisitor}
        handleVisitorChange={handleVisitorChange}
        handleAddVisitor={handleAddVisitor}
        handleRemoveVisitor={handleRemoveVisitor}
        visitors={visitors}
        saving={saving}
        success={success}
      />

      {/* Participant Management Section for Edit Mode */}
      {contextId && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Manage Participants</h3>
          
          {/* Current Participants */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Current Participants ({participants.length})</h4>
            {participants.length > 0 ? (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.member_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">
                        {participant.first_name} {participant.last_name}
                      </span>
                      <select
                        value={participant.status}
                        onChange={(e) => handleParticipantStatusChange(participant.member_id, e.target.value as 'present' | 'absent' | 'late' | 'excused')}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        disabled={saving}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(participant.member_id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No participants added yet</p>
            )}
          </div>

          {/* Add New Participants */}
          {availableMembers.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-2">Add Members ({availableMembers.length} available)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {availableMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => addParticipant(member)}
                    className="text-left p-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                    disabled={saving}
                  >
                    {member.first_name} {member.last_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end mt-6 space-x-3">
        <button
          type="button"
          onClick={() => router.push(`/attendance/${id}`)}
          className="btn-secondary"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveAttendance}
          className="btn-primary"
          disabled={saving || success}
        >
          {saving ? 'Updating...' : 'Update Attendance Record'}
        </button>
      </div>
    </div>
  );
}
