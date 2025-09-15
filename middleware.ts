// /middleware.ts (raiz)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Função para gerar UUID usando Web Crypto API (compatível com Edge)
function generateUUID(): string {
  return crypto.randomUUID();
}

export async function middleware(request: NextRequest) {
  try {
    // Gerar/obter request ID
    const requestId = request.headers.get("x-request-id") ?? generateUUID();
    
    // Continuar com a sessão do Supabase
    const response = await updateSession(request);
    
    // Adicionar request ID aos headers da resposta
    response.headers.set("x-request-id", requestId);
    
    return response;
  } catch (err) {
    // evita 500 em produção se algo falhar
    console.error("[middleware] crashed:", err);
    const response = NextResponse.next();
    response.headers.set("x-request-id", generateUUID());
    return response;
  }
}

// Rode o middleware só onde precisa sessão
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};