import React from 'react';
import { CommonFormFields, BaseAttendanceFormProps } from './BaseAttendanceForm';

type ServiceDetailsFormProps = BaseAttendanceFormProps & {
  // Additional props specific to service attendance
};

export default function ServiceDetailsForm({
  meetingDate,
  setMeetingDate,
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
}: ServiceDetailsFormProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Church Service Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <CommonFormFields
          meetingDate={meetingDate}
          setMeetingDate={setMeetingDate}
          saving={saving}
          success={success}
        />
        
        <div>
          <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1">
            Service Type
          </label>
          <select
            id="service_type"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field"
            disabled={saving || success}
          >
            <option value="">-- Select Service Type --</option>
            <option value="Sunday Service">Sunday Service</option>
            <option value="Midweek Service">Midweek Service</option>
            <option value="Special Service">Special Service</option>
            <option value="Youth Service">Youth Service</option>
            <option value="Children Service">Children Service</option>
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
            placeholder="Service location"
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
            placeholder="Any notes about this service"
          ></textarea>
        </div>
      </div>
    </div>
  );
}
