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
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginMember: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
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
    
    try {
      // First check if user is logged in with Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is logged in with Supabase Auth, get their member record
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (member) {
          setUser(member);
          await checkAdminStatus();
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
          setLoading(false);
          return;
        } else {
          // Invalid token, clear it
          localStorage.removeItem('memberToken');
        }
      }
      
      // No valid session found
      setUser(null);
      setIsAdminUser(false);
    } catch (error) {
      
      setUser(null);
      setIsAdminUser(false);
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

  // Logout function
  const logout = async () => {
    // Clear Supabase Auth session
    await supabase.auth.signOut();
    
    // Clear member token
    localStorage.removeItem('memberToken');
    
    // Reset state
    setUser(null);
    setIsAdminUser(false);
    
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

  const value = {
    user,
    loading,
    isAdmin: isAdminUser,
    loginAdmin,
    loginMember,
    logout,
    refreshUser,
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
