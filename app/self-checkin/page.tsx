'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase';
import Header from '../components/Header';
import QRCodeScanner from '../components/QRCodeScanner';

function SelfCheckinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meeting');

  const [step, setStep] = useState<'scan-meeting' | 'enter-member-id' | 'success'>('scan-meeting');
  const [meeting, setMeeting] = useState<any>(null);
  const [memberId, setMemberId] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // If meeting ID is provided in URL, fetch meeting details
  useEffect(() => {
    if (meetingId) {
      fetchMeetingDetails(meetingId);
    }
  }, [meetingId]);

  useEffect(() => {
    // Check if user is logged in and auto check-in
    const checkLoggedInUser = async () => {
      if (meeting && step === 'enter-member-id') {
        try {
          const supabase = getSupabaseClient();

          // Get current user
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // User is logged in, auto check-in
            checkInMember(user.id);
          }
        } catch (error) {
          
        }
      }
    };

    checkLoggedInUser();
  }, [meeting, step]);

  const fetchMeetingDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();

      // Check if meeting exists and is set to realtime
      const { data, error } = await supabase
        .from('attendance_meetings')
        .select(`
          *,
          cell_group:cell_group_id(name),
          ministry:ministry_id(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Meeting not found');
      }

      if (!data.is_realtime) {
        throw new Error('This meeting is not enabled for self check-in');
      }

      setMeeting(data);
      setStep('enter-member-id');
    } catch (error: any) {
      
      setError(error.message || 'Failed to fetch meeting details');
    } finally {
      setLoading(false);
    }
  };

  const handleScanMeeting = (decodedText: string) => {
    try {
      // Check if the scanned text is a valid URL with meeting parameter
      const url = new URL(decodedText);
      const meetingParam = url.searchParams.get('meeting');

      if (!meetingParam) {
        setError('Invalid QR code. No meeting ID found.');
        return;
      }

      fetchMeetingDetails(meetingParam);
    } catch (error: any) {
      
      setError('Invalid QR code format. Please scan a valid meeting QR code.');
    }
  };

  const handleManualMeetingInput = (inputMeetingId: string) => {
    if (!inputMeetingId) {
      setError('Please enter a meeting ID');
      return;
    }

    fetchMeetingDetails(inputMeetingId);
  };

  const handleScanMemberId = (decodedText: string) => {
    // Validate the scanned text is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(decodedText)) {
      setError('Invalid member QR code format');
      return;
    }

    setMemberId(decodedText);
    checkInMember(decodedText);
  };

  const handleManualMemberInput = (inputMemberId: string) => {
    if (!inputMemberId) {
      setError('Please enter your member ID');
      return;
    }

    setMemberId(inputMemberId);
    checkInMember(inputMemberId);
  };

  const handleLoginRedirect = () => {
    if (!meeting) {
      setError('No meeting selected');
      return;
    }

    const redirectUrl = `/auth/login?redirectTo=${encodeURIComponent(`/self-checkin?meeting=${meeting.id}`)}`;
    window.location.href = redirectUrl;
  };

  const checkInMember = async (id: string) => {
    if (!meeting) {
      setError('No meeting selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();

      // Check if member exists
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id, first_name, last_name, status')
        .eq('id', id)
        .single();

      if (memberError) throw memberError;

      if (!memberData) {
        throw new Error('Member not found');
      }

      if (memberData.status !== 'active') {
        throw new Error('Member is not active');
      }

      // Check if member is already checked in
      const { data: existingRecord, error: existingError } = await supabase
        .from('attendance_participants')
        .select('id, status')
        .eq('meeting_id', meeting.id)
        .eq('member_id', id)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingRecord) {
        setMemberName(`${memberData.first_name} ${memberData.last_name}`);
        setSuccess(`You are already checked in as ${existingRecord.status}`);
        setStep('success');
        return;
      }

      // Record attendance
      const { error: insertError } = await supabase
        .from('attendance_participants')
        .insert({
          meeting_id: meeting.id,
          member_id: id,
          status: 'present',
        });

      if (insertError) throw insertError;

      setMemberName(`${memberData.first_name} ${memberData.last_name}`);
      setSuccess('Check-in successful!');
      setStep('success');
    } catch (error: any) {
      
      setError(error.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const getContextName = () => {
    if (!meeting) return '';

    if (meeting.event_category === 'cell_group' && meeting.cell_group) {
      return meeting.cell_group.name;
    } else if (meeting.event_category === 'ministry' && meeting.ministry) {
      return meeting.ministry.name;
    } else {
      return meeting.event_category.replace('_', ' ');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'scan-meeting':
        return (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Scan Meeting QR Code</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center mb-6">
              <QRCodeScanner
                onScan={handleScanMeeting}
                onError={(error) => setError(error)}
                width={300}
                height={300}
                className="mb-4"
              />
              <p className="text-sm text-gray-500 text-center">
                Scan the QR code displayed at the meeting location
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Or Enter Meeting ID Manually</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter Meeting ID"
                  className="input-field flex-grow"
                  id="manualMeetingId"
                  disabled={loading}
                />
                <button
                  onClick={() => handleManualMeetingInput((document.getElementById('manualMeetingId') as HTMLInputElement).value)}
                  className="ml-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'enter-member-id':
        return (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Check In to Meeting</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium mb-2">Meeting Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Context:</span>
                  <span className="font-medium">{getContextName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(meeting.meeting_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{meeting.meeting_type.replace('_', ' ')}</span>
                </div>
                {meeting.topic && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Topic:</span>
                    <span className="font-medium">{meeting.topic}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium mb-2">Login for Quick Check-in</h3>
              <p className="text-sm text-gray-500 mb-4">
                Login to your account for a faster check-in experience
              </p>
              <button
                onClick={handleLoginRedirect}
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center justify-center"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login to My Account
              </button>
            </div>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Enter Your Member ID</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter Your Member ID"
                  className="input-field flex-grow"
                  id="manualMemberId"
                  disabled={loading}
                />
                <button
                  onClick={() => handleManualMemberInput((document.getElementById('manualMemberId') as HTMLInputElement).value)}
                  className="ml-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  disabled={loading}
                >
                  {loading ? 'Checking in...' : 'Check In'}
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('scan-meeting')}
                className="text-primary hover:underline"
                disabled={loading}
              >
                ← Back to Scan Meeting
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="card">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{success}</h2>
              <p className="text-gray-600 mb-6">Thank you, {memberName}!</p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-md mx-auto">
                <h3 className="text-md font-medium mb-2">Meeting Details</h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Context:</span>
                    <span className="font-medium">{getContextName()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(meeting.meeting_date).toLocaleDateString()}</span>
                  </div>
                  {meeting.topic && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Topic:</span>
                      <span className="font-medium">{meeting.topic}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setStep('scan-meeting')}
                  className="btn-primary w-full"
                >
                  Check In to Another Meeting
                </button>

                <Link href="/" className="text-primary hover:underline block">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <Header
        title="Self Check-in"
        backTo="/"
        backLabel="Home"
      />

      {loading && step !== 'success' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-700">Processing...</p>
          </div>
        </div>
      )}

      {renderStepContent()}
    </div>
  );
}

export default function SelfCheckinPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>}>
      <SelfCheckinContent />
    </Suspense>
  );
}
