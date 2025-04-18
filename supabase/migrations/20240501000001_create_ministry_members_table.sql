-- Create ministry_members table
CREATE TABLE IF NOT EXISTS public.ministry_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    role TEXT,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(ministry_id, member_id)
);

-- Add RLS policies
ALTER TABLE public.ministry_members ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access for all authenticated users"
    ON public.ministry_members
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow insert, update, delete for admins only
CREATE POLICY "Allow insert for admins"
    ON public.ministry_members
    FOR INSERT
    WITH CHECK (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    );

CREATE POLICY "Allow update for admins"
    ON public.ministry_members
    FOR UPDATE
    USING (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    )
    WITH CHECK (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    );

CREATE POLICY "Allow delete for admins"
    ON public.ministry_members
    FOR DELETE
    USING (
        (SELECT role = 'admin' OR role_level >= 4 FROM members WHERE id = auth.uid())
    );

-- Create trigger to update the updated_at column
CREATE TRIGGER set_ministry_members_updated_at
BEFORE UPDATE ON public.ministry_members
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
