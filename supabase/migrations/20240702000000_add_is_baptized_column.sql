-- Add is_baptized column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_baptized BOOLEAN DEFAULT FALSE;

-- Update is_baptized based on baptism_date
UPDATE members SET is_baptized = (baptism_date IS NOT NULL);

-- Create trigger to keep is_baptized and baptism_date in sync
CREATE OR REPLACE FUNCTION sync_baptism_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If baptism_date is set, ensure is_baptized is TRUE
  IF NEW.baptism_date IS NOT NULL THEN
    NEW.is_baptized := TRUE;
  END IF;
  
  -- If is_baptized is FALSE, ensure baptism_date is NULL
  IF NEW.is_baptized = FALSE THEN
    NEW.baptism_date := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on members table
DROP TRIGGER IF EXISTS trigger_sync_baptism_status ON members;
CREATE TRIGGER trigger_sync_baptism_status
BEFORE INSERT OR UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION sync_baptism_status();
