-- Extend attendance system to support various event types and ministries
-- This migration adds new tables and columns without modifying existing data

-- Step 1: Create ministries table
CREATE TABLE IF NOT EXISTS ministries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES members(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create ministry_members table
CREATE TABLE IF NOT EXISTS ministry_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  role VARCHAR(255),
  joined_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ministry_id, member_id)
);

-- Step 3: Add new columns to attendance_meetings table
-- Using ALTER TABLE IF NOT EXISTS pattern for safety
DO $$
BEGIN
    -- Add event_category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'attendance_meetings'
                   AND column_name = 'event_category') THEN
        ALTER TABLE attendance_meetings
        ADD COLUMN event_category VARCHAR(50) DEFAULT 'cell_group';
    END IF;

    -- Add ministry_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'attendance_meetings'
                   AND column_name = 'ministry_id') THEN
        ALTER TABLE attendance_meetings
        ADD COLUMN ministry_id UUID;
    END IF;

    -- Add is_recurring column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'attendance_meetings'
                   AND column_name = 'is_recurring') THEN
        ALTER TABLE attendance_meetings
        ADD COLUMN is_recurring BOOLEAN DEFAULT false;
    END IF;

    -- Add parent_event_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'attendance_meetings'
                   AND column_name = 'parent_event_id') THEN
        ALTER TABLE attendance_meetings
        ADD COLUMN parent_event_id UUID;
    END IF;
END $$;

-- Step 4: Add foreign key constraints
DO $$
BEGIN
    -- Add foreign key for ministry_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_ministry'
        AND table_name = 'attendance_meetings'
    ) THEN
        ALTER TABLE attendance_meetings
        ADD CONSTRAINT fk_ministry
        FOREIGN KEY (ministry_id) REFERENCES ministries(id);
    END IF;

    -- Add foreign key for parent_event_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_parent_event'
        AND table_name = 'attendance_meetings'
    ) THEN
        ALTER TABLE attendance_meetings
        ADD CONSTRAINT fk_parent_event
        FOREIGN KEY (parent_event_id) REFERENCES attendance_meetings(id);
    END IF;
END $$;

-- Step 5: Update existing records to use the new event_category field
UPDATE attendance_meetings
SET event_category = 'cell_group'
WHERE event_category IS NULL;

-- Step 6: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_event_category
ON attendance_meetings(event_category);

CREATE INDEX IF NOT EXISTS idx_attendance_ministry
ON attendance_meetings(ministry_id);

CREATE INDEX IF NOT EXISTS idx_ministry_members_member
ON ministry_members(member_id);

-- Step 7: Create enum type for event categories if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category_enum') THEN
        CREATE TYPE event_category_enum AS ENUM (
            'cell_group',
            'prayer',
            'ministry',
            'service',
            'other'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

-- Note: We're not converting the column to use the enum type yet
-- to maintain backward compatibility
