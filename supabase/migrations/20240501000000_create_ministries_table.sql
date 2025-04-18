-- Create set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create ministries table
CREATE TABLE IF NOT EXISTS public.ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES public.members(id),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access for all authenticated users"
    ON public.ministries
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow insert, update, delete for admins only
CREATE POLICY "Allow insert for admins"
    ON public.ministries
    FOR INSERT
    WITH CHECK (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    );

CREATE POLICY "Allow update for admins"
    ON public.ministries
    FOR UPDATE
    USING (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    )
    WITH CHECK (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    );

CREATE POLICY "Allow delete for admins"
    ON public.ministries
    FOR DELETE
    USING (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    );

-- Create trigger to update the updated_at column
CREATE TRIGGER set_ministries_updated_at
BEFORE UPDATE ON public.ministries
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
