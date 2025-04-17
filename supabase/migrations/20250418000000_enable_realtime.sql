-- Enable realtime for attendance tables
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_visitors;

-- Add realtime flag to attendance_meetings table
ALTER TABLE attendance_meetings ADD COLUMN IF NOT EXISTS is_realtime BOOLEAN DEFAULT false;
