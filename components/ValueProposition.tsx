import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Zap, Target, Award, Code, FileText } from "lucide-react";

const ValueProposition = () => {
  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      text: "IA que gera, valida e estrutura sua ideia em minutos"
    },
    {
      icon: <Target className="h-6 w-6" />,
      text: "Score: Avaliação automática da sua ideia"
    },
    {
      icon: <Award className="h-6 w-6" />,
      text: "Valuation: descubra quanto vale sua Startup"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      text: "Projeto certificado pela plataforma"
    },
    {
      icon: <Code className="h-6 w-6" />,
      text: "Orientação na criação do MVP (produto mínimo viável)"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      text: "Documentação para busca de investimento"
    }
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Processo guiado por IA
            </span>
            <br />
            do zero a captação
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-primary flex-shrink-0 mt-1">
                    {benefit.icon}
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {benefit.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;