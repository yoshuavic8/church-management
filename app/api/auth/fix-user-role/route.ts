import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, adminSecret } = await request.json();
    
    // Simple security check - in production, use a more secure method
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get user by email from auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      return NextResponse.json(
        { error: `Error fetching auth users: ${authError.message}` },
        { status: 500 }
      );
    }
    
    // Find the user with the given email
    const authUser = authData.users.find(user => user.email === email);
    
    if (!authUser) {
      return NextResponse.json(
        { error: `No auth user found with email: ${email}` },
        { status: 404 }
      );
    }
    
    // Get user from members table
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (memberError) {
      return NextResponse.json(
        { error: `Error fetching member: ${memberError.message}` },
        { status: 500 }
      );
    }
    
    const results = {
      auth_user: {
        id: authUser.id,
        email: authUser.email,
        metadata_before: authUser.user_metadata,
      },
      member: memberData,
      actions: []
    };
    
    // Update auth user metadata with admin role
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { 
        user_metadata: { 
          role: 'admin',
          role_level: 4
        } 
      }
    );
    
    if (updateAuthError) {
      return NextResponse.json(
        { error: `Error updating auth user: ${updateAuthError.message}` },
        { status: 500 }
      );
    }
    
    results.actions.push('Updated auth user metadata with admin role');
    
    // If member exists, update it
    if (memberData) {
      const { error: updateMemberError } = await supabase
        .from('members')
        .update({ 
          role: 'admin',
          role_level: 4
        })
        .eq('id', memberData.id);
        
      if (updateMemberError) {
        return NextResponse.json(
          { error: `Error updating member: ${updateMemberError.message}` },
          { status: 500 }
        );
      }
      
      results.actions.push('Updated member record with admin role');
    } else {
      // Create member record if it doesn't exist
      const { error: insertError } = await supabase
        .from('members')
        .insert([
          {
            id: authUser.id,
            email: authUser.email,
            first_name: authUser.user_metadata?.first_name || '',
            last_name: authUser.user_metadata?.last_name || '',
            role: 'admin',
            role_level: 4,
            status: 'active'
          }
        ]);
        
      if (insertError) {
        return NextResponse.json(
          { error: `Error creating member record: ${insertError.message}` },
          { status: 500 }
        );
      }
      
      results.actions.push('Created new member record with admin role');
    }
    
    // Get updated auth user
    const { data: updatedAuthData } = await supabase.auth.admin.getUserById(authUser.id);
    
    if (updatedAuthData) {
      results.auth_user.metadata_after = updatedAuthData.user.user_metadata;
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully fixed role for user: ${email}`,
      results
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
