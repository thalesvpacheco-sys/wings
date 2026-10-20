/** Conversor de imagem: decodifica no navegador, redimensiona num canvas e reexporta. */
import { $, baseName, downloadBlob, escapeHtml, formatBytes, initDropzone } from "./utils.js";
import { logActivity } from "./activity.js";

const EXTENSIONS = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg", "image/avif": "avif" };
const LABELS = { "image/webp": "WebP", "image/png": "PNG", "image/jpeg": "JPG", "image/avif": "AVIF" };

async function decode(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* cai para o <img> abaixo */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function convert(file, { type, quality, maxWidth }) {
  const source = await decode(file);
  const scale = maxWidth && source.width > maxWidth ? maxWidth / source.width : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  const context = canvas.getContext("2d");
  // JPG não tem transparência: fundo branco em vez de preto.
  if (type === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  // Sem suporte ao formato, o navegador devolve PNG: avisamos em vez de baixar o tipo errado.
  if (!blob || blob.type !== type) throw new Error(`Este navegador não exporta ${LABELS[type]}. Escolha WebP.`);
  return { blob, width: canvas.width, height: canvas.height };
}

/** O navegador consegue exportar este formato? (AVIF, por exemplo, quase nenhum exporta pelo canvas.) */
function canEncode(type) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob?.type === type), type));
}

/** Desativa no seletor os formatos que este navegador não exporta. */
async function markUnsupported(select) {
  for (const option of select.options) {
    if (await canEncode(option.value)) continue;
    option.disabled = true;
    option.textContent += " (indisponível neste navegador)";
    if (option.selected) select.value = "image/webp";
  }
}

export function initImageConverter() {
  const format = $("#img-format");
  const width = $("#img-width");
  const quality = $("#img-quality");
  const qualityValue = $("#img-quality-value");
  const qualityField = $("#img-quality-field");
  const list = $("#img-list");
  const empty = $("#img-empty");
  const summary = $("#img-summary");
  /** @type {{file: File, result?: {blob: Blob, width: number, height: number}, error?: string, busy?: boolean}[]} */
  let items = [];

  function render() {
    empty.hidden = items.length > 0;
    const done = items.filter((item) => item.result);
    const before = done.reduce((sum, item) => sum + item.file.size, 0);
    const after = done.reduce((sum, item) => sum + item.result.blob.size, 0);
    summary.textContent = done.length && before ? `${Math.round((1 - after / before) * 100)}% menor no total` : "";

    list.innerHTML = items
      .map((item, index) => {
        let detail = `${formatBytes(item.file.size)} · aguardando conversão`;
        if (item.busy) detail = `${formatBytes(item.file.size)} · convertendo…`;
        if (item.error) detail = `<span class="tk-error-text">${escapeHtml(item.error)}</span>`;
        if (item.result) {
          const diff = Math.round((1 - item.result.blob.size / item.file.size) * 100);
          const change = diff >= 0 ? `${diff}% menor` : `${-diff}% maior`;
          detail = `${formatBytes(item.file.size)} → <b>${formatBytes(item.result.blob.size)}</b> · ${change} · ${item.result.width}×${item.result.height}`;
        }
        return `<div class="tk-example">
          <div class="tk-example-text"><strong>${escapeHtml(item.file.name)}</strong><span>${detail}</span></div>
          ${item.result ? `<button class="tk-btn-sm" type="button" data-download="${index}">Baixar</button>` : ""}
        </div>`;
      })
      .join("");
  }

  async function convertAll(targets = items) {
    const options = {
      type: format.value,
      quality: Number(quality.value) / 100,
      maxWidth: Number(width.value) > 0 ? Number(width.value) : 0,
    };
    for (const item of targets) {
      item.busy = true;
      item.error = undefined;
      item.result = undefined;
      render();
      try {
        item.result = await convert(item.file, options);
      } catch (error) {
        item.error = error.message.startsWith("Este navegador") ? error.message : "Não foi possível ler esta imagem.";
      }
      item.busy = false;
      render();
    }
    const done = targets.filter((item) => item.result).length;
    if (done) {
      logActivity({
        text: `Converteu ${done} ${done === 1 ? "imagem" : "imagens"} para ${LABELS[options.type]}`,
      });
    }
  }

  const fileName = (item) => `${baseName(item.file.name)}.${EXTENSIONS[item.result.blob.type]}`;

  initDropzone($("#img-drop"), (files) => {
    const images = files.filter((file) => file.type.startsWith("image/") || /\.(heic|heif|avif)$/i.test(file.name));
    const added = images.map((file) => ({ file }));
    items.push(...added);
    render();
    convertAll(added);
  });

  quality.addEventListener("input", () => (qualityValue.textContent = quality.value));
  // PNG é sem perdas: a qualidade não se aplica.
  const syncQuality = () => (qualityField.hidden = format.value === "image/png");
  format.addEventListener("change", syncQuality);
  syncQuality();
  markUnsupported(format);

  $("#img-convert").addEventListener("click", () => {
    if (items.length) convertAll();
    else $("#img-drop input").click();
  });
  $("#img-download-all").addEventListener("click", async () => {
    for (const item of items.filter((entry) => entry.result)) {
      downloadBlob(item.result.blob, fileName(item));
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  });
  $("#img-clear").addEventListener("click", () => {
    items = [];
    render();
  });
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-download]");
    if (!button) return;
    const item = items[Number(button.dataset.download)];
    downloadBlob(item.result.blob, fileName(item));
  });

  render();
}
