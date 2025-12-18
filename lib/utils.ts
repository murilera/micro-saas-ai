/**
 * Utility functions for validation and sanitization
 */

export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function sanitizeString(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength);
}

export function isValidApiKeyFormat(key: string): boolean {
  // API keys should start with "api_" and be at least 20 characters
  return key.startsWith("api_") && key.length >= 20 && key.length <= 200;
}

export function isValidUsername(username: string): boolean {
  // Username should be 3-100 characters, alphanumeric and common email chars
  const usernameRegex = /^[a-zA-Z0-9@._-]{3,100}$/;
  return usernameRegex.test(username);
}

export function isValidPassword(password: string): boolean {
  // Password should be at least 6 characters, max 128
  return password.length >= 6 && password.length <= 128;
}

/**
 * Get secure cookie options based on environment
 */
export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: "lax" as const,
    path: "/",
  };
}

