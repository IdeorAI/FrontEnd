// Layout intermediário para rotas dinâmicas de etapas
// Necessário para suportar output:'export' no Next.js

// Marcar como dinâmico para Next.js 15+
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Retorna array vazio porque essas rotas são dinâmicas e não serão exportadas ainda
  // Quando for colocar a plataforma completa no ar, adicione aqui as etapas disponíveis
  return [];
}

export default function EtapaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}