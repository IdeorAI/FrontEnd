// components/VideoTeaser.tsx
"use client";

import { Play } from "lucide-react";

export default function VideoTeaser() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Veja como a{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              IdeorAI funciona
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra como transformamos sua ideia em uma startup de sucesso,
            passo a passo, com a inteligência artificial ao seu lado.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-muted/10 backdrop-blur-sm border border-border/50">
            <video
              controls
              preload="metadata"
              className="w-full h-full object-cover"
              poster="/assets/video-poster.jpg"
            >
              <source
                src="/assets/teaser_subtitle_pt.mp4"
                type="video/mp4"
              />
              Seu navegador não suporta o elemento de vídeo.
            </video>

            {/* Decorative gradient overlay on edges */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/10 via-transparent to-background/10" />
          </div>

          {/* Optional: Play indicator overlay (only visible before playing) */}
          <div className="flex items-center justify-center mt-8 gap-2 text-muted-foreground">
            <Play className="h-5 w-5" />
            <p className="text-sm">
              Assista ao vídeo e conheça a plataforma completa
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
