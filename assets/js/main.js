/* WingsBr — comportamento do site (sem dependências).
   Movimento: revela, conecta e aproxima. Respeita prefers-reduced-motion; nada essencial depende de animação. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  var year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  // ---------------------------------------------------------------- header
  var header = $(".site-header");
  var toggle = $(".menu-toggle"), nav = $("#menu-principal");
  function onScrollHeader() { header.classList.toggle("scrolled", window.scrollY > 24); }
  onScrollHeader();
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", open);
    nav.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    doc.body.classList.toggle("menu-lock", open);
    if (open) { var first = nav.querySelector("a"); if (first) first.focus(); }
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); } });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) setMenu(false); });
  }

  // seção ativa no menu
  var navLinks = $$('.nav a[href^="#"]:not(.btn)');
  var sections = navLinks.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) navLinks.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id ? "true" : "false"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  // ---------------------------------------------------------------- hero
  var hero = $(".hero"), rig = $("#stage-rig"), conn = $("#hero-connector");
  if (conn) { try { var L = conn.getTotalLength(); conn.style.setProperty("--len", Math.ceil(L)); conn.parentNode.style.setProperty("--len", Math.ceil(L)); } catch (e) {} }
  requestAnimationFrame(function () { requestAnimationFrame(function () { if (hero) hero.classList.add("ready"); }); });

  var mx = 0, my = 0, sy = 0, ticking = false;
  function applyRig() {
    ticking = false;
    if (!rig || reduce) return;
    var p = Math.min(1, Math.max(0, sy / (hero.offsetHeight * 0.9)));
    var rx = 10 - p * 8 + my * -4, ry = -18 + p * 12 + mx * 6;
    rig.style.transform = "translate3d(0," + (p * -40) + "px," + (p * 120) + "px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) rotateZ(" + (2 - p * 2).toFixed(2) + "deg)";
    // opacidade no palco (pai), não no rig: opacidade no elemento 3D achataria a profundidade
    rig.parentNode.style.opacity = String(1 - p * 0.55);
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(applyRig); } }
  if (rig && !reduce) {
    rig.style.transition = "transform 160ms linear";
    if (finePointer) hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; req();
    });
    hero.addEventListener("pointerleave", function () { mx = 0; my = 0; req(); });
  }

  // ---------------------------------------------------------------- revelações
  var revealEls = $$("[data-reveal]");
  if (!reduce && "IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { rio.observe(el); });
    // garantia: nada fica invisível se o observador falhar
    setTimeout(function () { revealEls.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in"); }); }, 2500);
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // fragmentos → linha conectada (Por que WingsBr?)
  var frag = $("#frag");
  if (frag) {
    if (reduce || !("IntersectionObserver" in window)) frag.classList.add("connected");
    else {
      var fio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { setTimeout(function () { frag.classList.add("connected"); }, 350); fio.disconnect(); } }, { threshold: 0.6 });
      fio.observe(frag);
    }
  }

  // ---------------------------------------------------------------- jornada conectada
  var journey = $("#journey");
  if (journey) {
    var nodes = $$(".jnode", journey), btns = $$(".jbtn", journey);
    var svg = $(".journey-svg", journey), base = $(".base", svg), prog = $(".prog", svg);
    var idx = $("#j-idx"), cat = $("#j-cat"), title = $("#j-title"), text = $("#j-text"), demo = $("#j-demo"), demoName = $("#j-demo-name");
    var current = 0, total = 0;
    var DEMO_NAMES = { planejador: "Planejador MICCA", cronograma: "Cronograma", campanhas: "Campanhas e aprovações", visao: "Visão geral" };

    function buildPath() {
      if (!svg || getComputedStyle(svg).display === "none") return;
      var jr = journey.getBoundingClientRect();
      var pts = nodes.map(function (n) { var d = $(".jdot", n).getBoundingClientRect(); return [d.left + d.width / 2 - jr.left, d.top + d.height / 2 - jr.top]; });
      var d = "M" + pts[0][0] + " " + pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        if (Math.abs(b[1] - a[1]) < 2) d += " L" + b[0] + " " + b[1];
        else { // troca de linha: desce e volta em ângulos de 45°
          var midY = a[1] + (b[1] - a[1]) / 2, dy = midY - a[1];
          d += " L" + (a[0] + 24) + " " + a[1] + " L" + (a[0] + 24 + dy) + " " + midY + " L" + (b[0] + dy) + " " + midY + " L" + b[0] + " " + b[1];
        }
      }
      svg.setAttribute("viewBox", "0 0 " + jr.width + " " + jr.height);
      base.setAttribute("d", d); prog.setAttribute("d", d);
      total = prog.getTotalLength();
      prog.style.setProperty("--len", total);
      // comprimento até cada nó, para acender a linha até a etapa selecionada
      nodes.forEach(function (n, i) {
        var target = pts[i], best = 0, bestD = 1e9;
        for (var s = 0; s <= total; s += 6) { var p = prog.getPointAtLength(s); var dd = Math.abs(p.x - target[0]) + Math.abs(p.y - target[1]); if (dd < bestD) { bestD = dd; best = s; } }
        n.dataset.len = best;
      });
      paint();
    }
    function paint() {
      if (!total) return;
      var len = +nodes[current].dataset.len || 0;
      prog.style.setProperty("--p", Math.max(0.02, len / total));
    }
    function select(i, focus) {
      current = (i + nodes.length) % nodes.length;
      nodes.forEach(function (n, k) { n.classList.toggle("on", k === current); n.classList.toggle("done", k < current); btns[k].setAttribute("aria-pressed", k === current); });
      var b = btns[current];
      idx.textContent = (current + 1 < 10 ? "0" : "") + (current + 1);
      cat.textContent = $(".jnum", b).textContent;
      title.textContent = $("h3", b).textContent;
      text.textContent = $("p", b).textContent;
      var dm = nodes[current].dataset.demo;
      if (dm) { demo.hidden = false; demo.dataset.screen = dm; demoName.textContent = DEMO_NAMES[dm]; } else { demo.hidden = true; }
      paint();
      if (focus) b.focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i); });
      // sem seleção por hover: o painel de detalhe fica abaixo dos cartões e o ponteiro passaria por outras etapas
      b.addEventListener("focus", function () { select(i); });
    });
    $("#j-prev").addEventListener("click", function () { select(current - 1, true); });
    $("#j-next").addEventListener("click", function () { select(current + 1, true); });
    select(0);
    var rT; window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(buildPath, 150); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(buildPath); else window.addEventListener("load", buildPath);
    window.addEventListener("load", buildPath);
  }

  // ---------------------------------------------------------------- scroll
  window.addEventListener("scroll", function () { sy = window.scrollY; onScrollHeader(); if (sy < window.innerHeight * 1.2) req(); }, { passive: true });

  // links que abrem uma tela da demonstração (jornada, MICCA): rolagem já é feita pela âncora
})();
