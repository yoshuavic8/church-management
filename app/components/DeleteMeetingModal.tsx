'use client';

import { useState } from 'react';
import { apiClient } from '../lib/api-client';

interface DeleteMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meeting: {
    id: string;
    topic: string;
    meeting_date: string;
    event_category: string;
  } | null;
}

export default function DeleteMeetingModal({ isOpen, onClose, onSuccess, meeting }: DeleteMeetingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!meeting) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.deleteAttendanceMeeting(meeting.id);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error?.message || 'Failed to delete meeting');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting the meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Delete Meeting</h3>
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

        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">
                Are you sure you want to delete this meeting?
              </h4>
              <p className="mt-2 text-sm text-gray-500">
                This action cannot be undone. All attendance data for this meeting will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Topic: </span>
                <span className="text-sm text-gray-900">{meeting.topic}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Date: </span>
                <span className="text-sm text-gray-900">
                  {new Date(meeting.meeting_date).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Category: </span>
                <span className="text-sm text-gray-900 capitalize">
                  {meeting.event_category.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </div>
            ) : (
              'Delete Meeting'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
