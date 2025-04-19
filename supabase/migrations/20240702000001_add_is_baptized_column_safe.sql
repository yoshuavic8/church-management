-- Safe migration to add is_baptized column to members table
-- This migration is designed to be idempotent and safe to run multiple times

-- Step 1: Add is_baptized column if it doesn't exist
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'members'
        AND column_name = 'is_baptized'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE members ADD COLUMN is_baptized BOOLEAN DEFAULT FALSE;
        
        -- Update is_baptized based on baptism_date
        UPDATE members SET is_baptized = (baptism_date IS NOT NULL);
    END IF;
END $$;

-- Step 2: Create or replace the trigger function
CREATE OR REPLACE FUNCTION sync_baptism_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run this logic if one of these columns is changing
    IF TG_OP = 'INSERT' OR 
       NEW.baptism_date IS DISTINCT FROM OLD.baptism_date OR 
       NEW.is_baptized IS DISTINCT FROM OLD.is_baptized THEN
        
        -- If baptism_date is set, ensure is_baptized is TRUE
        IF NEW.baptism_date IS NOT NULL THEN
            NEW.is_baptized := TRUE;
        END IF;
        
        -- If is_baptized is FALSE, ensure baptism_date is NULL
        IF NEW.is_baptized = FALSE THEN
            NEW.baptism_date := NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger only if it doesn't exist
DO $$
BEGIN
    -- Check if the trigger already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trigger_sync_baptism_status'
    ) THEN
        -- Create trigger on members table
        CREATE TRIGGER trigger_sync_baptism_status
        BEFORE INSERT OR UPDATE ON members
        FOR EACH ROW
        EXECUTE FUNCTION sync_baptism_status();
    END IF;
END $$;
