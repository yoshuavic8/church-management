-- Initial schema for Church Management System
-- This single migration creates all tables, functions, and policies needed for the system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create members table
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
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  role TEXT DEFAULT 'member',
  role_level INTEGER DEFAULT 1,
  role_context JSONB DEFAULT NULL,
  cell_group_id UUID,
  district_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member_tokens table for token-based authentication
CREATE TABLE IF NOT EXISTS member_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create districts table
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

-- Create cell_groups table
CREATE TABLE IF NOT EXISTS cell_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  district_id UUID,
  leader_id UUID,
  assistant_leader_id UUID,
  meeting_day TEXT,
  meeting_time TEXT,
  meeting_location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance tables
CREATE TABLE IF NOT EXISTS attendance_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_group_id UUID,
  meeting_date DATE NOT NULL,
  meeting_type VARCHAR(50) DEFAULT 'regular',
  topic VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  location VARCHAR(255),
  offering FLOAT
);

CREATE TABLE IF NOT EXISTS attendance_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID,
  member_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create ministries tables
CREATE TABLE IF NOT EXISTS ministries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leader_id UUID,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create articles tables
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

CREATE TABLE IF NOT EXISTS article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID,
  member_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  parent_id UUID
);

CREATE TABLE IF NOT EXISTS article_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID,
  member_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, member_id)
);

-- Add foreign key constraints
ALTER TABLE members 
  ADD CONSTRAINT fk_members_cell_group 
  FOREIGN KEY (cell_group_id) REFERENCES cell_groups(id);

ALTER TABLE members 
  ADD CONSTRAINT fk_members_district 
  FOREIGN KEY (district_id) REFERENCES districts(id);

ALTER TABLE member_tokens
  ADD CONSTRAINT fk_member_tokens_member_id
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

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

ALTER TABLE cell_groups
  ADD CONSTRAINT fk_cell_groups_assistant_leader
  FOREIGN KEY (assistant_leader_id) REFERENCES members(id);

ALTER TABLE attendance_meetings
  ADD CONSTRAINT fk_attendance_meetings_cell_group
  FOREIGN KEY (cell_group_id) REFERENCES cell_groups(id);

ALTER TABLE attendance_meetings
  ADD CONSTRAINT fk_attendance_meetings_created_by
  FOREIGN KEY (created_by) REFERENCES members(id);

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
  ADD CONSTRAINT fk_attendance_visitors_converted_to_member
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

ALTER TABLE article_comments
  ADD CONSTRAINT fk_article_comments_article
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

ALTER TABLE article_comments
  ADD CONSTRAINT fk_article_comments_member
  FOREIGN KEY (member_id) REFERENCES members(id);

ALTER TABLE article_comments
  ADD CONSTRAINT fk_article_comments_parent
  FOREIGN KEY (parent_id) REFERENCES article_comments(id);

ALTER TABLE article_bookmarks
  ADD CONSTRAINT fk_article_bookmarks_article
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

ALTER TABLE article_bookmarks
  ADD CONSTRAINT fk_article_bookmarks_member
  FOREIGN KEY (member_id) REFERENCES members(id);

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_role_level ON members(role_level);
CREATE INDEX idx_members_cell_group_id ON members(cell_group_id);
CREATE INDEX idx_members_district_id ON members(district_id);
CREATE INDEX idx_cell_groups_district_id ON cell_groups(district_id);
CREATE INDEX idx_attendance_meetings_cell_group_id ON attendance_meetings(cell_group_id);
CREATE INDEX idx_attendance_participants_meeting_id ON attendance_participants(meeting_id);
CREATE INDEX idx_attendance_participants_member_id ON attendance_participants(member_id);
CREATE INDEX idx_ministry_members_ministry_id ON ministry_members(ministry_id);
CREATE INDEX idx_ministry_members_member_id ON ministry_members(member_id);
CREATE INDEX idx_member_tokens_member_id ON member_tokens(member_id);
CREATE INDEX idx_member_tokens_token ON member_tokens(token);

-- Enable realtime for attendance tables
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_visitors;

-- Create authentication functions

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
    -- Update the existing member with auth data if needed
    UPDATE members
    SET 
      email = COALESCE(members.email, NEW.email),
      first_name = COALESCE(members.first_name, COALESCE(NEW.raw_user_meta_data->>'first_name', '')),
      last_name = COALESCE(members.last_name, COALESCE(NEW.raw_user_meta_data->>'last_name', '')),
      updated_at = NOW()
    WHERE id = NEW.id;
  ELSE
    -- Insert new member record with error handling
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the trigger
      RAISE NOTICE 'Error creating member from auth user: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registrations
DROP TRIGGER IF EXISTS trigger_create_member_from_auth ON auth.users;
CREATE TRIGGER trigger_create_member_from_auth
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_member_from_auth();

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

-- Function to manually create an admin auth user
CREATE OR REPLACE FUNCTION create_admin_auth_user(
  admin_email TEXT,
  admin_first_name TEXT DEFAULT 'Admin',
  admin_last_name TEXT DEFAULT 'User'
)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
  member_id UUID;
BEGIN
  -- First check if the user already exists in auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = admin_email LIMIT 1;
  
  IF user_id IS NULL THEN
    -- Create the user in auth.users directly (bypassing the API)
    INSERT INTO auth.users (
      email,
      raw_user_meta_data,
      created_at,
      updated_at,
      email_confirmed_at,
      confirmation_sent_at,
      is_super_admin,
      role_id
    ) VALUES (
      admin_email,
      jsonb_build_object('first_name', admin_first_name, 'last_name', admin_last_name),
      NOW(),
      NOW(),
      NOW(), -- Email already confirmed
      NOW(),
      FALSE,
      (SELECT id FROM auth.roles WHERE name = 'authenticated')
    )
    RETURNING id INTO user_id;
  END IF;
  
  -- Now check if there's a corresponding member record
  SELECT id INTO member_id FROM members WHERE id = user_id OR email = admin_email LIMIT 1;
  
  IF member_id IS NULL THEN
    -- Create the member record
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
      user_id,
      admin_email,
      admin_first_name,
      admin_last_name,
      'admin',
      4,
      'active',
      NOW(),
      NOW()
    )
    RETURNING id INTO member_id;
  ELSE
    -- Update the member record to ensure it has admin privileges
    UPDATE members
    SET 
      role = 'admin',
      role_level = 4,
      status = 'active',
      updated_at = NOW()
    WHERE id = member_id;
  END IF;
  
  RETURN 'Admin user created/updated successfully with ID: ' || user_id::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up RLS policies

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
