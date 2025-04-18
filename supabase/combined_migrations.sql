-- Combined migrations for authentication system reset and rebuild

-- Reset database by dropping existing tables and recreating them
-- This migration creates the base schema for the church management system

-- First, check if the members table exists and has the required columns
DO $$
BEGIN
  -- Check if members table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'members') THEN
    -- Check if cell_group_id column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = 'members'
                  AND column_name = 'cell_group_id') THEN
      -- Add cell_group_id column
      ALTER TABLE members ADD COLUMN cell_group_id UUID;
    END IF;

    -- Check if district_id column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = 'members'
                  AND column_name = 'district_id') THEN
      -- Add district_id column
      ALTER TABLE members ADD COLUMN district_id UUID;
    END IF;

    -- Check if role column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = 'members'
                  AND column_name = 'role') THEN
      -- Add role column
      ALTER TABLE members ADD COLUMN role TEXT DEFAULT 'member';
    END IF;

    -- Check if role_level column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = 'members'
                  AND column_name = 'role_level') THEN
      -- Add role_level column
      ALTER TABLE members ADD COLUMN role_level INTEGER DEFAULT 1;
    END IF;
  END IF;
END $$;

-- Disable RLS to avoid permission issues during migration
ALTER TABLE IF EXISTS members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cell_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_visitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ministries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ministry_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS article_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS article_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS article_bookmarks DISABLE ROW LEVEL SECURITY;

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_sync_members_to_auth ON members;
DROP TRIGGER IF EXISTS trigger_create_member_from_auth ON auth.users;
DROP TRIGGER IF EXISTS trigger_sync_role_fields ON members;

-- Drop existing functions
DROP FUNCTION IF EXISTS sync_auth_with_members();
DROP FUNCTION IF EXISTS sync_members_to_auth();
DROP FUNCTION IF EXISTS create_member_from_auth();
DROP FUNCTION IF EXISTS update_auth_metadata_on_login();
DROP FUNCTION IF EXISTS sync_user_metadata(UUID);
DROP FUNCTION IF EXISTS sync_role_fields();
DROP FUNCTION IF EXISTS get_role_name(INTEGER);
DROP FUNCTION IF EXISTS get_role_level(TEXT);
DROP FUNCTION IF EXISTS disable_members_rls();
DROP FUNCTION IF EXISTS enable_members_rls();
DROP FUNCTION IF EXISTS fix_rls_policies();
DROP FUNCTION IF EXISTS insert_admin_member(UUID, TEXT, TEXT, TEXT);

-- Create member_tokens table for token-based authentication
DO $$
BEGIN
  -- Check if member_tokens table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'member_tokens') THEN
    -- Create the table
    CREATE TABLE member_tokens (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      member_id UUID,
      token TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      last_used_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT TRUE
    );

    -- Add foreign key constraint if members table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'members') THEN
      ALTER TABLE member_tokens ADD CONSTRAINT fk_member_tokens_member_id FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Create indexes for better performance
