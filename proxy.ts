import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
  const res = NextResponse.next();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Server-side middleware, jangan persist
    },
  });

  // Pemeriksaan optimistis. AuthGuard memvalidasi user penuh di sisi client.
  const token = request.cookies.get("sb-access-token")?.value;
  
  if (token) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (!error && user) {
      // User authenticated, allow access
      return res;
    }
  }

  // No valid session, redirect to login
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/profile/:path*",
  ],
};
