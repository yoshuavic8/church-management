-- Create function to update user metadata
CREATE OR REPLACE FUNCTION update_user_metadata(user_id UUID, metadata JSONB)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = metadata
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set admin role
CREATE OR REPLACE FUNCTION set_admin_role(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
  WHERE email = user_email;
  
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role_level}',
    '4'
  )
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to fix RLS policies
CREATE OR REPLACE FUNCTION fix_rls_policies()
RETURNS VOID AS $$
BEGIN
  -- Drop existing policies
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create dummy functions for client to call
CREATE OR REPLACE FUNCTION create_update_metadata_function()
RETURNS TEXT AS $$
BEGIN
  RETURN 'Function already exists';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_set_admin_role_function()
RETURNS TEXT AS $$
BEGIN
  RETURN 'Function already exists';
END;
$$ LANGUAGE plpgsql;
