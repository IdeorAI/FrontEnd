export type ListingStage = "Ideia" | "MVP" | "Tração" | "Escala";
export type ListingCategory =
  | "Fintech"
  | "Healthtech"
  | "Edtech"
  | "Agritech"
  | "SaaS"
  | "E-commerce"
  | "Outro";

export type ServiceSpecialty =
  | "Frontend"
  | "Backend"
  | "UX/UI"
  | "Marketing"
  | "Design"
  | "Jurídico"
  | "Financeiro"
  | "Mentoria";

export type Availability = "Disponível" | "Ocupado" | "Em breve";

export type ProjectListing = {
  id: string;
  name: string;
  description: string;
  category: ListingCategory;
  stage: ListingStage;
  score: number;
  teamSize: number;
  price: string;
  tags: string[];
};

export type ServiceListing = {
  id: string;
  name: string;
  specialty: ServiceSpecialty;
  bio: string;
  skills: string[];
  rate: string;
  availability: Availability;
  rating: number;
  reviewCount: number;
  initials: string;
  avatarColor: string;
};
