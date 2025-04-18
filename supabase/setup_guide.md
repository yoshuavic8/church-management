# Supabase Setup Guide for Church Management System

This guide will help you set up a new Supabase project for the Church Management System.

## Step 1: Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter a name for your project (e.g., "Church Management")
4. Choose a database password (save this securely)
5. Choose a region close to your users
6. Click "Create new project"

## Step 2: Apply the Database Schema

1. Once your project is created, go to the SQL Editor
2. Create a new query
3. Copy and paste the contents of `combined_migrations.sql` into the editor
4. Run the query

This single migration file will:
- Create all necessary tables
- Set up foreign key relationships
- Create indexes for better performance
- Enable realtime for attendance tables
- Create authentication functions
- Set up RLS policies

## Step 3: Create an Admin User

After applying the schema, you need to create an admin user:

1. In the Supabase dashboard, go to Authentication > Users
2. Click "Invite user"
3. Enter the admin's email address
4. After the user is created, they will receive an email to set their password

Alternatively, you can create an admin user directly using SQL:

```sql
SELECT create_admin_auth_user('admin@example.com', 'Admin', 'User');
```

Then send a password reset email through the dashboard.

## Step 4: Update Environment Variables

Update your `.env.local` file with the new Supabase URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in the Supabase dashboard under Project Settings > API.

## Step 5: Test the Authentication System

1. Start your application: `npm run dev`
2. Try logging in as an admin using the email and password
3. Generate a token for a member and test member login

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify that the Supabase URL and anon key are correctly set in `.env.local`
3. Make sure the RLS policies are correctly applied
4. Check that the member tokens are valid and not expired

### Common Issues and Solutions

#### Failed to invite user

If you see "Failed to invite user: failed to make invite request: Database error saving new user":

```sql
-- Try creating the admin user directly with SQL
SELECT create_admin_auth_user('admin@example.com', 'Admin', 'User');
```

#### Authentication not working

Make sure the trigger for creating member records is working:

```sql
-- Check if there are any auth users without member records
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.members m ON m.id = au.id
WHERE m.id IS NULL;

-- Fix missing member records
SELECT create_member_from_auth();
```

#### RLS policies blocking access

You can temporarily disable RLS for testing:

```sql
-- Disable RLS on members table (use with caution)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Re-enable when done
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
```
