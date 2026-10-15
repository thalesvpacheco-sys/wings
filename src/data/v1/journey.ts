import type { ShowcaseScreen } from "./showcase-screens";

/** As 8 etapas da jornada conectada (seção Plataforma). */
export interface JourneyStep {
  category: string;
  title: string;
  text: string;
  /** Tela da demonstração que mostra esta etapa, quando existe. */
  demo?: ShowcaseScreen["id"];
}

export const journey: JourneyStep[] = [
  {
    category: "Estratégia",
    title: "Planejamento e plano de mídia",
    text: "Metas, investimentos, canais, campanhas, cronogramas e indicadores estruturados em um planejamento centralizado.",
    demo: "planejador",
  },
  {
    category: "Operação",
    title: "Gestão de projetos",
    text: "Controle de etapas, tarefas, responsáveis, entregas e prazos para acompanhar cada fase do empreendimento.",
    demo: "cronograma",
  },
  {
    category: "Marketing",
    title: "Campanhas integradas",
    text: "Planeje ações digitais e offline e acompanhe origens de leads, investimentos e resultados por canal.",
    demo: "campanhas",
  },
  {
    category: "Comercial",
    title: "CRM e funil de vendas",
    text: "Centralize leads, contatos, históricos, oportunidades e funis personalizados para cada produto.",
  },
  {
    category: "Atendimento",
    title: "Distribuição de leads",
    text: "Organize equipes por produto, defina filas e regras de distribuição e conecte fluxos ao WhatsApp.",
  },
  {
    category: "Negociação",
    title: "Unidades, simulações e propostas",
    text: "Gerencie disponibilidade, tabelas comerciais, simulações de pagamento e propostas imobiliárias.",
  },
  {
    category: "Integrações",
    title: "Contratos e ERPs",
    text: "Conecte o processo comercial à formalização, documentação e sistemas de gestão do mercado.",
  },
  {
    category: "Inteligência",
    title: "Dashboards e indicadores",
    text: "Acompanhe marketing, atendimento, negociações e vendas para decidir com mais segurança.",
    demo: "visao",
  },
];
