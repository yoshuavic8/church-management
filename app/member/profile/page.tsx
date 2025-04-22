'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

export default function MemberProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();

        // Get member profile
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setMemberData(data);
      } catch (error) {
        console.error('Error fetching member data:', error);
        // Set memberData to null to ensure we show loading state
        setMemberData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [user]);



  if (loading || !memberData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute redirectTo="/auth/member/login">
      <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
          </div>
        </div>

        {updateSuccess && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-6 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your profile has been updated successfully.
                </p>
              </div>
            </div>
          </div>
        )}

        {updateError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {updateError}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="md:col-span-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="text-sm font-medium">{memberData.first_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="text-sm font-medium">{memberData.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium">{memberData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{memberData.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Birthday</p>
                        <p className="text-sm font-medium">
                          {memberData.birthday
                            ? new Date(memberData.birthday).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Occupation</p>
                        <p className="text-sm font-medium">{memberData.occupation || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-2">Address</h3>
                    <p className="text-sm font-medium">
                      {memberData.address ? (
                        <>
                          {memberData.address}<br />
                          {memberData.city && `${memberData.city}, `}
                          {memberData.state && `${memberData.state} `}
                          {memberData.postal_code && memberData.postal_code}
                        </>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-2">Emergency Contact</h3>
                    {memberData.emergency_contact_name ? (
                      <div>
                        <p className="text-sm font-medium">{memberData.emergency_contact_name}</p>
                        <p className="text-sm text-gray-500">{memberData.emergency_contact_phone || '-'}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No emergency contact provided</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-2">Church Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Member Status</p>
                        <p className="text-sm font-medium capitalize">{memberData.status || '-'}</p>
                      </div>

                    </div>
                  </div>
                </div>
            </div>

            {/* Right Column - QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-50 p-6 rounded-lg w-full">
                <h3 className="text-md font-medium text-gray-900 mb-4 text-center">Your QR Code</h3>
                <QRCodeGenerator
                  value={memberData.id}
                  size={180}
                  level="H"
                  className="mx-auto mb-4"
                />
                <p className="text-xs text-gray-500 text-center mb-4">
                  Use this QR code for quick attendance check-in at church events
                </p>
                <button
                  onClick={() => window.print()}
                  className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
