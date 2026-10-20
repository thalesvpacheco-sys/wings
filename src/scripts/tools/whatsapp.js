/** Link de WhatsApp: normaliza o número, formata a mensagem e monta o link. */
import { $, $$, copyText, escapeHtml } from "./utils.js";
import { logActivity } from "./activity.js";

/** Só dígitos; sem DDI, assume Brasil (55). Retorna null se não parece um número válido. */
function normalizeNumber(raw) {
  let digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (digits.length < 12 || digits.length > 15) return null;
  return digits;
}

/** Mostra o número como +55 (62) 99999-9999 quando é brasileiro. */
function prettyNumber(digits) {
  const br = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(digits);
  return br ? `+55 (${br[1]}) ${br[2]}-${br[3]}` : `+${digits}`;
}

/** Formatação do WhatsApp → HTML (o texto é escapado antes). */
function renderMarkup(text) {
  return escapeHtml(text)
    .replace(/```([^`]+)```/g, "<code>$1</code>")
    .replace(/\*([^*\n]+)\*/g, "<b>$1</b>")
    .replace(/_([^_\n]+)_/g, "<i>$1</i>")
    .replace(/~([^~\n]+)~/g, "<s>$1</s>")
    .replace(/\n/g, "<br>");
}

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function initWhatsApp() {
  const number = $("#wa-number");
  const numberState = $("#wa-number-state");
  const target = $("#wa-target");
  const message = $("#wa-message");
  const count = $("#wa-count");
  const url = $("#wa-url");
  const error = $("#wa-error");
  const preview = $("#wa-preview");
  const previewNumber = $("#wa-preview-number");

  const now = new Date();
  $("#wa-time").textContent = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  function buildLink() {
    const digits = normalizeNumber(number.value);
    if (!digits) return null;
    const text = message.value.trim();
    const query = text ? `text=${encodeURIComponent(text)}` : "";
    const mode = target.value === "auto" ? (isMobile() ? "app" : "web") : target.value;
    if (mode === "web") return `https://web.whatsapp.com/send?phone=${digits}${query ? `&${query}` : ""}`;
    return `https://wa.me/${digits}${query ? `?${query}` : ""}`;
  }

  function update() {
    const digits = normalizeNumber(number.value);
    const typed = number.value.trim() !== "";
    numberState.hidden = !typed || Boolean(digits);
    previewNumber.textContent = digits ? prettyNumber(digits) : "+55 · aguardando número…";

    const text = message.value;
    count.textContent = `${text.length} ${text.length === 1 ? "caractere" : "caracteres"}`;
    preview.innerHTML = text.trim() ? renderMarkup(text) : "Sua mensagem aparecerá aqui…";

    // O link gerado acompanha a edição depois do primeiro clique em Gerar.
    if (url.value) url.value = buildLink() ?? "";
  }

  function generate() {
    const link = buildLink();
    error.hidden = Boolean(link);
    error.textContent = link ? "" : "Confira o número: use DDD e número, com ou sem o +55.";
    url.value = link ?? "";
    if (!link) number.focus();
    // Só o número de destino; o texto da mensagem não vai para o histórico.
    else logActivity({ text: `Gerou link de WhatsApp para ${prettyNumber(normalizeNumber(number.value))}` });
    return link;
  }

  // Botões de formatação: envolvem a seleção (ou inserem o par e põem o cursor no meio).
  $$("[data-wrap]").forEach((button) =>
    button.addEventListener("click", () => {
      const mark = button.dataset.wrap;
      const { selectionStart: start, selectionEnd: end, value } = message;
      message.value = value.slice(0, start) + mark + value.slice(start, end) + mark + value.slice(end);
      message.focus();
      message.setSelectionRange(start + mark.length, end + mark.length);
      update();
    }),
  );

  $$("[data-example]").forEach((button) =>
    button.addEventListener("click", () => {
      message.value = button.dataset.example;
      update();
      message.focus();
    }),
  );

  [number, message].forEach((field) => field.addEventListener("input", update));
  target.addEventListener("change", update);
  $("#wa-generate").addEventListener("click", generate);
  $("#wa-open").addEventListener("click", () => {
    const link = generate();
    if (link) window.open(link, "_blank", "noopener");
  });
  $("#wa-copy").addEventListener("click", (event) => {
    const link = url.value || generate();
    if (link) copyText(link, event.currentTarget);
  });

  update();
}
