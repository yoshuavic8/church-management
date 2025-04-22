import React from 'react';
import { EventCategory } from '../../../types/ministry';

export type BaseAttendanceFormProps = {
  meetingDate: string;
  setMeetingDate: (date: string) => void;
  meetingType: string;
  setMeetingType: (type: string) => void;
  location: string;
  setLocation: (location: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  offering: string;
  setOffering: (offering: string) => void;
  eventCategory: EventCategory;
  contextId: string;
  saving: boolean;
  success: boolean;
};

// Common form fields that all event types need
export function CommonFormFields({
  meetingDate,
  setMeetingDate,
  saving,
  success
}: Pick<BaseAttendanceFormProps, 'meetingDate' | 'setMeetingDate' | 'saving' | 'success'>) {
  return (
    <div>
      <label htmlFor="meeting_date" className="block text-sm font-medium text-gray-700 mb-1">
        Meeting Date *
      </label>
      <input
        id="meeting_date"
        type="date"
        value={meetingDate}
        onChange={(e) => setMeetingDate(e.target.value)}
        className="input-field"
        disabled={saving || success}
        required
      />
    </div>
  );
}

// Cell Group specific form
export default function CellGroupDetailsForm({
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
  eventCategory,
  contextId,
  saving,
  success
}: BaseAttendanceFormProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Cell Group Meeting Details</h2>

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
            <option value="special">Special Meeting</option>
            <option value="outreach">Outreach</option>
            <option value="prayer">Prayer Meeting</option>
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
          <label htmlFor="offering" className="block text-sm font-medium text-gray-700 mb-1">
            Offering Amount
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
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Topic/Theme
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field"
            disabled={saving || success}
            placeholder="Topic or theme of the meeting"
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
