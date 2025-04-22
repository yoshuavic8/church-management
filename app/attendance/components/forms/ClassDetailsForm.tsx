import React, { useState } from 'react';
import { CommonFormFields, BaseAttendanceFormProps } from './BaseAttendanceForm';

type ClassDetailsFormProps = BaseAttendanceFormProps & {
  // Additional props specific to class attendance
};

export default function ClassDetailsForm({
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
}: ClassDetailsFormProps) {
  const [additionalAttendees, setAdditionalAttendees] = useState<string>('0');
  const [lessonProgress, setLessonProgress] = useState<string>('');
  const [homeworkAssigned, setHomeworkAssigned] = useState<string>('');
  const [nextSessionDate, setNextSessionDate] = useState<string>('');
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Class Session Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <CommonFormFields
          meetingDate={meetingDate}
          setMeetingDate={setMeetingDate}
          saving={saving}
          success={success}
        />

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field"
            disabled={saving || success}
            placeholder="Topic of this lesson"
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
            placeholder="Class location"
          />
        </div>

        <div>
          <label htmlFor="lesson_progress" className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Progress
          </label>
          <input
            id="lesson_progress"
            type="text"
            value={lessonProgress}
            onChange={(e) => setLessonProgress(e.target.value)}
            className="input-field"
            disabled={saving || success}
            placeholder="e.g., Chapter 3, Lesson 2"
          />
        </div>

        <div>
          <label htmlFor="additional_attendees" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Attendees (not enrolled)
          </label>
          <input
            id="additional_attendees"
            type="number"
            min="0"
            value={additionalAttendees}
            onChange={(e) => setAdditionalAttendees(e.target.value)}
            className="input-field"
            disabled={saving || success}
            placeholder="0"
          />
        </div>

        <div>
          <label htmlFor="next_session_date" className="block text-sm font-medium text-gray-700 mb-1">
            Next Session Date
          </label>
          <input
            id="next_session_date"
            type="date"
            value={nextSessionDate}
            onChange={(e) => setNextSessionDate(e.target.value)}
            className="input-field"
            disabled={saving || success}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Description
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            disabled={saving || success}
            rows={3}
            placeholder="Description of this lesson"
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="homework_assigned" className="block text-sm font-medium text-gray-700 mb-1">
            Homework/Assignment
          </label>
          <textarea
            id="homework_assigned"
            value={homeworkAssigned}
            onChange={(e) => setHomeworkAssigned(e.target.value)}
            className="input-field"
            disabled={saving || success}
            rows={2}
            placeholder="Describe any homework or assignments given"
          ></textarea>
        </div>
      </div>
    </div>
  );
}
