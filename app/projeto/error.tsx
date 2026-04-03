'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[Projeto Error Boundary] Erro capturado:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <AlertTriangle className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Erro no projeto</h2>
          <p className="text-muted-foreground">
            Não foi possível carregar os dados do projeto. Tente novamente ou volte ao dashboard.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
          
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 rounded-lg bg-muted p-4 text-left text-xs">
            <summary className="cursor-pointer font-medium">Detalhes do erro (dev)</summary>
            <pre className="mt-2 overflow-x-auto text-destructive">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
