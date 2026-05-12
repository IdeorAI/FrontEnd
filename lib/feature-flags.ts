/**
 * Feature flags controlados por variáveis de ambiente.
 * Para ativar uma feature em produção, basta setar a env var no Vercel — sem alterar código.
 *
 * Padrão: false (desabilitado) quando a var não está definida.
 */

export const FEATURES = {
  /** Marketplace: botão "Publicar" e modal AnunciarModal na project screen. */
  MARKETPLACE: process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === 'true',
} as const;
