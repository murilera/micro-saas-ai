import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { isValidUUID } from "@/lib/utils";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session || !isValidUUID(session.value)) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("app_users")
      .select("id, username, created_at")
      .eq("id", session.value)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: data }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}


