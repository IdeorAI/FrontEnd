import Image from "next/image";

export default function Oportunidade() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Título com destaque em gradiente */}
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 md:mb-16">
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
              className="rounded-2xl shadow-2xl w-full h-auto"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
