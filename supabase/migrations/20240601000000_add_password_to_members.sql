-- Add password-related columns to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT TRUE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE;

-- Create table for password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_member_id_idx ON password_reset_tokens(member_id);

-- Add RLS policies for password_reset_tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view password reset tokens
CREATE POLICY "Admins can view password reset tokens" 
ON password_reset_tokens FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

-- Only allow admins to insert password reset tokens
CREATE POLICY "Admins can insert password reset tokens" 
ON password_reset_tokens FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

-- Only allow admins to update password reset tokens
CREATE POLICY "Admins can update password reset tokens" 
ON password_reset_tokens FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);
