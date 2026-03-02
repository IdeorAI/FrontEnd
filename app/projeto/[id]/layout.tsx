// Layout intermediário para rotas dinâmicas de projeto
// Necessário para suportar output:'export' no Next.js

export async function generateStaticParams() {
  // Retorna array vazio porque essas rotas são dinâmicas e não serão exportadas ainda
  // Quando for colocar a plataforma completa no ar, adicione aqui os IDs dos projetos
  return [];
}

export default function ProjetoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
