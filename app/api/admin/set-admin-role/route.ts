import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if the current user is an admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const currentUserRole = session.user.user_metadata?.role;
    
    if (currentUserRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('members')
      .select('id, email, first_name, last_name')
      .eq('email', email)
      .single();
    
    if (userError) {
      return NextResponse.json(
        { error: `Error finding user: ${userError.message}` },
        { status: 500 }
      );
    }
    
    if (!userData) {
      return NextResponse.json(
        { error: `No user found with email: ${email}` },
        { status: 404 }
      );
    }
    
    // Update member record with admin role
    const { error: updateError } = await supabase
      .from('members')
      .update({ role: 'admin' })
      .eq('id', userData.id);
    
    if (updateError) {
      return NextResponse.json(
        { error: `Error updating member role: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    // Update user metadata with admin role
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userData.id,
      { user_metadata: { role: 'admin' } }
    );
    
    if (authError) {
      return NextResponse.json(
        { error: `Error updating user metadata: ${authError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully set admin role for user: ${userData.email}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
