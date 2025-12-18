/**
 * Environment variable validation
 * 
 * Install: npm install zod
 * Then uncomment the zod-based validation below
 */

// Uncomment when zod is installed:
// import { z } from "zod";

// const envSchema = z.object({
//   NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
//   NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
//   NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
// });

// export const env = envSchema.parse({
//   NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
//   NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//   NODE_ENV: process.env.NODE_ENV,
// });

/**
 * Current implementation (without zod)
 */
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL");
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NODE_ENV: (process.env.NODE_ENV || "development") as
      | "development"
      | "production"
      | "test",
  };
}

