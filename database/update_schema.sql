-- Ensure baptism_date in members table is nullable
ALTER TABLE members ALTER COLUMN baptism_date DROP NOT NULL;

-- Ensure leader1_id and leader2_id in districts table are nullable
ALTER TABLE districts ALTER COLUMN leader1_id DROP NOT NULL;
ALTER TABLE districts ALTER COLUMN leader2_id DROP NOT NULL;
