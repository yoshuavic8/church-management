import React from 'react';
import { CommonFormFields, BaseAttendanceFormProps } from './BaseAttendanceForm';

type PrayerDetailsFormProps = BaseAttendanceFormProps & {
  // Additional props specific to prayer attendance
};

export default function PrayerDetailsForm({
  meetingDate,
  setMeetingDate,
  location,
  setLocation,
  topic,
  setTopic,
  notes,
  setNotes,
  saving,
  success
}: PrayerDetailsFormProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Prayer Meeting Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <CommonFormFields
          meetingDate={meetingDate}
          setMeetingDate={setMeetingDate}
          saving={saving}
          success={success}
        />
        
        {/* Menghapus dropdown Prayer Type yang duplikat */}
        {/* <div>
          <label htmlFor="prayer_type" className="block text-sm font-medium text-gray-700 mb-1">
            Prayer Type
          </label>
          <select
            id="prayer_type"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field"
            disabled={saving || success}
          >
            <option value="">-- Select Prayer Type --</option>
            <option value="Intercession">Intercession</option>
            <option value="Thanksgiving">Thanksgiving</option>
            <option value="Worship">Worship</option>
            <option value="Fasting">Fasting</option>
            <option value="Night Vigil">Night Vigil</option>
            <option value="Other">Other</option>
          </select>
        </div> */}

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
            placeholder="Prayer meeting location"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Prayer Focus
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            disabled={saving || success}
            rows={3}
            placeholder="Main focus of this prayer meeting"
          ></textarea>
        </div>
      </div>
    </div>
  );
}
