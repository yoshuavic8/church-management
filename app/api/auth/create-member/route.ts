import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { id, email, first_name, last_name, role, role_level, key } = await request.json();
    
    // Simple security check
    if (!key || key !== 'super-admin-setup-key') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!id || !email) {
      return NextResponse.json(
        { error: 'ID and email are required' },
        { status: 400 }
      );
    }
    
    // Create a Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // First try to disable RLS
    try {
      await supabaseAdmin.rpc('disable_members_rls');
    } catch (error) {
      console.log('Error disabling RLS, continuing anyway:', error);
    }
    
    // Insert member record using admin client
    const { data, error } = await supabaseAdmin
      .from('members')
      .insert([
        {
          id,
          email,
          first_name: first_name || '',
          last_name: last_name || '',
          role: role || 'admin',
          role_level: role_level || 4,
          status: 'active'
        }
      ])
      .select();
    
    if (error) {
      // Try direct SQL as a last resort
      try {
        const { error: sqlError } = await supabaseAdmin.rpc('insert_admin_member', {
          user_id: id,
          user_email: email,
          user_first_name: first_name || '',
          user_last_name: last_name || ''
        });
        
        if (sqlError) {
          return NextResponse.json(
            { error: `Error inserting member via SQL: ${sqlError.message}` },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Member created successfully via SQL',
          data: { id, email }
        });
      } catch (sqlError: any) {
        return NextResponse.json(
          { error: `Error with SQL fallback: ${sqlError.message}` },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Member created successfully',
      data
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
