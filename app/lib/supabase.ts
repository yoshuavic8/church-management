import { createClient } from "@supabase/supabase-js";

// This approach ensures the Supabase client is only created once in the browser
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};

// For client components
let supabase: ReturnType<typeof createSupabaseClient> | null = null;

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // Server-side: create a new client for each request
    return createSupabaseClient();
  }

  // Client-side: reuse the same client
  if (!supabase) {
    supabase = createSupabaseClient();
  }

  return supabase;
};
