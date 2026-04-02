# Marketplace Redesign — Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformar o `/marketplace` de um placeholder em uma UI completa de marketplace com duas seções — **Projetos** (comprar/vender startups) e **Serviços** (contratar/oferecer freelance) — usando dados mockados, sem backend ainda.

**Architecture:** A página usa o padrão existente: `layout.tsx` (Server, `getAuthUser`) + `page.tsx` (Server Component com dados mock). Componentes de UI e interatividade ficam em `components/marketplace/`. Tabs são Client Component. Nenhum chamada real de API — todos os dados vêm de arrays estáticos tipados.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Lucide React · shadcn/ui (Badge, Button, Card, Dialog, Input, Select) · dados mock em arquivos `.ts`

---

## Visão Geral das Seções

### Aba "Projetos" (Startups à venda / busca de sócio)
Cada card mostra: nome, descrição curta, categoria (Fintech, Healthtech…), estágio (Ideia / MVP / Tração), score IdeorAI, tamanho da equipe, preço/negociável, botão "Ver detalhes" (disabled + "Em breve").

### Aba "Serviços" (Freelancers / Especialistas)
Cada card mostra: avatar + nome, especialidade, tags de skills, valor/hora, disponibilidade, rating mock, botão "Contratar" (disabled).

### Header com Filtros
- Input de busca (visual only, sem handler real)
- Select de categoria (visual only)
- Botão "Anunciar" → abre Dialog com formulário placeholder + "Em breve"

---

## Task 1: Tipos TypeScript

**Files:**
- Create: `app/marketplace/_types/index.ts`

**Step 1: Criar o arquivo de tipos**

```ts
// app/marketplace/_types/index.ts

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
  score: number;          // 0-100, IdeorAI score
  teamSize: number;
  price: string;          // "R$ 15.000", "Negociável", "A combinar"
  tags: string[];
};

export type ServiceListing = {
  id: string;
  name: string;
  specialty: ServiceSpecialty;
  bio: string;
  skills: string[];
  rate: string;           // "R$ 120/h", "Sob consulta"
  availability: Availability;
  rating: number;         // 1-5
  reviewCount: number;
  initials: string;       // para avatar placeholder
  avatarColor: string;    // classe tailwind bg-*
};
```

**Step 2: Verificar que o arquivo existe**

```bash
ls FrontEnd/ideor/app/marketplace/_types/index.ts
```

**Step 3: Commit**

```bash
git add FrontEnd/ideor/app/marketplace/_types/
git commit -m "feat(marketplace): add TypeScript types for listings"
```

---

## Task 2: Dados Mock

**Files:**
- Create: `app/marketplace/_data/mock.ts`

**Step 1: Criar dados mockados representativos**

