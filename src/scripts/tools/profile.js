/**
 * Meu perfil: preenche os dados da pessoa logada, a foto, o "Editar perfil" e as abas (visão geral,
 * atividade, arquivos) a partir do histórico em activity.js. "Sair" fica com a casca (shell.js).
 * Perfil, foto e histórico vêm do store (Firestore/Storage, ou o navegador no modo de teste).
 */
import { mode, resetPassword } from "../auth/session.js";
import { editableFields, initials, roleLabel, team } from "../../data/team";
import { budget, toolHref, tools } from "../../data/tools/catalog";
import { toolIcons } from "../../components/tools/icons";
import { getProfile, removePhoto, saveProfile, uploadPhoto } from "../data/store.js";
import { readActivity, toolIcon, toolTitle } from "./activity.js";
import { announcePhoto, paintAvatar } from "./avatar.js";
import { $, $$, escapeHtml, formatBytes } from "./utils.js";

/* ── Perfil editável ───────────────────────────────────────────── */

/** Só os campos editáveis, sempre como texto (vazio quando a pessoa não preencheu). */
const editable = (saved) => Object.fromEntries(editableFields.map((field) => [field, (saved?.[field] ?? "").trim()]));

/* ── Formatação ────────────────────────────────────────────────── */

function icon(name, size = 16) {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor" width="${size}" height="${size}" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="${toolIcons[name] ?? toolIcons.home}"/></svg>`;
}

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const time = (at) => new Date(at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

function relative(at) {
  const diff = (Date.now() - at) / 1000;
  if (diff < 60) return "agora há pouco";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  const date = new Date(at);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (dayKey(date) === dayKey(today)) return `hoje às ${time(at)}`;
  if (dayKey(date) === dayKey(yesterday)) return `ontem às ${time(at)}`;
  return `${date.getDate()} de ${MONTHS_SHORT[date.getMonth()]}${date.getFullYear() !== today.getFullYear() ? ` de ${date.getFullYear()}` : ""}`;
}

function dayLabel(date) {
  const today = new Date();
  if (dayKey(date) === dayKey(today)) return "Hoje";
  if (dayKey(date) === dayKey(new Date(Date.now() - 86400000))) return "Ontem";
  return `${date.getDate()} de ${MONTHS[date.getMonth()]}${date.getFullYear() !== today.getFullYear() ? ` de ${date.getFullYear()}` : ""}`;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** Links do perfil: aceita "@usuario", "usuario" ou a URL completa. */
const linkFor = {
  site: (value) => ({
    href: /^https?:\/\//i.test(value) ? value : `https://${value}`,
    label: value.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
  }),
  instagram: (value) => {
    const handle = value
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@/, "")
      .replace(/\/$/, "");
    return { href: `https://instagram.com/${handle}`, label: `@${handle}` };
  },
  linkedin: (value) => {
    const path = value.replace(/^https?:\/\/(www\.)?linkedin\.com\//i, "").replace(/\/$/, "");
    const slug = path.startsWith("in/") || path.startsWith("company/") ? path : `in/${path}`;
    return { href: `https://linkedin.com/${slug}`, label: `linkedin.com/${slug}` };
  },
  phone: (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
    return { href: `https://wa.me/${digits}`, label: value };
  },
};

/* ── Lado da pessoa ────────────────────────────────────────────── */

function renderSide(member, profile) {
  const bio = $("[data-profile='bio']");
  bio.textContent = profile.bio || "Sem descrição ainda. Use “Editar perfil” para contar o que você faz no Wings.";
  bio.classList.toggle("is-empty", !profile.bio);

  const role = escapeHtml(roleLabel[member.role]);
  const rows = [
    { icon: "building", html: profile.company ? `${role} · <b>${escapeHtml(profile.company)}</b>` : role },
    profile.title && { icon: "user", html: escapeHtml(profile.title) },
    profile.phone && { icon: "phone", link: linkFor.phone(profile.phone) },
    profile.site && { icon: "globe", link: linkFor.site(profile.site) },
    profile.instagram && { icon: "link", link: linkFor.instagram(profile.instagram), prefix: "Instagram" },
    profile.linkedin && { icon: "link", link: linkFor.linkedin(profile.linkedin), prefix: "LinkedIn" },
  ].filter(Boolean);

  $("[data-meta]").innerHTML = rows
    .map((row) => {
      const content = row.link
        ? `<a href="${escapeHtml(row.link.href)}" target="_blank" rel="noopener">${escapeHtml(row.link.label)}</a>`
        : row.html;
      return `<li>${icon(row.icon)}<span>${content}</span></li>`;
    })
    .join("");

  $$(".pf-team li").forEach((item) => {
    const isYou = item.dataset.email.toLowerCase() === member.email.toLowerCase();
    item.classList.toggle("is-you", isYou);
    $(".pf-you", item).hidden = !isYou;
    if (!isYou) return;
    // O próprio avatar na equipe segue a foto do usuário, como a topbar e a sidebar.
    $("[data-avatar]", item).dataset.member = "initials";
    const label = roleLabel[member.role];
    $("[data-team-line]", item).textContent = profile.company ? `${label} · ${profile.company}` : label;
  });
}

/** Liga o "Editar perfil". getCurrent devolve os campos atuais; onSave recebe os novos valores. */
function initEditing(getCurrent, onSave) {
  const view = $("[data-view]");
  const form = $("[data-edit-form]");
  const bioCount = $("[data-bio-count]");
  const submit = form.querySelector("[type=submit]");

  const open = () => {
    const profile = getCurrent();
    editableFields.forEach((field) => (form.elements[field].value = profile[field]));
    bioCount.textContent = profile.bio.length;
    view.hidden = true;
    form.hidden = false;
    form.elements.bio.focus();
  };
  const close = () => {
    form.hidden = true;
    view.hidden = false;
  };

  $("[data-edit]").addEventListener("click", open);
  $("[data-cancel]").addEventListener("click", close);
  form.elements.bio.addEventListener("input", () => (bioCount.textContent = form.elements.bio.value.length));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(editableFields.map((field) => [field, form.elements[field].value.trim()]));
    submit.disabled = true;
    try {
      await onSave(values);
      close();
    } catch (error) {
      console.warn("[wings] não foi possível salvar o perfil:", error);
      alertStatus("Não foi possível salvar. Confira a conexão e tente de novo.");
    } finally {
      submit.disabled = false;
    }
  });
}

