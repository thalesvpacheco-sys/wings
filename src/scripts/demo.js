/** Demonstração: as abas de cima e a barra lateral da janela trocam a mesma tela. */
import { $, $$ } from "./utils/dom.js";

export function initDemo() {
  const root = $("[data-demo]");
  if (!root) return;
  const buttons = $$("[data-tab]", root);
  const panels = $$("[data-panel]", root);
  // atalhos da barra lateral (Estratégia, Mídia digital) abrem uma tela, mas não ficam marcados
  const markable = buttons.filter((b) => !("shortcut" in b.dataset));

  const select = (key) => {
    markable.forEach((b) => {
      const on = b.dataset.tab === key;
      b.classList.toggle("on", on);
      if (b.classList.contains("tab")) b.setAttribute("aria-pressed", String(on));
    });
    panels.forEach((p) => (p.hidden = p.dataset.panel !== key));
  };
  buttons.forEach((b) => b.addEventListener("click", () => select(b.dataset.tab)));
}
