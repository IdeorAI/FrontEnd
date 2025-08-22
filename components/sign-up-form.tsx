"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, User, LogIn } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingOAuth, setIsLoadingOAuth] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoadingEmail(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("As senhas não coincidem");
      setIsLoadingEmail(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Armazena o nome no user_metadata
          data: { full_name: fullName },
          // Para fluxo de confirmação por email
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro");
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    setIsLoadingOAuth(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Crie esta rota ou aponte para a página desejada
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            // força selecionar conta quando o usuário tem múltiplas
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
      // O redirecionamento acontece automaticamente;
      // nenhuma navegação manual aqui.
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Erro ao entrar com Google"
      );
      setIsLoadingOAuth(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Registre-se com email/senha ou Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              disabled={isLoadingOAuth}
            >
              {isLoadingOAuth ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Continuar com Google
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou com email
                </span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Nome</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Nome e sobrenome"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repita a senha</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoadingEmail}
              >
                {isLoadingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando
                    conta...
                  </>
                ) : (
                  "Cadastrar"
                )}
              </Button>

              <div className="mt-2 text-center text-sm">
                Já tem uma conta?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  Entrar
                </Link>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
