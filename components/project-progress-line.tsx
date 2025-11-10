"use client";

import { Rocket } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectProgressLineProps {
  currentStage: number; // 0 = Início, 1-7 = Etapas, 8 = Concluído
  completedStages: number[]; // Array de etapas completas
}

export function ProjectProgressLine({ currentStage, completedStages }: ProjectProgressLineProps) {
  const stages = [
    { id: 0, label: "Início", shortLabel: "Início" },
    { id: 1, label: "Ideia e\nProblema", shortLabel: "Problema", medalha: null },
    { id: 2, label: "Pesquisa de\nMercado", shortLabel: "Mercado", medalha: { nome: "Visionário", emoji: "🔭" } },
    { id: 3, label: "Proposta de\nValor", shortLabel: "Valor", medalha: null },
    { id: 4, label: "Modelo de\nNegócio", shortLabel: "Modelo", medalha: { nome: "Explorador", emoji: "🗺️" } },
    { id: 5, label: "Definição do\nMVP", shortLabel: "MVP", medalha: null },
    { id: 6, label: "Criação de\nEquipe", shortLabel: "Equipe", medalha: { nome: "Construtor", emoji: "🔨" } },
    { id: 7, label: "Documentação", shortLabel: "Doc.", medalha: null },
    { id: 8, label: "Captação", shortLabel: "Captação", medalha: { nome: "Escalador", emoji: "📈" } },
  ];

  const isCompleted = (stageId: number) => completedStages.includes(stageId);
  const isCurrent = (stageId: number) => stageId === currentStage;

  return (
    <div className="w-full py-8 px-4 bg-gradient-to-r from-background via-primary/5 to-background rounded-lg">
      <div className="max-w-6xl mx-auto">
        {/* Linha principal com círculos */}
        <div className="relative flex items-center justify-between">
          {/* Linha de fundo */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 -z-10" />

          {/* Linha de progresso */}
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {/* Círculos das etapas */}
          {stages.map((stage, index) => {
            const completed = isCompleted(stage.id);
            const current = isCurrent(stage.id);

            return (
              <div key={stage.id} className="relative flex flex-col items-center group">
                {/* Medalha acima do círculo (se existir) */}
                {stage.medalha && completed && (
                  <motion.div
                    className="absolute -top-16 flex flex-col items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                  >
                    <div className="text-3xl mb-1">{stage.medalha.emoji}</div>
                    <div className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                      {stage.medalha.nome}
                    </div>
                  </motion.div>
                )}

                {/* Círculo */}
                <motion.div
                  className={`
                    relative z-10 w-10 h-10 rounded-full border-4 flex items-center justify-center
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
                      initial={{ scale: 0, rotate: -90 }}
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

                {/* Label com quebra de linha */}
                <motion.div
                  className={`
                    mt-3 text-xs font-medium text-center whitespace-pre-line leading-tight
                    transition-colors max-w-[60px]
                    ${
                      completed || current
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  `}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {stage.label}
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
  );
}
