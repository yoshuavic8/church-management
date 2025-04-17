'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../../lib/supabase';
import Header from '../../components/Header';
import EventCategorySelector from '../components/EventCategorySelector';
import ContextSelector from '../components/ContextSelector';
import { EventCategory } from '../../types/ministry';

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
        console.error('Error fetching data:', error);
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
      console.error('Error fetching cell group members:', error);
      setError(error.message || 'Failed to load cell group members');
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
      console.error('Error fetching ministry members:', error);
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
  const handleContextChange = (newContextId: string) => {
    setContextId(newContextId);
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
    if (!contextId) {
      setError(`Please select a ${getCategoryContextLabel(eventCategory)}`);
      return;
    }

    if (!meetingDate) {
      setError('Please select a meeting date');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const supabase = getSupabaseClient();

      // Parse offering value to float if provided
      const offeringValue = offering ? parseFloat(offering) : null;

      // Prepare meeting record based on event category
      const meetingRecord: any = {
        event_category: eventCategory,
        meeting_date: meetingDate,
        meeting_type: meetingType,
        topic,
        notes,
        location,
        offering: offeringValue,
      };

      // Add the appropriate context ID based on event category
      if (eventCategory === 'cell_group') {
        meetingRecord.cell_group_id = contextId;
      } else if (eventCategory === 'ministry') {
        meetingRecord.ministry_id = contextId;
      }

      // 1. Create the meeting record
      const { data: meetingData, error: meetingError } = await supabase
        .from('attendance_meetings')
        .insert(meetingRecord)
        .select();

      if (meetingError) throw meetingError;

      if (!meetingData || meetingData.length === 0) {
        throw new Error('Failed to create meeting record');
      }

      const meetingId = meetingData[0].id;

      // 2. Record registered participants
      const registeredParticipants = participants.filter(p => p.isRegistered);
      if (registeredParticipants.length > 0) {
        const participantRecords = registeredParticipants.map(p => ({
          meeting_id: meetingId,
          member_id: p.member_id,
          status: p.status,
        }));

        const { error: participantsError } = await supabase
          .from('attendance_participants')
          .insert(participantRecords);

        if (participantsError) throw participantsError;
      }

      // 3. Record visitors
      if (visitors.length > 0) {
        const visitorRecords = visitors.map(v => ({
          meeting_id: meetingId,
          first_name: v.first_name,
          last_name: v.last_name,
          phone: v.phone,
          email: v.email,
          notes: v.notes,
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
      console.error('Error saving attendance:', error);
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

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Meeting Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <EventCategorySelector
              value={eventCategory}
              onChange={handleEventCategoryChange}
              disabled={loading || saving || success}
            />
          </div>

          <div className="md:col-span-2">
            <ContextSelector
              category={eventCategory}
              value={contextId}
              onChange={handleContextChange}
              disabled={loading || saving || success}
            />
          </div>

          <div>
            <label htmlFor="meeting_date" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Date *
            </label>
            <input
              id="meeting_date"
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="input-field"
              disabled={saving || success}
              required
            />
          </div>

          <div>
            <label htmlFor="meeting_type" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Type
            </label>
            <select
              id="meeting_type"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="input-field"
              disabled={saving || success}
            >
              <option value="regular">Regular Meeting</option>
              <option value="special">Special Meeting</option>
              <option value="outreach">Outreach</option>
              <option value="prayer">Prayer Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              disabled={saving || success}
              placeholder="Meeting location"
            />
          </div>

          <div>
            <label htmlFor="offering" className="block text-sm font-medium text-gray-700 mb-1">
              Offering Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">Rp</span>
              </div>
              <input
                id="offering"
                type="number"
                min="0"
                step="0.01"
                value={offering}
                onChange={(e) => setOffering(e.target.value)}
                className="input-field pl-10"
                disabled={saving || success}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Topic/Theme
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-field"
              disabled={saving || success}
              placeholder="Topic or theme of the meeting"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              disabled={saving || success}
              rows={3}
              placeholder="Any notes about this meeting"
            ></textarea>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {contextId && (
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-4">Attendance</h2>

              {participants.length === 0 ? (
                <p className="text-gray-500">No members found in this {eventCategory === 'cell_group' ? 'cell group' : eventCategory === 'ministry' ? 'ministry' : 'context'}.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.map((participant) => (
                        <tr key={participant.member_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.first_name} {participant.last_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleParticipantStatusChange(participant.member_id, 'present')}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  participant.status === 'present'
                                    ? 'bg-green-100 text-green-800 ring-2 ring-green-600'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                                disabled={saving || success}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleParticipantStatusChange(participant.member_id, 'absent')}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  participant.status === 'absent'
                                    ? 'bg-red-100 text-red-800 ring-2 ring-red-600'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                                disabled={saving || success}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleParticipantStatusChange(participant.member_id, 'late')}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  participant.status === 'late'
                                    ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-600'
                                    : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                }`}
                                disabled={saving || success}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => handleParticipantStatusChange(participant.member_id, 'excused')}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  participant.status === 'excused'
                                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-600'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                                disabled={saving || success}
                              >
                                Excused
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
          )}

          {contextId && (
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-4">New Visitors</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="visitor_first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    id="visitor_first_name"
                    name="first_name"
                    type="text"
                    value={newVisitor.first_name}
                    onChange={handleVisitorChange}
                    className="input-field"
                    disabled={saving || success}
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label htmlFor="visitor_last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="visitor_last_name"
                    name="last_name"
                    type="text"
                    value={newVisitor.last_name}
                    onChange={handleVisitorChange}
                    className="input-field"
                    disabled={saving || success}
                    placeholder="Last name"
                  />
                </div>

                <div>
                  <label htmlFor="visitor_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="visitor_phone"
                    name="phone"
                    type="tel"
                    value={newVisitor.phone}
                    onChange={handleVisitorChange}
                    className="input-field"
                    disabled={saving || success}
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label htmlFor="visitor_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="visitor_email"
                    name="email"
                    type="email"
                    value={newVisitor.email}
                    onChange={handleVisitorChange}
                    className="input-field"
                    disabled={saving || success}
                    placeholder="Email address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="visitor_notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="visitor_notes"
                    name="notes"
                    value={newVisitor.notes}
                    onChange={handleVisitorChange}
                    className="input-field"
                    disabled={saving || success}
                    rows={2}
                    placeholder="Any notes about this visitor"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddVisitor}
                    className="btn-secondary"
                    disabled={!newVisitor.first_name || !newVisitor.last_name || saving || success}
                  >
                    Add Visitor
                  </button>
                </div>
              </div>

              {visitors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Added Visitors</h3>
                  <div className="space-y-3">
                    {visitors.map((visitor, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{visitor.first_name} {visitor.last_name}</p>
                          <p className="text-sm text-gray-600">
                            {visitor.phone && <span className="mr-3">{visitor.phone}</span>}
                            {visitor.email && <span>{visitor.email}</span>}
                          </p>
                          {visitor.notes && <p className="text-sm text-gray-500 mt-1">{visitor.notes}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVisitor(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={saving || success}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
