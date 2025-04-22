import React, { useState } from 'react';
import ServiceDetailsForm from './ServiceDetailsForm';
import { BaseAttendanceFormProps } from './BaseAttendanceForm';

type ServiceAttendanceFormProps = BaseAttendanceFormProps & {
  // Additional props specific to service attendance
};

type AttendanceCount = {
  adults: string;
  youth: string;
  children: string;
  firstTimeVisitors: string;
  totalAttendance: string;
};

export default function ServiceAttendanceForm({
  ...baseProps
}: ServiceAttendanceFormProps) {
  const [attendanceCounts, setAttendanceCounts] = useState<AttendanceCount>({
    adults: '',
    youth: '',
    children: '',
    firstTimeVisitors: '',
    totalAttendance: '',
  });

  const handleCountChange = (field: keyof AttendanceCount, value: string) => {
    const newCounts = { ...attendanceCounts, [field]: value };

    // Calculate total attendance
    const adults = parseInt(newCounts.adults) || 0;
    const youth = parseInt(newCounts.youth) || 0;
    const children = parseInt(newCounts.children) || 0;

    newCounts.totalAttendance = (adults + youth + children).toString();

    setAttendanceCounts(newCounts);
  };

  return (
    <>
      <ServiceDetailsForm {...baseProps} />

      {baseProps.contextId && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Attendance Count</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="adults_count" className="block text-sm font-medium text-gray-700 mb-1">
                Adults (18+)
              </label>
              <input
                id="adults_count"
                type="number"
                min="0"
                value={attendanceCounts.adults}
                onChange={(e) => handleCountChange('adults', e.target.value)}
                className="input-field"
                disabled={baseProps.saving || baseProps.success}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="youth_count" className="block text-sm font-medium text-gray-700 mb-1">
                Youth (13-17)
              </label>
              <input
                id="youth_count"
                type="number"
                min="0"
                value={attendanceCounts.youth}
                onChange={(e) => handleCountChange('youth', e.target.value)}
                className="input-field"
                disabled={baseProps.saving || baseProps.success}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="children_count" className="block text-sm font-medium text-gray-700 mb-1">
                Children (0-12)
              </label>
              <input
                id="children_count"
                type="number"
                min="0"
                value={attendanceCounts.children}
                onChange={(e) => handleCountChange('children', e.target.value)}
                className="input-field"
                disabled={baseProps.saving || baseProps.success}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="first_time_visitors" className="block text-sm font-medium text-gray-700 mb-1">
                First Time Visitors
              </label>
              <input
                id="first_time_visitors"
                type="number"
                min="0"
                value={attendanceCounts.firstTimeVisitors}
                onChange={(e) => handleCountChange('firstTimeVisitors', e.target.value)}
                className="input-field"
                disabled={baseProps.saving || baseProps.success}
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="total_attendance" className="block text-sm font-medium text-gray-700 mb-1">
                Total Attendance
              </label>
              <input
                id="total_attendance"
                type="number"
                min="0"
                value={attendanceCounts.totalAttendance}
                className="input-field bg-gray-50"
                disabled={true}
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Auto-calculated from adults, youth, and children counts
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-md font-medium text-blue-800 mb-2">Service Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="service_duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Duration (minutes)
                </label>
                <input
                  id="service_duration"
                  type="number"
                  min="0"
                  className="input-field"
                  disabled={baseProps.saving || baseProps.success}
                  placeholder="90"
                />
              </div>

              <div>
                <label htmlFor="preacher" className="block text-sm font-medium text-gray-700 mb-1">
                  Preacher/Speaker
                </label>
                <input
                  id="preacher"
                  type="text"
                  className="input-field"
                  disabled={baseProps.saving || baseProps.success}
                  placeholder="Name of preacher"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
