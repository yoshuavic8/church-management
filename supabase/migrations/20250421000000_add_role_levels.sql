-- Add role_level and role_context columns to members table
DO $$
BEGIN
  -- Add role_level column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'role_level') THEN
    ALTER TABLE members ADD COLUMN role_level INTEGER DEFAULT 1;
  END IF;

  -- Add role_context column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'role_context') THEN
    ALTER TABLE members ADD COLUMN role_context JSONB DEFAULT NULL;
  END IF;
END $$;

-- Create role_level_enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_level_enum') THEN
    CREATE TYPE role_level_enum AS ENUM (
      'member',        -- Level 1: Regular member
      'cell_leader',   -- Level 2: Cell group leader
      'ministry_leader', -- Level 3: Ministry leader
      'admin'          -- Level 4: Administrator
    );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Create function to convert role_level to text
CREATE OR REPLACE FUNCTION get_role_name(role_level INTEGER) RETURNS TEXT AS $$
BEGIN
  CASE role_level
    WHEN 1 THEN RETURN 'member';
    WHEN 2 THEN RETURN 'cell_leader';
    WHEN 3 THEN RETURN 'ministry_leader';
    WHEN 4 THEN RETURN 'admin';
    ELSE RETURN 'member';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to convert text role to role_level
CREATE OR REPLACE FUNCTION get_role_level(role_name TEXT) RETURNS INTEGER AS $$
BEGIN
  CASE lower(role_name)
    WHEN 'member' THEN RETURN 1;
    WHEN 'cell_leader' THEN RETURN 2;
    WHEN 'ministry_leader' THEN RETURN 3;
    WHEN 'admin' THEN RETURN 4;
    ELSE RETURN 1;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Update existing members with role_level based on role
UPDATE members
SET role_level = get_role_level(role)
WHERE role IS NOT NULL;

-- Update cell group leaders with role_level = 2 and appropriate context
-- We'll do this in a simpler way without GROUP BY
DO $$
DECLARE
  cg_leader RECORD;
  cell_group_ids TEXT[];
BEGIN
  FOR cg_leader IN
    SELECT DISTINCT member_id
    FROM cell_group_leaders
  LOOP
    -- Get all cell group IDs for this leader
    SELECT array_agg(cell_group_id) INTO cell_group_ids
    FROM cell_group_leaders
    WHERE member_id = cg_leader.member_id;

    -- Update the member record
    UPDATE members
    SET
      role_level = 2,
      role_context = jsonb_build_object('cell_group_ids', cell_group_ids)
    WHERE id = cg_leader.member_id
    AND (role_level IS NULL OR role_level < 2);
  END LOOP;
END $$;

-- Update ministry leaders with role_level = 3 and appropriate context
DO $$
DECLARE
  ministry_leader RECORD;
  ministry_ids TEXT[];
BEGIN
  FOR ministry_leader IN
    SELECT DISTINCT leader_id
    FROM ministries
    WHERE leader_id IS NOT NULL
  LOOP
    -- Get all ministry IDs for this leader
    SELECT array_agg(id) INTO ministry_ids
    FROM ministries
    WHERE leader_id = ministry_leader.leader_id;

    -- Update the member record
    UPDATE members
    SET
      role_level = 3,
      role_context = jsonb_build_object('ministry_ids', ministry_ids)
    WHERE id = ministry_leader.leader_id
    AND (role_level IS NULL OR role_level < 3);
  END LOOP;
END $$;

-- Create or update RLS policies for role-based access
-- Everyone can read members
DROP POLICY IF EXISTS "Anyone can read members" ON members;
CREATE POLICY "Anyone can read members"
ON members FOR SELECT USING (true);

-- Only admins and users themselves can update their own records
DROP POLICY IF EXISTS "Users can update their own records" ON members;
CREATE POLICY "Users can update their own records"
ON members FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  (auth.jwt() ->> 'role_level')::INTEGER >= 4
)
WITH CHECK (
  auth.uid() = id OR
  (auth.jwt() ->> 'role_level')::INTEGER >= 4
);

-- Only admins can insert/delete members
DROP POLICY IF EXISTS "Only admins can insert members" ON members;
CREATE POLICY "Only admins can insert members"
ON members FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role_level')::INTEGER >= 4);

DROP POLICY IF EXISTS "Only admins can delete members" ON members;
CREATE POLICY "Only admins can delete members"
ON members FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role_level')::INTEGER >= 4);

-- Create trigger to sync role and role_level
CREATE OR REPLACE FUNCTION sync_role_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If role_level is updated, update role
  IF NEW.role_level IS DISTINCT FROM OLD.role_level THEN
    NEW.role := get_role_name(NEW.role_level);
  END IF;

  -- If role is updated, update role_level
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role_level := get_role_level(NEW.role);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_role_fields ON members;
CREATE TRIGGER trigger_sync_role_fields
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION sync_role_fields();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_members_role_level
ON members(role_level);
