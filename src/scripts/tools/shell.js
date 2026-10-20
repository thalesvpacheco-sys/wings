/**
 * Casca do app: sessão (protege a página e preenche o perfil), sidebar e menu da conta.
 *
 * Sidebar: no desktop fica recolhida nos ícones e abre por cima do conteúdo ao passar o mouse
 * (ou ao receber foco pelo teclado); o botão de menu fixa aberta. No celular é uma gaveta.
 */
import { cachedMember, requireMember, signOut } from "../auth/session.js";
import { initials, roleLabel } from "../../data/team";
import { cachedPhoto, getProfile } from "../data/store.js";
import { paintMemberAvatars } from "./avatar.js";

const MOBILE = window.matchMedia("(max-width: 900px)");
const root = document.documentElement;

/** Papel + empresa (a empresa vem do perfil que a pessoa preenche; sem ela, só o papel). */
const roleLine = (member, company) => (company ? `${roleLabel[member.role]} · ${company}` : roleLabel[member.role]);

function fillMember(member, photoURL, company) {
  const values = {
    name: member.name,
    email: member.email,
    roleCompany: roleLine(member, company),
  };
  document.querySelectorAll("[data-member]").forEach((element) => {
    if (element.dataset.member !== "initials") element.textContent = values[element.dataset.member] ?? "";
  });
  paintMemberAvatars(photoURL, initials(member.name));
}

async function initSession() {
  // Com perfil e foto guardados no aparelho, a página aparece na hora; a sessão é conferida em seguida.
  const cached = cachedMember();
  if (cached) {
    fillMember(cached, cachedPhoto(cached.email));
    root.classList.remove("auth-pending");
  }
  const member = await requireMember();
  if (!member) return;
  fillMember(member, cachedPhoto(member.email));
  root.classList.remove("auth-pending");
  document.dispatchEvent(new CustomEvent("wings:member", { detail: member }));

  // Foto e empresa atuais do banco (podem ter sido trocadas em outro aparelho).
  getProfile(member.email)
    .then((profile) => fillMember(member, profile.photoURL ?? null, profile.company))
    .catch(() => {});
  document.addEventListener("wings:photo", (event) => paintMemberAvatars(event.detail.photoURL, initials(member.name)));
  document.addEventListener("wings:profile", (event) =>
    fillMember(member, event.detail.photoURL ?? null, event.detail.company),
  );
}

function initSidebar(app) {
  const sidebar = app.querySelector("[data-sidebar]");
  const closeDrawer = () => app.classList.remove("sh-mobile-open");

  // Abre ao passar o mouse; um pequeno atraso ao sair evita fechar quando o ponteiro só raspa a borda.
  let timer;
  const open = () => {
    clearTimeout(timer);
    sidebar.classList.add("is-open");
  };
  const close = () => {
    clearTimeout(timer);
    timer = setTimeout(() => sidebar.classList.remove("is-open"), 120);
  };
  sidebar.addEventListener("mouseenter", open);
  sidebar.addEventListener("mouseleave", close);
  sidebar.addEventListener("focusin", open);
  sidebar.addEventListener("focusout", (event) => {
    if (!sidebar.contains(event.relatedTarget)) close();
  });

  app.querySelector("[data-shell-toggle]")?.addEventListener("click", () => {
    if (MOBILE.matches) {
      app.classList.toggle("sh-mobile-open");
      return;
    }
    const pinned = root.classList.toggle("sh-pinned");
    try {
      localStorage.setItem("wings.sidebar", pinned ? "pinned" : "rail");
    } catch {
      /* sem armazenamento: vale só nesta página */
    }
  });
  app.querySelector("[data-shell-scrim]")?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });
}

function initAccountMenu(app) {
  const toggle = app.querySelector("[data-account-toggle]");
  const menu = app.querySelector("[data-account-menu]");
  const setOpen = (value) => {
    menu.hidden = !value;
    toggle.setAttribute("aria-expanded", String(value));
  };
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(menu.hidden);
  });
  document.addEventListener("click", (event) => {
    if (!menu.hidden && !menu.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
  app.querySelectorAll("[data-sign-out]").forEach((button) => button.addEventListener("click", () => signOut()));
}

export function initShell() {
  const app = document.querySelector("[data-shell]");
  if (!app) return;
  initSession();
  initSidebar(app);
  initAccountMenu(app);
}
