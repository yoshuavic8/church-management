-- Table for attendance records (meetings)
CREATE TABLE attendance_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_group_id UUID REFERENCES cell_groups(id),
  meeting_date DATE NOT NULL,
  meeting_type VARCHAR(50) DEFAULT 'regular', -- regular, special, etc.
  topic VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID, -- reference to the user who created the record
  location VARCHAR(255)
);

-- Table for attendance participants (registered members)
CREATE TABLE attendance_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES attendance_meetings(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  status VARCHAR(20) NOT NULL DEFAULT 'present', -- present, absent, late, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for new/potential members who attended but aren't registered yet
CREATE TABLE attendance_visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES attendance_meetings(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_to_member_id UUID REFERENCES members(id), -- If they later become a member
  converted_at TIMESTAMP WITH TIME ZONE
);
