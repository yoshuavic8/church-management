import React from 'react';
import { CommonFormFields, BaseAttendanceFormProps } from './BaseAttendanceForm';

type OtherDetailsFormProps = BaseAttendanceFormProps & {
  // Additional props specific to other attendance types
};

export default function OtherDetailsForm({
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
  offering,
  setOffering,
  saving,
  success
}: OtherDetailsFormProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Event Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <CommonFormFields
          meetingDate={meetingDate}
          setMeetingDate={setMeetingDate}
          saving={saving}
          success={success}
        />
        
        <div>
          <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <input
            id="event_type"
            type="text"
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value)}
            className="input-field"
            disabled={saving || success}
            placeholder="Type of event"
          />
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Event Name/Title
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field"
            disabled={saving || success}
            placeholder="Name or title of the event"
          />
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
            placeholder="Event location"
          />
        </div>

        <div>
          <label htmlFor="offering" className="block text-sm font-medium text-gray-700 mb-1">
            Offering/Collection Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">Rp</span>
            </div>
            <input
              id="offering"
              type="number"
              min="0"
              step="0.01"
              value={offering}
              onChange={(e) => setOffering(e.target.value)}
              className="input-field pl-10"
              disabled={saving || success}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            disabled={saving || success}
            rows={3}
            placeholder="Description of the event"
          ></textarea>
        </div>
      </div>
    </div>
  );
}