```ts
// app/marketplace/_data/mock.ts
import type { ProjectListing, ServiceListing } from "../_types";

export const mockProjects: ProjectListing[] = [
  {
    id: "p1",
    name: "PayFácil",
    description: "Plataforma de pagamentos parcelados para MEIs sem burocracia bancária.",
    category: "Fintech",
    stage: "MVP",
    score: 82,
    teamSize: 3,
    price: "R$ 45.000",
    tags: ["Fintech", "B2B", "SaaS"],
  },
  {
    id: "p2",
    name: "MedConnect",
    description: "Marketplace de teleconsultas especializadas com IA de triagem.",
    category: "Healthtech",
    stage: "Tração",
    score: 91,
    teamSize: 5,
    price: "Negociável",
    tags: ["Saúde", "IA", "B2C"],
  },
  {
    id: "p3",
    name: "AgroScore",
    description: "Análise de crédito rural baseada em dados satelitais e clima.",
    category: "Agritech",
    stage: "Ideia",
    score: 67,
    teamSize: 2,
    price: "A combinar",
    tags: ["Agro", "Crédito", "IA"],
  },
  {
    id: "p4",
    name: "SkillPath",
    description: "LMS com trilhas personalizadas por IA para requalificação profissional.",
    category: "Edtech",
    stage: "MVP",
    score: 75,
    teamSize: 4,
    price: "R$ 30.000",
    tags: ["Educação", "IA", "B2B"],
  },
  {
    id: "p5",
    name: "StoreMind",
    description: "Gestão inteligente de estoque para pequenos varejistas.",
    category: "SaaS",
    stage: "Tração",
    score: 88,
    teamSize: 3,
    price: "R$ 60.000",
    tags: ["Varejo", "SaaS", "B2B"],
  },
  {
    id: "p6",
    name: "EduKids",
    description: "App de alfabetização gamificada para crianças de 4-8 anos.",
    category: "Edtech",
    stage: "Ideia",
    score: 61,
    teamSize: 2,
    price: "Negociável",
    tags: ["Educação", "Mobile", "B2C"],
  },
];

export const mockServices: ServiceListing[] = [
  {
    id: "s1",
    name: "Ana Ribeiro",
    specialty: "UX/UI",
    bio: "Designer com 6 anos em produtos digitais. Especialista em SaaS B2B.",
    skills: ["Figma", "Design System", "Prototipagem", "Research"],
    rate: "R$ 150/h",
    availability: "Disponível",
    rating: 4.9,
    reviewCount: 34,
    initials: "AR",
    avatarColor: "bg-purple-500",
  },
  {
    id: "s2",
    name: "Lucas Mendes",
    specialty: "Frontend",
    bio: "Desenvolvedor React/Next.js com foco em performance e acessibilidade.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind"],
    rate: "R$ 120/h",
    availability: "Disponível",
    rating: 4.8,
    reviewCount: 21,
    initials: "LM",
    avatarColor: "bg-cyan-500",
  },
  {
    id: "s3",
    name: "Carla Souza",
    specialty: "Marketing",
    bio: "Growth hacker com track record em startups de Série A.",
    skills: ["Growth", "SEO", "Paid Ads", "CRO"],
    rate: "R$ 130/h",
    availability: "Ocupado",
    rating: 4.7,
    reviewCount: 18,
    initials: "CS",
    avatarColor: "bg-orange-500",
  },
  {
    id: "s4",
    name: "Rafael Costa",
    specialty: "Backend",
    bio: "Engenheiro de software especialista em APIs escaláveis e microsserviços.",
    skills: ["Node.js", "Go", "PostgreSQL", "AWS"],
    rate: "R$ 140/h",
    availability: "Disponível",
    rating: 4.9,
    reviewCount: 27,
    initials: "RC",
    avatarColor: "bg-green-500",
  },
  {
    id: "s5",
    name: "Dra. Juliana Lima",
    specialty: "Jurídico",
    bio: "Advogada especialista em startups: contratos, LGPD e captação.",
    skills: ["LGPD", "Contratos", "IP", "Investimento"],
    rate: "Sob consulta",
    availability: "Disponível",
    rating: 5.0,
    reviewCount: 12,
    initials: "JL",
    avatarColor: "bg-blue-500",
  },
  {
    id: "s6",
    name: "Bruno Ferreira",
    specialty: "Mentoria",
    bio: "Fundador 3x com exits. Mentor de startups em fase de validação.",
    skills: ["Pitch", "Estratégia", "Captação", "Produto"],
    rate: "R$ 200/h",
    availability: "Em breve",
    rating: 4.8,
    reviewCount: 9,
    initials: "BF",
    avatarColor: "bg-rose-500",
  },
];
```

**Step 2: Commit**

```bash
git add FrontEnd/ideor/app/marketplace/_data/
git commit -m "feat(marketplace): add mock data for projects and services"
```

---

## Task 3: ProjectListingCard

**Files:**
- Create: `components/marketplace/project-listing-card.tsx`

Este componente é Server-compatible (sem hooks de estado), recebe `ProjectListing` como prop.

**Step 1: Criar o componente**

```tsx
// components/marketplace/project-listing-card.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp } from "lucide-react";
import type { ProjectListing } from "@/app/marketplace/_types";

const stageColor: Record<string, string> = {
  Ideia: "bg-muted text-muted-foreground",
  MVP: "bg-blue-500/20 text-blue-400",
  Tração: "bg-secondary/20 text-secondary",
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
```

**Step 2: Commit**

```bash
git add FrontEnd/ideor/components/marketplace/project-listing-card.tsx
git commit -m "feat(marketplace): add ProjectListingCard component"
```

---

## Task 4: ServiceListingCard

**Files:**
- Create: `components/marketplace/service-listing-card.tsx`

**Step 1: Criar o componente**

```tsx
// components/marketplace/service-listing-card.tsx
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
```

**Step 2: Commit**

```bash
git add FrontEnd/ideor/components/marketplace/service-listing-card.tsx
git commit -m "feat(marketplace): add ServiceListingCard component"
```

