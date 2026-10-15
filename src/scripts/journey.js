/** Jornada conectada (seção Plataforma): seleção de etapa, painel de detalhe e linha de progresso. */
import { $, $$ } from "./utils/dom.js";

export function initJourney() {
  const journey = $("#journey");
  if (!journey) return;

  const nodes = $$(".jnode", journey);
  const buttons = $$(".jbtn", journey);
  const svg = $(".journey-svg", journey);
  const base = $(".base", svg);
  const prog = $(".prog", svg);
  const detail = {
    idx: $("#j-idx"),
    cat: $("#j-cat"),
    title: $("#j-title"),
    text: $("#j-text"),
    demo: $("#j-demo"),
    demoName: $("#j-demo-name"),
  };
  let current = 0;
  let total = 0;

  // desenha a linha que liga os nós, descendo em 45° na troca de linha da grade
  function buildPath() {
    if (!svg || getComputedStyle(svg).display === "none") return;
    const jr = journey.getBoundingClientRect();
    const pts = nodes.map((n) => {
      const d = $(".jdot", n).getBoundingClientRect();
      return [d.left + d.width / 2 - jr.left, d.top + d.height / 2 - jr.top];
    });
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      if (Math.abs(b[1] - a[1]) < 2) {
        d += ` L${b[0]} ${b[1]}`;
      } else {
        const midY = a[1] + (b[1] - a[1]) / 2;
        const dy = midY - a[1];
        d += ` L${a[0] + 24} ${a[1]} L${a[0] + 24 + dy} ${midY} L${b[0] + dy} ${midY} L${b[0]} ${b[1]}`;
      }
    }
    svg.setAttribute("viewBox", `0 0 ${jr.width} ${jr.height}`);
    base.setAttribute("d", d);
    prog.setAttribute("d", d);
    total = prog.getTotalLength();
    prog.style.setProperty("--len", total);
    // comprimento até cada nó, para acender a linha até a etapa selecionada
    nodes.forEach((n, i) => {
      const target = pts[i];
      let best = 0;
      let bestD = Infinity;
      for (let s = 0; s <= total; s += 6) {
        const p = prog.getPointAtLength(s);
        const dd = Math.abs(p.x - target[0]) + Math.abs(p.y - target[1]);
        if (dd < bestD) {
          bestD = dd;
          best = s;
        }
      }
      n.dataset.len = best;
    });
    paint();
  }

  function paint() {
    if (!total) return;
    const len = Number(nodes[current].dataset.len) || 0;
    prog.style.setProperty("--p", Math.max(0.02, len / total));
  }

  function select(i, focus) {
    current = (i + nodes.length) % nodes.length;
    nodes.forEach((n, k) => {
      n.classList.toggle("on", k === current);
      n.classList.toggle("done", k < current);
      buttons[k].setAttribute("aria-pressed", String(k === current));
    });
    const b = buttons[current];
    detail.idx.textContent = String(current + 1).padStart(2, "0");
    detail.cat.textContent = $(".jnum", b).textContent;
    detail.title.textContent = $("h3", b).textContent;
    detail.text.textContent = $("p", b).textContent;
    const { demo, demoName } = nodes[current].dataset;
    detail.demo.hidden = !demo;
    if (demo) {
      detail.demo.dataset.screen = demo;
      detail.demoName.textContent = demoName;
    }
    paint();
    if (focus) b.focus();
  }

  buttons.forEach((b, i) => {
    b.addEventListener("click", () => select(i));
    // sem seleção por hover: o painel de detalhe fica abaixo dos cartões e o ponteiro passaria por outras etapas
    b.addEventListener("focus", () => select(i));
  });
  $("#j-prev").addEventListener("click", () => select(current - 1, true));
  $("#j-next").addEventListener("click", () => select(current + 1, true));
  select(0);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildPath, 150);
  });
  if (document.fonts?.ready) document.fonts.ready.then(buildPath);
  window.addEventListener("load", buildPath);
}
