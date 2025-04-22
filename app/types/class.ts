// Class types for the Classes module

export type ClassCategory =
  | "bible_study"
  | "counseling"
  | "discipleship"
  | "leadership"
  | "other";

export type ClassStatus = "upcoming" | "active" | "completed";

export type EnrollmentStatus = "enrolled" | "completed" | "dropped";

export interface Class {
  id: string;
  name: string;
  description: string | null;
  category: ClassCategory;
  max_students: number | null;
  status: ClassStatus;
  has_levels: boolean;
  created_at: string;
  updated_at: string;
  level_count?: number;
  student_count?: number;
}

export interface ClassLevel {
  id: string;
  class_id: string;
  name: string;
  description: string | null;
  prerequisite_level_id: string | null;
  order_number: number;
  created_at: string;
  updated_at: string;
  session_count?: number;
  student_count?: number;
  class?: Class;
}

export interface ClassSession {
  id: string;
  level_id: string;
  title: string;
  description: string | null;
  session_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  instructor_id: string | null;
  materials: any | null;
  order_number: number;
  attendance_meeting_id: string | null;
  created_at: string;
  updated_at: string;
  level?: ClassLevel;
  instructor?: {
    first_name: string;
    last_name: string;
  };
}

export interface ClassEnrollment {
  id: string;
  member_id: string;
  level_id: string;
  class_id: string;
  enrollment_date: string;
  status: EnrollmentStatus;
  completion_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  member?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  level?: ClassLevel;
  class?: Class;
}
