'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SuperAdminSetup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [setupKey, setSetupKey] = useState('');
  const [keyVerified, setKeyVerified] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Generate a random setup key if not already in localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('super_admin_setup_key');
    if (storedKey) {
      setSetupKey(storedKey);
    } else {
      const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('super_admin_setup_key', newKey);
      setSetupKey(newKey);
    }
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const verifySetupKey = () => {
    const inputKey = prompt('Enter the setup key shown on the page:');
    if (inputKey === setupKey) {
      setKeyVerified(true);
      addLog('Setup key verified successfully');
    } else {
      alert('Invalid setup key');
      addLog('Setup key verification failed');
    }
  };

  const createSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyVerified) {
      alert('Please verify the setup key first');
      return;
    }
    
    if (!email || !password || !firstName || !lastName) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      addLog('Starting super admin creation process');
      const supabase = createClientComponentClient();
      
      // Step 1: Check if user already exists
      addLog('Checking if user already exists');
      const { data: existingUsers, error: checkError } = await supabase
        .from('members')
        .select('id, email')
        .eq('email', email);
        
      if (checkError) {
        throw new Error(`Error checking existing users: ${checkError.message}`);
      }
      
      if (existingUsers && existingUsers.length > 0) {
        addLog(`User with email ${email} already exists. Will update to super admin.`);
        
        // Get the existing user's ID
        const existingUserId = existingUsers[0].id;
        
        // Update the member record to super admin
        addLog('Updating member record to super admin');
        const { error: updateMemberError } = await supabase
          .from('members')
          .update({
            role: 'admin',
            role_level: 4,
            first_name: firstName,
            last_name: lastName,
            status: 'active'
          })
          .eq('id', existingUserId);
          
        if (updateMemberError) {
          throw new Error(`Error updating member: ${updateMemberError.message}`);
        }
        
        // Try to update auth user metadata
        addLog('Updating auth user metadata');
        const { error: updateAuthError } = await supabase.rpc('update_user_metadata', {
          user_id: existingUserId,
          metadata: {
            role: 'admin',
            role_level: 4,
            first_name: firstName,
            last_name: lastName
          }
        });
        
        if (updateAuthError) {
          addLog(`Warning: Could not update auth metadata: ${updateAuthError.message}`);
          // Continue anyway as this might be a permissions issue
        }
        
        setSuccess(`Existing user ${email} has been updated to super admin. You can now login with your existing password.`);
      } else {
        // Step 2: Create a new user
        addLog('Creating new user in auth system');
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'admin',
              role_level: 4,
              first_name: firstName,
              last_name: lastName
            }
          }
        });
        
        if (signUpError) {
          throw new Error(`Error creating auth user: ${signUpError.message}`);
        }
        
        if (!authData.user) {
          throw new Error('No user returned from auth signup');
        }
        
        addLog(`Auth user created with ID: ${authData.user.id}`);
        
        // Step 3: Create a member record
        addLog('Creating member record');
        const { error: memberError } = await supabase
          .from('members')
          .insert([{
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            role: 'admin',
            role_level: 4,
            status: 'active'
          }]);
          
        if (memberError) {
          throw new Error(`Error creating member record: ${memberError.message}`);
        }
        
        addLog('Member record created successfully');
        
        // Step 4: Try to directly set admin role in auth.users (might fail due to permissions)
        try {
          addLog('Attempting to set admin role in auth.users directly');
          const { error: directUpdateError } = await supabase.rpc('set_admin_role', {
            user_email: email
          });
          
          if (directUpdateError) {
            addLog(`Warning: Could not set admin role directly: ${directUpdateError.message}`);
            // Continue anyway as this might be a permissions issue
          } else {
            addLog('Admin role set directly in auth.users');
          }
        } catch (directError: any) {
          addLog(`Warning: Error in direct role setting: ${directError.message}`);
          // Continue anyway
        }
        
        setSuccess(`Super admin created successfully! You can now login with email: ${email} and the password you provided.`);
      }
      
      addLog('Super admin setup completed successfully');
    } catch (error: any) {
      console.error('Error creating super admin:', error);
      setError(error.message || 'An error occurred while creating super admin');
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createRpcFunctions = async () => {
    try {
      addLog('Creating RPC functions in database');
      const supabase = createClientComponentClient();
      
      // Create update_user_metadata function
      const { error: rpcError1 } = await supabase.rpc('create_update_metadata_function');
      
      if (rpcError1) {
        addLog(`Warning: Could not create update_user_metadata function: ${rpcError1.message}`);
      } else {
        addLog('Created update_user_metadata function successfully');
      }
      
      // Create set_admin_role function
      const { error: rpcError2 } = await supabase.rpc('create_set_admin_role_function');
      
      if (rpcError2) {
        addLog(`Warning: Could not create set_admin_role function: ${rpcError2.message}`);
      } else {
        addLog('Created set_admin_role function successfully');
      }
      
    } catch (error: any) {
      addLog(`Error creating RPC functions: ${error.message}`);
    }
  };

  const fixRlsPolicies = async () => {
    try {
      addLog('Fixing RLS policies');
      const supabase = createClientComponentClient();
      
      const { error } = await supabase.rpc('fix_rls_policies');
      
      if (error) {
        addLog(`Warning: Could not fix RLS policies: ${error.message}`);
      } else {
        addLog('Fixed RLS policies successfully');
      }
      
    } catch (error: any) {
      addLog(`Error fixing RLS policies: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Super Admin Setup
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            This page allows you to create a super admin account.
            <br />
            <span className="font-medium text-red-600">Delete this page after use!</span>
          </p>
        </div>
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Setup Key: <strong>{setupKey}</strong>
                <br />
                <button
                  onClick={verifySetupKey}
                  className="mt-1 font-medium text-yellow-700 underline"
                >
                  Verify Key to Continue
                </button>
              </p>
            </div>
          </div>
        </div>
        
        {keyVerified && (
          <>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create Super Admin</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}
              
              <form onSubmit={createSuperAdmin}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {loading ? 'Creating...' : 'Create Super Admin'}
                </button>
              </form>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Database Utilities</h2>
              
              <div className="space-y-4">
                <button
                  onClick={createRpcFunctions}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Create RPC Functions
                </button>
                
                <button
                  onClick={fixRlsPolicies}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Fix RLS Policies
                </button>
              </div>
            </div>
            
            <div className="bg-black text-green-400 p-4 rounded-lg shadow overflow-auto h-64 font-mono text-sm">
              <div className="mb-2 text-white font-bold">Logs:</div>
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
