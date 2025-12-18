import type { ApiKey } from "./types";
import { DashboardClient } from "./DashboardClient";
import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidUUID } from "@/lib/utils";

async function getInitialApiKeys(userId: string): Promise<ApiKey[]> {
  try {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      // In production, log to monitoring service instead of console
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Failed to load API keys on server:", error.message);
      }
      return [];
    }

    return (
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
    // In production, log to monitoring service instead of console
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("Error fetching API keys on server:", error);
    }
    return [];
  }
}

export default async function DashboardsPage() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session");

  if (!userSession || !isValidUUID(userSession.value)) {
    redirect("/");
  }

  const userId = userSession.value;
  const initialKeys = await getInitialApiKeys(userId);
  return <DashboardClient initialKeys={initialKeys} />;
}



