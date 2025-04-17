-- Fungsi untuk memastikan sinkronisasi peran antara auth.users dan members
CREATE OR REPLACE FUNCTION sync_auth_with_members()
RETURNS VOID AS $$
BEGIN
  -- Update members table based on auth.users
  UPDATE members m
  SET 
    role = COALESCE(u.raw_user_meta_data->>'role', m.role, 'member'),
    role_level = COALESCE((u.raw_user_meta_data->>'role_level')::INTEGER, m.role_level, 1),
    role_context = COALESCE(u.raw_user_meta_data->'role_context', m.role_context, NULL)
  FROM auth.users u
  WHERE m.id = u.id
  AND (
    (u.raw_user_meta_data->>'role' IS NOT NULL AND u.raw_user_meta_data->>'role' != m.role) OR
    (u.raw_user_meta_data->>'role_level' IS NOT NULL AND (u.raw_user_meta_data->>'role_level')::INTEGER != m.role_level) OR
    (u.raw_user_meta_data->'role_context' IS NOT NULL AND u.raw_user_meta_data->'role_context' != m.role_context)
  );

  -- Update auth.users based on members
  UPDATE auth.users u
  SET 
    raw_user_meta_data = jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(u.raw_user_meta_data, '{}'::jsonb),
          '{role}',
          to_jsonb(m.role)
        ),
        '{role_level}',
        to_jsonb(m.role_level)
      ),
      '{role_context}',
      COALESCE(m.role_context, 'null'::jsonb)
    )
  FROM members m
  WHERE u.id = m.id
  AND (
    (u.raw_user_meta_data->>'role' IS NULL OR u.raw_user_meta_data->>'role' != m.role) OR
    (u.raw_user_meta_data->>'role_level' IS NULL OR (u.raw_user_meta_data->>'role_level')::INTEGER != m.role_level) OR
    (u.raw_user_meta_data->'role_context' IS NULL OR u.raw_user_meta_data->'role_context' != m.role_context)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk memastikan sinkronisasi saat members diperbarui
CREATE OR REPLACE FUNCTION sync_members_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users when members is updated
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{role}',
          to_jsonb(NEW.role)
        ),
        '{role_level}',
        to_jsonb(NEW.role_level)
      ),
      '{role_context}',
      COALESCE(NEW.role_context, 'null'::jsonb)
    )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_members_to_auth ON members;

-- Create trigger
CREATE TRIGGER trigger_sync_members_to_auth
AFTER UPDATE ON members
FOR EACH ROW
WHEN (
  NEW.role IS DISTINCT FROM OLD.role OR
  NEW.role_level IS DISTINCT FROM OLD.role_level OR
  NEW.role_context IS DISTINCT FROM OLD.role_context
)
EXECUTE FUNCTION sync_members_to_auth();

-- Run initial sync
SELECT sync_auth_with_members();
