/** Revelações na rolagem ([data-reveal]) e fragmentos que se conectam (seção Por que WingsBr). */
import { $, $$, prefersReducedMotion } from "../utils/dom.js";

export function initReveal() {
  const elements = $$("[data-reveal]");
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  elements.forEach((el) => io.observe(el));
  // garantia: nada fica invisível se o observador falhar
  setTimeout(() => {
    elements.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
    });
  }, 2500);
}

export function initFragments() {
  const frag = $("#frag");
  if (!frag) return;
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    frag.classList.add("connected");
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      setTimeout(() => frag.classList.add("connected"), 350);
      io.disconnect();
    },
    { threshold: 0.6 },
  );
  io.observe(frag);
}
