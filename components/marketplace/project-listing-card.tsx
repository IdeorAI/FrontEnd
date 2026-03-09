import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp } from "lucide-react";
import type { ProjectListing } from "@/app/marketplace/_types";

const stageColor: Record<string, string> = {
  Ideia: "bg-muted text-muted-foreground",
  MVP: "bg-blue-500/20 text-blue-400",
  "Tração": "bg-secondary/20 text-secondary",
  Escala: "bg-primary/20 text-primary",
};

export function ProjectListingCard({ project }: { project: ProjectListing }) {
  return (
    <div className="bg-card border rounded-lg p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-base leading-tight">{project.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{project.category}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${stageColor[project.stage] ?? "bg-muted text-muted-foreground"}`}
        >
          {project.stage}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-secondary" />
          Score {project.score}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {project.teamSize} pessoa{project.teamSize !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto font-semibold text-foreground">{project.price}</span>
      </div>

      {/* CTA */}
      <Button variant="outline" size="sm" disabled className="w-full mt-auto">
        Ver detalhes — Em breve
      </Button>
    </div>
  );
}
