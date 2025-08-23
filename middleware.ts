// /middleware.ts (raiz)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (err) {
    // evita 500 em produção se algo falhar
    console.error("[middleware] crashed:", err);
    return NextResponse.next();
  }
}

// Rode o middleware só onde precisa sessão
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
