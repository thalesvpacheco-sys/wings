/** Hero: entrada animada e palco 3D que reage ao ponteiro e à rolagem. */
import { $, hasFinePointer, prefersReducedMotion } from "./utils/dom.js";

export function initHero() {
  const hero = $(".hero");
  if (!hero) return;
  const rig = $("#stage-rig");
  const connector = $("#hero-connector");
  const reduce = prefersReducedMotion();

  // comprimento real da linha para a animação de traço
  if (connector) {
    try {
      const length = Math.ceil(connector.getTotalLength());
      connector.style.setProperty("--len", length);
      connector.parentNode.style.setProperty("--len", length);
    } catch {
      /* SVG ainda sem layout: mantém o valor padrão do CSS */
    }
  }
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("ready")));

  if (!rig || reduce) return;

  let mx = 0;
  let my = 0;
  let ticking = false;

  const apply = () => {
    ticking = false;
    const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.9)));
    const rx = 10 - p * 8 + my * -4;
    const ry = -18 + p * 12 + mx * 6;
    rig.style.transform = `translate3d(0,${p * -40}px,${p * 120}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${(2 - p * 2).toFixed(2)}deg)`;
    // opacidade no palco (pai), não no rig: opacidade no elemento 3D achataria a profundidade
    rig.parentNode.style.opacity = String(1 - p * 0.55);
  };
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(apply);
    }
  };

  rig.style.transition = "transform 160ms linear";
  if (hasFinePointer()) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      request();
    });
  }
  hero.addEventListener("pointerleave", () => {
    mx = 0;
    my = 0;
    request();
  });
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY < window.innerHeight * 1.2) request();
    },
    { passive: true },
  );
}
