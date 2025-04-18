'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../lib/supabase';
import Header from '../../../components/Header';
import RealtimeAttendanceStats from '../../../components/RealtimeAttendanceStats';
import QRCodeGenerator from '../../../components/QRCodeGenerator';

export default function RealtimeDashboardPage() {
  const params = useParams();
  const meetingId = params.id as string;
  
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Fetch meeting details
        const { data, error } = await supabase
          .from('attendance_meetings')
          .select(`
            *,
            cell_group:cell_group_id(id, name),
            ministry:ministry_id(id, name)
          `)
          .eq('id', meetingId)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          throw new Error('Meeting not found');
        }
        
        setMeeting(data);
        setIsRealtime(data.is_realtime || false);
      } catch (error: any) {
        
        setError(error.message || 'Failed to fetch meeting details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeeting();
  }, [meetingId]);

  const toggleRealtime = async () => {
    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('attendance_meetings')
        .update({ is_realtime: !isRealtime })
        .eq('id', meetingId);
        
      if (error) throw error;
      
      setIsRealtime(!isRealtime);
    } catch (error: any) {
      
      alert('Failed to update realtime status: ' + error.message);
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

  if (loading) {
    return (
      <div>
        <Header title="Realtime Dashboard" backTo={`/attendance/${meetingId}`} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div>
        <Header title="Realtime Dashboard" backTo="/attendance" />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Meeting not found'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Realtime Dashboard" 
        backTo={`/attendance/${meetingId}`}
        backLabel="Meeting Details"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Meeting Info and QR Code */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Meeting Information</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">{new Date(meeting.meeting_date).toLocaleDateString()}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Context</div>
                <div className="font-medium">{getContextName()}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Type</div>
                <div className="font-medium">{meeting.meeting_type.replace('_', ' ')}</div>
              </div>
              
              {meeting.topic && (
                <div>
                  <div className="text-sm text-gray-500">Topic</div>
                  <div className="font-medium">{meeting.topic}</div>
                </div>
              )}
              
              <div>
                <div className="text-sm text-gray-500">Realtime Status</div>
                <div className="flex items-center mt-1">
                  <button
                    onClick={toggleRealtime}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${isRealtime ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isRealtime ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                  <span className="ml-2 text-sm">
                    {isRealtime ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Self Check-in QR Code</h2>
            <div className="flex flex-col items-center">
              <QRCodeGenerator 
                value={`${window.location.origin}/self-checkin?meeting=${meetingId}`} 
                size={200} 
                level="H"
                className="mb-3"
              />
              <p className="text-sm text-gray-500 text-center mb-4">
                Members can scan this QR code to check in to this meeting
              </p>
              <button 
                onClick={() => window.print()} 
                className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print QR Code
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Column - Realtime Stats and Member List */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <RealtimeAttendanceStats meetingId={meetingId} />
          </div>
          
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href={`/scan?meeting=${meetingId}`}
                className="btn-primary text-center flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                Scan Attendance
              </Link>
              
              <Link 
                href={`/attendance/${meetingId}`}
                className="btn-secondary text-center"
              >
                View Meeting Details
              </Link>
              
              <Link 
                href={`/attendance/${meetingId}/edit`}
                className="btn-secondary text-center"
              >
                Edit Meeting
              </Link>
              
              <Link 
                href={`/attendance`}
                className="btn-secondary text-center"
              >
                All Attendance Records
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
