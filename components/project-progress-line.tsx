"use client";

import { Rocket } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ProjectProgressLineProps {
  currentStage: number; // 0 = Início, 1-7 = Etapas, 8 = Concluído
  completedStages: number[]; // Array de etapas completas
}

export function ProjectProgressLine({ currentStage, completedStages }: ProjectProgressLineProps) {
  const stages = [
    { id: 0, label: "Início", shortLabel: "Início" },
    { id: 1, label: "Ideia e\nProblema", shortLabel: "Problema", medalha: null },
    {
      id: 2,
      label: "Pesquisa de\nMercado",
      shortLabel: "Mercado",
      medalha: {
        nome: "Visionário",
        badge: "/assets/badges/badge_visionario.png",
        badgePendente: "/assets/badges/badge_visionário PENDENTE.png",
        color: "text-cyan-400"
      }
    },
    { id: 3, label: "Proposta de\nValor", shortLabel: "Valor", medalha: null },
    {
      id: 4,
      label: "Modelo de\nNegócio",
      shortLabel: "Modelo",
      medalha: {
        nome: "Explorador",
        badge: "/assets/badges/badge_explorador.png",
        badgePendente: "/assets/badges/badge_explorador PENDENTE.png",
        color: "text-rose-600"
      }
    },
    { id: 5, label: "Definição do\nMVP", shortLabel: "MVP", medalha: null },
    {
      id: 6,
      label: "Criação de\nEquipe",
      shortLabel: "Equipe",
      medalha: {
        nome: "Construtor",
        badge: "/assets/badges/badge_construtor.png",
        badgePendente: "/assets/badges/badge_construtor PENDENTE.png",
        color: "text-green-500"
      }
    },
    { id: 7, label: "Documentação", shortLabel: "Doc.", medalha: null },
    {
      id: 8,
      label: "Captação",
      shortLabel: "Captação",
      medalha: {
        nome: "Escalador",
        badge: "/assets/badges/badge_escalador.png",
        badgePendente: "/assets/badges/badge_escalador PENDENTE.png",
        color: "text-pink-500"
      }
    },
  ];

  const isCompleted = (stageId: number) => completedStages.includes(stageId);
  const isCurrent = (stageId: number) => stageId === currentStage;

  return (
    <>
      {/* Versão Desktop */}
      <div className="hidden md:block w-full py-8 px-4 bg-gradient-to-r from-background via-primary/5 to-background rounded-lg">
        <div className="max-w-6xl mx-auto">
          {/* Linha principal com círculos */}
          <div className="relative flex items-center justify-between">
            {/* Linha de fundo */}
            <div className="absolute top-[60px] left-0 right-0 h-1 bg-muted -z-10" />

            {/* Linha de progresso */}
            <motion.div
              className="absolute top-[60px] left-0 h-1 bg-primary -z-10"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Círculos das etapas */}
            {stages.map((stage, index) => {
              const completed = isCompleted(stage.id);
              const current = isCurrent(stage.id);

              return (
                <div key={stage.id} className="relative flex flex-col items-center group" style={{ width: '70px' }}>
                  {/* Medalha acima do círculo (sempre visível) - Aproximada dos círculos */}
                  {stage.medalha && (
                    <motion.div
                      className="absolute -top-12 flex flex-col items-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                    >
                      <div className="mb-1">
                        <Image
                          src={completed ? stage.medalha.badge : stage.medalha.badgePendente}
                          alt={stage.medalha.nome}
                          width={27}
                          height={27}
                          className="object-contain transition-all duration-300"
                        />
                      </div>
                      <div
                        className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap transition-all duration-300 ${
                          completed
                            ? `${stage.medalha.color} bg-primary/10`
                            : 'text-muted-foreground bg-muted/30 opacity-50'
                        }`}
                      >
                        {stage.medalha.nome}
                      </div>
                    </motion.div>
                  )}

                  {/* Círculo - sempre na mesma posição vertical */}
                  <div className="flex items-center justify-center" style={{ height: '60px' }}>
                    <motion.div
                      className={`
                        w-10 h-10 rounded-full border-4 flex items-center justify-center
                        transition-all duration-300 cursor-pointer
                        ${
                          completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : current
                            ? "bg-background border-primary animate-pulse"
                            : "bg-background border-muted"
                        }
                      `}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {current && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                          {/* Foguete horizontal apontando para direita */}
                          <Rocket className="h-5 w-5 text-primary rotate-45" />
                        </motion.div>
                      )}
                      {completed && !current && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {!completed && !current && (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {stage.id}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  {/* Label com quebra de linha - altura fixa */}
                  <motion.div
                    className="flex items-center justify-center text-center"
                    style={{ height: '48px', marginTop: '8px' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <div className={`
                      text-xs font-medium whitespace-pre-line leading-tight
                      transition-colors
                      ${
                        completed || current
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    `}>
                      {stage.label}
                    </div>
                  </motion.div>

                  {/* Tooltip on hover */}
                  <div
                    className="
                      absolute -top-12 left-1/2 -translate-x-1/2
                      px-3 py-1 bg-popover text-popover-foreground text-xs rounded-md
                      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                      shadow-lg border whitespace-nowrap z-50
                    "
                  >
                    {completed ? "Concluída" : current ? "Em progresso" : "Pendente"}
                    {stage.medalha && completed && ` • ${stage.medalha.nome}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Versão Mobile - Barra Simplificada */}
      <div className="md:hidden w-full py-6 px-4 bg-gradient-to-r from-background via-primary/5 to-background rounded-lg">
        <div className="space-y-4">
          {/* Barra de progresso */}
          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${(completedStages.length / stages.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          {/* Informação de progresso */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary rotate-90" />
              <span className="font-semibold text-foreground">
                {stages[currentStage]?.shortLabel || "Captação"}
              </span>
            </div>
            <span className="text-muted-foreground">
              {completedStages.length} / {stages.length}
            </span>
          </div>

          {/* Lista de etapas (colapsável) */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-primary hover:underline flex items-center justify-between">
              <span>Ver todas as etapas</span>
              <svg
                className="w-4 h-4 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-3 space-y-2">
              {stages.map((stage) => {
                const completed = isCompleted(stage.id);
                const current = isCurrent(stage.id);

                return (
                  <div
                    key={stage.id}
                    className={`
                      flex items-center gap-3 p-2 rounded-md transition-colors
                      ${current ? 'bg-primary/10' : ''}
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${completed ? 'bg-primary border-primary' : 'border-muted'}
                    `}>
                      {completed && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {current && !completed && (
                        <Rocket className="h-3 w-3 text-primary rotate-90" />
                      )}
                    </div>
                    <span className={`text-sm ${completed || current ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {stage.shortLabel}
                    </span>
                    {stage.medalha && (
                      <Image
                        src={completed ? stage.medalha.badge : stage.medalha.badgePendente}
                        alt={stage.medalha.nome}
                        width={20}
                        height={20}
                        className="ml-auto object-contain"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        </div>
      </div>
    </>
  );
}
