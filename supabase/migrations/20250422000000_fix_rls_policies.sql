-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read members" ON members;
DROP POLICY IF EXISTS "Users can update their own records" ON members;
DROP POLICY IF EXISTS "Only admins can insert members" ON members;
DROP POLICY IF EXISTS "Only admins can delete members" ON members;

-- Create more permissive policies
-- Everyone can read members
CREATE POLICY "Anyone can read members" 
ON members FOR SELECT USING (true);

-- Users can update their own records
CREATE POLICY "Users can update their own records" 
ON members FOR UPDATE 
TO authenticated
USING (
  auth.uid() = id OR 
  (auth.jwt() ->> 'role_level')::INTEGER >= 4 OR
  (auth.jwt() ->> 'role') = 'admin'
)
WITH CHECK (
  auth.uid() = id OR 
  (auth.jwt() ->> 'role_level')::INTEGER >= 4 OR
  (auth.jwt() ->> 'role') = 'admin'
);

-- Authenticated users can insert members (needed for login auto-creation)
CREATE POLICY "Authenticated users can insert members" 
ON members FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = id OR
  (auth.jwt() ->> 'role_level')::INTEGER >= 4 OR
  (auth.jwt() ->> 'role') = 'admin'
);

-- Only admins can delete members
CREATE POLICY "Only admins can delete members" 
ON members FOR DELETE 
TO authenticated
USING (
  (auth.jwt() ->> 'role_level')::INTEGER >= 4 OR
  (auth.jwt() ->> 'role') = 'admin'
);
