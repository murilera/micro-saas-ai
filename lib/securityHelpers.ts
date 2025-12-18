/**
 * Security helper functions
 */

import { NextResponse } from "next/server";

/**
 * Validate request body size
 */
export function validateBodySize(body: string, maxSize: number = 1024 * 1024): boolean {
  return new Blob([body]).size <= maxSize;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/\.\./g, "")
    .slice(0, 255);
}

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.some((allowed) => {
    if (allowed === "*") return true;
    return origin === allowed || origin.endsWith(`.${allowed}`);
  });
}

/**
 * Create a secure error response that doesn't leak information
 */
export function createSecureErrorResponse(
  message: string,
  status: number = 500,
  logDetails?: unknown
): NextResponse {
  // In production, log details to monitoring service instead of exposing them
  if (process.env.NODE_ENV === "development" && logDetails) {
    // eslint-disable-next-line no-console
    console.error("Error details:", logDetails);
  }

  return NextResponse.json({ error: message }, { status });
}

/**
 * Validate Content-Type header
 */
export function validateContentType(
  contentType: string | null,
  allowedTypes: string[] = ["application/json"]
): boolean {
  if (!contentType) return false;
  return allowedTypes.some((type) => contentType.includes(type));
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (byte) => chars[byte % chars.length]).join("");
}

/**
 * Check if email format is valid (basic check)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Prevent timing attacks by using constant-time comparison
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

