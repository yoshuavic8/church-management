import React, { useState } from 'react';
import ClassDetailsForm from './ClassDetailsForm';
import { BaseAttendanceFormProps } from './BaseAttendanceForm';

type ClassAttendanceFormProps = BaseAttendanceFormProps & {
  participants: any[];
  handleParticipantStatusChange: (memberId: string, status: string) => void;
};

export default function ClassAttendanceForm({
  participants,
  handleParticipantStatusChange,
  ...baseProps
}: ClassAttendanceFormProps) {
  // Removed duplicate state variables

  return (
    <>
      <ClassDetailsForm {...baseProps} />

      {baseProps.contextId && (
        <>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Enrolled Student Attendance</h2>

            {participants.length === 0 ? (
              <p className="text-gray-500">No students enrolled in this class.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <tr key={participant.member_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {participant.first_name} {participant.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleParticipantStatusChange(participant.member_id, 'present')}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'present'
                                  ? 'bg-green-100 text-green-800 ring-2 ring-green-600'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                              disabled={baseProps.saving || baseProps.success}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleParticipantStatusChange(participant.member_id, 'absent')}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'absent'
                                  ? 'bg-red-100 text-red-800 ring-2 ring-red-600'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                              disabled={baseProps.saving || baseProps.success}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleParticipantStatusChange(participant.member_id, 'late')}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-600'
                                  : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                              }`}
                              disabled={baseProps.saving || baseProps.success}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleParticipantStatusChange(participant.member_id, 'excused')}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'excused'
                                  ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-600'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                              disabled={baseProps.saving || baseProps.success}
                            >
                              Excused
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
