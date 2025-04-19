# Database Migrations

This directory contains SQL migration files for the church management application.

## Running Migrations

To apply migrations to your Supabase database, you can use the Supabase CLI or run the SQL directly in the Supabase SQL Editor.

### Using Supabase CLI

1. Make sure you have the Supabase CLI installed:
   ```bash
   npm install -g supabase
   ```

2. Login to your Supabase account:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Apply migrations:
   ```bash
   supabase db push
   ```

### Using Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Open the SQL file you want to run
4. Click "Run" to execute the SQL

## Migration Files

- `create_ministries_table.sql`: Creates the ministries and ministry_members tables if they don't exist, and adds necessary columns to the attendance_meetings table.
- `attendance_schema.sql`: Creates the attendance-related tables.
- `add_offering_column.sql`: Adds the offering column to the attendance_meetings table.
- `update_schema.sql`: Updates various columns to be nullable.

## Troubleshooting

If you encounter errors when running migrations:

1. Check if the tables or columns already exist
2. Verify that referenced tables exist before creating foreign key constraints
3. Make sure you have the necessary permissions to modify the database schema
