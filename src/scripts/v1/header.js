/** Header: estado rolado, menu mobile e seção ativa na navegação. */
import { $, $$ } from "../utils/dom.js";

export function initHeader() {
  const header = $(".site-header");
  if (!header) return;
  const toggle = $(".menu-toggle", header);
  const nav = $("#menu-principal");

  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // menu mobile
  if (toggle && nav) {
    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
      header.classList.toggle("menu-open", open);
      document.body.classList.toggle("menu-lock", open);
      if (open) nav.querySelector("a")?.focus();
    };
    toggle.addEventListener("click", () => setMenu(!isOpen()));
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  // seção ativa no menu
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window) || !sections.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) =>
          a.setAttribute("aria-current", a.getAttribute("href") === `#${entry.target.id}` ? "true" : "false"),
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  sections.forEach((s) => io.observe(s));
}