/* ── Foto ──────────────────────────────────────────────────────── */

function alertStatus(text) {
  const status = $("[data-photo-status]");
  status.hidden = !text;
  status.textContent = text;
}

/** Botão sobre o avatar: menu com "Enviar foto" e "Remover foto". */
function initPhoto(member, getPhoto, onChange) {
  const toggle = $("[data-photo-toggle]");
  const menu = $("[data-photo-menu]");
  const input = $("[data-photo-input]");
  const removeButton = $("[data-photo-remove]");

  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) removeButton.hidden = !getPhoto();
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

  $("[data-photo-upload]").addEventListener("click", () => {
    setOpen(false);
    input.click();
  });
  input.addEventListener("change", async () => {
    const file = input.files[0];
    input.value = "";
    if (!file) return;
    alertStatus("Enviando foto…");
    try {
      const url = await uploadPhoto(member.email, file);
      onChange(url);
      alertStatus("");
    } catch (error) {
      alertStatus(error.message || "Não foi possível enviar a foto.");
    }
  });
  removeButton.addEventListener("click", async () => {
    setOpen(false);
    try {
      await removePhoto(member.email);
      onChange(null);
    } catch {
      alertStatus("Não foi possível remover a foto.");
    }
  });
}

/** Fotos e empresa dos outros admins na lista da equipe. */
async function renderTeam(member) {
  await Promise.all(
    team.map(async (person) => {
      const item = $(`.pf-team li[data-email="${person.email}"]`);
      if (!item) return;
      const saved = person.email === member.email ? null : await getProfile(person.email).catch(() => ({}));
      if (!saved) return;
      paintAvatar($("[data-avatar]", item), { photoURL: saved.photoURL ?? null, initials: initials(person.name) });
      const line = $("[data-team-line]", item);
      line.textContent = saved.company ? `${roleLabel[person.role]} · ${saved.company}` : roleLabel[person.role];
    }),
  );
}

/* ── Visão geral ───────────────────────────────────────────────── */

const catalog = [...tools.map((tool) => ({ ...tool, href: toolHref(tool.slug) })), { ...budget, slug: "orcamento" }];

