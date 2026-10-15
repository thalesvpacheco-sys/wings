import type { IconName } from "../../components/v1/ui/icons";

/** Conteúdo em lista das seções Para quem é, Método MICCA e Muito além. */

export const audiences = [
  {
    segment: "Incorporadoras e construtoras",
    title: "Da estratégia à última unidade vendida.",
    text: "Centralize lançamentos, coordene equipes, acompanhe investimentos e controle o desempenho comercial com uma visão única de gestão.",
    signature: "Mais previsibilidade para decidir. Mais eficiência para executar.",
  },
  {
    segment: "Loteadoras",
    title: "Grandes projetos exigem gestão à altura.",
    text: "Organize campanhas, equipes, disponibilidade de lotes, propostas e negociações em todas as fases da comercialização.",
    signature: "Do primeiro lead à venda do último lote.",
  },
  {
    segment: "Imobiliárias",
    title: "Mais oportunidades, melhor aproveitadas.",
    text: "Crie operações por empreendimento, funis sob medida, equipes de especialistas e distribuição inteligente de leads.",
    signature: "Mais gestão para a equipe. Mais negócios para a imobiliária.",
  },
];

export const miccaPillars = [
  { letter: "M", name: "Meta", text: "Objetivos e indicadores claros." },
  { letter: "I", name: "Investimento", text: "Recursos planejados com inteligência." },
  { letter: "C", name: "Conteúdo", text: "Comunicação alinhada ao público e ao produto." },
  { letter: "C", name: "Canais", text: "Pontos de contato conectados." },
  { letter: "A", name: "Atendimento", text: "Oportunidades acompanhadas até a conversão." },
];

export interface Benefit {
  icon: IconName;
  title: string;
  text: string;
  /** Classes de tamanho e cor do bloco no bento: wide, center, navy, royal. */
  variant?: string;
}

export const benefits: Benefit[] = [
  {
    icon: "centralize",
    title: "Centralização",
    text: "Informações, projetos e processos em um único ambiente.",
    variant: "wide navy",
  },
  {
    icon: "productivity",
    title: "Produtividade",
    text: "Menos tarefas manuais e mais eficiência entre equipes.",
    variant: "wide",
  },
  { icon: "chart", title: "Previsibilidade", text: "Indicadores para orientar decisões e antecipar gargalos." },
  {
    icon: "integration",
    title: "Integração",
    text: "Marketing, gestão e comercial trabalhando juntos.",
    variant: "royal",
  },
  { icon: "performance", title: "Performance", text: "Visibilidade sobre investimentos, oportunidades e conversões." },
  {
    icon: "control",
    title: "Controle",
    text: "Uma visão estratégica de cada empreendimento e de toda a operação.",
    variant: "wide center",
  },
];
