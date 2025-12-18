import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { isValidApiKeyFormat, sanitizeString, getCookieOptions } from "@/lib/utils";
import { rateLimit, getClientIdentifier, rateLimitPresets } from "@/lib/rateLimit";
import { validateContentType, createSecureErrorResponse } from "@/lib/securityHelpers";

export async function POST(req: Request) {
  try {
    // Rate limiting - prevent API key enumeration attacks
    const identifier = getClientIdentifier(req);
    const limitResult = rateLimit({
      ...rateLimitPresets.api,
      identifier,
    });

    if (!limitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limitResult.limit.toString(),
            "X-RateLimit-Remaining": limitResult.remaining.toString(),
            "X-RateLimit-Reset": limitResult.reset.toString(),
            "Retry-After": "60",
          },
        }
      );
    }

    // Validate Content-Type
    const contentType = req.headers.get("content-type");
    if (!validateContentType(contentType)) {
      return NextResponse.json(
        { error: "Content-Type must be application/json." },
        { status: 400 }
      );
    }

    // Get and validate request body
    // Note: Content-Length header validation would be ideal, but req.json() consumes the body
    // For production, consider using middleware for body size validation
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const key = sanitizeString(body.key || "", 200);

    if (!key) {
      return NextResponse.json(
        { error: "API key is required." },
        { status: 400 }
      );
    }

    if (!isValidApiKeyFormat(key)) {
      return NextResponse.json(
        { error: "Invalid API key format." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select("id, is_active")
      .eq("key", key)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Error validating API key." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Invalid or inactive API key." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true });

    // Include rate limit headers in response
    res.headers.set("X-RateLimit-Limit", limitResult.limit.toString());
    res.headers.set("X-RateLimit-Remaining", limitResult.remaining.toString());
    res.headers.set("X-RateLimit-Reset", limitResult.reset.toString());

    const cookieOptions = getCookieOptions();
    res.cookies.set("api_key_session", "valid", {
      ...cookieOptions,
      maxAge: 60 * 5, // 5 minutes
    });

    return res;
  } catch (error) {
    return createSecureErrorResponse(
      "An error occurred while validating the API key.",
      500,
      error
    );
  }
}


