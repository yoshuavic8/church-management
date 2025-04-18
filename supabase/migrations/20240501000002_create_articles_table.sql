-- Create set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT NOT NULL,
    author_id UUID REFERENCES public.members(id),
    status TEXT NOT NULL DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users for published articles
CREATE POLICY "Allow read access for published articles"
    ON public.articles
    FOR SELECT
    USING (status = 'published' OR auth.role() = 'authenticated');

-- Allow insert, update, delete for admins only
CREATE POLICY "Allow insert for admins"
    ON public.articles
    FOR INSERT
    WITH CHECK (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    );

CREATE POLICY "Allow update for admins"
    ON public.articles
    FOR UPDATE
    USING (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    )
    WITH CHECK (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    );

CREATE POLICY "Allow delete for admins"
    ON public.articles
    FOR DELETE
    USING (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    );

-- Create trigger to update the updated_at column
CREATE TRIGGER set_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
