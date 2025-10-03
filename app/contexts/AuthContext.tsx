'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { useRouter } from 'next/navigation';

// Define the Member type
export type Member = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  role_level: number;
  status?: string;
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
  updateUserData: (userData: Member) => void;
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

  // Function to check and set admin status
  const checkAdminStatus = (user: Member) => {
    const adminStatus = user.role === 'admin' || (user.role_level || 0) >= 4;
    setIsAdminUser(adminStatus);
    return adminStatus;
  };

  // Function to refresh user data
  const refreshUser = async () => {
    setLoading(true);

    try {
      // Check if user is logged in with API token
      const response = await apiClient.getCurrentUser();

      if (response.success && response.data) {
        setUser(response.data);
        const adminStatus = checkAdminStatus(response.data);
        setIsAdminUser(adminStatus);
        setIsMember(!adminStatus); // If admin, not a regular member
        setLoading(false);
        return;
      }

      // If no API token, check for legacy member data in localStorage
      const memberId = localStorage.getItem('memberId');
      const memberEmail = localStorage.getItem('memberEmail');
      const memberDataStr = localStorage.getItem('memberData');

      if (memberId && memberEmail) {
        // First try to use memberData from localStorage if available
        if (memberDataStr) {
          try {
            const memberData = JSON.parse(memberDataStr);

            if (memberData && memberData.id === memberId) {
              setUser(memberData);
              setIsAdminUser(false);
              setIsMember(true);
              setLoading(false);
              return;
            }
          } catch (parseError) {
            console.error('Error parsing member data from localStorage:', parseError);
          }
        }

        // If no valid data in localStorage, fetch from API
        const response = await apiClient.getMember(memberId);

        if (!response.success) {
          console.error('Error fetching member data:', response.error?.message);
        }

        if (response.success && response.data) {
          setUser(response.data);
          setIsAdminUser(false);
          setIsMember(true);
          setLoading(false);
          return;
        } else {
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

  // Login as admin using API
  const loginAdmin = async (email: string, password: string) => {
    try {
      const response = await apiClient.loginAdmin(email, password);

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Login failed. Please try again.'
        };
      }

      if (response.data) {
        // Set user data
        setUser(response.data.user);
        const adminStatus = checkAdminStatus(response.data.user);
        setIsAdminUser(adminStatus);
        setIsMember(!adminStatus);

        if (!adminStatus) {
          // Not an admin, clear token
          apiClient.clearToken();
          return {
            success: false,
            error: 'You do not have admin privileges.'
          };
        }

        return { success: true };
      }

      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    } catch (error: any) {
      console.error('Admin login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  // Login as member using token (legacy support)
  const loginMember = async (token: string) => {
    try {
      // For now, this is legacy support - we'll phase this out
      return {
        success: false,
        error: 'Token-based login is deprecated. Please use email/password login.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  // Login as member using password
  const loginMemberWithPassword = async (email: string, password: string) => {
    try {
      const response = await apiClient.loginMember(email, password);

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Login failed. Please try again.'
        };
      }

      if (response.data) {
        // Set user data
        setUser(response.data.user);
        const adminStatus = checkAdminStatus(response.data.user);
        setIsAdminUser(adminStatus);
        setIsMember(!adminStatus);

        return { success: true };
      }

      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    } catch (error: any) {
      console.error('Member login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  // Logout function
  const logout = async () => {
    // Call API logout
    await apiClient.logout();

    // Clear all local data
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberEmail');
    localStorage.removeItem('memberId');
    localStorage.removeItem('memberData');
    
    // Clear session storage backup used by scanner
    sessionStorage.removeItem('scanner_user');
    sessionStorage.removeItem('scanner_meetings');

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
  }, []);



  // Function to manually update user data
  const updateUserData = (userData: Member) => {
    setUser(userData);
    const adminStatus = checkAdminStatus(userData);
    setIsAdminUser(adminStatus);
    setIsMember(!adminStatus);
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
