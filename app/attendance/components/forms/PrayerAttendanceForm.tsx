import React, { useState } from 'react';
import PrayerDetailsForm from './PrayerDetailsForm';
import { BaseAttendanceFormProps } from './BaseAttendanceForm';

type PrayerAttendanceFormProps = BaseAttendanceFormProps & {
  // Additional props specific to prayer attendance
};

type PrayerRequest = {
  id: string;
  request: string;
  requestType: 'thanksgiving' | 'petition' | 'intercession' | 'other';
  isAnswered: boolean;
};

export default function PrayerAttendanceForm({
  ...baseProps
}: PrayerAttendanceFormProps) {
  const [attendanceCount, setAttendanceCount] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [newRequest, setNewRequest] = useState<string>('');
  const [requestType, setRequestType] = useState<'thanksgiving' | 'petition' | 'intercession' | 'other'>('petition');

  const handleAddPrayerRequest = () => {
    if (!newRequest.trim()) return;

    const request: PrayerRequest = {
      id: Date.now().toString(),
      request: newRequest,
      requestType: requestType,
      isAnswered: false,
    };

    setPrayerRequests([...prayerRequests, request]);
    setNewRequest('');
  };

  const handleToggleAnswered = (requestId: string) => {
    setPrayerRequests(prayerRequests.map(req =>
      req.id === requestId ? { ...req, isAnswered: !req.isAnswered } : req
    ));
  };

  const handleRemoveRequest = (requestId: string) => {
    setPrayerRequests(prayerRequests.filter(req => req.id !== requestId));
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'thanksgiving': return 'Thanksgiving';
      case 'petition': return 'Petition';
      case 'intercession': return 'Intercession';
      default: return 'Other';
    }
  };

  return (
    <>
      <PrayerDetailsForm {...baseProps} />

      {baseProps.contextId && (
        <>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Prayer Meeting Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="attendance_count" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Attendees
                </label>
                <input
                  id="attendance_count"
                  type="number"
                  min="0"
                  value={attendanceCount}
                  onChange={(e) => setAttendanceCount(e.target.value)}
                  className="input-field"
                  disabled={baseProps.saving || baseProps.success}
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="prayer_duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  id="prayer_duration"
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-field"
                  disabled={baseProps.saving || baseProps.success}
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Prayer Requests</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label htmlFor="prayer_request" className="block text-sm font-medium text-gray-700 mb-1">
                  Prayer Request
                </label>
                <input
                  id="prayer_request"
                  type="text"
                  value={newRequest}
                  onChange={(e) => setNewRequest(e.target.value)}
                  className="input-field"
                  disabled={baseProps.saving || baseProps.success}
                  placeholder="Enter prayer request"
                />
              </div>

              <div>
                <label htmlFor="request_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Request Type
                </label>
                <select
                  id="request_type"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="input-field"
                  disabled={baseProps.saving || baseProps.success}
                >
                  <option value="thanksgiving">Thanksgiving</option>
                  <option value="petition">Petition</option>
                  <option value="intercession">Intercession</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={handleAddPrayerRequest}
                  className="btn-secondary"
                  disabled={!newRequest.trim() || baseProps.saving || baseProps.success}
                >
                  Add Prayer Request
                </button>
              </div>
            </div>

            {prayerRequests.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Prayer Request List</h3>
                <div className="space-y-3">
                  {prayerRequests.map((request) => (
                    <div key={request.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={request.isAnswered}
                        onChange={() => handleToggleAnswered(request.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        disabled={baseProps.saving || baseProps.success}
                      />
                      <div className="ml-3 flex-grow">
                        <p className={`font-medium ${request.isAnswered ? 'line-through text-gray-500' : ''}`}>
                          {request.request}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {getRequestTypeLabel(request.requestType)}
                          {request.isAnswered && ' • Answered'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequest(request.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={baseProps.saving || baseProps.success}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
