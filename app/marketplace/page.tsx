import { Users, Palette, Code2, Megaphone, Scale, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ComponentType } from "react"

type Service = {
  icon: ComponentType<{ className?: string }>
  name: string
  description: string
}

const services: Service[] = [
  { icon: Users, name: "Mentoria", description: "Sessões 1:1 com mentores experientes em startups e inovação" },
  { icon: Palette, name: "Design", description: "UI/UX, branding e identidade visual para sua startup" },
  { icon: Code2, name: "Desenvolvimento", description: "MVP e produtos digitais com times especializados" },
  { icon: Megaphone, name: "Marketing", description: "Growth, SEO, mídia paga e estratégia de conteúdo" },
  { icon: Scale, name: "Jurídico", description: "Contratos, LGPD, constituição de empresa e propriedade intelectual" },
  { icon: BarChart3, name: "Financeiro", description: "Modelagem financeira, captação e gestão de caixa" },
]

export default function MarketplacePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground mt-1">Conecte-se com especialistas para acelerar sua startup</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.name}
              className="bg-card border rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden"
            >
              <span className="absolute top-3 right-3 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Em breve
              </span>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
              </div>
              <Button variant="outline" size="sm" disabled className="mt-auto">
                Em breve
              </Button>
            </div>
          )
        })}
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">Seja um parceiro IdeorAI</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ofereça seus serviços para centenas de empreendedores em validação
          </p>
        </div>
        <Button disabled>Quero ser parceiro</Button>
      </div>
    </div>
  )
}
