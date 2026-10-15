/**
 * Entradas na rolagem: .rv aparece inteiro; os filhos de .st aparecem em sequência.
 * Marca .in quando o elemento entra na tela (o CSS em motion.css faz a animação).
 */
import { $$, prefersReducedMotion } from "../utils/dom.js";

export function initReveal() {
  const items = [...$$(".rv"), ...$$(".st > *")];
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  // atraso em cascata entre irmãos que entram juntos
  $$(".st").forEach((group) =>
    [...group.children].forEach((el, i) => el.style.setProperty("--i", `${Math.min(i, 5) * 70}ms`)),
  );

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
}
