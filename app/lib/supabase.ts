import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create singleton instances of the Supabase client
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;
let supabaseServiceInstance: ReturnType<typeof createClient<Database>> | null =
  null;

export const getSupabaseClient = () => {
  // Check if API URL and key are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or API key is missing');
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          headers: {
            'apikey': supabaseAnonKey
          },
        },
      });
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      return null;
    }
  }
  return supabaseInstance;
};

// Get a Supabase client with service role for admin operations
export const getServiceSupabaseClient = () => {
  if (!supabaseServiceInstance) {
    supabaseServiceInstance = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return supabaseServiceInstance;
};

// Function to check if a user is an admin
export const isAdmin = async () => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error('Failed to initialize Supabase client in isAdmin');
    return false;
  }

  try {
    // First check if user is authenticated with Supabase Auth
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      // User is authenticated with Supabase Auth, check if they're an admin in the members table
      const { data: member } = await supabase
        .from("members")
        .select("role, role_level")
        .eq("id", session.user.id)
        .single();

      return member?.role === "admin" || (member?.role_level || 0) >= 4;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }

  return false;
};

// Function to check if a member token is valid
export const validateMemberToken = async (token: string) => {
  if (!token) return null;

  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Failed to initialize Supabase client in validateMemberToken');
    return null;
  }

  try {
    // Call the RPC function to validate the token
    const { data, error } = await supabase.rpc("is_valid_member_token", {
      token_value: token,
    });

    if (error || !data) return null;

    // Get the member details
    const { data: member } = await supabase
      .from("members")
      .select("*")
      .eq("id", data)
      .single();

    return member;
  } catch (error) {
    console.error('Error validating member token:', error);
    return null;
  }
};
