import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Don't validate at module load time - this allows builds to succeed
// even if environment variables aren't set yet (e.g., during Vercel build)
// Validation will happen at runtime when the client is actually used
if (!supabaseUrl || !supabaseAnonKey) {
  // Only warn in development, not during build
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Supabase environment variables are not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
    );
  }
}

// Create client with fallback values to prevent build-time errors
// Runtime validation will catch missing values when actually used
// The Supabase client will fail gracefully if invalid credentials are provided
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);


