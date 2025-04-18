import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { member_id } = await request.json();
    
    if (!member_id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if the current user is an admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the user is an admin
    const { data: adminCheck } = await supabase.rpc('is_admin');
    
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Only admins can invalidate tokens' },
        { status: 403 }
      );
    }
    
    // Check if the member exists
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('id', member_id)
      .single();
    
    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Invalidate all tokens for the member
    const { error: invalidateError } = await supabase.rpc(
      'invalidate_member_tokens',
      {
        member_id_param: member_id
      }
    );
    
    if (invalidateError) {
      return NextResponse.json(
        { error: `Error invalidating tokens: ${invalidateError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'All tokens for this member have been invalidated'
    });
    
  } catch (error: any) {
    console.error('Error invalidating tokens:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
