'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meetingId: string;
}

interface CellGroup {
  id: string;
  name: string;
}

interface Ministry {
  id: string;
  name: string;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ParticipantStatus {
  id?: string;
  member_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

interface Visitor {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

interface MeetingData {
  id: string;
  event_category: string;
  cell_group_id?: string;
  ministry_id?: string;
  meeting_date: string;
  meeting_type: string;
  topic: string;
  location: string;
  notes?: string;
  offering?: number;
  is_realtime: boolean;
  participants?: ParticipantStatus[];
}

interface MeetingApiResponse {
  id: string;
  event_category: string;
  meeting_date: string;
  meeting_type: string;
  topic: string;
  location: string;
  notes?: string;
  offering?: number;
  is_realtime: boolean;
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
  }>;
}

export default function EditMeetingModal({ isOpen, onClose, onSuccess, meetingId }: EditMeetingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(false);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  
  const [formData, setFormData] = useState<MeetingData>({
    id: '',
    event_category: 'cell_group',
    cell_group_id: '',
    ministry_id: '',
    meeting_date: '',
    meeting_type: 'regular',
    topic: '',
    location: '',
    notes: '',
    offering: 0,
    is_realtime: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load meeting data when modal opens
  useEffect(() => {
    if (isOpen && meetingId) {
      loadMeetingData();
      loadCellGroups();
      loadMinistries();
    }
  }, [isOpen, meetingId]);

  const loadMeetingData = async () => {
    setIsLoadingMeeting(true);
    try {
      const response = await apiClient.getAttendanceMeeting(meetingId);
      if (response.success && response.data) {
        const meeting: MeetingApiResponse = response.data;
        setFormData({
          id: meeting.id,
          event_category: meeting.event_category,
          cell_group_id: meeting.cell_group?.id || '',
          ministry_id: meeting.ministry?.id || '',
          meeting_date: meeting.meeting_date.split('T')[0], // Format date for input
          meeting_type: meeting.meeting_type,
          topic: meeting.topic || '',
          location: meeting.location || '',
          notes: meeting.notes || '',
          offering: meeting.offering || 0,
          is_realtime: meeting.is_realtime
        });

        // Load participants if it's a cell group or ministry meeting
        if ((meeting.event_category === 'cell_group' && meeting.cell_group?.id) || 
            (meeting.event_category === 'ministry' && meeting.ministry?.id)) {
          // First set participants from API data (transform the structure)
          if (meeting.participants) {
            const transformedParticipants = meeting.participants.map(p => ({
              id: p.id,
              member_id: p.member.id,
              status: p.status,
              notes: p.notes || ''
            }));
            setParticipants(transformedParticipants);
          }
          // Then load members (in edit mode, don't add new participants)
          if (meeting.event_category === 'cell_group' && meeting.cell_group?.id) {
            await loadMembers(meeting.cell_group.id, true);
          } else if (meeting.event_category === 'ministry' && meeting.ministry?.id) {
            await loadMinistryMembers(meeting.ministry.id, true);
          }
        }

        // Load visitors if any
        if (meeting.visitors) {
          const transformedVisitors = meeting.visitors.map(v => ({
            id: v.id,
            name: `${v.first_name} ${v.last_name}`.trim(),
            phone: v.phone || '',
            email: v.email || '',
            notes: v.notes || ''
          }));
          setVisitors(transformedVisitors);
        }
      }
    } catch (error) {
      console.error('Error loading meeting:', error);
      setErrors({ general: 'Failed to load meeting data' });
    } finally {
      setIsLoadingMeeting(false);
    }
  };

  const loadCellGroups = async () => {
    try {
      const response = await apiClient.getCellGroups();
      if (response.success && response.data) {
        setCellGroups(response.data);
      }
    } catch (error) {
      console.error('Error loading cell groups:', error);
    }
  };

  const loadMinistries = async () => {
    try {
      const response = await apiClient.getMinistries();
      if (response.success && response.data) {
        setMinistries(response.data);
      }
    } catch (error) {
      console.error('Error loading ministries:', error);
    }
  };

  const loadMembers = async (cellGroupId: string, isEditMode: boolean = false) => {
    try {
      const response = await apiClient.getCellGroupMembers(cellGroupId);
      if (response.success && response.data) {
        // Transform the nested member data to flat structure
        const flatMembers = response.data.map((memberData: any) => ({
          id: memberData.member.id,
          first_name: memberData.member.first_name,
          last_name: memberData.member.last_name,
          email: memberData.member.email,
          phone: memberData.member.phone,
          status: memberData.member.status
        }));
        
        setMembers(flatMembers);
        
        // Only initialize participants for new members when NOT in edit mode
        if (!isEditMode) {
          const existingMemberIds = participants.map(p => p.member_id);
          const newMembers = flatMembers.filter((member: Member) => 
            !existingMemberIds.includes(member.id)
          );
          
          if (newMembers.length > 0) {
            const newParticipants = newMembers.map((member: Member) => ({
              member_id: member.id,
              status: 'absent' as const,
              notes: ''
            }));
            setParticipants(prev => [...prev, ...newParticipants]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading members:', error);
      setMembers([]);
    }
  };

  // Load ministry members function
  const loadMinistryMembers = async (ministryId: string, isEditMode: boolean = false) => {
    try {
      const response = await apiClient.getMinistry(ministryId);
      if (response.success && response.data && response.data.ministry_members) {
        // Transform the nested member data to flat structure
        const flatMembers = response.data.ministry_members
          .filter((memberData: any) => memberData.status === 'active')
          .map((memberData: any) => ({
            id: memberData.member.id,
            first_name: memberData.member.first_name,
            last_name: memberData.member.last_name,
            email: memberData.member.email,
            phone: memberData.member.phone,
            status: memberData.member.status
          }));
        
        setMembers(flatMembers);
        
        // Only initialize participants for new members when NOT in edit mode
        if (!isEditMode) {
          const existingMemberIds = participants.map(p => p.member_id);
          const newMembers = flatMembers.filter((member: Member) => 
            !existingMemberIds.includes(member.id)
          );
          
          if (newMembers.length > 0) {
            const newParticipants = newMembers.map((member: Member) => ({
              member_id: member.id,
              status: 'absent' as const,
              notes: ''
            }));
            setParticipants(prev => [...prev, ...newParticipants]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading ministry members:', error);
      setMembers([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Load members when cell group is selected
      if (name === 'cell_group_id' && value) {
        loadMembers(value);
      }
      
      // Load members when ministry is selected
      if (name === 'ministry_id' && value) {
        loadMinistryMembers(value);
      }
      
      // Load members when category changes to cell_group and cell_group_id exists
      if (name === 'event_category' && value === 'cell_group') {
        const cellGroupId = formData.cell_group_id || (document.querySelector('[name="cell_group_id"]') as HTMLSelectElement)?.value;
        if (cellGroupId) {
          loadMembers(cellGroupId);
        }
      }
      
      // Load members when category changes to ministry and ministry_id exists
      if (name === 'event_category' && value === 'ministry') {
        const ministryId = formData.ministry_id || (document.querySelector('[name="ministry_id"]') as HTMLSelectElement)?.value;
        if (ministryId) {
          loadMinistryMembers(ministryId);
        }
      }
      
      // Clear members when category changes away from cell_group and ministry
      if (name === 'event_category' && value !== 'cell_group' && value !== 'ministry') {
        setMembers([]);
        setParticipants([]);
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleParticipantStatusChange = (memberId: string, status: ParticipantStatus['status']) => {
    setParticipants(prev => prev.map(p => 
      p.member_id === memberId ? { ...p, status } : p
    ));
  };

  const handleParticipantNotesChange = (memberId: string, notes: string) => {
    setParticipants(prev => prev.map(p => 
      p.member_id === memberId ? { ...p, notes } : p
    ));
  };

  // Handle visitors
  const addVisitor = () => {
    setVisitors(prev => [...prev, { name: '', phone: '', email: '', notes: '' }]);
  };

  const removeVisitor = (index: number) => {
    setVisitors(prev => prev.filter((_, i) => i !== index));
  };

  const updateVisitor = (index: number, field: keyof Visitor, value: string) => {
    setVisitors(prev => prev.map((visitor, i) => 
      i === index ? { ...visitor, [field]: value } : visitor
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.event_category) {
      newErrors.event_category = 'Category is required';
    }

    if (!formData.meeting_date) {
      newErrors.meeting_date = 'Meeting date is required';
    }

    if (!formData.topic?.trim()) {
      newErrors.topic = 'Topic is required';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.event_category === 'cell_group' && !formData.cell_group_id) {
      newErrors.cell_group_id = 'Cell group is required for cell group meetings';
    }

    if (formData.event_category === 'ministry' && !formData.ministry_id) {
      newErrors.ministry_id = 'Ministry is required for ministry meetings';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const meetingData: any = {
        event_category: formData.event_category,
        meeting_date: formData.meeting_date,
        meeting_type: formData.meeting_type,
        topic: formData.topic?.trim() || '',
        location: formData.location?.trim() || '',
        notes: formData.notes?.trim() || null,
        offering: formData.offering && formData.offering > 0 ? formData.offering : null,
        is_realtime: formData.is_realtime
      };

      if (formData.event_category === 'cell_group' && formData.cell_group_id) {
        meetingData.cell_group_id = formData.cell_group_id;
        meetingData.participants = participants;
      }

      if (formData.event_category === 'ministry' && formData.ministry_id) {
        meetingData.ministry_id = formData.ministry_id;
        meetingData.participants = participants;
      }

      // Add visitors if any
      if (visitors.length > 0) {
        const validVisitors = visitors.filter(v => v.name?.trim());
        if (validVisitors.length > 0) {
          meetingData.visitors = validVisitors;
        }
      }

      const response = await apiClient.updateAttendanceMeeting(meetingId, meetingData);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ general: response.error?.message || 'Failed to update meeting' });
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred while updating the meeting' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Edit Meeting</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {isLoadingMeeting ? (
          <div className="px-6 py-8 text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading meeting data...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Event Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Category *
              </label>
              <select
                name="event_category"
                value={formData.event_category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="cell_group">Cell Group</option>
                <option value="ministry">Ministry</option>
                <option value="sunday_service">Sunday Service</option>
                <option value="special_event">Special Event</option>
                <option value="prayer">Prayer Meeting</option>
                <option value="class">Class</option>
                <option value="other">Other</option>
              </select>
              {errors.event_category && (
                <p className="mt-1 text-xs text-red-600">{errors.event_category}</p>
              )}
            </div>

            {/* Conditional Cell Group Selection */}
            {formData.event_category === 'cell_group' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cell Group *
                </label>
                <select
                  name="cell_group_id"
                  value={formData.cell_group_id}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Cell Group</option>
                  {cellGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
                {errors.cell_group_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.cell_group_id}</p>
                )}
              </div>
            )}

            {/* Conditional Ministry Selection */}
            {formData.event_category === 'ministry' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ministry *
                </label>
                <select
                  name="ministry_id"
                  value={formData.ministry_id}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Ministry</option>
                  {ministries.map(ministry => (
                    <option key={ministry.id} value={ministry.id}>{ministry.name}</option>
                  ))}
                </select>
                {errors.ministry_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.ministry_id}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meeting Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Date *
                </label>
                <input
                  type="date"
                  name="meeting_date"
                  value={formData.meeting_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.meeting_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.meeting_date}</p>
                )}
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Type
                </label>
                <select
                  name="meeting_type"
                  value={formData.meeting_type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="regular">Regular</option>
                  <option value="special">Special</option>
                  <option value="training">Training</option>
                  <option value="outreach">Outreach</option>
                </select>
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="Enter meeting topic"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {errors.topic && (
                <p className="mt-1 text-xs text-red-600">{errors.topic}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter meeting location"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Offering */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offering Amount
                </label>
                <input
                  type="number"
                  name="offering"
                  value={formData.offering || ''}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes about the meeting"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Real-time Meeting */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_realtime"
                  checked={formData.is_realtime}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Enable real-time attendance tracking
                </span>
              </label>
            </div>

            {/* Participants Section - Show for cell group and ministry meetings */}
            {(formData.event_category === 'cell_group' || formData.event_category === 'ministry') && members.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Attendance</h4>
                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.map((member) => {
                        const participant = participants.find(p => p.member_id === member.id);
                        return (
                          <tr key={member.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {member.first_name} {member.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {[
                                  { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800 border-green-200' },
                                  { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800 border-red-200' },
                                  { value: 'late', label: 'Late', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                                  { value: 'excused', label: 'Excused', color: 'bg-blue-100 text-blue-800 border-blue-200' }
                                ].map((status) => (
                                  <button
                                    key={status.value}
                                    type="button"
                                    onClick={() => handleParticipantStatusChange(member.id, status.value as ParticipantStatus['status'])}
                                    className={`px-2 py-1 text-xs font-medium rounded-full border transition-all ${
                                      participant?.status === status.value 
                                        ? status.color + ' ring-2 ring-offset-1 ring-gray-400 shadow-md' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {status.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                placeholder="Add notes..."
                                value={participant?.notes || ''}
                                onChange={(e) => handleParticipantNotesChange(member.id, e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Attendance Summary */}
                <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
                  {[
                    { status: 'present', label: 'Present', color: 'text-green-600', bg: 'bg-green-50' },
                    { status: 'absent', label: 'Absent', color: 'text-red-600', bg: 'bg-red-50' },
                    { status: 'late', label: 'Late', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { status: 'excused', label: 'Excused', color: 'text-blue-600', bg: 'bg-blue-50' }
                  ].map((item) => (
                    <div key={item.status} className={`text-center p-3 rounded-lg ${item.bg}`}>
                      <div className={`text-2xl font-bold ${item.color}`}>
                        {participants.filter(p => p.status === item.status).length}
                      </div>
                      <div className="text-gray-600 text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Total Members */}
                <div className="mt-2 text-center text-sm text-gray-500">
                  Total Members: {members.length}
                </div>
              </div>
            )}

            {/* Visitors Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Visitors</h4>
                <button
                  type="button"
                  onClick={addVisitor}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  + Add Visitor
                </button>
              </div>

              {visitors.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No visitors recorded</p>
                  <p className="text-xs">Click "Add Visitor" to record first-time attendees</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visitors.map((visitor, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-900">Visitor {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeVisitor(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Full name"
                            value={visitor.name}
                            onChange={(e) => updateVisitor(index, 'name', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            placeholder="Phone number"
                            value={visitor.phone || ''}
                            onChange={(e) => updateVisitor(index, 'phone', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            placeholder="Email address"
                            value={visitor.email || ''}
                            onChange={(e) => updateVisitor(index, 'email', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            placeholder="Additional notes"
                            value={visitor.notes || ''}
                            onChange={(e) => updateVisitor(index, 'notes', e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Visitors Summary */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {visitors.length}
                    </div>
                    <div className="text-blue-600 text-xs">Total Visitors</div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Meeting'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
