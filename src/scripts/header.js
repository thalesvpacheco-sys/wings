/** Header: fundo ao rolar, mega-menu (hover com tolerância, clique, teclado) e menu mobile. */
import { $, $$ } from "./utils/dom.js";

export function initHeader() {
  const header = $("[data-header]");
  if (!header) return;

  const onScroll = () => header.classList.toggle("on", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // mega-menu
  const items = $$("[data-navitem]", header);
  let closeTimer = null;
  const setOpen = (target) => {
    clearTimeout(closeTimer);
    items.forEach((item) => {
      const open = item === target;
      item.classList.toggle("open", open);
      $(".navtrigger", item).setAttribute("aria-expanded", String(open));
    });
  };
  const closeSoon = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setOpen(null), 140);
  };
  items.forEach((item) => {
    const trigger = $(".navtrigger", item);
    item.addEventListener("mouseenter", () => setOpen(item));
    item.addEventListener("mouseleave", closeSoon);
    trigger.addEventListener("click", () => setOpen(item.classList.contains("open") ? null : item));
    trigger.addEventListener("focus", () => setOpen(item));
    item.addEventListener("focusout", (e) => {
      if (!item.contains(e.relatedTarget)) closeSoon();
    });
    $$(".navpanel a", item).forEach((a) => a.addEventListener("click", () => setOpen(null)));
  });

  // menu mobile
  const burger = $("[data-burger]", header);
  const panel = $("#mmenu");
  const setMenu = (open) => {
    if (!burger || !panel) return;
    burger.classList.toggle("x", open);
    burger.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger?.addEventListener("click", () => setMenu(panel.hidden));
  panel?.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) setMenu(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setOpen(null);
    if (panel && !panel.hidden) {
      setMenu(false);
      burger.focus();
    }
  });
}