---

## Task 5: MarketplaceFilters (Client Component)

**Files:**
- Create: `components/marketplace/marketplace-filters.tsx`

Barra de filtros com search input, select de categoria, e botão "Anunciar" que recebe `onAnunciar` como prop.

**Step 1: Criar o componente**

```tsx
// components/marketplace/marketplace-filters.tsx
"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MarketplaceFiltersProps {
  onAnunciar: () => void;
}

const projectCategories = ["Todos", "Fintech", "Healthtech", "Edtech", "Agritech", "SaaS", "E-commerce"];
const serviceCategories = ["Todos", "Frontend", "Backend", "UX/UI", "Marketing", "Design", "Jurídico", "Mentoria"];

export function MarketplaceFilters({ onAnunciar }: MarketplaceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar no marketplace..."
          className="pl-9"
          // Sem handler real — visual only
        />
      </div>

      <select
        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        defaultValue="Todos"
        // Sem handler real — visual only
      >
        {projectCategories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <Button onClick={onAnunciar} variant="default" size="sm" className="sm:ml-auto">
        + Anunciar
      </Button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add FrontEnd/ideor/components/marketplace/marketplace-filters.tsx
git commit -m "feat(marketplace): add MarketplaceFilters component"
```

---

## Task 6: AnunciarModal (Client Component)

**Files:**
- Create: `components/marketplace/anunciar-modal.tsx`

Dialog com dois sub-tipos (Projeto ou Serviço) e formulário placeholder. Tudo disabled com badge "Em breve".

**Step 1: Criar o componente**

```tsx
// components/marketplace/anunciar-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rocket, Briefcase } from "lucide-react";

interface AnunciarModalProps {
  open: boolean;
  onClose: () => void;
}

type AnunciarType = "projeto" | "servico" | null;

export function AnunciarModal({ open, onClose }: AnunciarModalProps) {
  const [type, setType] = useState<AnunciarType>(null);

  function handleClose() {
    setType(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>O que você quer anunciar?</DialogTitle>
          <DialogDescription>
            Escolha o tipo de anúncio para continuar
          </DialogDescription>
        </DialogHeader>

        {!type && (
          <div className="grid grid-cols-2 gap-4 py-2">
            <button
              onClick={() => setType("projeto")}
              className="flex flex-col items-center gap-3 p-5 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Projeto / Startup</p>
                <p className="text-xs text-muted-foreground mt-0.5">Venda ou busque sócios</p>
              </div>
            </button>

            <button
              onClick={() => setType("servico")}
              className="flex flex-col items-center gap-3 p-5 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-secondary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Serviço / Freelance</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ofereça sua expertise</p>
              </div>
            </button>
          </div>
        )}

        {type && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setType(null)} className="text-xs text-muted-foreground hover:text-foreground">
                ← Voltar
              </button>
              <span className="text-sm font-medium">
                {type === "projeto" ? "Anunciar Projeto / Startup" : "Anunciar Serviço"}
              </span>
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Em breve
              </span>
            </div>

            <Input placeholder="Nome do projeto / serviço" disabled />
            <Textarea placeholder="Descrição..." rows={3} disabled />
            <Input placeholder={type === "projeto" ? "Preço ou 'Negociável'" : "Valor/hora ou 'Sob consulta'"} disabled />

            <p className="text-xs text-muted-foreground text-center">
              Esta funcionalidade estará disponível em breve. Cadastre seu interesse e avisamos você!
            </p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancelar</Button>
              <Button className="flex-1" disabled>Publicar anúncio</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Commit**

```bash
git add FrontEnd/ideor/components/marketplace/anunciar-modal.tsx
git commit -m "feat(marketplace): add AnunciarModal dialog component"
```

---

## Task 7: MarketplaceTabs (Client Component)

**Files:**
- Create: `components/marketplace/marketplace-tabs.tsx`

Este é o componente principal de interatividade. Recebe as listas como props (vindo do Server Component pai) e gerencia qual aba está ativa.

**Step 1: Criar o componente**

```tsx
// components/marketplace/marketplace-tabs.tsx
"use client";

import { useState } from "react";
import { ProjectListingCard } from "./project-listing-card";
import { ServiceListingCard } from "./service-listing-card";
import { MarketplaceFilters } from "./marketplace-filters";
import { AnunciarModal } from "./anunciar-modal";
import type { ProjectListing, ServiceListing } from "@/app/marketplace/_types";
import { Rocket, Briefcase } from "lucide-react";

