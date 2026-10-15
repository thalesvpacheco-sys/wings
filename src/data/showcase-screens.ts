import type { IconName } from "../components/ui/icons";

/** Telas da demonstração interativa: alimentam o menu lateral, a barra da aplicação e os links da jornada. */
export interface ShowcaseScreen {
  id: "visao" | "processos" | "planejador" | "campanhas" | "estrategia" | "cronograma" | "midia";
  label: string;
  context: string;
  icon: IconName;
  /** Quantidade exibida na barra lateral da aplicação. */
  count?: number;
}

export const showcaseScreens: ShowcaseScreen[] = [
  { id: "visao", label: "Visão geral", context: "Seu lançamento, em perspectiva.", icon: "chart" },
  {
    id: "processos",
    label: "Processos",
    context: "Trajetória das tarefas, mensagens, correções e decisões ao longo dos dias.",
    icon: "process",
  },
  {
    id: "planejador",
    label: "Planejador MICCA",
    context: "Plano integrado de canais, orçamento, cronograma e funil comercial.",
    icon: "planner",
  },
  {
    id: "campanhas",
    label: "Campanhas e aprovações",
    context: "Planejamento, revisão interna de artes e acompanhamento das campanhas em veiculação.",
    icon: "megaphone",
  },
  {
    id: "estrategia",
    label: "Estratégia",
    context: "Etapas do lançamento com período, status e conclusão, em lista ou Kanban.",
    icon: "strategy",
    count: 7,
  },
  {
    id: "cronograma",
    label: "Cronograma",
    context: "Ações e produções com prazos, responsáveis e progresso, em lista ou Kanban.",
    icon: "schedule",
    count: 14,
  },
  {
    id: "midia",
    label: "Mídia digital",
    context: "Campanhas digitais com período, investimento e status de cada registro.",
    icon: "media",
    count: 6,
  },
];

export const screenLabel = (id: ShowcaseScreen["id"]) => showcaseScreens.find((s) => s.id === id)?.label ?? "";
