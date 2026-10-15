/**
 * Alternância de conteúdo: um grupo [data-switch] com botões [data-switch-tab="n"] e painéis [data-switch-panel="n"].
 * Usado em "Um dia na operação", "Para quem é" e "Método MICCA". Todos os painéis já vêm no HTML.
 * [data-switch-progress] recebe --tl (0 a 1) com a posição do item escolhido.
 */
import { $, $$ } from "./utils/dom.js";

export function initSwitchers() {
  $$("[data-switch]").forEach((group) => {
    const tabs = $$("[data-switch-tab]", group);
    const panels = $$("[data-switch-panel]", group);
    const progress = $("[data-switch-progress]", group);

    const select = (i) => {
      tabs.forEach((t, k) => {
        t.classList.toggle("on", k === i);
        t.setAttribute("aria-pressed", String(k === i));
      });
      panels.forEach((p, k) => (p.hidden = k !== i));
      progress?.style.setProperty("--tl", String(tabs.length > 1 ? i / (tabs.length - 1) : 0));
    };
    tabs.forEach((t, i) => t.addEventListener("click", () => select(i)));
  });
}
