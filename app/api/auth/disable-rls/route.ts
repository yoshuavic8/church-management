import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Get the URL parameters
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    // Simple security check - in production, use a more secure method
    if (!key || key !== 'super-admin-setup-key') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create a Supabase client with service role key
    // This is needed to disable RLS
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
    
    // Disable RLS for members table
    const { error: disableRlsError } = await supabaseAdmin.rpc('disable_members_rls');
    
    if (disableRlsError) {
      // If the RPC function doesn't exist, try to create it first
      if (disableRlsError.message.includes('function "disable_members_rls" does not exist')) {
        // Create the function
        const { error: createFunctionError } = await supabaseAdmin.rpc('create_disable_rls_function');
        
        if (createFunctionError) {
          return NextResponse.json(
            { error: `Error creating function: ${createFunctionError.message}` },
            { status: 500 }
          );
        }
        
        // Try again to disable RLS
        const { error: retryError } = await supabaseAdmin.rpc('disable_members_rls');
        
        if (retryError) {
          return NextResponse.json(
            { error: `Error disabling RLS after creating function: ${retryError.message}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Error disabling RLS: ${disableRlsError.message}` },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'RLS disabled for members table'
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
