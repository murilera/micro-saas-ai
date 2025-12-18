import { NextResponse } from "next/server";
import { getCookieOptions } from "@/lib/utils";

export async function POST() {
  const res = NextResponse.json({ success: true });

  const cookieOptions = getCookieOptions();

  // Clear user session and API key session if present
  res.cookies.set("user_session", "", {
    ...cookieOptions,
    maxAge: 0,
  });

  res.cookies.set("api_key_session", "", {
    ...cookieOptions,
    maxAge: 0,
  });

  return res;
}


