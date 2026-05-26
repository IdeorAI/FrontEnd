import fs from "node:fs/promises";
import path from "node:path";
import { MarkdownDoc } from "@/components/legal/markdown-doc";

export const metadata = {
  title: "Termos de Uso · IdeorAI",
  description: "Termos e condições de uso da plataforma IdeorAI.",
};

export default async function TermosPage() {
  const filePath = path.join(process.cwd(), "content", "legal", "termos.md");
  const source = await fs.readFile(filePath, "utf-8");

  return (
    <div className="container max-w-3xl py-10">
      <MarkdownDoc source={source} />
    </div>
  );
}