interface MarketplaceTabsProps {
  projects: ProjectListing[];
  services: ServiceListing[];
}

type Tab = "projetos" | "servicos";

export function MarketplaceTabs({ projects, services }: MarketplaceTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("projetos");
  const [anunciarOpen, setAnunciarOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("projetos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "projetos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Rocket className="h-4 w-4" />
          Projetos & Startups
        </button>
        <button
          onClick={() => setActiveTab("servicos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "servicos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Serviços & Freelancers
        </button>
      </div>

      {/* Filters */}
      <MarketplaceFilters onAnunciar={() => setAnunciarOpen(true)} />

      {/* Grid */}
      {activeTab === "projetos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectListingCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {activeTab === "servicos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <ServiceListingCard key={s.id} service={s} />
          ))}
        </div>
      )}

      {/* Anunciar modal */}
      <AnunciarModal
        open={anunciarOpen}
        onClose={() => setAnunciarOpen(false)}
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add FrontEnd/ideor/components/marketplace/marketplace-tabs.tsx
git commit -m "feat(marketplace): add MarketplaceTabs with tab switching and modal trigger"
```

---

## Task 8: Rewrite app/marketplace/page.tsx

**Files:**
- Modify: `app/marketplace/page.tsx`

O `page.tsx` permanece Server Component: importa mock data e passa para `MarketplaceTabs`.

**Step 1: Reescrever o page.tsx**

```tsx
// app/marketplace/page.tsx
import { MarketplaceTabs } from "@/components/marketplace/marketplace-tabs";
import { mockProjects, mockServices } from "./_data/mock";

export default function MarketplacePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Compre, venda e colabore — projetos, startups e especialistas em um só lugar
        </p>
      </div>

      {/* Tabs + conteúdo interativo (Client Component) */}
      <MarketplaceTabs projects={mockProjects} services={mockServices} />
    </div>
  );
}
```

**Step 2: Verificar que não há erros de import**

```bash
# Conferir que os caminhos de import estão corretos:
# @/components/marketplace/marketplace-tabs  → components/marketplace/marketplace-tabs.tsx  ✓
# @/app/marketplace/_data/mock               → app/marketplace/_data/mock.ts               ✓
```

**Step 3: Commit**

```bash
git add FrontEnd/ideor/app/marketplace/page.tsx
git commit -m "feat(marketplace): rewrite page.tsx to use MarketplaceTabs with mock data"
```

---

## Task 9: Final push e verificação

**Step 1: Push para Vercel**

```bash
cd FrontEnd/ideor
git push origin main
```

**Step 2: Verificar build no Vercel**
- Aguardar deploy terminar
- Abrir `/marketplace` e confirmar:
  - Tabs "Projetos & Startups" e "Serviços & Freelancers" funcionam
  - 6 cards em cada aba
  - Botão "Anunciar" abre o modal
  - Modal mostra os dois tipos (Projeto / Serviço)
  - Ao selecionar um tipo, mostra formulário disabled com "Em breve"
  - Todos os botões dos cards estão disabled

---

## Estrutura Final de Arquivos

```
FrontEnd/ideor/
├── app/marketplace/
│   ├── _data/
│   │   └── mock.ts                      ← Task 2
│   ├── _types/
│   │   └── index.ts                     ← Task 1
│   ├── layout.tsx                       ← já existe, não modificar
│   └── page.tsx                         ← Task 8 (reescrito)
│
└── components/marketplace/
    ├── marketplace-tabs.tsx             ← Task 7 (Client, orquestra tudo)
    ├── marketplace-filters.tsx          ← Task 5 (Client, search + anunciar)
    ├── anunciar-modal.tsx               ← Task 6 (Client, Dialog)
    ├── project-listing-card.tsx         ← Task 3 (Server-compatible)
    └── service-listing-card.tsx         ← Task 4 (Server-compatible)
```

---

## Notas para implementação futura (não fazer agora)

- Conectar filtros a estado real (busca e categoria com `useSearchParams`)
- Substituir mock data por queries Supabase em `page.tsx`
- Integrar com `/perfil` para pré-preencher dados ao anunciar
- Adicionar paginação ou infinite scroll
- Rota `/marketplace/[id]` para detalhe de cada listagem
- Sistema de mensagens para contato entre partes
