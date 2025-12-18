import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { isValidUUID, isValidApiKeyFormat } from "@/lib/utils";
import { validateContentType, createSecureErrorResponse } from "@/lib/securityHelpers";

// GET /api/api-keys  -> list keys for current user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session");

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userSession.value;

    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    // Validate environment variables at runtime
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch API keys." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      data?.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        key: row.key,
        createdAt: row.created_at,
        lastUsed: row.last_used ?? undefined,
        isActive: row.is_active,
      })) ?? []
    );
  } catch (error) {
    return createSecureErrorResponse(
      "An error occurred while fetching API keys.",
      500,
      error
    );
  }
}

// POST /api/api-keys -> create key for current user
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session");

    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userSession.value;

    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    // Validate Content-Type
    const contentType = req.headers.get("content-type");
    if (!validateContentType(contentType)) {
      return NextResponse.json(
        { error: "Content-Type must be application/json." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { name, description, key, isActive = true } = body;

    if (!name || !key) {
      return NextResponse.json(
        { error: "Name and key are required." },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (name.length > 200) {
      return NextResponse.json(
        { error: "Name must be 200 characters or less." },
        { status: 400 }
      );
    }

    if (description && description.length > 1000) {
      return NextResponse.json(
        { error: "Description must be 1000 characters or less." },
        { status: 400 }
      );
    }

    if (!isValidApiKeyFormat(key)) {
      return NextResponse.json(
        { error: "Invalid API key format." },
        { status: 400 }
      );
    }

    // Check if user has reached the maximum limit of 10 API keys
    const { count, error: countError } = await supabase
      .from("api_keys")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      return NextResponse.json(
        { error: "Failed to check API key limit." },
        { status: 500 }
      );
    }

    const MAX_API_KEYS = 10;
    if (count !== null && count >= MAX_API_KEYS) {
      return NextResponse.json(
        {
          error: `You have reached the maximum limit of ${MAX_API_KEYS} API keys. Please delete an existing key before creating a new one.`,
        },
        { status: 403 }
      );
    }

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: userId,
      name,
      description: description ?? null,
      key,
      is_active: isActive,
    })
    .select()
    .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create API key." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: data.id,
        name: data.name,
        description: data.description ?? undefined,
        key: data.key,
        createdAt: data.created_at,
        lastUsed: data.last_used ?? undefined,
        isActive: data.is_active,
      },
      { status: 201 }
    );
  } catch (error) {
    return createSecureErrorResponse(
      "An error occurred while creating the API key.",
      500,
      error
    );
  }
}


