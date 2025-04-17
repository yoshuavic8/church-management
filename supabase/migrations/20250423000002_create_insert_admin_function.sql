-- Create function to insert admin member directly
CREATE OR REPLACE FUNCTION insert_admin_member(
  user_id UUID,
  user_email TEXT,
  user_first_name TEXT,
  user_last_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Disable RLS first
  BEGIN
    ALTER TABLE members DISABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors
  END;
  
  -- Delete any existing member with the same ID or email
  DELETE FROM members WHERE id = user_id OR email = user_email;
  
  -- Insert the new member
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
    user_email,
    user_first_name,
    user_last_name,
    'admin',
    4,
    'active',
    now(),
    now()
  );
  
  -- Enable RLS again
  BEGIN
    ALTER TABLE members ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors
  END;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
