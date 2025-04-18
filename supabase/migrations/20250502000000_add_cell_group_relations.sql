-- Add missing tables for cell group members and leaders

-- Create cell_group_members table
CREATE TABLE IF NOT EXISTS cell_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_group_id UUID NOT NULL REFERENCES cell_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  joined_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cell_group_id, member_id)
);

-- Create cell_group_leaders table
CREATE TABLE IF NOT EXISTS cell_group_leaders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_group_id UUID NOT NULL REFERENCES cell_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'leader', -- 'leader', 'assistant', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cell_group_id, member_id)
);

-- Create indexes for better performance
CREATE INDEX idx_cell_group_members_cell_group_id ON cell_group_members(cell_group_id);
CREATE INDEX idx_cell_group_members_member_id ON cell_group_members(member_id);
CREATE INDEX idx_cell_group_leaders_cell_group_id ON cell_group_leaders(cell_group_id);
CREATE INDEX idx_cell_group_leaders_member_id ON cell_group_leaders(member_id);

-- Enable RLS on the new tables
ALTER TABLE cell_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_group_leaders ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for cell_group_members
CREATE POLICY "Anyone can read cell_group_members"
ON cell_group_members
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage cell_group_members"
ON cell_group_members
USING (is_admin())
WITH CHECK (is_admin());

-- Add RLS policies for cell_group_leaders
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
