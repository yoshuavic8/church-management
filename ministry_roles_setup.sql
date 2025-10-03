-- Ministry Roles Migration and Initial Data
-- This script creates the ministry_roles table and populates it with common roles

-- Create ministry_roles table
CREATE TABLE IF NOT EXISTS ministry_roles (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  ministry_type VARCHAR(50), -- 'worship', 'media', 'prayer', 'general', etc.
  is_leadership BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY unique_name (name)
);

-- Insert predefined ministry roles
INSERT IGNORE INTO ministry_roles (id, name, description, ministry_type, is_leadership, sort_order) VALUES
-- Worship Ministry Roles
('wr-leader-001', 'Worship Leader', 'Memimpin worship dan ibadah', 'worship', TRUE, 1),
('wr-vocal-001', 'Lead Vocalist', 'Penyanyi utama dalam worship', 'worship', FALSE, 2),
('wr-vocal-002', 'Backing Vocalist', 'Penyanyi pendukung', 'worship', FALSE, 3),
('wr-guitar-001', 'Lead Guitarist', 'Pemain gitar utama', 'worship', FALSE, 4),
('wr-guitar-002', 'Rhythm Guitarist', 'Pemain gitar rhythm', 'worship', FALSE, 5),
('wr-piano-001', 'Pianist/Keyboardist', 'Pemain piano/keyboard', 'worship', FALSE, 6),
('wr-bass-001', 'Bassist', 'Pemain bass', 'worship', FALSE, 7),
('wr-drum-001', 'Drummer', 'Pemain drum', 'worship', FALSE, 8),
('wr-violin-001', 'Violinist', 'Pemain violin', 'worship', FALSE, 9),

-- Media Ministry Roles  
('md-coord-001', 'Media Coordinator', 'Koordinator tim media', 'media', TRUE, 1),
('md-sound-001', 'Sound Engineer', 'Operator sound system', 'media', FALSE, 2),
('md-video-001', 'Video Operator', 'Operator kamera dan video', 'media', FALSE, 3),
('md-light-001', 'Lighting Operator', 'Operator pencahayaan', 'media', FALSE, 4),
('md-stream-001', 'Live Streaming Operator', 'Operator live streaming', 'media', FALSE, 5),
('md-photo-001', 'Photographer', 'Fotografer kegiatan', 'media', FALSE, 6),
('md-graphic-001', 'Graphic Designer', 'Desainer grafis', 'media', FALSE, 7),

-- Prayer Ministry Roles
('pr-leader-001', 'Prayer Leader', 'Pemimpin doa', 'prayer', TRUE, 1),
('pr-inter-001', 'Intercessor', 'Pendoa syafaat', 'prayer', FALSE, 2),
('pr-coord-001', 'Prayer Coordinator', 'Koordinator doa', 'prayer', FALSE, 3),

-- Youth Ministry Roles
('yt-leader-001', 'Youth Pastor', 'Pastor pemuda', 'youth', TRUE, 1),
('yt-leader-002', 'Youth Leader', 'Pemimpin pemuda', 'youth', TRUE, 2),
('yt-mentor-001', 'Youth Mentor', 'Mentor pemuda', 'youth', FALSE, 3),
('yt-coord-001', 'Youth Coordinator', 'Koordinator kegiatan pemuda', 'youth', FALSE, 4),

-- Children Ministry Roles
('ch-teacher-001', 'Children Teacher', 'Guru sekolah minggu', 'children', FALSE, 1),
('ch-leader-001', 'Children Ministry Leader', 'Pemimpin pelayanan anak', 'children', TRUE, 2),
('ch-helper-001', 'Children Ministry Helper', 'Asisten pelayanan anak', 'children', FALSE, 3),

-- Outreach Ministry Roles
('or-leader-001', 'Outreach Leader', 'Pemimpin outreach', 'outreach', TRUE, 1),
('or-evangelist-001', 'Evangelist', 'Penginjil', 'outreach', FALSE, 2),
('or-coord-001', 'Outreach Coordinator', 'Koordinator outreach', 'outreach', FALSE, 3),

-- General Ministry Roles
('gn-leader-001', 'Ministry Leader', 'Pemimpin ministry', 'general', TRUE, 1),
('gn-asst-001', 'Assistant Leader', 'Asisten pemimpin', 'general', TRUE, 2),
('gn-coord-001', 'Ministry Coordinator', 'Koordinator kegiatan', 'general', FALSE, 3),
('gn-member-001', 'Active Member', 'Anggota aktif', 'general', FALSE, 4),
('gn-volunteer-001', 'Volunteer', 'Relawan/sukarelawan', 'general', FALSE, 5),
('gn-helper-001', 'Ministry Helper', 'Pembantu pelayanan', 'general', FALSE, 6),

-- Hospitality Ministry Roles
('hp-leader-001', 'Hospitality Leader', 'Pemimpin hospitality', 'hospitality', TRUE, 1),
('hp-usher-001', 'Usher', 'Penjaga pintu/penunjuk tempat', 'hospitality', FALSE, 2),
('hp-greeter-001', 'Greeter', 'Penyambut tamu', 'hospitality', FALSE, 3),
('hp-server-001', 'Server', 'Pelayan makanan/minuman', 'hospitality', FALSE, 4);

-- Optional: Add future role_id column to ministry_members table 
-- (Keep existing role column for backward compatibility)
ALTER TABLE ministry_members 
ADD COLUMN IF NOT EXISTS role_id VARCHAR(191) AFTER role,
ADD CONSTRAINT fk_ministry_members_role_id 
  FOREIGN KEY (role_id) REFERENCES ministry_roles(id) 
  ON DELETE SET NULL ON UPDATE CASCADE;
