/** Navegação e contato da versão principal (v1). */
export { demoWhatsapp, site } from "../site";

export interface NavLink {
  label: string;
  href: string;
}

export const mainNav: NavLink[] = [
  { label: "Plataforma", href: "#plataforma" },
  { label: "Soluções", href: "#solucoes" },
  { label: "Método MICCA", href: "#micca" },
  { label: "Quem somos", href: "#sobre" },
];

export const footerNav: NavLink[] = [
  { label: "Plataforma", href: "#plataforma" },
  { label: "Demonstração", href: "#produto" },
  { label: "Soluções", href: "#solucoes" },
  { label: "Método MICCA", href: "#micca" },
  { label: "Quem somos", href: "#sobre" },
];