function renderPins(entries) {
  const uses = {};
  const last = {};
  for (const entry of entries) {
    if (!entry.tool) continue;
    uses[entry.tool] = (uses[entry.tool] ?? 0) + 1;
    last[entry.tool] ??= entry.at;
  }
  const ranked = catalog.filter((tool) => uses[tool.slug]).sort((a, b) => uses[b.slug] - uses[a.slug]);
  // Sem histórico suficiente, completa com as mais úteis para quem está começando.
  for (const slug of ["orcamento", "qr-code", "link-de-whatsapp", "gerador-de-utm"]) {
    if (ranked.length >= 4) break;
    if (!ranked.some((tool) => tool.slug === slug)) ranked.push(catalog.find((tool) => tool.slug === slug));
  }

  $("[data-pins]").innerHTML = ranked
    .slice(0, 4)
    .map((tool) => {
      const count = uses[tool.slug] ?? 0;
      return `<article class="pf-card pf-pin">
        <div class="pf-pin-head">
          <span class="pf-pin-icon">${icon(tool.icon, 16)}</span>
          <a href="${tool.href}">${escapeHtml(tool.title)}</a>
        </div>
        <p>${escapeHtml(tool.description)}</p>
        <div class="pf-pin-foot">
          <span><i class="pf-dot${count ? "" : " is-off"}"></i>${count ? plural(count, "uso", "usos") : "Ainda não usada"}</span>
          ${count ? `<span>${icon("clock", 13)}${relative(last[tool.slug])}</span>` : ""}
        </div>
      </article>`;
    })
    .join("");
}

