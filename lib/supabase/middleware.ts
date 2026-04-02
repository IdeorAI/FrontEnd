// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Função para sanitizar JWTs corrompidos pelo Vercel
function sanitizeEnvVar(value: string | undefined): string | undefined {
  if (!value) return value;

  // Remover TODOS os whitespaces (newlines, tabs, espaços)
  // JWTs são base64url encoded e não devem ter espaços
  return value.replace(/[\s\n\r\t]/g, '');
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Sanitizar variáveis de ambiente antes de usar
  let url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  let anon =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Aplicar sanitização
  url = sanitizeEnvVar(url);
  anon = sanitizeEnvVar(anon);

  if (!url || !anon) {
    // Sem variáveis? Só segue a requisição sem tentar autenticar.
    return response;
  }

  // Log cookies recebidos
  const allCookies = request.cookies.getAll();
  console.log('[middleware] 🍪 Cookies received:', {
    count: allCookies.length,
    hasSupabaseCookies: allCookies.some(c => c.name.startsWith('sb-')),
    cookieNames: allCookies.map(c => c.name),
  });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        console.log('[middleware] 🍪 Setting cookies:', {
          count: cookiesToSet.length,
          names: cookiesToSet.map(c => c.name),
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Tentar obter usuário, mas não falhar se o token for inválido
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    console.log('[middleware] 🔍 Auth check result:', {
      pathname: request.nextUrl.pathname,
      hasError: !!error,
      errorMessage: error?.message,
      hasUser: !!data?.user,
      userId: data?.user?.id,
    });
    if (!error) {
      user = data.user;
    }
  } catch (err) {
    // Ignorar erros de refresh token - usuário não autenticado
    console.log("[middleware] ⚠️ Auth check failed:", err);
  }

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/auth") || pathname.startsWith("/login");

  console.log('[middleware] 🛡️ Protection check:', {
    pathname,
    hasUser: !!user,
    isAuthRoute,
    willRedirect: !user && !isAuthRoute && pathname !== "/",
  });

  // Protege rotas autenticadas (ajuste conforme sua necessidade)
  if (!user && !isAuthRoute && pathname !== "/") {
    console.log('[middleware] 🚫 Redirecting to /auth/login - no user found');
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return response;
}
