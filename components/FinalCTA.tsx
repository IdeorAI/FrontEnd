import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Pronto para tirar sua{" "}
          <span className="bg-gradient-hero bg-clip-text text-transparent">
            ideia do papel?
          </span>
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Leva menos de 2 minutos para criar seu primeiro projeto.
        </p>
        
        <Button 
          size="lg" 
          className="text-lg px-8 py-4 bg-gradient-hero hover:shadow-glow transition-all duration-300 transform hover:scale-105"
        >
          Começar agora grátis
        </Button>
      </div>
    </section>
  );
};

export default FinalCTA;