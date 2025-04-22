import React, { useState } from 'react';
import OtherDetailsForm from './OtherDetailsForm';
import { BaseAttendanceFormProps } from './BaseAttendanceForm';

type OtherAttendanceFormProps = BaseAttendanceFormProps & {
  // Additional props specific to other attendance types
};

export default function OtherAttendanceForm({
  ...baseProps
}: OtherAttendanceFormProps) {
  const [attendanceCount, setAttendanceCount] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [organizer, setOrganizer] = useState<string>('');

  return (
    <>
      <OtherDetailsForm {...baseProps} />

      {baseProps.contextId && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="event_type_detail" className="block text-sm font-medium text-gray-700 mb-1">
                Event Type Detail
              </label>
              <input
                id="event_type_detail"
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="input-field"
                disabled={baseProps.saving || baseProps.success}
                placeholder="e.g., Workshop, Seminar, Fellowship"
              />
            </div>

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
              <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                Organizer/Responsible Person
              </label>
              <input
                id="organizer"
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="input-field"
                disabled={baseProps.saving || baseProps.success}
                placeholder="Name of organizer"
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> For custom event types, you can record basic attendance information here.
              For more detailed tracking, consider creating a specific event category in the system settings.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
