import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { sanitizeString, getCookieOptions } from "@/lib/utils";
import { rateLimit, getClientIdentifier, rateLimitPresets } from "@/lib/rateLimit";
import { validateContentType, createSecureErrorResponse } from "@/lib/securityHelpers";

export async function POST(req: Request) {
  try {
    // Rate limiting - prevent brute force attacks
    const identifier = getClientIdentifier(req);
    const limitResult = rateLimit({
      ...rateLimitPresets.auth,
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

    const username = sanitizeString(body.username || "", 100);
    const password = body.password as string | undefined;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

  const { data, error } = await supabase
    .from("app_users")
    .select("id, username, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Error fetching user." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

  const isValid = await bcrypt.compare(password, data.password_hash);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

    const res = NextResponse.json({
      user: { id: data.id, username: data.username },
    });

    // Include rate limit headers in response
    res.headers.set("X-RateLimit-Limit", limitResult.limit.toString());
    res.headers.set("X-RateLimit-Remaining", limitResult.remaining.toString());
    res.headers.set("X-RateLimit-Reset", limitResult.reset.toString());

    const cookieOptions = getCookieOptions();
    res.cookies.set("user_session", data.id, {
      ...cookieOptions,
      maxAge: 60 * 60, // 1 hour
    });

    return res;
  } catch (error) {
    return createSecureErrorResponse(
      "An error occurred during authentication.",
      500,
      error
    );
  }
}


