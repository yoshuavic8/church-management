-- Trigger untuk membuat catatan member saat pengguna baru mendaftar
CREATE OR REPLACE FUNCTION create_member_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if member already exists
  IF EXISTS (SELECT 1 FROM members WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Get role information from metadata
  DECLARE
    role_value TEXT := NEW.raw_user_meta_data->>'role';
    role_level_value INTEGER := (NEW.raw_user_meta_data->>'role_level')::INTEGER;
    role_context_value JSONB := NEW.raw_user_meta_data->'role_context';
  BEGIN
    -- Set defaults if not provided
    IF role_value IS NULL THEN
      role_value := 'member';
    END IF;

    IF role_level_value IS NULL THEN
      role_level_value := 1;
    END IF;

    -- Insert new member record
    INSERT INTO members (
      id,
      email,
      first_name,
      last_name,
      role,
      role_level,
      role_context,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      role_value,
      role_level_value,
      role_context_value,
      'active',
      NOW(),
      NOW()
    );
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_member_from_auth ON auth.users;

-- Create trigger for new user registrations
CREATE TRIGGER trigger_create_member_from_auth
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_member_from_auth();

-- Trigger untuk memperbarui metadata pengguna saat login
CREATE OR REPLACE FUNCTION update_auth_metadata_on_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Get member data
  DECLARE
    member_record RECORD;
  BEGIN
    SELECT role, role_level, role_context
    INTO member_record
    FROM members
    WHERE id = NEW.id;

    IF FOUND THEN
      -- Update user metadata with role information
      UPDATE auth.users
      SET raw_user_meta_data = jsonb_set(
        jsonb_set(
          jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            to_jsonb(member_record.role)
          ),
          '{role_level}',
          to_jsonb(member_record.role_level)
        ),
        '{role_context}',
        COALESCE(member_record.role_context, 'null'::jsonb)
      )
      WHERE id = NEW.id;
    END IF;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to manually sync a user's metadata
CREATE OR REPLACE FUNCTION sync_user_metadata(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  member_record RECORD;
BEGIN
  -- Get member data
  SELECT role, role_level, role_context
  INTO member_record
  FROM members
  WHERE id = user_id;

  IF FOUND THEN
    -- Update user metadata with role information
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{role}',
          to_jsonb(member_record.role)
        ),
        '{role_level}',
        to_jsonb(member_record.role_level)
      ),
      '{role_context}',
      COALESCE(member_record.role_context, 'null'::jsonb)
    )
    WHERE id = user_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
