# Supabase Setup Instructions

Since we couldn't use the Supabase CLI to reset the database, you'll need to manually apply the migrations using the Supabase dashboard. Follow these steps:

## Step 1: Apply the Database Migrations

1. Open the Supabase dashboard: https://supabase.com/dashboard/project/ausqiboqioiwwqtqemzh
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `combined_migrations.sql` into the editor
5. Run the query

The migration script has been updated to handle existing tables, columns, and policies, so it should run without errors. It will:

- Check if the members table exists and add any missing columns
- Create the member_tokens table if it doesn't exist
- Create indexes only for tables and columns that exist
- Drop existing policies before creating new ones to avoid conflicts
- Set up authentication functions and RLS policies

## Step 2: Create an Admin User

After applying the migrations, you need to create an admin user:

1. In the Supabase dashboard, go to Authentication > Users
2. Click "Invite user"
3. Enter the admin's email address
4. After the user is created, they will receive an email to set their password
5. Once they set their password, they can log in to the admin dashboard

## Step 3: Generate Member Tokens

After logging in as an admin:

1. Go to the Members page
2. Click on a member to view their details
3. Scroll down to the "Member Access Token" section
4. Generate a token for the member
5. Share the token securely with the member

## Step 4: Test the Authentication System

1. Test admin login using the email and password
2. Test member login using the generated token
3. Verify that admins can access the admin dashboard
4. Verify that members can access the member dashboard

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify that the Supabase URL and anon key are correctly set in `.env.local`
3. Make sure the RLS policies are correctly applied
4. Check that the member tokens are valid and not expired
