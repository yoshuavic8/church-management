'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CellGroup {
  id: string;
  name: string;
}

interface Ministry {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  has_levels: boolean;
  levels?: ClassLevel[];
}

interface ClassLevel {
  id: string;
  name: string;
  order: number;
}

interface ClassSession {
  id: string;
  title: string;
  description: string;
  session_date: string;
  location?: string;
  level_id?: string;
  class_id?: string;
  order_number: number;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ParticipantStatus {
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

export default function AddMeetingModal({ isOpen, onClose, onSuccess }: AddMeetingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  
  const [formData, setFormData] = useState({
    event_category: 'cell_group',
    cell_group_id: '',
    ministry_id: '',
    class_id: '',
    level_id: '',
    session_id: '',
    meeting_date: '',
    meeting_type: 'regular',
    topic: '',
    location: '',
    notes: '',
    offering: '',
    is_realtime: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load cell groups and ministries when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCellGroups();
      loadMinistries();
      loadClasses();
    }
  }, [isOpen]);

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

  const loadClasses = async () => {
    try {
      const response = await apiClient.getClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  // Load class levels when class is selected
  const loadClassLevels = async (classId: string) => {
    try {
      const response = await apiClient.getClassLevels(classId);
      if (response.success && response.data) {
        setClassLevels(response.data);
      }
    } catch (error) {
      console.error('Error loading class levels:', error);
    }
  };

  // Load class sessions based on class and level
  const loadClassSessions = async (classId: string, levelId?: string) => {
    try {
      console.log('Loading sessions for class:', classId, 'level:', levelId);
      const response = await apiClient.getClassSessions(classId, levelId);
      
      if (response.success && response.data) {
        console.log('Sessions loaded:', response.data);
        setClassSessions(response.data);
      } else {
        console.log('No sessions found or API error');
        setClassSessions([]);
      }
    } catch (error) {
      console.error('Error loading class sessions:', error);
      setClassSessions([]);
    }
  };

  // Load enrolled members for a class
  const loadClassMembers = async (classId: string, levelId?: string) => {
    setIsLoadingMembers(true);
    try {
      console.log('Loading enrolled members for class:', classId, 'level:', levelId);
      const params = levelId ? { level_id: levelId } : {};
      const response = await apiClient.getClassEnrollments(classId, params);
      console.log('Class enrollment API response:', response);
      
      if (response.success && response.data) {
        console.log('Raw enrollment data:', response.data);
        
        // Transform the enrollment data to flat member structure
        const flatMembers = response.data
          .filter((enrollment: any) => enrollment.status === 'enrolled')
          .map((enrollment: any) => ({
            id: enrollment.member.id,
            first_name: enrollment.member.first_name,
            last_name: enrollment.member.last_name,
            email: enrollment.member.email,
            phone: enrollment.member.phone,
            status: enrollment.member.status
          }));
        
        console.log('Transformed enrolled members:', flatMembers);
        setMembers(flatMembers);
        
        // Initialize participants with all members marked as absent by default (for live attendance)
        const initialParticipants = flatMembers.map((member: Member) => ({
          member_id: member.id,
          status: 'absent' as const,
          notes: ''
        }));
        setParticipants(initialParticipants);
      } else {
        console.log('No enrolled members found');
        setMembers([]);
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error loading class members:', error);
      setMembers([]);
      setParticipants([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Load members when cell group is selected
  const loadMembers = async (cellGroupId: string) => {
    setIsLoadingMembers(true);
    try {
      console.log('Loading members for cell group:', cellGroupId);
      const response = await apiClient.getCellGroupMembers(cellGroupId);
      console.log('API response:', response);
      
      if (response.success && response.data) {
        console.log('Raw member data:', response.data);
        
        // Transform the nested member data to flat structure
        const flatMembers = response.data.map((memberData: any) => ({
          id: memberData.member.id,
          first_name: memberData.member.first_name,
          last_name: memberData.member.last_name,
          email: memberData.member.email,
          phone: memberData.member.phone,
          status: memberData.member.status
        }));
        
        console.log('Transformed members:', flatMembers);
        setMembers(flatMembers);
        
        // Initialize participants with all members marked as absent by default (for live attendance)
        const initialParticipants = flatMembers.map((member: Member) => ({
          member_id: member.id,
          status: 'absent' as const,
          notes: ''
        }));
        setParticipants(initialParticipants);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Load members when ministry is selected
  const loadMinistryMembers = async (ministryId: string) => {
    setIsLoadingMembers(true);
    try {
      console.log('Loading members for ministry:', ministryId);
      const response = await apiClient.getMinistry(ministryId);
      console.log('Ministry API response:', response);
      
      if (response.success && response.data) {
        console.log('Ministry data:', response.data);
        
        if (response.data.ministry_members && response.data.ministry_members.length > 0) {
          console.log('Raw ministry member data:', response.data.ministry_members);
          
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
          
          console.log('Transformed ministry members:', flatMembers);
          setMembers(flatMembers);
          
          // Initialize participants with all members marked as absent by default (for live attendance)
          const initialParticipants = flatMembers.map((member: Member) => ({
            member_id: member.id,
            status: 'absent' as const,
            notes: ''
          }));
          setParticipants(initialParticipants);
        } else {
          console.log('No ministry members found');
          setMembers([]);
          setParticipants([]);
        }
      } else {
        console.error('Failed to fetch ministry data:', response.error);
        setMembers([]);
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error loading ministry members:', error);
      setMembers([]);
      setParticipants([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Handle participant status change
  const handleParticipantStatusChange = (memberId: string, status: ParticipantStatus['status']) => {
    setParticipants(prev => prev.map(p => 
      p.member_id === memberId ? { ...p, status } : p
    ));
  };

  // Handle participant notes change
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      console.log('Setting form data:', { [name]: value });
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Load members when cell group is selected
      if (name === 'cell_group_id' && value) {
        console.log('Loading members for cell group:', value);
        loadMembers(value);
      }
      
      // Load members when ministry is selected
      if (name === 'ministry_id' && value) {
        console.log('Loading members for ministry:', value);
        loadMinistryMembers(value);
      }
      
      // Load levels when class is selected
      if (name === 'class_id' && value) {
        console.log('Loading levels for class:', value);
        const selectedClass = classes.find(c => c.id === value);
        if (selectedClass && selectedClass.has_levels) {
          loadClassLevels(value);
          setClassSessions([]); // Clear sessions until level is selected
        } else {
          // Single-level class, load sessions directly and load members
          setClassLevels([]);
          loadClassSessions(value);
          loadClassMembers(value);
        }
      }
      
      // Load sessions when level is selected  
      if (name === 'level_id' && value && formData.class_id) {
        console.log('Loading sessions for class level:', formData.class_id, value);
        loadClassSessions(formData.class_id, value);
        loadClassMembers(formData.class_id, value);
      }
      
      // Auto-populate topic when session is selected
      if (name === 'session_id' && value) {
        const selectedSession = classSessions.find(s => s.id === value);
        if (selectedSession) {
          setFormData(prev => ({
            ...prev,
            session_id: value,
            topic: selectedSession.title, // Auto-fill topic with session title
            location: selectedSession.location || prev.location
          }));
          return; // Early return to prevent duplicate state update
        }
      }
      
      // Load members when level is selected (moved here to avoid duplication)
      if (name === 'level_id' && value && formData.class_id) {
        console.log('Loading members for class level:', formData.class_id, value);
        loadClassMembers(formData.class_id, value);
      }
      
      // Clear members when category changes
      if (name === 'event_category') {
        setMembers([]);
        setParticipants([]);
        setClassLevels([]);
        setClassSessions([]);
        // Also clear the selected group/ministry/class IDs when changing category
        setFormData(prev => ({
          ...prev,
          cell_group_id: '',
          ministry_id: '',
          class_id: '',
          level_id: '',
          session_id: ''
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

    // Check category-specific requirements
    if (formData.event_category === 'cell_group' && !formData.cell_group_id) {
      newErrors.cell_group_id = 'Cell group is required for cell group meetings';
    }

    if (formData.event_category === 'ministry' && !formData.ministry_id) {
      newErrors.ministry_id = 'Ministry is required for ministry meetings';
    }

    if (formData.event_category === 'class') {
      if (!formData.class_id) {
        newErrors.class_id = 'Class is required for class meetings';
      } else {
        const selectedClass = classes.find(c => c.id === formData.class_id);
        if (selectedClass && selectedClass.has_levels && !formData.level_id) {
          newErrors.level_id = 'Level is required for multi-level class meetings';
        }
        if (!formData.session_id) {
          newErrors.session_id = 'Session/topic is required for class meetings';
        }
      }
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
      // Prepare data for API
      const meetingData: any = {
        event_category: formData.event_category,
        meeting_date: formData.meeting_date,
        meeting_type: formData.meeting_type,
        topic: formData.topic.trim(),
        location: formData.location.trim(),
        is_realtime: formData.is_realtime
      };

      // Add optional fields only if they have values
      if (formData.notes.trim()) {
        meetingData.notes = formData.notes.trim();
      }

      if (formData.offering && parseFloat(formData.offering) > 0) {
        meetingData.offering = parseFloat(formData.offering);
      }

      // Add category-specific fields
      if (formData.event_category === 'cell_group' && formData.cell_group_id) {
        meetingData.cell_group_id = formData.cell_group_id;
        // Add participants data
        meetingData.participants = participants;
      } else if (formData.event_category === 'ministry' && formData.ministry_id) {
        meetingData.ministry_id = formData.ministry_id;
        // Add participants data for ministry meetings too
        meetingData.participants = participants;
      } else if (formData.event_category === 'class' && formData.class_id) {
        // Store comprehensive class session info in notes
        let classNote = `Class: ${classes.find(c => c.id === formData.class_id)?.name || formData.class_id}`;
        if (formData.level_id && classLevels.length > 0) {
          const levelName = classLevels.find(l => l.id === formData.level_id)?.name;
          classNote += ` - Level: ${levelName}`;
        }
        if (formData.session_id) {
          const sessionInfo = classSessions.find(s => s.id === formData.session_id);
          classNote += ` - Session: ${sessionInfo?.title} (ID: ${formData.session_id})`;
        }
        meetingData.notes = meetingData.notes ? `${meetingData.notes}\n${classNote}` : classNote;
        
        // Add class-specific fields for backend processing
        meetingData.class_id = formData.class_id;
        if (formData.level_id) meetingData.level_id = formData.level_id;
        if (formData.session_id) meetingData.session_id = formData.session_id;
        
        // Add participants data for class meetings
        meetingData.participants = participants;
      } else {
        // For other event types without predefined members, send empty participants array
        meetingData.participants = [];
      }

      // Add visitors if any
      if (visitors.length > 0) {
        const validVisitors = visitors.filter(v => v.name.trim());
        if (validVisitors.length > 0) {
          meetingData.visitors = validVisitors;
        }
      }

      console.log('Sending meeting data to API:', meetingData);
      console.log('Participants data:', participants);
      console.log('Visitors data:', visitors);

      const response = await apiClient.createAttendanceMeeting(meetingData);

      if (response.success) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        setErrors({ general: response.error?.message || 'Failed to create meeting' });
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred while creating the meeting' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      event_category: 'cell_group',
      cell_group_id: '',
      ministry_id: '',
      class_id: '',
      level_id: '',
      session_id: '',
      meeting_date: '',
      meeting_type: 'regular',
      topic: '',
      location: '',
      notes: '',
      offering: '',
      is_realtime: false
    });
    setErrors({});
    setMembers([]);
    setParticipants([]);
    setVisitors([]);
    setClasses([]);
    setClassLevels([]);
    setClassSessions([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Add New Meeting</h3>
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

          {/* Conditional Class Selection */}
          {formData.event_category === 'class' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                name="class_id"
                value={formData.class_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Class</option>
                {classes.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} {classItem.has_levels ? '(Multi-level)' : ''}
                  </option>
                ))}
              </select>
              {errors.class_id && (
                <p className="mt-1 text-xs text-red-600">{errors.class_id}</p>
              )}
            </div>
          )}

          {/* Conditional Level Selection for Multi-level Classes */}
          {formData.event_category === 'class' && formData.class_id && classLevels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level *
              </label>
              <select
                name="level_id"
                value={formData.level_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Level</option>
                {classLevels
                  .sort((a, b) => a.order - b.order)
                  .map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))
                }
              </select>
              {errors.level_id && (
                <p className="mt-1 text-xs text-red-600">{errors.level_id}</p>
              )}
            </div>
          )}

          {/* Session/Topic Selection for Classes */}
          {formData.event_category === 'class' && formData.class_id && 
            (classLevels.length === 0 || formData.level_id) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session/Topic *
              </label>
              <select
                name="session_id"
                value={formData.session_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Session/Topic</option>
                {classSessions
                  .sort((a, b) => a.order_number - b.order_number)
                  .map(session => (
                    <option key={session.id} value={session.id}>
                      Session {session.order_number}: {session.title}
                    </option>
                  ))
                }
              </select>
              {errors.session_id && (
                <p className="mt-1 text-xs text-red-600">{errors.session_id}</p>
              )}
              {classSessions.length === 0 && formData.class_id && (
                <p className="mt-1 text-xs text-amber-600">
                  No sessions found for this {classLevels.length > 0 ? 'level' : 'class'}. 
                  Please add sessions first.
                </p>
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
                value={formData.offering}
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
              value={formData.notes}
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

          {/* Participants Section - Show for cell group, ministry, and class meetings */}
          {((formData.event_category === 'cell_group' && formData.cell_group_id) || 
            (formData.event_category === 'ministry' && formData.ministry_id) ||
            (formData.event_category === 'class' && formData.class_id && formData.session_id &&
              (classLevels.length === 0 || formData.level_id))) && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Attendance</h4>
              
              {isLoadingMembers ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 transition ease-in-out duration-150">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading members...
                  </div>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-2">
                    No members found in this {
                      formData.event_category === 'cell_group' ? 'cell group' : 
                      formData.event_category === 'ministry' ? 'ministry' : 
                      (formData.level_id ? 'class level' : 'class')
                    }
                  </p>
                  <p className="text-sm">
                    Please enroll members to the {
                      formData.event_category === 'cell_group' ? 'cell group' : 
                      formData.event_category === 'ministry' ? 'ministry' : 
                      (formData.level_id ? 'class level' : 'class')
                    } first
                  </p>
                </div>
              ) : (
                <>
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
                </>
              )}
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
                <p className="text-sm">No visitors added yet</p>
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
              {isLoading ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
