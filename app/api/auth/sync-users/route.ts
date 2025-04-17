import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { adminSecret } = await request.json();
    
    // Simple security check - in production, use a more secure method
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      return NextResponse.json(
        { error: `Error fetching auth users: ${authError.message}` },
        { status: 500 }
      );
    }
    
    // Get all members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id, email');
      
    if (membersError) {
      return NextResponse.json(
        { error: `Error fetching members: ${membersError.message}` },
        { status: 500 }
      );
    }
    
    // Create a map of existing members by ID
    const memberMap = new Map();
    members.forEach(member => {
      memberMap.set(member.id, member);
    });
    
    // Create a map of existing members by email
    const memberEmailMap = new Map();
    members.forEach(member => {
      if (member.email) {
        memberEmailMap.set(member.email.toLowerCase(), member);
      }
    });
    
    // Track results
    const results = {
      total: authUsers.users.length,
      synced: 0,
      errors: 0,
      details: []
    };
    
    // Sync each auth user
    for (const user of authUsers.users) {
      try {
        // Skip if user already exists in members table
        if (memberMap.has(user.id)) {
          continue;
        }
        
        // Check if a member with this email already exists
        let existingMemberByEmail = null;
        if (user.email) {
          existingMemberByEmail = memberEmailMap.get(user.email.toLowerCase());
        }
        
        if (existingMemberByEmail) {
          // Update the existing member's ID to match the auth user ID
          const { error: updateError } = await supabase
            .from('members')
            .update({ id: user.id })
            .eq('id', existingMemberByEmail.id);
            
          if (updateError) {
            throw updateError;
          }
          
          results.synced++;
          results.details.push({
            user_id: user.id,
            email: user.email,
            action: 'updated_id',
            existing_id: existingMemberByEmail.id
          });
        } else {
          // Create a new member record
          const { error: insertError } = await supabase
            .from('members')
            .insert([
              {
                id: user.id,
                email: user.email,
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                role: user.user_metadata?.role || 'member',
                role_level: user.user_metadata?.role_level || 1,
                role_context: user.user_metadata?.role_context || null,
                status: 'active'
              }
            ]);
            
          if (insertError) {
            throw insertError;
          }
          
          results.synced++;
          results.details.push({
            user_id: user.id,
            email: user.email,
            action: 'created'
          });
        }
      } catch (error: any) {
        console.error(`Error syncing user ${user.id}:`, error);
        results.errors++;
        results.details.push({
          user_id: user.id,
          email: user.email,
          action: 'error',
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
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
