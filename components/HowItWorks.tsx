import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, FileText, BarChart3, Users, Rocket } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <MessageSquare className="h-8 w-8" />,
      title: "IDEAÇÃO",
      subtitle: "Ideação com Chat IA",
      description: "explore ideias e defina a proposta de valor."
    },
    {
      number: "02",
      icon: <FileText className="h-8 w-8" />,
      title: "DOCUMENTAÇÃO",
      subtitle: "Documentação automática",
      description: "pitch deck, resumo executivo e plano de negócios."
    },
    {
      number: "03",
      icon: <BarChart3 className="h-8 w-8" />,
      title: "SCORE E VALUATION",
      subtitle: "Avaliação objetiva",
      description: "e valor estimado em tempo real."
    },
    {
      number: "04",
      icon: <Users className="h-8 w-8" />,
      title: "CAPTAÇÃO",
      subtitle: "Busca de investidores",
      description: "conecte-se com os investidores certos."
    },
    {
      number: "05",
      icon: <Rocket className="h-8 w-8" />,
      title: "LANÇAMENTO",
      subtitle: "MVP e crescimento",
      description: "coloque sua startup no mercado."
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Seu caminho em{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              5 etapas
            </span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card relative group">
              <CardContent className="p-6 text-center">
                <div className="text-6xl font-bold text-primary/20 mb-4">
                  {step.number}
                </div>
                
                <div className="text-primary mb-4 flex justify-center">
                  {step.icon}
                </div>
                
                <h3 className="text-lg font-bold text-primary mb-2">
                  {step.title}
                </h3>
                
                <p className="text-sm font-semibold text-foreground mb-2">
                  {step.subtitle}
                </p>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
              
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary to-secondary transform -translate-y-1/2 z-10" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;