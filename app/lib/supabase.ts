import { createClient } from "@supabase/supabase-js";

// This approach ensures the Supabase client is only created once in the browser
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: "church_management_auth",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
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

    // Add debug logging for session state
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Supabase auth state changed:", event);
      console.log("Session exists:", !!session);
      if (session) {
        console.log("User ID:", session.user.id);
        console.log("User role:", session.user.user_metadata?.role);
        console.log("User role level:", session.user.user_metadata?.role_level);
      }
    });
  }

  return supabase;
};
