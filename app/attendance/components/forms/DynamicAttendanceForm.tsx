import React from 'react';
import { EventCategory } from '../../../types/ministry';
import CellGroupAttendanceForm from './CellGroupAttendanceForm';
import ServiceAttendanceForm from './ServiceAttendanceForm';
import MinistryAttendanceForm from './MinistryAttendanceForm';
import ClassAttendanceForm from './ClassAttendanceForm';
import PrayerAttendanceForm from './PrayerAttendanceForm';
import OtherAttendanceForm from './OtherAttendanceForm';
import VisitorsForm from './VisitorsForm';

type DynamicAttendanceFormProps = {
  eventCategory: EventCategory;
  contextId: string;
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
  participants: any[];
  handleParticipantStatusChange: (memberId: string, status: string) => void;
  newVisitor: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    notes: string;
  };
  handleVisitorChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAddVisitor: () => void;
  handleRemoveVisitor: (index: number) => void;
  visitors: any[];
  saving: boolean;
  success: boolean;
};

export default function DynamicAttendanceForm({
  eventCategory,
  contextId,
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
  participants,
  handleParticipantStatusChange,
  newVisitor,
  handleVisitorChange,
  handleAddVisitor,
  handleRemoveVisitor,
  visitors,
  saving,
  success
}: DynamicAttendanceFormProps) {
  // Common props for all form types
  const baseProps = {
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
  };

  // Visitor form props
  const visitorFormProps = {
    newVisitor,
    handleVisitorChange,
    handleAddVisitor,
    handleRemoveVisitor,
    visitors,
    saving,
    success
  };

  // Render the appropriate form based on event category
  const renderForm = () => {
    switch (eventCategory) {
      case 'cell_group':
        return (
          <>
            <CellGroupAttendanceForm
              {...baseProps}
              participants={participants}
              handleParticipantStatusChange={handleParticipantStatusChange}
            />
            {contextId && <VisitorsForm {...visitorFormProps} />}
          </>
        );
      
      case 'service':
        return (
          <>
            <ServiceAttendanceForm {...baseProps} />
            {contextId && <VisitorsForm {...visitorFormProps} />}
          </>
        );
      
      case 'ministry':
        return (
          <>
            <MinistryAttendanceForm
              {...baseProps}
              participants={participants}
              handleParticipantStatusChange={handleParticipantStatusChange}
            />
            {contextId && <VisitorsForm {...visitorFormProps} />}
          </>
        );
      
      case 'class':
        return (
          <>
            <ClassAttendanceForm
              {...baseProps}
              participants={participants}
              handleParticipantStatusChange={handleParticipantStatusChange}
            />
            {contextId && <VisitorsForm {...visitorFormProps} />}
          </>
        );
      
      case 'prayer':
        return (
          <>
            <PrayerAttendanceForm {...baseProps} />
            {contextId && <VisitorsForm {...visitorFormProps} />}
          </>
        );
      
      case 'other':
      default:
        return (
          <>
            <OtherAttendanceForm {...baseProps} />
            {contextId && <VisitorsForm {...visitorFormProps} />}
          </>
        );
    }
  };

  return <>{renderForm()}</>;
}
