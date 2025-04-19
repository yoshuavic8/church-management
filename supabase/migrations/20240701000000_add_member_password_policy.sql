-- Add policy to allow members to update their own password
CREATE POLICY "Members can update their own password"
ON members
FOR UPDATE
USING (id = auth.uid() OR id::text = (SELECT current_setting('request.jwt.claims', true)::jsonb->>'sub'))
WITH CHECK (id = auth.uid() OR id::text = (SELECT current_setting('request.jwt.claims', true)::jsonb->>'sub'));

-- Add policy to allow service role to update members
CREATE POLICY "Service role can update members"
ON members
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add policy to allow anon role to update members (for password reset)
CREATE POLICY "Anon can update members"
ON members
FOR UPDATE
USING (auth.role() = 'anon')
WITH CHECK (auth.role() = 'anon');
