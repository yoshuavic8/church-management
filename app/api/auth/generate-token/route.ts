import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { member_id, days_valid = 30 } = await request.json();
    
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
        { error: 'Only admins can generate tokens' },
        { status: 403 }
      );
    }
    
    // Check if the member exists
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name, email')
      .eq('id', member_id)
      .single();
    
    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Generate a token for the member
    const { data: token, error: tokenError } = await supabase.rpc(
      'generate_member_token',
      {
        member_id_param: member_id,
        days_valid: days_valid
      }
    );
    
    if (tokenError) {
      return NextResponse.json(
        { error: `Error generating token: ${tokenError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      token,
      member: {
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email
      },
      expires_in_days: days_valid
    });
    
  } catch (error: any) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
