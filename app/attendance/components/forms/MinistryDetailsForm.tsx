import React from 'react';
import { CommonFormFields, BaseAttendanceFormProps } from './BaseAttendanceForm';

type MinistryDetailsFormProps = BaseAttendanceFormProps & {
  // Additional props specific to ministry attendance
};

export default function MinistryDetailsForm({
  meetingDate,
  setMeetingDate,
  meetingType,
  setMeetingType,
  location,
  setLocation,
  topic,
  setTopic,
  notes,
  setNotes,
  saving,
  success
}: MinistryDetailsFormProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Ministry Meeting Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <CommonFormFields
          meetingDate={meetingDate}
          setMeetingDate={setMeetingDate}
          saving={saving}
          success={success}
        />
        
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
            <option value="training">Training</option>
            <option value="planning">Planning</option>
            <option value="evaluation">Evaluation</option>
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
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Topic/Agenda
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field"
            disabled={saving || success}
            placeholder="Topic or agenda of the meeting"
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
  );
}
