'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../lib/supabase';
import Header from '../components/Header';
import QRCodeScanner from '../components/QRCodeScanner';
import { EventCategory } from '../types/ministry';

type ContextOption = {
  id: string;
  name: string;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
};

type ScannedMember = Member & {
  scannedAt: Date;
};

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = searchParams.get('member');

  // State for context selection
  const [eventCategory, setEventCategory] = useState<EventCategory>('cell_group');
  const [contextOptions, setContextOptions] = useState<ContextOption[]>([]);
  const [selectedContextId, setSelectedContextId] = useState<string>('');
  const [loadingContexts, setLoadingContexts] = useState(false);

  // State for meeting details
  const [meetingDate, setMeetingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meetingType, setMeetingType] = useState<string>('regular');
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [offering, setOffering] = useState<string>('');

  // State for scanning
  const [isScanning, setIsScanning] = useState(false);
  const [scannedMembers, setScannedMembers] = useState<ScannedMember[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  // State for saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load context options based on selected category
  useEffect(() => {
    const fetchContextOptions = async () => {
      setLoadingContexts(true);
      try {
        const supabase = getSupabaseClient();
        
        if (!supabase) {
          console.error('Could not initialize Supabase client');
          return;
        }

        if (eventCategory === 'cell_group') {
          const { data, error } = await supabase
            .from('cell_groups')
            .select('id, name')
            .eq('status', 'active')
            .order('name');

          if (error) throw error;
          setContextOptions(data || []);
        }
        else if (eventCategory === 'ministry') {
          const { data, error } = await supabase
            .from('ministries')
            .select('id, name')
            .eq('status', 'active')
            .order('name');

          if (error) throw error;
          setContextOptions(data || []);
        }
        else {
          // For other categories, we might not need context options
          setContextOptions([]);
        }
      } catch (error) {
        console.error('Error fetching context options:', error);
      } finally {
        setLoadingContexts(false);
      }
    };

    fetchContextOptions();
    setSelectedContextId(''); // Reset selection when category changes
  }, [eventCategory]);

  // Handle QR code scan
  const handleScan = async (decodedText: string) => {
    try {
      setScanError(null);

      // Validate the scanned text is a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(decodedText)) {
        setScanError('Invalid QR code format');
        return;
      }

      // Check if member already scanned
      const alreadyScanned = scannedMembers.some(member => member.id === decodedText);
      if (alreadyScanned) {
        setScanSuccess('Member already scanned');
        setTimeout(() => setScanSuccess(null), 2000);
        return;
      }

      // Fetch member details
      const supabase = getSupabaseClient();
      if (!supabase) {
        setScanError('Database connection failed. Please refresh the page.');
        return;
      }
      
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, status')
        .eq('id', decodedText)
        .single();

      if (error) throw error;

      if (!data) {
        setScanError('Member not found');
        return;
      }

      if (data.status !== 'active') {
        setScanError('Member is not active');
        return;
      }

      // Add to scanned members
      const newScannedMember: ScannedMember = {
        ...data,
        scannedAt: new Date()
      };

      setScannedMembers(prev => [...prev, newScannedMember]);
      setScanSuccess(`${data.first_name} ${data.last_name} checked in!`);

      // Clear success message after 2 seconds
      setTimeout(() => setScanSuccess(null), 2000);

    } catch (error: any) {
      
      setScanError(error.message || 'Error processing scan');
    }
  };

  // Handle manual member input
  const handleManualInput = async (memberId: string) => {
    if (!memberId) {
      setScanError('Please enter a member ID');
      return;
    }

    await handleScan(memberId);
  };

  // Handle save attendance
  const handleSaveAttendance = async () => {
    if (!selectedContextId && eventCategory !== 'other') {
      setSaveError(`Please select a ${eventCategory === 'cell_group' ? 'cell group' : 'ministry'}`);
      return;
    }

    if (!meetingDate) {
      setSaveError('Please select a meeting date');
      return;
    }

    if (scannedMembers.length === 0) {
      setSaveError('No members scanned yet');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Get a fresh Supabase client instance to ensure proper auth headers
      const supabase = getSupabaseClient();
      
      // Check if supabase client is properly initialized
      if (!supabase) {
        throw new Error('Database connection failed. Please refresh the page and try again.');
      }

      // Parse offering value to float if provided
      const offeringValue = offering ? parseFloat(offering) : null;

      // Prepare meeting record based on event category
      // Simpan info konteks di field notes jika kategori adalah class
      let notesWithContext = notes;
      if (eventCategory === 'class') {
        notesWithContext = `Session ID: ${selectedContextId}\n${notes || ''}`;
      }

      const meetingRecord: any = {
        event_category: eventCategory,
        meeting_date: meetingDate,
        meeting_type: meetingType,
        topic,
        notes: notesWithContext,
        location,
        offering: offeringValue,
      };

      // Add the appropriate context ID based on event category
      // Hanya tambahkan kolom yang benar-benar ada di database
      if (eventCategory === 'cell_group') {
        meetingRecord.cell_group_id = selectedContextId;
      } else if (eventCategory === 'ministry') {
        meetingRecord.ministry_id = selectedContextId;
      }
      // Untuk class, kita sudah simpan ID di notes

      console.log('Saving meeting record:', meetingRecord);

      // 1. Create the meeting record
      const { data: meetingData, error: meetingError } = await supabase
        .from('attendance_meetings')
        .insert(meetingRecord)
        .select();

      if (meetingError) {
        console.error('Meeting creation error:', meetingError);
        throw meetingError;
      }

      if (!meetingData || meetingData.length === 0) {
        throw new Error('Failed to create meeting record');
      }

      const meetingId = meetingData[0].id;
      console.log('Meeting created with ID:', meetingId);

      // 2. Record participants
      const participantRecords = scannedMembers.map(member => ({
        meeting_id: meetingId,
        member_id: member.id,
        status: 'present',
      }));

      console.log('Saving participant records:', participantRecords);

      const { error: participantsError } = await supabase
        .from('attendance_participants')
        .insert(participantRecords);

      if (participantsError) {
        console.error('Participants creation error:', participantsError);
        throw participantsError;
      }

      // 3. Update class session status if this is a class attendance
      if (eventCategory === 'class' && selectedContextId) {
        try {
          const { error: updateError } = await supabase
            .from('class_sessions')
            .update({ status: 'completed' })
            .eq('id', selectedContextId);

          if (updateError) {
            console.error('Error updating class session status:', updateError);
            // Don't throw this error as it's not critical to the overall operation
          } else {
            console.log('Class session status updated to completed');
          }
        } catch (error) {
          console.error('Error updating class session:', error);
          // Continue, this is not critical
        }
      }

      console.log('Attendance recorded successfully');
      setSaveSuccess(true);

      // Redirect to attendance details page after a short delay
      setTimeout(() => {
        router.push(`/attendance/${meetingId}`);
      }, 1500);

    } catch (error: any) {
      console.error('Save attendance error:', error);
      setSaveError(error.message || 'Failed to save attendance record');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove a scanned member
  const handleRemoveMember = (memberId: string) => {
    setScannedMembers(prev => prev.filter(member => member.id !== memberId));
  };

  // Get context label based on event category
  const getContextLabel = () => {
    switch (eventCategory) {
      case 'cell_group': return 'Cell Group';
      case 'ministry': return 'Ministry';
      case 'prayer': return 'Prayer Type';
      case 'service': return 'Service Type';
      default: return 'Event Type';
    }
  };

  return (
    <div>
      <Header
        title="Quick Attendance Scanner"
        backTo="/attendance"
        backLabel="Attendance"
      />

      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Attendance recorded successfully! Redirecting...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Scanner and Scanned Members */}
        <div>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">QR Code Scanner</h2>

            {scanError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {scanError}
              </div>
            )}

            {scanSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                {scanSuccess}
              </div>
            )}

            <QRCodeScanner
              onScan={handleScan}
              onError={(error) => setScanError(error)}
              width={300}
              height={300}
              className="mb-4"
            />

            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Manual Entry</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter Member ID"
                  className="input-field flex-grow"
                  id="manualMemberId"
                />
                <button
                  onClick={() => handleManualInput((document.getElementById('manualMemberId') as HTMLInputElement).value)}
                  className="ml-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Scanned Members</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {scannedMembers.length} members
              </span>
            </div>

            {scannedMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No members scanned yet</p>
                <p className="text-sm mt-1">Scan a member's QR code to check them in</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scannedMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {member.scannedAt.toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Meeting Details */}
        <div>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Meeting Details</h2>

            {saveError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {saveError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Category *
                </label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as EventCategory)}
                  className="input-field w-full"
                  disabled={isSaving}
                >
                  <option value="cell_group">Cell Group</option>
                  <option value="ministry">Ministry</option>
                  <option value="prayer">Prayer Meeting</option>
                  <option value="service">Church Service</option>
                  <option value="other">Other Event</option>
                </select>
              </div>

              {(eventCategory === 'cell_group' || eventCategory === 'ministry') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getContextLabel()} *
                  </label>
                  <select
                    value={selectedContextId}
                    onChange={(e) => setSelectedContextId(e.target.value)}
                    className="input-field w-full"
                    disabled={isSaving || loadingContexts}
                  >
                    <option value="">Select {getContextLabel()}</option>
                    {contextOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Date *
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="input-field w-full"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Type
                </label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="input-field w-full"
                  disabled={isSaving}
                >
                  <option value="regular">Regular Meeting</option>
                  <option value="special">Special Meeting</option>
                  <option value="outreach">Outreach</option>
                  <option value="prayer">Prayer Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic/Theme
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="input-field w-full"
                  placeholder="Topic or theme of the meeting"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field w-full"
                  placeholder="Meeting location"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offering Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">Rp</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={offering}
                    onChange={(e) => setOffering(e.target.value)}
                    className="input-field w-full pl-10"
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Any notes about this meeting"
                  disabled={isSaving}
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveAttendance}
                  className="w-full btn-primary py-3"
                  disabled={isSaving || scannedMembers.length === 0}
                >
                  {isSaving ? 'Saving...' : 'Save Attendance Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>}>
      <ScanPageContent />
    </Suspense>
  );
}
