/** Brilho que acompanha o cursor nos cards marcados com [data-spot]. */
import { $$, hasFinePointer } from "./utils/dom.js";

export function initSpotlight() {
  if (!hasFinePointer()) return;
  $$("[data-spot]").forEach((el) =>
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }),
  );
}
