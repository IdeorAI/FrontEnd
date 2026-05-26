import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  source: string;
}

export function MarkdownDoc({ source }: Props) {
  return (
    <article className="prose prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h1:mb-2 prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-primary prose-h3:text-lg prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:underline prose-table:text-sm prose-th:bg-muted/50 prose-th:font-semibold prose-th:text-foreground prose-td:text-muted-foreground prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-table:border prose-th:border prose-td:border prose-table:border-border prose-th:border-border prose-td:border-border prose-hr:border-border max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </article>
  );
}
