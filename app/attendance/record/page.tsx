'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';
import EventCategorySelector from '../components/EventCategorySelector';
import ContextSelector from '../components/ContextSelector';
import { EventCategory } from '../../types/ministry';
import DynamicAttendanceForm from '../components/forms/DynamicAttendanceForm';

type CellGroup = {
  id: string;
  name: string;
};

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

// Client component that uses useSearchParams
function RecordAttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cellGroupIdParam = searchParams.get('cell_group');
  const ministryIdParam = searchParams.get('ministry');

  // Determine initial event category based on URL parameters
  const getInitialEventCategory = (): EventCategory => {
    if (cellGroupIdParam) return 'cell_group';
    if (ministryIdParam) return 'ministry';
    return 'cell_group'; // Default to cell group
  };

  // Determine initial context ID based on URL parameters
  const getInitialContextId = (): string => {
    if (cellGroupIdParam) return cellGroupIdParam;
    if (ministryIdParam) return ministryIdParam;
    return '';
  };

  const [eventCategory, setEventCategory] = useState<EventCategory>(getInitialEventCategory());
  const [contextId, setContextId] = useState<string>(getInitialContextId());
  const [members, setMembers] = useState<Member[]>([]);
  const [meetingDate, setMeetingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meetingType, setMeetingType] = useState<string>('regular');
  const [topic, setTopic] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [offering, setOffering] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [newVisitor, setNewVisitor] = useState<Visitor>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch members based on event category and context
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // If context is selected, fetch its members
        if (contextId) {
          if (eventCategory === 'cell_group') {
            await fetchCellGroupMembers(contextId);
          } else if (eventCategory === 'ministry') {
            await fetchMinistryMembers(contextId);
          } else if (eventCategory === 'class') {
            await fetchClassMembers(contextId);
          } else {
            // For other event types, we might not have predefined members
            setMembers([]);
            setParticipants([]);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [eventCategory, contextId]);

  // Fetch cell group members when a cell group is selected
  const fetchCellGroupMembers = async (cellGroupId: string) => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Get all members in this cell group
      const { data: cellGroupMembers, error: membersError } = await supabase
        .from('cell_group_members')
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
        .from('cell_group_leaders')
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

      // Combine and format members data - fix the type issue
      const allMemberData = [
        ...(cellGroupMembers || []).map(item => {
          // Check if item.members is an array or an object
          const memberData = Array.isArray(item.members) ? item.members[0] : item.members;
          return {
            id: memberData.id,
            first_name: memberData.first_name,
            last_name: memberData.last_name,
            status: memberData.status
          } as Member;
        }),
        ...(cellGroupLeaders || []).map(item => {
          // Check if item.members is an array or an object
          const memberData = Array.isArray(item.members) ? item.members[0] : item.members;
          return {
            id: memberData.id,
            first_name: memberData.first_name,
            last_name: memberData.last_name,
            status: memberData.status
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

      // Initialize participants with all active members
      const initialParticipants: Participant[] = activeMembers.map(member => ({
        member_id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        status: 'present', // Default to present
        isRegistered: true,
      }));

      setParticipants(initialParticipants);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to load cell group members');
      setLoading(false);
    }
  };

  // Fetch class members (enrollments)
  const fetchClassMembers = async (sessionId: string) => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // First, get the class and level IDs for this session
      const { data: sessionData, error: sessionError } = await supabase
        .from('class_sessions')
        .select('class_id, level_id')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw sessionError;
      }

      // Get enrollments based on class_id and level_id
      let query = supabase
        .from('class_enrollments')
        .select(`
          id,
          member_id,
          status,
          member:member_id(id, first_name, last_name, status)
        `)
        .eq('class_id', sessionData.class_id)
        .eq('status', 'enrolled');

      // If level_id is not null, add it to the query
      if (sessionData.level_id) {
        query = query.eq('level_id', sessionData.level_id);
      }

      const { data: enrollmentsData, error: enrollmentsError } = await query;

      if (enrollmentsError) {
        throw enrollmentsError;
      }

      // Format members data
      const allMemberData = (enrollmentsData || []).map(item => {
        const memberData = Array.isArray(item.member) ? item.member[0] : item.member;
        return {
          id: memberData.id,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          status: memberData.status
        } as Member;
      });

      // Filter out inactive members
      const activeMembers = allMemberData.filter(member => member.status === 'active');

      setMembers(activeMembers);

      // Initialize participants with all active members
      const initialParticipants: Participant[] = activeMembers.map(member => ({
        member_id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        status: 'present', // Default to present
        isRegistered: true,
      }));

      setParticipants(initialParticipants);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to load class members');
      setLoading(false);
    }
  };

  // Fetch ministry members
  const fetchMinistryMembers = async (ministryId: string) => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Get all members in this ministry
      const { data: ministryMembers, error: membersError } = await supabase
        .from('ministry_members')
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
      const allMemberData = (ministryMembers || []).map(item => {
        // Check if item.members is an array or an object
        const memberData = Array.isArray(item.members) ? item.members[0] : item.members;
        return {
          id: memberData.id,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          status: memberData.status
        } as Member;
      });

      // Filter out inactive members
      const activeMembers = allMemberData.filter(member => member.status === 'active');

      setMembers(activeMembers);

      // Initialize participants with all active members
      const initialParticipants: Participant[] = activeMembers.map(member => ({
        member_id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        status: 'present', // Default to present
        isRegistered: true,
      }));

      setParticipants(initialParticipants);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to load ministry members');
      setLoading(false);
    }
  };

  // Handle event category change
  const handleEventCategoryChange = (category: EventCategory) => {
    setEventCategory(category);
    setContextId(''); // Reset context when category changes
    setMembers([]);
    setParticipants([]);
  };

  // Handle context selection change
  const handleContextChange = async (newContextId: string) => {
    setContextId(newContextId);

    // If no context is selected, return
    if (!newContextId) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Fetch meeting details based on event category
      if (eventCategory === 'cell_group') {
        // For cell groups, we don't have pre-stored meeting details
        // We could fetch the cell group location if needed
        const { data: cellGroup, error: cellGroupError } = await supabase
          .from('cell_groups')
          .select('location, name')
          .eq('id', newContextId)
          .single();

        if (cellGroupError) throw cellGroupError;

        if (cellGroup) {
          setLocation(cellGroup.location || '');
          setTopic(`${cellGroup.name} Meeting`);
        }
      } else if (eventCategory === 'ministry') {
        // For ministries, we could fetch ministry details if needed
        const { data: ministry, error: ministryError } = await supabase
          .from('ministries')
          .select('location, name')
          .eq('id', newContextId)
          .single();

        if (ministryError) throw ministryError;

        if (ministry) {
          setLocation(ministry.location || '');
          setTopic(`${ministry.name} Meeting`);
        }
      } else if (eventCategory === 'class') {
        // For classes, fetch session details
        const { data: session, error: sessionError } = await supabase
          .from('class_sessions')
          .select(`
            title,
            description,
            location,
            session_date,
            start_time,
            end_time,
            classes:class_id(name)
          `)
          .eq('id', newContextId)
          .single();

        if (sessionError) throw sessionError;

        if (session) {
          // Update form fields with session data
          setTopic(session.title || '');
          setNotes(session.description || '');
          setLocation(session.location || '');

          // Set meeting date from session_date
          if (session.session_date) {
            setMeetingDate(session.session_date);
          }

          // Set meeting type
          setMeetingType('class');
        }
      }

      // Fetch members for the selected context
      if (eventCategory === 'cell_group') {
        await fetchCellGroupMembers(newContextId);
      } else if (eventCategory === 'ministry') {
        await fetchMinistryMembers(newContextId);
      } else if (eventCategory === 'class') {
        await fetchClassMembers(newContextId);
      } else {
        // For other event types, we might not have predefined members
        setMembers([]);
        setParticipants([]);
        setLoading(false);
      }
    } catch (error: any) {
      setError(`Error loading context details: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Handle participant status change
  const handleParticipantStatusChange = (memberId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setParticipants(prev =>
      prev.map(p =>
        p.member_id === memberId ? { ...p, status } : p
      )
    );
  };

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

  // Save attendance record
  const handleSaveAttendance = async () => {
    // Validate required fields
    if (!contextId) {
      setError(`Please select a ${getCategoryContextLabel(eventCategory)}`);
      return;
    }

    if (!meetingDate) {
      setError('Please select a meeting date');
      return;
    }

    // Validate that at least one participant has a status set
    if (participants.length > 0 && !participants.some(p => p.status !== 'unknown')) {
      setError('Please set attendance status for at least one member');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Database connection failed. Please refresh the page and try again.');
      }
      
      console.log('Saving attendance record for category:', eventCategory);
      
      // Create attendance meeting record
      // Untuk kelas, simpan ID sesi di field notes karena tidak ada kolom khusus untuk itu
      let notesValue = notes || null;
      if (eventCategory === 'class' && contextId) {
        notesValue = `Class Session ID: ${contextId}${notes ? '\n' + notes : ''}`;
      }
      
      const meetingData = {
        event_category: eventCategory,
        meeting_date: meetingDate,
        meeting_type: meetingType,
        topic: topic || null,
        notes: notesValue,
        location: location || null,
        offering: offering ? parseFloat(offering) : null,
        // Hapus is_recurring karena kolom ini tidak ada di tabel
        cell_group_id: eventCategory === 'cell_group' ? contextId : null,
        ministry_id: eventCategory === 'ministry' ? contextId : null,
      };
      
      console.log('Meeting data to save:', meetingData);
      
      const { data: meetingRecord, error: meetingError } = await supabase
        .from('attendance_meetings')
        .insert(meetingData)
        .select('id')
        .single();
        
      if (meetingError) {
        console.error('Error creating meeting record:', meetingError);
        throw meetingError;
      }
      
      if (!meetingRecord) {
        throw new Error('Failed to create meeting record');
      }
      
      const meetingId = meetingRecord.id;
      console.log('Created meeting with ID:', meetingId);
      
      // Record participant attendance
      if (participants.length > 0) {
        // Hanya gunakan kolom yang benar-benar ada di tabel attendance_participants
        const participantRecords = participants.map(p => ({
          meeting_id: meetingId,
          member_id: p.member_id,
          status: p.status,
          notes: p.isRegistered ? 'Pre-registered member' : null, // Simpan informasi registrasi di notes sebagai gantinya
        }));
        
        console.log('Saving participant records:', participantRecords.length);
        
        const { error: participantsError } = await supabase
          .from('attendance_participants')
          .insert(participantRecords);
          
        if (participantsError) {
          console.error('Error saving participants:', participantsError);
          throw participantsError;
        }
      }

      // Update class session status if this is a class attendance
      if (eventCategory === 'class') {
        try {
          const { error: updateError } = await supabase
            .from('class_sessions')
            .update({ status: 'completed' })
            .eq('id', contextId);

          if (updateError) throw updateError;
        } catch (error: any) {
          // Log error but continue - this is not critical
        }
      }

      // Record visitors
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
          .from('attendance_visitors')
          .insert(visitorRecords);

        if (visitorsError) throw visitorsError;
      }

      setSuccess(true);

      // Redirect to attendance details page after a short delay
      setTimeout(() => {
        router.push(`/attendance/${meetingId}`);
      }, 1500);

    } catch (error: any) {
      setError(error.message || 'Failed to save attendance record');
      setSaving(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Attendance recorded successfully! Redirecting...
        </div>
      )}

      <div className="md:col-span-2 mb-4">
        <EventCategorySelector
          value={eventCategory}
          onChange={handleEventCategoryChange}
          disabled={loading || saving || success}
        />
      </div>

      <div className="md:col-span-2 mb-4">
        <ContextSelector
          category={eventCategory}
          value={contextId}
          onChange={handleContextChange}
          disabled={loading || saving || success}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="btn-primary"
              disabled={!contextId || saving || success}
            >
              {saving ? 'Saving...' : 'Save Attendance Record'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to get appropriate label for context
function getCategoryContextLabel(category: EventCategory): string {
  switch (category) {
    case 'cell_group': return 'Cell Group';
    case 'ministry': return 'Ministry';
    case 'prayer': return 'Prayer Type';
    case 'service': return 'Service Type';
    case 'class': return 'Class Session';
    default: return 'Event Type';
  }
}

// Page component with Suspense boundary
export default function RecordAttendancePage() {
  return (
    <div>
      <Header title="Record Attendance" />
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <RecordAttendanceContent />
      </Suspense>
    </div>
  );
}
