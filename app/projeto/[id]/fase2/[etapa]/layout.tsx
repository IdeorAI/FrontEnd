// Layout intermediário para rotas dinâmicas de etapas
// Marcar como dinâmico para Next.js 15+
export const dynamic = 'force-dynamic';

export default function EtapaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}