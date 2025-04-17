import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RoleLevel, ContextType } from '../../../lib/role-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, roleLevel, contextType, contextIds } = await request.json();
    
    if (!email || !roleLevel) {
      return NextResponse.json(
        { error: 'Email and role level are required' },
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
    
    const currentUserRoleLevel = Number(session.user.user_metadata?.role_level) || 1;
    
    if (currentUserRoleLevel < RoleLevel.Admin) {
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
    
    // Prepare role context
    let roleContext = null;
    
    if (contextType && contextIds) {
      roleContext = {
        [contextType]: Array.isArray(contextIds) ? contextIds : [contextIds]
      };
    }
    
    // Get role name based on role level
    let roleName = 'member';
    switch (Number(roleLevel)) {
      case 2:
        roleName = 'cell_leader';
        break;
      case 3:
        roleName = 'ministry_leader';
        break;
      case 4:
        roleName = 'admin';
        break;
      default:
        roleName = 'member';
    }
    
    // Update member record with new role
    const { error: updateError } = await supabase
      .from('members')
      .update({ 
        role: roleName,
        role_level: roleLevel,
        role_context: roleContext
      })
      .eq('id', userData.id);
    
    if (updateError) {
      return NextResponse.json(
        { error: `Error updating member role: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    // Update user metadata with new role
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userData.id,
      { 
        user_metadata: { 
          role: roleName,
          role_level: roleLevel,
          role_context: roleContext
        } 
      }
    );
    
    if (authError) {
      return NextResponse.json(
        { error: `Error updating user metadata: ${authError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully set role for user: ${userData.email}`,
      data: {
        user: userData,
        role: roleName,
        role_level: roleLevel,
        role_context: roleContext
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
