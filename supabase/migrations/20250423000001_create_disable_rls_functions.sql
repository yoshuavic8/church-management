-- Create function to disable RLS directly
CREATE OR REPLACE FUNCTION disable_members_rls()
RETURNS TEXT AS $$
BEGIN
  -- Disable RLS for members table
  ALTER TABLE members DISABLE ROW LEVEL SECURITY;
  RETURN 'RLS disabled for members table';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error disabling RLS: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple function for client to call
CREATE OR REPLACE FUNCTION create_disable_rls_function()
RETURNS TEXT AS $$
BEGIN
  RETURN 'Function already exists';
END;
$$ LANGUAGE plpgsql;

-- Create function to enable RLS directly
CREATE OR REPLACE FUNCTION enable_members_rls()
RETURNS TEXT AS $$
BEGIN
  -- Enable RLS for members table
  ALTER TABLE members ENABLE ROW LEVEL SECURITY;

  -- Recreate policies
  DROP POLICY IF EXISTS "Anyone can read members" ON members;
  DROP POLICY IF EXISTS "Users can update their own records" ON members;
  DROP POLICY IF EXISTS "Only admins can insert members" ON members;
  DROP POLICY IF EXISTS "Only admins can delete members" ON members;
  DROP POLICY IF EXISTS "Authenticated users can insert members" ON members;

  -- Create more permissive policies
  CREATE POLICY "Anyone can read members"
  ON members FOR SELECT USING (true);

  CREATE POLICY "Users can update their own records"
  ON members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Authenticated users can insert members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (true);

  CREATE POLICY "Anyone can delete members"
  ON members FOR DELETE
  TO authenticated
  USING (true);

  RETURN 'RLS enabled for members table with permissive policies';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error enabling RLS: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple function for client to call
CREATE OR REPLACE FUNCTION create_enable_rls_function()
RETURNS TEXT AS $$
BEGIN
  RETURN 'Function already exists';
END;
$$ LANGUAGE plpgsql;
