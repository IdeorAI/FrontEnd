import Image from "next/image";

export default function Oportunidade() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Título com destaque em gradiente */}
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 md:mb-4">
          Não perca o{" "}
          <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            timing!
          </span>
        </h2>

        {/* Imagem centralizada e responsiva */}
        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-4xl">
            <Image
              src="/assets/Section_landing_timing.png"
              alt="Não perca o timing - Oportunidade de criar sua startup"
              width={1200}
              height={800}
              className="rounded-2xl w-full h-auto"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
