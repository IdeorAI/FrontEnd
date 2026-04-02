import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { ServiceListing } from "@/app/marketplace/_types";

const availabilityStyle: Record<string, string> = {
  "Disponível": "bg-green-500/20 text-green-400",
  "Ocupado": "bg-red-500/20 text-red-400",
  "Em breve": "bg-muted text-muted-foreground",
};

export function ServiceListingCard({ service }: { service: ServiceListing }) {
  return (
    <div className="bg-card border rounded-lg p-5 flex flex-col gap-4">
      {/* Header: avatar + name + specialty */}
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${service.avatarColor}`}
        >
          {service.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate">{service.name}</h3>
          <p className="text-xs text-muted-foreground">{service.specialty}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${availabilityStyle[service.availability]}`}
        >
          {service.availability}
        </span>
      </div>

      {/* Bio */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {service.bio}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {service.skills.map((skill) => (
          <span key={skill} className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
            {skill}
          </span>
        ))}
      </div>

      {/* Rating + rate */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-foreground font-medium">{service.rating.toFixed(1)}</span>
          <span>({service.reviewCount})</span>
        </span>
        <span className="font-semibold text-foreground">{service.rate}</span>
      </div>

      {/* CTAs */}
      <div className="flex gap-2 mt-auto">
        <Button variant="outline" size="sm" disabled className="flex-1">
          Ver perfil
        </Button>
        <Button size="sm" disabled className="flex-1">
          Contratar
        </Button>
      </div>
    </div>
  );
}
