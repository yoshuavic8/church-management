-- Create ministries table if it doesn't exist
CREATE TABLE IF NOT EXISTS ministries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id UUID,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ministries_leader'
  ) THEN
    ALTER TABLE ministries
    ADD CONSTRAINT fk_ministries_leader
    FOREIGN KEY (leader_id) REFERENCES members(id);
  END IF;
END
$$;

-- Create ministry_members table if it doesn't exist
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

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ministry_members_ministry'
  ) THEN
    ALTER TABLE ministry_members
    ADD CONSTRAINT fk_ministry_members_ministry
    FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ministry_members_member'
  ) THEN
    ALTER TABLE ministry_members
    ADD CONSTRAINT fk_ministry_members_member
    FOREIGN KEY (member_id) REFERENCES members(id);
  END IF;
END
$$;

-- Add ministry_id column to attendance_meetings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendance_meetings' AND column_name = 'ministry_id'
  ) THEN
    ALTER TABLE attendance_meetings ADD COLUMN ministry_id UUID;
  END IF;
END
$$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_attendance_meetings_ministry'
  ) THEN
    ALTER TABLE attendance_meetings
    ADD CONSTRAINT fk_attendance_meetings_ministry
    FOREIGN KEY (ministry_id) REFERENCES ministries(id);
  END IF;
END
$$;

-- Add event_category column to attendance_meetings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendance_meetings' AND column_name = 'event_category'
  ) THEN
    ALTER TABLE attendance_meetings ADD COLUMN event_category VARCHAR(50) DEFAULT 'cell_group';
  END IF;
END
$$;

-- Add is_realtime column to attendance_meetings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendance_meetings' AND column_name = 'is_realtime'
  ) THEN
    ALTER TABLE attendance_meetings ADD COLUMN is_realtime BOOLEAN DEFAULT FALSE;
  END IF;
END
$$;
