import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { validateEnv } from "./env";

// Lazy initialization: Don't validate at module load time
// This allows the build to succeed even if env vars are temporarily missing
// Validation happens when the client is first accessed (at runtime)
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    // Validate only when client is first accessed (runtime, not build time)
    const env = validateEnv();
    supabaseClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return supabaseClient;
}

// Proxy to make supabase appear as a normal object while using lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    // If it's a function, bind it to the client to preserve 'this' context
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as SupabaseClient;


