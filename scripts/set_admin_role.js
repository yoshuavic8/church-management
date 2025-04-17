// This script sets the admin role for a specific user
// Run with: node scripts/set_admin_role.js <email>

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address: node scripts/set_admin_role.js <email>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setAdminRole() {
  try {
    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('members')
      .select('id, email, first_name, last_name')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError.message);
      return;
    }
    
    if (!userData) {
      console.error(`No user found with email: ${email}`);
      return;
    }
    
    console.log(`Found user: ${userData.first_name} ${userData.last_name} (${userData.email})`);
    
    // Update member record with admin role
    const { error: updateError } = await supabase
      .from('members')
      .update({ role: 'admin' })
      .eq('id', userData.id);
    
    if (updateError) {
      console.error('Error updating member role:', updateError.message);
      return;
    }
    
    // Update user metadata with admin role
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userData.id,
      { user_metadata: { role: 'admin' } }
    );
    
    if (authError) {
      console.error('Error updating user metadata:', authError.message);
      return;
    }
    
    console.log(`Successfully set admin role for user: ${userData.email}`);
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

setAdminRole()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
