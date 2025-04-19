// Types for ministry management

export type Ministry = {
  id: string;
  name: string;
  description: string | null;
  leader_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  leader?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  member_count?: number;
};

export type MinistryMember = {
  id: string;
  ministry_id: string;
  member_id: string;
  role: string | null;
  joined_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  member?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
  };
};

export type EventCategory =
  | "cell_group"
  | "prayer"
  | "ministry"
  | "service"
  | "class"
  | "other";

// Extended attendance meeting type
export type ExtendedAttendanceMeeting = {
  id: string;
  cell_group_id: string | null;
  ministry_id: string | null;
  meeting_date: string;
  meeting_type: string;
  event_category: EventCategory;
  topic: string | null;
  notes: string | null;
  location: string | null;
  offering: number | null;
  is_recurring: boolean;
  parent_event_id: string | null;
  created_at: string;
  cell_group?: {
    name: string;
  };
  ministry?: {
    name: string;
  };
  present_count?: number;
  absent_count?: number;
  late_count?: number;
  excused_count?: number;
  visitor_count?: number;
  total_count?: number;
};
