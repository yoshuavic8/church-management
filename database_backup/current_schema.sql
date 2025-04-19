-- Backup of current database schema
-- Generated on: $(date)

-- This file contains the SQL commands to recreate the current database schema
-- It should be used as a reference if you need to recreate the database structure

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  baptism_date DATE,
  is_baptized BOOLEAN DEFAULT FALSE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  role TEXT DEFAULT 'member',
  role_level INTEGER DEFAULT 1,
  role_context JSONB DEFAULT NULL,
  cell_group_id UUID,
  district_id UUID,
  password_hash TEXT,
  password_reset_required BOOLEAN DEFAULT TRUE,
  last_password_change TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  leader1_id UUID,
  leader2_id UUID,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cell Groups table
CREATE TABLE IF NOT EXISTS cell_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  district_id UUID,
  leader_id UUID,
  meeting_day TEXT,
  meeting_time TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cell Group Members table
CREATE TABLE IF NOT EXISTS cell_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_group_id UUID NOT NULL,
  member_id UUID NOT NULL,
  joined_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cell_group_id, member_id)
);

-- Attendance Meetings table
CREATE TABLE IF NOT EXISTS attendance_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_group_id UUID,
  ministry_id UUID,
  meeting_date DATE NOT NULL,
  meeting_type VARCHAR(50) DEFAULT 'regular',
  topic VARCHAR(255),
  notes TEXT,
  event_category VARCHAR(50) DEFAULT 'cell_group',
  is_realtime BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  location VARCHAR(255),
  offering FLOAT
);

-- Attendance Participants table
CREATE TABLE IF NOT EXISTS attendance_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID,
  member_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Visitors table
CREATE TABLE IF NOT EXISTS attendance_visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_to_member_id UUID,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Ministries table
CREATE TABLE IF NOT EXISTS ministries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id UUID,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ministry Members table
CREATE TABLE IF NOT EXISTS ministry_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministry_id UUID,
  member_id UUID,
  role VARCHAR(255),
  joined_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ministry_id, member_id)
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0
);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Baptism Status Trigger
CREATE OR REPLACE FUNCTION sync_baptism_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run this logic if one of these columns is changing
    IF TG_OP = 'INSERT' OR 
       NEW.baptism_date IS DISTINCT FROM OLD.baptism_date OR 
       NEW.is_baptized IS DISTINCT FROM OLD.is_baptized THEN
        
        -- If baptism_date is set, ensure is_baptized is TRUE
        IF NEW.baptism_date IS NOT NULL THEN
            NEW.is_baptized := TRUE;
        END IF;
        
        -- If is_baptized is FALSE, ensure baptism_date is NULL
        IF NEW.is_baptized = FALSE THEN
            NEW.baptism_date := NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on members table
DROP TRIGGER IF EXISTS trigger_sync_baptism_status ON members;
CREATE TRIGGER trigger_sync_baptism_status
BEFORE INSERT OR UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION sync_baptism_status();

-- Foreign Key Constraints
ALTER TABLE members 
  ADD CONSTRAINT fk_members_cell_group 
  FOREIGN KEY (cell_group_id) REFERENCES cell_groups(id);

ALTER TABLE members 
  ADD CONSTRAINT fk_members_district 
  FOREIGN KEY (district_id) REFERENCES districts(id);

ALTER TABLE districts
  ADD CONSTRAINT fk_districts_leader1
  FOREIGN KEY (leader1_id) REFERENCES members(id);

ALTER TABLE districts
  ADD CONSTRAINT fk_districts_leader2
  FOREIGN KEY (leader2_id) REFERENCES members(id);

ALTER TABLE cell_groups
  ADD CONSTRAINT fk_cell_groups_district
  FOREIGN KEY (district_id) REFERENCES districts(id);

ALTER TABLE cell_groups
  ADD CONSTRAINT fk_cell_groups_leader
  FOREIGN KEY (leader_id) REFERENCES members(id);

ALTER TABLE cell_group_members
  ADD CONSTRAINT fk_cell_group_members_cell_group
  FOREIGN KEY (cell_group_id) REFERENCES cell_groups(id) ON DELETE CASCADE;

ALTER TABLE cell_group_members
  ADD CONSTRAINT fk_cell_group_members_member
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE attendance_meetings
  ADD CONSTRAINT fk_attendance_meetings_cell_group
  FOREIGN KEY (cell_group_id) REFERENCES cell_groups(id);

ALTER TABLE attendance_meetings
  ADD CONSTRAINT fk_attendance_meetings_ministry
  FOREIGN KEY (ministry_id) REFERENCES ministries(id);

ALTER TABLE attendance_participants
  ADD CONSTRAINT fk_attendance_participants_meeting
  FOREIGN KEY (meeting_id) REFERENCES attendance_meetings(id) ON DELETE CASCADE;

ALTER TABLE attendance_participants
  ADD CONSTRAINT fk_attendance_participants_member
  FOREIGN KEY (member_id) REFERENCES members(id);

ALTER TABLE attendance_visitors
  ADD CONSTRAINT fk_attendance_visitors_meeting
  FOREIGN KEY (meeting_id) REFERENCES attendance_meetings(id) ON DELETE CASCADE;

ALTER TABLE attendance_visitors
  ADD CONSTRAINT fk_attendance_visitors_converted_member
  FOREIGN KEY (converted_to_member_id) REFERENCES members(id);

ALTER TABLE ministries
  ADD CONSTRAINT fk_ministries_leader
  FOREIGN KEY (leader_id) REFERENCES members(id);

ALTER TABLE ministry_members
  ADD CONSTRAINT fk_ministry_members_ministry
  FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE CASCADE;

ALTER TABLE ministry_members
  ADD CONSTRAINT fk_ministry_members_member
  FOREIGN KEY (member_id) REFERENCES members(id);

ALTER TABLE articles
  ADD CONSTRAINT fk_articles_author
  FOREIGN KEY (author_id) REFERENCES members(id);

ALTER TABLE password_reset_tokens
  ADD CONSTRAINT fk_password_reset_tokens_member
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- RLS Policies
-- These are the policies that should be recreated if needed

-- Members table policies
CREATE POLICY "Admins can do anything with members"
ON members
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Anyone can read active members"
ON members
FOR SELECT
USING (status = 'active');

CREATE POLICY "Members can update their own data"
ON members
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Service role can update members"
ON members
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anon can update members"
ON members
FOR UPDATE
USING (auth.role() = 'anon')
WITH CHECK (auth.role() = 'anon');

-- Cell Groups table policies
CREATE POLICY "Anyone can read cell_groups"
ON cell_groups
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage cell_groups"
ON cell_groups
USING (is_admin())
WITH CHECK (is_admin());

-- Attendance tables policies
CREATE POLICY "Anyone can read attendance_meetings"
ON attendance_meetings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage attendance_meetings"
ON attendance_meetings
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Anyone can read attendance_participants"
ON attendance_participants
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage attendance_participants"
ON attendance_participants
USING (is_admin())
WITH CHECK (is_admin());
