/** Utilitários das ferramentas: área de transferência, download e formatação. */
import { logActivity } from "./activity.js";

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Copia o texto e mostra "Copiado" no botão por um instante. */
export async function copyText(text, button) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  if (button) flash(button, "Copiado");
  return true;
}

/** Troca o rótulo do botão por um momento, sem perder o ícone. */
export function flash(button, label, ms = 1400) {
  const textNode = [...button.childNodes]
    .reverse()
    .find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (!textNode) return;
  const original = textNode.textContent;
  textNode.textContent = ` ${label}`;
  clearTimeout(button._flash);
  button._flash = setTimeout(() => (textNode.textContent = original), ms);
}

/** Baixa o arquivo e registra o download no histórico do perfil. */
export function downloadBlob(blob, filename) {
  logActivity({ kind: "download", text: `Baixou ${filename}`, file: { name: filename, size: blob.size } });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2).replace(".", ",")} MB`;
}

export function escapeHtml(text) {
  return text.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}

/** Nome do arquivo sem a extensão. */
export const baseName = (name) => name.replace(/\.[^.]+$/, "");

/** Liga a área de envio (clique + arrastar e soltar) a um callback que recebe File[]. */
export function initDropzone(drop, onFiles) {
  const input = $("input[type=file]", drop);
  input.addEventListener("change", () => {
    if (input.files.length) onFiles([...input.files]);
    input.value = "";
  });
  ["dragenter", "dragover"].forEach((type) =>
    drop.addEventListener(type, (event) => {
      event.preventDefault();
      drop.classList.add("over");
    }),
  );
  ["dragleave", "drop"].forEach((type) => drop.addEventListener(type, () => drop.classList.remove("over")));
  drop.addEventListener("drop", (event) => {
    event.preventDefault();
    const files = [...event.dataTransfer.files];
    if (files.length) onFiles(files);
  });
}
