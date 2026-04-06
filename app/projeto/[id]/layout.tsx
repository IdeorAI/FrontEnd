// Layout intermediário para rotas dinâmicas de projeto
// Marcar como dinâmico para Next.js 15+
export const dynamic = 'force-dynamic';

export default function ProjetoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}