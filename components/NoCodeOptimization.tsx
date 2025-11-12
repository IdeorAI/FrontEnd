import Image from "next/image";

export default function NoCodeOptimization() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Título com destaque em gradiente */}
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 md:mb-16 leading-tight">
          Tudo para criar sua Startup em{" "}
          <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            plataformas no-code
          </span>
        </h2>

        {/* Logos das plataformas no-code */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {/* Base44 */}
          <div className="transition-transform hover:scale-110 duration-300">
            <Image
              src="/assets/icon3/base44.png"
              alt="Base44 - Plataforma No-Code"
              width={140}
              height={50}
              className="h-10 md:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Bubble */}
          <div className="transition-transform hover:scale-110 duration-300">
            <Image
              src="/assets/icon3/bubble.png"
              alt="Bubble - Plataforma No-Code"
              width={140}
              height={50}
              className="h-10 md:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Glide */}
          <div className="transition-transform hover:scale-110 duration-300">
            <Image
              src="/assets/icon3/glide.png"
              alt="Glide - Plataforma No-Code"
              width={140}
              height={50}
              className="h-10 md:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Lovable */}
          <div className="transition-transform hover:scale-110 duration-300">
            <Image
              src="/assets/icon3/lovable.png"
              alt="Lovable - Plataforma No-Code"
              width={140}
              height={50}
              className="h-10 md:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Texto "Entre outros..." */}
          <div className="w-full md:w-auto text-center md:text-left mt-4 md:mt-0">
            <span className="text-gray-700 dark:text-gray-400 text-lg md:text-xl italic font-light">
              Entre outras…
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