DO $$
BEGIN
  -- Create indexes on members table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'members') THEN
    -- Check if email column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'members'
              AND column_name = 'email') THEN
      CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
    END IF;

    -- Check if role column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'members'
              AND column_name = 'role') THEN
      CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
    END IF;

    -- Check if role_level column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'members'
              AND column_name = 'role_level') THEN
      CREATE INDEX IF NOT EXISTS idx_members_role_level ON members(role_level);
    END IF;

    -- Check if cell_group_id column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'members'
              AND column_name = 'cell_group_id') THEN
      CREATE INDEX IF NOT EXISTS idx_members_cell_group_id ON members(cell_group_id);
    END IF;

    -- Check if district_id column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'members'
              AND column_name = 'district_id') THEN
      CREATE INDEX IF NOT EXISTS idx_members_district_id ON members(district_id);
    END IF;
  END IF;

  -- Create indexes on cell_groups table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cell_groups') THEN
    -- Check if district_id column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'cell_groups'
              AND column_name = 'district_id') THEN
      CREATE INDEX IF NOT EXISTS idx_cell_groups_district_id ON cell_groups(district_id);
    END IF;
  END IF;

  -- Create indexes on attendance_meetings table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'attendance_meetings') THEN
    -- Check if cell_group_id column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'attendance_meetings'
              AND column_name = 'cell_group_id') THEN
      CREATE INDEX IF NOT EXISTS idx_attendance_meetings_cell_group_id ON attendance_meetings(cell_group_id);
    END IF;
  END IF;

  -- Create indexes on attendance_participants table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'attendance_participants') THEN
    -- Check if meeting_id column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'attendance_participants'
              AND column_name = 'meeting_id') THEN
      CREATE INDEX IF NOT EXISTS idx_attendance_participants_meeting_id ON attendance_participants(meeting_id);
    END IF;

    -- Check if member_id column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'attendance_participants'
              AND column_name = 'member_id') THEN
      CREATE INDEX IF NOT EXISTS idx_attendance_participants_member_id ON attendance_participants(member_id);
    END IF;
  END IF;

  -- Create indexes on ministry_members table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ministry_members') THEN
    -- Check if ministry_id column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'ministry_members'
              AND column_name = 'ministry_id') THEN
      CREATE INDEX IF NOT EXISTS idx_ministry_members_ministry_id ON ministry_members(ministry_id);
    END IF;

    -- Check if member_id column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'ministry_members'
              AND column_name = 'member_id') THEN
      CREATE INDEX IF NOT EXISTS idx_ministry_members_member_id ON ministry_members(member_id);
    END IF;
  END IF;

  -- Create indexes on member_tokens table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'member_tokens') THEN
    -- Check if member_id column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'member_tokens'
              AND column_name = 'member_id') THEN
      CREATE INDEX IF NOT EXISTS idx_member_tokens_member_id ON member_tokens(member_id);
    END IF;

    -- Check if token column exists
    IF EXISTS (SELECT FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'member_tokens'
              AND column_name = 'token') THEN
      CREATE INDEX IF NOT EXISTS idx_member_tokens_token ON member_tokens(token);
    END IF;
  END IF;
END $$;