function level(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function renderHeatmap(entries) {
  const perDay = {};
  for (const entry of entries) {
    const key = dayKey(new Date(entry.at));
    perDay[key] = (perDay[key] ?? 0) + 1;
  }

  // 53 semanas terminando nesta; cada coluna começa no domingo.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - today.getDay() - 52 * 7);

  let cells = "";
  let months = "";
  let total = 0;
  let lastMonth = -1;
  for (let week = 0; week < 53; week++) {
    const first = new Date(start);
    first.setDate(first.getDate() + week * 7);
    if (first.getMonth() !== lastMonth && first.getDate() <= 7) {
      months += `<span style="grid-column:${week + 2}">${MONTHS_SHORT[first.getMonth()]}</span>`;
      lastMonth = first.getMonth();
    }
    for (let day = 0; day < 7; day++) {
      const date = new Date(first);
      date.setDate(date.getDate() + day);
      if (date > today) {
        cells += `<i class="is-future" style="grid-column:${week + 2};grid-row:${day + 2}"></i>`;
        continue;
      }
      const count = perDay[dayKey(date)] ?? 0;
      total += count;
      const tip = `${count ? plural(count, "ação", "ações") : "Nenhuma ação"} em ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
      cells += `<i data-l="${level(count)}" title="${tip}" style="grid-column:${week + 2};grid-row:${day + 2}"></i>`;
    }
  }
  const days = ["", "Seg", "", "Qua", "", "Sex", ""]
    .map((label, i) => `<b style="grid-row:${i + 2}">${label}</b>`)
    .join("");

  $("[data-heat]").innerHTML = `<div class="pf-heat-months">${months}</div>${days}${cells}`;
  $("[data-heat-title]").textContent = `${plural(total, "ação", "ações")} no último ano`;
  const scroll = $("[data-heat-scroll]");
  scroll.scrollLeft = scroll.scrollWidth;
}

function renderTimeline(entries, year) {
  const ofYear = entries.filter((entry) => new Date(entry.at).getFullYear() === year);
  const timeline = $("[data-timeline]");
  if (!ofYear.length) {
    timeline.innerHTML = `<div class="pf-card pf-empty">${icon("clock", 20)}<p>Nenhuma atividade em ${year} ainda.</p><a class="gt-btn-secondary" href="/ferramentas/">Ir para as ferramentas</a></div>`;
    return;
  }

  const byMonth = new Map();
  for (const entry of ofYear) {
    const month = new Date(entry.at).getMonth();
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(entry);
  }

  timeline.innerHTML = [...byMonth]
    .map(([month, list]) => {
      const actions = list.filter((entry) => entry.kind === "action");
      const downloads = list.filter((entry) => entry.kind === "download");
      const logins = list.filter((entry) => entry.kind === "login");
      const perTool = {};
      for (const entry of [...actions, ...downloads])
        if (entry.tool) perTool[entry.tool] = (perTool[entry.tool] ?? 0) + 1;
      const ranked = Object.entries(perTool).sort((a, b) => b[1] - a[1]);
      const max = ranked[0]?.[1] ?? 1;

      const blocks = [];
      if (ranked.length) {
        blocks.push(`<div class="pf-event">
          <span class="pf-event-icon">${icon("home")}</span>
          <div class="pf-event-body">
            <h3>${plural(actions.length + downloads.length, "ação", "ações")} em ${plural(ranked.length, "ferramenta", "ferramentas")}</h3>
            <ul class="pf-bars">${ranked
              .map(
                ([slug, count]) =>
                  `<li><span>${icon(toolIcon(slug), 14)}${escapeHtml(toolTitle(slug))}</span><em>${plural(count, "vez", "vezes")}</em><i style="--w:${Math.max(6, (count / max) * 100)}%"></i></li>`,
              )
              .join("")}</ul>
          </div>
        </div>`);
      }
      if (downloads.length) {
        blocks.push(`<div class="pf-event">
          <span class="pf-event-icon">${icon("download")}</span>
          <div class="pf-event-body">
            <h3>Baixou ${plural(downloads.length, "arquivo", "arquivos")}</h3>
            <ul class="pf-files-mini">${downloads
              .slice(0, 5)
              .map(
                (entry) =>
                  `<li><span>${escapeHtml(entry.file?.name ?? entry.text)}</span><em>${entry.file ? formatBytes(entry.file.size) : ""}</em><time>${relative(entry.at)}</time></li>`,
              )
              .join("")}</ul>
            ${downloads.length > 5 ? `<button class="pf-link-btn" type="button" data-go="arquivos">Ver todos os ${downloads.length}</button>` : ""}
          </div>
        </div>`);
      }
      if (logins.length) {
        blocks.push(`<div class="pf-event">
          <span class="pf-event-icon">${icon("login")}</span>
          <div class="pf-event-body"><h3>Entrou no Wings ${plural(logins.length, "vez", "vezes")}</h3>
          <p class="pf-event-sub">Último acesso ${relative(logins[0].at)}</p></div>
        </div>`);
      }
      const title = `${MONTHS[month][0].toUpperCase()}${MONTHS[month].slice(1)} de ${year}`;
      return `<section class="pf-month"><h3 class="pf-month-title"><span>${title}</span></h3>${blocks.join("")}</section>`;
    })
    .join("");
}

function renderYears(entries, selected, onPick) {
  const years = [...new Set(entries.map((entry) => new Date(entry.at).getFullYear()))].sort((a, b) => b - a);
  if (!years.includes(selected)) years.unshift(selected);
  const box = $("[data-years]");
  box.innerHTML = years
    .map(
      (year) =>
        `<button type="button" class="pf-year" aria-pressed="${year === selected}" data-year="${year}">${year}</button>`,
    )
    .join("");
  box.onclick = (event) => {
    const button = event.target.closest("[data-year]");
    if (button) onPick(Number(button.dataset.year));
  };
}

/* ── Atividade e arquivos ──────────────────────────────────────── */

function renderFeed(entries) {
  const feed = $("[data-feed]");
  if (!entries.length) {
    feed.innerHTML = `<div class="pf-card pf-empty">${icon("clock", 20)}<p>Ainda não há atividade. Use as ferramentas e tudo o que você fizer aparece aqui.</p></div>`;
    return;
  }
  const byDay = new Map();
  for (const entry of entries) {
    const label = dayLabel(new Date(entry.at));
    if (!byDay.has(label)) byDay.set(label, []);
    byDay.get(label).push(entry);
  }
  feed.innerHTML = [...byDay]
    .map(
      ([label, list]) =>
        `<section class="pf-day"><h3>${label}</h3><ul class="pf-card">${list
          .map((entry) => {
            const kindIcon =
              entry.kind === "download" ? "download" : entry.kind === "login" ? "login" : toolIcon(entry.tool);
            const where = entry.tool ? `<span class="pf-chip">${escapeHtml(toolTitle(entry.tool))}</span>` : "";
            return `<li><span class="pf-feed-icon">${icon(kindIcon, 15)}</span><span class="pf-feed-text">${escapeHtml(entry.text)}</span>${where}<time>${time(entry.at)}</time></li>`;
          })
          .join("")}</ul></section>`,
    )
    .join("");
}

function renderFiles(entries) {
  const downloads = entries.filter((entry) => entry.kind === "download");
  const box = $("[data-files]");
  const total = downloads.reduce((sum, entry) => sum + (entry.file?.size ?? 0), 0);
  $("[data-files-total]").textContent = downloads.length
    ? `${plural(downloads.length, "arquivo", "arquivos")} · ${formatBytes(total)}`
    : "";
  if (!downloads.length) {
    box.innerHTML = `<div class="pf-empty">${icon("download", 20)}<p>Nenhum arquivo baixado ainda. QR Codes, imagens convertidas e PDFs comprimidos aparecem aqui.</p></div>`;
    return;
  }
  box.innerHTML = `<div class="pf-table-wrap"><table class="pf-table">
    <thead><tr><th>Arquivo</th><th>Ferramenta</th><th class="num">Tamanho</th><th>Quando</th></tr></thead>
    <tbody>${downloads
      .map(
        (entry) => `<tr>
          <td><span class="pf-file">${icon("documentText", 15)}${escapeHtml(entry.file?.name ?? entry.text)}</span></td>
          <td>${entry.tool ? `<a href="${toolHref(entry.tool)}">${escapeHtml(toolTitle(entry.tool))}</a>` : "—"}</td>
          <td class="num">${entry.file ? formatBytes(entry.file.size) : "—"}</td>
          <td><time title="${new Date(entry.at).toLocaleString("pt-BR")}">${relative(entry.at)}</time></td>
        </tr>`,
      )
      .join("")}</tbody></table></div>`;
}

/* ── Abas ──────────────────────────────────────────────────────── */

function showTab(name) {
  $$("[data-tab]").forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.tab === name)));
  $$("[data-panel]").forEach((panel) => (panel.hidden = panel.dataset.panel !== name));
  if (location.hash.slice(1) !== name)
    history.replaceState(null, "", name === "geral" ? location.pathname : `#${name}`);
}

/* ── Início ────────────────────────────────────────────────────── */

export function initProfile() {
  let member = null;
  let year = new Date().getFullYear();
  let entries = [];
  let profile = editable({});
  let photoURL = null;

  function renderAll() {
    renderSide(member, profile);
    renderActivity();
  }

  function renderActivity() {
    renderPins(entries);
    renderHeatmap(entries);
    renderYears(entries, year, (picked) => {
      year = picked;
      renderActivity();
    });
    renderTimeline(entries, year);
    renderFeed(entries);
    renderFiles(entries);
    $("[data-count='atividade']").textContent = entries.length;
    $("[data-count='arquivos']").textContent = entries.filter((entry) => entry.kind === "download").length;
  }

  $$("[data-tab]").forEach((tab) => tab.addEventListener("click", () => showTab(tab.dataset.tab)));
  document.addEventListener("click", (event) => {
    const go = event.target.closest("[data-go]");
    if (go) showTab(go.dataset.go);
  });
  const hash = location.hash.slice(1);
  if (["atividade", "arquivos"].includes(hash)) showTab(hash);

  document.addEventListener("wings:member", async (event) => {
    if (member) return;
    member = event.detail;
    renderAll();

    initEditing(
      () => profile,
      async (values) => {
        await saveProfile(member.email, values);
        profile = editable(values);
        renderSide(member, profile);
        document.dispatchEvent(new CustomEvent("wings:profile", { detail: { ...profile, photoURL } }));
      },
    );
    initPhoto(
      member,
      () => photoURL,
      (url) => {
        photoURL = url;
        announcePhoto(url);
      },
    );

    const [saved, history] = await Promise.all([
      getProfile(member.email).catch(() => ({})),
      readActivity(member.email),
    ]);
    profile = editable(saved);
    photoURL = saved.photoURL ?? null;
    entries = history;
    renderAll();
    announcePhoto(photoURL); // pinta também o próprio item da equipe, marcado em renderSide
    renderTeam(member);
  });

  const status = $("[data-reset-status]");
  $("[data-reset]").addEventListener("click", async () => {
    if (!member) return;
    status.hidden = false;
    if (mode === "teste") {
      status.textContent = "Por enquanto a senha é provisória: para trocar, peça a um administrador.";
      return;
    }
    try {
      await resetPassword(member.email);
      status.textContent = `Enviamos um link para ${member.email}. Confira a caixa de entrada.`;
    } catch (error) {
      status.textContent = error.message;
    }
  });
}
