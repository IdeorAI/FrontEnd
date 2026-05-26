import fs from "node:fs/promises";
import path from "node:path";
import { MarkdownDoc } from "@/components/legal/markdown-doc";

export const metadata = {
  title: "Política de Privacidade · IdeorAI",
  description: "Como tratamos seus dados pessoais no IdeorAI.",
};

export default async function PrivacidadePage() {
  const filePath = path.join(process.cwd(), "content", "legal", "privacidade.md");
  const source = await fs.readFile(filePath, "utf-8");

  return (
    <div className="container max-w-3xl py-10">
      <MarkdownDoc source={source} />
    </div>
  );
}