-- Create authentication functions and RLS policies

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user has admin role in members table
  RETURN EXISTS (
    SELECT 1
    FROM members
    WHERE
      id = auth.uid() AND
      (role = 'admin' OR role_level >= 4)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a member (via token)
CREATE OR REPLACE FUNCTION is_valid_member_token(token_value TEXT)
RETURNS UUID AS $$
DECLARE
  member_id UUID;
BEGIN
  -- Get member_id from token if valid and not expired
  SELECT mt.member_id INTO member_id
  FROM member_tokens mt
  WHERE
    mt.token = token_value AND
    mt.is_active = TRUE AND
    mt.expires_at > NOW();

  -- Update last_used_at if token is valid
  IF member_id IS NOT NULL THEN
    UPDATE member_tokens
    SET last_used_at = NOW()
    WHERE token = token_value;
  END IF;

  RETURN member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate a token for a member
CREATE OR REPLACE FUNCTION generate_member_token(member_id_param UUID, days_valid INTEGER DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Check if member exists
  IF NOT EXISTS (SELECT 1 FROM members WHERE id = member_id_param) THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  -- Generate a random token
  new_token := encode(gen_random_bytes(32), 'hex');

  -- Insert the token
  INSERT INTO member_tokens (
    member_id,
    token,
    expires_at
  ) VALUES (
    member_id_param,
    new_token,
    NOW() + (days_valid || ' days')::INTERVAL
  );

  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invalidate all tokens for a member
CREATE OR REPLACE FUNCTION invalidate_member_tokens(member_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE member_tokens
  SET is_active = FALSE
  WHERE member_id = member_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a member from auth user
CREATE OR REPLACE FUNCTION create_member_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if member already exists
  IF EXISTS (SELECT 1 FROM members WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Insert new member record
  INSERT INTO members (
    id,
    email,
    first_name,
    last_name,
    role,
    role_level,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'admin', -- Default to admin for users created through auth
    4,      -- Admin role level
    'active',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registrations
DROP TRIGGER IF EXISTS trigger_create_member_from_auth ON auth.users;
CREATE TRIGGER trigger_create_member_from_auth
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_member_from_auth();

-- Set up RLS policies

-- First, drop existing policies to avoid conflicts
DO $$
BEGIN
  -- Drop policies for members table
  DROP POLICY IF EXISTS "Admins can do anything with members" ON members;
  DROP POLICY IF EXISTS "Anyone can read active members" ON members;

  -- Drop policies for member_tokens table
  DROP POLICY IF EXISTS "Admins can do anything with member_tokens" ON member_tokens;
  DROP POLICY IF EXISTS "Members can view their own tokens" ON member_tokens;

  -- Drop policies for districts table
  DROP POLICY IF EXISTS "Anyone can read districts" ON districts;
  DROP POLICY IF EXISTS "Admins can manage districts" ON districts;

  -- Drop policies for cell_groups table
  DROP POLICY IF EXISTS "Anyone can read cell_groups" ON cell_groups;
  DROP POLICY IF EXISTS "Admins can manage cell_groups" ON cell_groups;

  -- Drop policies for attendance_meetings table
  DROP POLICY IF EXISTS "Anyone can read attendance_meetings" ON attendance_meetings;
  DROP POLICY IF EXISTS "Admins can manage attendance_meetings" ON attendance_meetings;

  -- Drop policies for attendance_participants table
  DROP POLICY IF EXISTS "Anyone can read attendance_participants" ON attendance_participants;
  DROP POLICY IF EXISTS "Admins can manage attendance_participants" ON attendance_participants;

  -- Drop policies for attendance_visitors table
  DROP POLICY IF EXISTS "Anyone can read attendance_visitors" ON attendance_visitors;
  DROP POLICY IF EXISTS "Admins can manage attendance_visitors" ON attendance_visitors;

  -- Drop policies for ministries table
  DROP POLICY IF EXISTS "Anyone can read ministries" ON ministries;
  DROP POLICY IF EXISTS "Admins can manage ministries" ON ministries;

  -- Drop policies for ministry_members table
  DROP POLICY IF EXISTS "Anyone can read ministry_members" ON ministry_members;
  DROP POLICY IF EXISTS "Admins can manage ministry_members" ON ministry_members;

  -- Drop policies for articles table
  DROP POLICY IF EXISTS "Anyone can read published articles" ON articles;
  DROP POLICY IF EXISTS "Admins can manage articles" ON articles;

  -- Drop policies for article_categories table
  DROP POLICY IF EXISTS "Anyone can read article_categories" ON article_categories;
  DROP POLICY IF EXISTS "Admins can manage article_categories" ON article_categories;

  -- Drop policies for article_comments table
  DROP POLICY IF EXISTS "Anyone can read article_comments" ON article_comments;
  DROP POLICY IF EXISTS "Admins can manage article_comments" ON article_comments;

  -- Drop policies for article_bookmarks table
  DROP POLICY IF EXISTS "Anyone can read article_bookmarks" ON article_bookmarks;
  DROP POLICY IF EXISTS "Admins can manage article_bookmarks" ON article_bookmarks;
END $$;

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create cell_group_members table if it doesn't exist
DO $$
BEGIN
  -- Check if cell_group_members table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cell_group_members') THEN
    -- Create the table
    CREATE TABLE cell_group_members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      cell_group_id UUID NOT NULL,
      member_id UUID NOT NULL,
      joined_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(cell_group_id, member_id)
    );

    -- Add foreign key constraints if tables exist
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cell_groups') AND
       EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'members') THEN
      ALTER TABLE cell_group_members
        ADD CONSTRAINT fk_cell_group_members_cell_group_id
        FOREIGN KEY (cell_group_id) REFERENCES cell_groups(id) ON DELETE CASCADE;

      ALTER TABLE cell_group_members
        ADD CONSTRAINT fk_cell_group_members_member_id
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;
    END IF;

    -- Create indexes
    CREATE INDEX idx_cell_group_members_cell_group_id ON cell_group_members(cell_group_id);
    CREATE INDEX idx_cell_group_members_member_id ON cell_group_members(member_id);
  END IF;

  -- Check if cell_group_leaders table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cell_group_leaders') THEN
    -- Create the table
    CREATE TABLE cell_group_leaders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      cell_group_id UUID NOT NULL,
      member_id UUID NOT NULL,
      role VARCHAR(50) DEFAULT 'leader',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(cell_group_id, member_id)
    );

    -- Add foreign key constraints if tables exist
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cell_groups') AND
       EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'members') THEN
      ALTER TABLE cell_group_leaders
        ADD CONSTRAINT fk_cell_group_leaders_cell_group_id
        FOREIGN KEY (cell_group_id) REFERENCES cell_groups(id) ON DELETE CASCADE;

      ALTER TABLE cell_group_leaders
        ADD CONSTRAINT fk_cell_group_leaders_member_id
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;
    END IF;

    -- Create indexes
    CREATE INDEX idx_cell_group_leaders_cell_group_id ON cell_group_leaders(cell_group_id);
    CREATE INDEX idx_cell_group_leaders_member_id ON cell_group_leaders(member_id);
  END IF;
END $$;

-- Enable RLS on the new tables
ALTER TABLE cell_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_group_leaders ENABLE ROW LEVEL SECURITY;

-- Members table policies
CREATE POLICY "Admins can do anything with members"
ON members
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Anyone can read active members"
ON members
FOR SELECT
USING (status = 'active');

-- Member tokens table policies
CREATE POLICY "Admins can do anything with member_tokens"
ON member_tokens
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Members can view their own tokens"
ON member_tokens
FOR SELECT
USING (member_id = auth.uid());

-- Districts table policies
CREATE POLICY "Anyone can read districts"
ON districts
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage districts"
ON districts
USING (is_admin())
WITH CHECK (is_admin());

-- Cell groups table policies
CREATE POLICY "Anyone can read cell_groups"
ON cell_groups
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage cell_groups"
ON cell_groups
USING (is_admin())
WITH CHECK (is_admin());

-- Attendance meetings policies
CREATE POLICY "Anyone can read attendance_meetings"
ON attendance_meetings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage attendance_meetings"
ON attendance_meetings
USING (is_admin())
WITH CHECK (is_admin());

-- Attendance participants policies
CREATE POLICY "Anyone can read attendance_participants"
ON attendance_participants
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage attendance_participants"
ON attendance_participants
USING (is_admin())
WITH CHECK (is_admin());

-- Attendance visitors policies
CREATE POLICY "Anyone can read attendance_visitors"
ON attendance_visitors
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage attendance_visitors"
ON attendance_visitors
USING (is_admin())
WITH CHECK (is_admin());

-- Ministries policies
CREATE POLICY "Anyone can read ministries"
ON ministries
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage ministries"
ON ministries
USING (is_admin())
WITH CHECK (is_admin());

-- Ministry members policies
CREATE POLICY "Anyone can read ministry_members"
ON ministry_members
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage ministry_members"
ON ministry_members
USING (is_admin())
WITH CHECK (is_admin());

-- Articles policies
CREATE POLICY "Anyone can read published articles"
ON articles
FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can manage articles"
ON articles
USING (is_admin())
WITH CHECK (is_admin());

-- Article categories policies
CREATE POLICY "Anyone can read article_categories"
ON article_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage article_categories"
ON article_categories
USING (is_admin())
WITH CHECK (is_admin());

-- Article comments policies
CREATE POLICY "Anyone can read article_comments"
ON article_comments
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage article_comments"
ON article_comments
USING (is_admin())
WITH CHECK (is_admin());

-- Article bookmarks policies
CREATE POLICY "Anyone can read article_bookmarks"
ON article_bookmarks
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage article_bookmarks"
ON article_bookmarks
USING (is_admin())
WITH CHECK (is_admin());

-- Cell group members policies
CREATE POLICY "Anyone can read cell_group_members"
ON cell_group_members
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage cell_group_members"
ON cell_group_members
USING (is_admin())
WITH CHECK (is_admin());

-- Cell group leaders policies
CREATE POLICY "Anyone can read cell_group_leaders"
ON cell_group_leaders
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage cell_group_leaders"
ON cell_group_leaders
USING (is_admin())
WITH CHECK (is_admin());

-- Add triggers to automatically populate cell_group_leaders when cell_group is updated
CREATE OR REPLACE FUNCTION update_cell_group_leaders()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete existing leader entries for this cell group
  DELETE FROM cell_group_leaders WHERE cell_group_id = NEW.id;

  -- Add leader if specified
  IF NEW.leader_id IS NOT NULL THEN
    INSERT INTO cell_group_leaders (cell_group_id, member_id, role)
    VALUES (NEW.id, NEW.leader_id, 'leader')
    ON CONFLICT (cell_group_id, member_id) DO NOTHING;
  END IF;

  -- Add assistant leader if specified
  IF NEW.assistant_leader_id IS NOT NULL THEN
    INSERT INTO cell_group_leaders (cell_group_id, member_id, role)
    VALUES (NEW.id, NEW.assistant_leader_id, 'assistant')
    ON CONFLICT (cell_group_id, member_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cell_groups
DROP TRIGGER IF EXISTS trigger_update_cell_group_leaders ON cell_groups;
CREATE TRIGGER trigger_update_cell_group_leaders
AFTER INSERT OR UPDATE OF leader_id, assistant_leader_id ON cell_groups
FOR EACH ROW
EXECUTE FUNCTION update_cell_group_leaders();

-- Add function to sync existing cell groups
CREATE OR REPLACE FUNCTION sync_cell_group_leaders()
RETURNS VOID AS $$
DECLARE
  cg RECORD;
BEGIN
  FOR cg IN SELECT id, leader_id, assistant_leader_id FROM cell_groups
  LOOP
    -- Delete existing leader entries for this cell group
    DELETE FROM cell_group_leaders WHERE cell_group_id = cg.id;

    -- Add leader if specified
    IF cg.leader_id IS NOT NULL THEN
      INSERT INTO cell_group_leaders (cell_group_id, member_id, role)
      VALUES (cg.id, cg.leader_id, 'leader')
      ON CONFLICT (cell_group_id, member_id) DO NOTHING;
    END IF;

    -- Add assistant leader if specified
    IF cg.assistant_leader_id IS NOT NULL THEN
      INSERT INTO cell_group_leaders (cell_group_id, member_id, role)
      VALUES (cg.id, cg.assistant_leader_id, 'assistant')
      ON CONFLICT (cell_group_id, member_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add function to sync members with cell_group_id to cell_group_members
CREATE OR REPLACE FUNCTION sync_members_to_cell_group_members()
RETURNS VOID AS $$
DECLARE
  m RECORD;
BEGIN
  FOR m IN SELECT id, cell_group_id FROM members WHERE cell_group_id IS NOT NULL
  LOOP
    -- Add member to cell_group_members if not already there
    INSERT INTO cell_group_members (cell_group_id, member_id)
    VALUES (m.cell_group_id, m.id)
    ON CONFLICT (cell_group_id, member_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically add members to cell_group_members when their cell_group_id is updated
CREATE OR REPLACE FUNCTION update_cell_group_members()
RETURNS TRIGGER AS $$
BEGIN
  -- If cell_group_id is being set to NULL, remove from cell_group_members
  IF OLD.cell_group_id IS NOT NULL AND NEW.cell_group_id IS NULL THEN
    DELETE FROM cell_group_members
    WHERE cell_group_id = OLD.cell_group_id AND member_id = NEW.id;
  END IF;

  -- If cell_group_id is being changed or set
  IF NEW.cell_group_id IS NOT NULL AND (OLD.cell_group_id IS NULL OR OLD.cell_group_id != NEW.cell_group_id) THEN
    -- Remove from old cell group if any
    IF OLD.cell_group_id IS NOT NULL THEN
      DELETE FROM cell_group_members
      WHERE cell_group_id = OLD.cell_group_id AND member_id = NEW.id;
    END IF;

    -- Add to new cell group
    INSERT INTO cell_group_members (cell_group_id, member_id)
    VALUES (NEW.cell_group_id, NEW.id)
    ON CONFLICT (cell_group_id, member_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for members
DROP TRIGGER IF EXISTS trigger_update_cell_group_members ON members;
CREATE TRIGGER trigger_update_cell_group_members
AFTER UPDATE OF cell_group_id ON members
FOR EACH ROW
EXECUTE FUNCTION update_cell_group_members();

-- Run the sync functions to populate the tables with existing data
SELECT sync_cell_group_leaders();
SELECT sync_members_to_cell_group_members();

-- Create helper functions for admin setup

-- Function to create an admin user directly in the members table
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_first_name TEXT DEFAULT 'Admin',
  admin_last_name TEXT DEFAULT 'User'
)
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Generate a new UUID
  admin_id := gen_random_uuid();

  -- Insert admin record
  INSERT INTO members (
    id,
    email,
    first_name,
    last_name,
    role,
    role_level,
    status,
    created_at,
    updated_at
  ) VALUES (
    admin_id,
    admin_email,
    admin_first_name,
    admin_last_name,
    'admin',
    4,
    'active',
    NOW(),
    NOW()
  );

  RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
