import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { isValidUUID, isValidApiKeyFormat, sanitizeString } from "@/lib/utils";
import { validateContentType, createSecureErrorResponse } from "@/lib/securityHelpers";

type ParamsPromise = {
  params: Promise<{
    id: string;
  }>;
};

// PATCH /api/api-keys/:id -> update key (only if owned by user)
export async function PATCH(req: Request, ctx: ParamsPromise) {
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

    const { id } = await ctx.params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid API key ID." }, { status: 400 });
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

    const { name, description, key, isActive, lastUsed } = body;

    // First verify the key belongs to the user
    const { data: existing, error: checkError } = await supabase
      .from("api_keys")
      .select("user_id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: "API key not found." }, { status: 404 });
    }

    if (existing.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const updatePayload: Record<string, unknown> = {};
    
    if (name !== undefined) {
      const sanitizedName = sanitizeString(name, 200);
      if (sanitizedName.length === 0) {
        return NextResponse.json(
          { error: "Name cannot be empty." },
          { status: 400 }
        );
      }
      updatePayload.name = sanitizedName;
    }
    
    if (description !== undefined) {
      updatePayload.description = description
        ? sanitizeString(description, 1000)
        : null;
    }
    
    if (key !== undefined) {
      const sanitizedKey = sanitizeString(key, 200);
      if (!isValidApiKeyFormat(sanitizedKey)) {
        return NextResponse.json(
          { error: "Invalid API key format." },
          { status: 400 }
        );
      }
      updatePayload.key = sanitizedKey;
    }
    
    if (isActive !== undefined) {
      updatePayload.is_active = Boolean(isActive);
    }
    
    if (lastUsed !== undefined) {
      updatePayload.last_used = lastUsed;
    }

    const { data, error } = await supabase
      .from("api_keys")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update API key." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      description: data.description ?? undefined,
      key: data.key,
      createdAt: data.created_at,
      lastUsed: data.last_used ?? undefined,
      isActive: data.is_active,
    });
  } catch (error) {
    return createSecureErrorResponse(
      "An error occurred while updating the API key.",
      500,
      error
    );
  }
}

// DELETE /api/api-keys/:id -> delete key (only if owned by user)
export async function DELETE(_req: Request, ctx: ParamsPromise) {
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

    const { id } = await ctx.params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid API key ID." }, { status: 400 });
    }

    // First verify the key belongs to the user
    const { data: existing, error: checkError } = await supabase
      .from("api_keys")
      .select("user_id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: "API key not found." }, { status: 404 });
    }

    if (existing.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete API key." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return createSecureErrorResponse(
      "An error occurred while deleting the API key.",
      500,
      error
    );
  }
}


