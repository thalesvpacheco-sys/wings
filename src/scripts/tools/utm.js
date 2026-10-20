/** Gerador de UTM: monta o link ao digitar, preservando os parâmetros que a URL já tem. */
import { $, $$, copyText } from "./utils.js";
import { logActivity } from "./activity.js";

const REQUIRED = ["utm_source", "utm_medium", "utm_campaign"];

/** "Lançamento Alameda 2" → "lancamento-alameda-2". */
function slug(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseUrl(raw) {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.includes(".") ? url : null;
  } catch {
    return null;
  }
}

export function initUtm() {
  const base = $("#utm-url");
  const fields = $$("[data-utm]");
  const result = $("#utm-result");
  const error = $("#utm-error");

  function build() {
    const url = parseUrl(base.value);
    const values = Object.fromEntries(fields.map((field) => [field.dataset.utm, slug(field.value)]));
    const missing = REQUIRED.filter((key) => !values[key]);

    if (!url || missing.length) {
      result.value = "";
      const touched = base.value.trim() || fields.some((field) => field.value.trim());
      error.hidden = !touched;
      error.textContent = !url
        ? "Informe uma URL válida, como residencial-exemplo.com.br."
        : `Falta preencher: ${missing.join(", ")}.`;
      return null;
    }

    for (const [key, value] of Object.entries(values)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    error.hidden = true;
    result.value = url.href;
    return url.href;
  }

  [base, ...fields].forEach((field) => field.addEventListener("input", build));

  $$("[data-source]").forEach((button) =>
    button.addEventListener("click", () => {
      $("#utm-source").value = button.dataset.source;
      $("#utm-medium").value = button.dataset.medium;
      build();
      $("#utm-campaign").focus();
    }),
  );

  $("#utm-copy").addEventListener("click", (event) => {
    const link = build();
    if (!link) return;
    copyText(link, event.currentTarget);
    logActivity({ text: `Gerou link com UTM · campanha ${new URL(link).searchParams.get("utm_campaign")}` });
  });
  $("#utm-open").addEventListener("click", () => {
    const link = build();
    if (link) window.open(link, "_blank", "noopener");
  });
  $("#utm-clear").addEventListener("click", () => {
    [base, ...fields].forEach((field) => (field.value = ""));
    result.value = "";
    error.hidden = true;
    base.focus();
  });
}
