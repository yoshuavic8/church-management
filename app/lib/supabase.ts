import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};

// Function to check if a user is an admin
export const isAdmin = async () => {
  const supabase = getSupabaseClient();

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

  return false;
};

// Function to check if a member token is valid
export const validateMemberToken = async (token: string) => {
  if (!token) return null;

  const supabase = getSupabaseClient();

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
};
