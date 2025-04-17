-- Add role column to auth.users table
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Create RLS policies for role-based access
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Everyone can read members
CREATE POLICY "Anyone can read members" 
ON members FOR SELECT USING (true);

-- Only admins can insert/update/delete members
CREATE POLICY "Only admins can insert members" 
ON members FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update members" 
ON members FOR UPDATE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete members" 
ON members FOR DELETE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- Create tables for news and articles
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0
);

-- Table for article categories
CREATE TABLE IF NOT EXISTS article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT
);

-- Table for article comments
CREATE TABLE IF NOT EXISTS article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  parent_id UUID REFERENCES article_comments(id)
);

-- Table for article bookmarks
CREATE TABLE IF NOT EXISTS article_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- Set up RLS for articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Everyone can read published articles
CREATE POLICY "Anyone can read published articles" 
ON articles FOR SELECT 
USING (status = 'published');

-- Only admins can manage articles
CREATE POLICY "Only admins can insert articles" 
ON articles FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update articles" 
ON articles FOR UPDATE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete articles" 
ON articles FOR DELETE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- Set up RLS for article categories
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Anyone can read article categories" 
ON article_categories FOR SELECT USING (true);

-- Only admins can manage categories
CREATE POLICY "Only admins can insert article categories" 
ON article_categories FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update article categories" 
ON article_categories FOR UPDATE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete article categories" 
ON article_categories FOR DELETE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- Set up RLS for article comments
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments
CREATE POLICY "Anyone can read article comments" 
ON article_comments FOR SELECT USING (true);

-- Authenticated users can add comments
CREATE POLICY "Authenticated users can add comments" 
ON article_comments FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" 
ON article_comments FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments, admins can delete any comment
CREATE POLICY "Users can delete their own comments" 
ON article_comments FOR DELETE 
TO authenticated
USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Set up RLS for article bookmarks
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bookmarks
CREATE POLICY "Users can see their own bookmarks" 
ON article_bookmarks FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can add their own bookmarks
CREATE POLICY "Users can add their own bookmarks" 
ON article_bookmarks FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks" 
ON article_bookmarks FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);
