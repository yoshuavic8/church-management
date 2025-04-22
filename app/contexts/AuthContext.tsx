'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient, isAdmin, validateMemberToken } from '../lib/supabase';
import { useRouter } from 'next/navigation';

// Define the Member type
export type Member = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  role_level: number;
  status: string;
  [key: string]: any; // Allow for other properties
};

// Define the auth context type
type AuthContextType = {
  user: Member | null;
  loading: boolean;
  isAdmin: boolean;
  isMember: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginMember: (token: string) => Promise<{ success: boolean; error?: string }>;
  loginMemberWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string; passwordResetRequired?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: Member | null) => void;
  setIsMember: (isMember: boolean) => void;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isMemberUser, setIsMember] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  // Function to check and set admin status
  const checkAdminStatus = async () => {
    const adminStatus = await isAdmin();
    setIsAdminUser(adminStatus);
    return adminStatus;
  };

  // Function to refresh user data
  const refreshUser = async () => {
    setLoading(true);
    console.log('Refreshing user data');

    try {
      // First check if user is logged in with Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Supabase session:', session ? 'exists' : 'none');

      if (session?.user) {
        // User is logged in with Supabase Auth, get their member record
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (member) {
          console.log('Found member record for admin user:', member.id);
          setUser(member);
          const adminStatus = await checkAdminStatus();
          setIsAdminUser(adminStatus);
          setIsMember(!adminStatus); // If admin, not a regular member
          setLoading(false);
          return;
        }
      }

      // If not logged in with Supabase Auth, check for member token in localStorage
      const memberToken = localStorage.getItem('memberToken');
      if (memberToken) {
        const member = await validateMemberToken(memberToken);
        if (member) {
          setUser(member);
          setIsAdminUser(false); // Member tokens are never admin
          setIsMember(true);
          setLoading(false);
          return;
        } else {
          // Invalid token, clear it
          localStorage.removeItem('memberToken');
        }
      }

      // Check for member email/id in localStorage (password-based login)
      const memberId = localStorage.getItem('memberId');
      const memberEmail = localStorage.getItem('memberEmail');
      const memberDataStr = localStorage.getItem('memberData');
      console.log('Checking for member login:', memberId ? 'ID exists' : 'No ID', memberEmail ? 'Email exists' : 'No email', memberDataStr ? 'Data exists' : 'No data');

      if (memberId && memberEmail) {
        // First try to use memberData from localStorage if available
        if (memberDataStr) {
          try {
            const memberData = JSON.parse(memberDataStr);
            console.log('Using member data from localStorage:', memberData.id);

            if (memberData && memberData.id === memberId) {
              setUser(memberData);
              setIsAdminUser(false);
              setIsMember(true);
              setLoading(false);
              console.log('Member data loaded from localStorage, password reset required:', memberData.password_reset_required === true);
              return;
            }
          } catch (parseError) {
            console.error('Error parsing member data from localStorage:', parseError);
          }
        }

        // If no valid data in localStorage, fetch from database
        console.log('Fetching member data from database');
        const { data: member, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', memberId)
          .single();

        if (error) {
          console.error('Error fetching member data:', error);
        }

        if (member) {
          console.log('Found member record for password login:', member.id, 'Password reset required:', member.password_reset_required);
          setUser(member);
          setIsAdminUser(false);
          setIsMember(true);
          setLoading(false);
          return;
        } else {
          console.log('No member found with stored ID/email');
          // Invalid member data, clear it
          localStorage.removeItem('memberId');
          localStorage.removeItem('memberEmail');
        }
      }

      // No valid session found
      setUser(null);
      setIsAdminUser(false);
      setIsMember(false);
    } catch (error) {

      setUser(null);
      setIsAdminUser(false);
      setIsMember(false);
    }

    setLoading(false);
  };

  // Login as admin using Supabase Auth
  const loginAdmin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if the user is an admin
        const adminStatus = await checkAdminStatus();

        if (!adminStatus) {
          // Not an admin, sign out
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'You do not have admin privileges.'
          };
        }

        // Get the member record
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (member) {
          setUser(member);
          return { success: true };
        } else {
          // No member record found
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Admin account not properly set up. Please contact support.'
          };
        }
      }

      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    } catch (error: any) {

      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  // Login as member using token
  const loginMember = async (token: string) => {
    try {
      const member = await validateMemberToken(token);

      if (member) {
        setUser(member);
        setIsAdminUser(false);
        setIsMember(true);
        localStorage.setItem('memberToken', token);
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid or expired token. Please try again.'
      };
    } catch (error: any) {

      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  // Login as member using password - simplified version
  const loginMemberWithPassword = async (email: string, password: string) => {
    try {
      console.log('Attempting to login with email:', email);

      // This is a simplified version that will need to be implemented
      // with a new authentication mechanism
      return {
        success: false,
        error: 'Member password login is not implemented in this version.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  // Logout function
  const logout = async () => {
    // Clear Supabase Auth session
    await supabase.auth.signOut();

    // Clear member data
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberEmail');
    localStorage.removeItem('memberId');

    // Reset state
    setUser(null);
    setIsAdminUser(false);
    setIsMember(false);

    // Redirect to home page
    router.push('/');
  };

  // Check for existing session on mount
  useEffect(() => {
    refreshUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          refreshUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdminUser(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);



  // Function to manually update user data
  const updateUserData = async (userId: string) => {
    console.log('Manually updating user data for:', userId);
    try {
      // Force cache refresh by adding a timestamp parameter
      const timestamp = new Date().getTime();

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching updated user data:', error);
        return false;
      }

      if (data) {
        console.log('Updated user data:', data);
        setUser(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in updateUserData:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    isAdmin: isAdminUser,
    isMember: isMemberUser,
    loginAdmin,
    loginMember,
    loginMemberWithPassword,
    logout,
    refreshUser,
    updateUserData,
    setUser,
    setIsMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
