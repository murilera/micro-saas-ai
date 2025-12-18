/**
 * Input validation schemas using Zod
 * 
 * Install: npm install zod
 * 
 * This provides type-safe validation for all API inputs
 */

// Uncomment when zod is installed:
// import { z } from "zod";

// For now, using TypeScript types as placeholders
// Replace with actual Zod schemas after installing zod

/**
 * User registration schema
 */
export const registerSchema = {
  username: (value: unknown) => {
    if (typeof value !== "string") return false;
    return /^[a-zA-Z0-9@._-]{3,100}$/.test(value);
  },
  password: (value: unknown) => {
    if (typeof value !== "string") return false;
    return value.length >= 6 && value.length <= 128;
  },
};

/**
 * Login schema
 */
export const loginSchema = {
  username: (value: unknown) => {
    if (typeof value !== "string") return false;
    return value.trim().length > 0;
  },
  password: (value: unknown) => {
    if (typeof value !== "string") return false;
    return value.length > 0;
  },
};

/**
 * API key creation/update schema
 */
export const apiKeySchema = {
  name: (value: unknown) => {
    if (typeof value !== "string") return false;
    return value.trim().length > 0 && value.length <= 200;
  },
  description: (value: unknown) => {
    if (value === null || value === undefined) return true;
    if (typeof value !== "string") return false;
    return value.length <= 1000;
  },
  key: (value: unknown) => {
    if (typeof value !== "string") return false;
    return value.startsWith("api_") && value.length >= 20 && value.length <= 200;
  },
  isActive: (value: unknown) => {
    return typeof value === "boolean" || value === undefined;
  },
};

/**
 * Example Zod schemas (uncomment after installing zod):
 * 
 * import { z } from "zod";
 * 
 * export const registerSchema = z.object({
 *   username: z.string().min(3).max(100).regex(/^[a-zA-Z0-9@._-]+$/),
 *   password: z.string().min(6).max(128),
 * });
 * 
 * export const loginSchema = z.object({
 *   username: z.string().min(1),
 *   password: z.string().min(1),
 * });
 * 
 * export const apiKeySchema = z.object({
 *   name: z.string().min(1).max(200),
 *   description: z.string().max(1000).optional().nullable(),
 *   key: z.string().regex(/^api_/).min(20).max(200),
 *   isActive: z.boolean().optional(),
 * });
 */

