/**
 * Apps embutidos (Orçamento): o iframe ocupa a área de conteúdo inteira e o app fica em modo "embed"
 * (sem repetir a logo que a topbar já mostra, tema claro), sem precisar mexer no arquivo do app.
 */
import { logActivity } from "./activity.js";

export function initAppFrame() {
  const frame = document.querySelector("[data-app-frame]");
  if (!frame) return;
  document.querySelector(".sh-main")?.classList.add("has-app");

  frame.addEventListener("load", () => {
    try {
      const root = frame.contentDocument.documentElement;
      root.classList.add("embed");
      root.setAttribute("data-theme", "light");
    } catch {
      /* outro domínio: o app aparece como é */
    }
  });

  logActivity({ text: "Abriu o gerador de orçamento", tool: "orcamento" });
}
