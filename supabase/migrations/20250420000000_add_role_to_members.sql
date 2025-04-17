-- Add role column to members table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'role') THEN
    ALTER TABLE members ADD COLUMN role TEXT DEFAULT 'member';
  END IF;
END $$;
