/**
 * Compressor de PDF, todo no navegador: o pdf.js desenha cada página num canvas, a página vira JPEG
 * na resolução do nível escolhido e o pdf-lib monta um PDF novo com o tamanho de página original.
 * As bibliotecas só carregam quando alguém comprime.
 */
import { $, $$, baseName, downloadBlob, escapeHtml, formatBytes, initDropzone } from "./utils.js";
import { logActivity } from "./activity.js";

const MAX_BYTES = 100 * 1024 * 1024;

/** scale 1 = 72 dpi. */
const LEVELS = {
  light: { scale: 2, quality: 0.82 },
  balanced: { scale: 1.5, quality: 0.68 },
  strong: { scale: 1.1, quality: 0.5 },
};

async function loadLibraries() {
  const [pdfjs, { default: workerUrl }, { PDFDocument }] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    import("pdf-lib"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return { pdfjs, PDFDocument };
}

async function compress(file, level, onProgress) {
  const { pdfjs, PDFDocument } = await loadLibraries();
  const { scale, quality } = LEVELS[level];
  const source = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const output = await PDFDocument.create();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  for (let number = 1; number <= source.numPages; number++) {
    const page = await source.getPage(number);
    const original = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale });
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;

    const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    const image = await output.embedJpg(await jpeg.arrayBuffer());
    output.addPage([original.width, original.height]).drawImage(image, {
      x: 0,
      y: 0,
      width: original.width,
      height: original.height,
    });
    page.cleanup();
    onProgress(number, source.numPages);
  }

  await source.destroy();
  const bytes = await output.save();
  return { blob: new Blob([bytes], { type: "application/pdf" }), pages: output.getPageCount() };
}

export function initPdfCompressor() {
  const dropTitle = $("#pdf-drop-title");
  const dropSub = $("#pdf-drop-sub");
  const compressButton = $("#pdf-compress");
  const downloadButton = $("#pdf-download");
  const progress = $("#pdf-progress");
  const bar = $("span", progress);
  const status = $("#pdf-status");
  const result = $("#pdf-result");
  let file = null;
  let output = null;
  let busy = false;

  function setFile(next) {
    if (!next) return;
    if (next.type !== "application/pdf" && !/\.pdf$/i.test(next.name)) {
      status.textContent = "Escolha um arquivo PDF.";
      return;
    }
    if (next.size > MAX_BYTES) {
      status.textContent = "O arquivo passa de 100 MB.";
      return;
    }
    file = next;
    output = null;
    downloadButton.disabled = true;
    dropTitle.textContent = next.name;
    dropSub.textContent = `${formatBytes(next.size)} · clique para trocar`;
    status.textContent = "Escolha o nível e clique em Comprimir.";
    result.textContent = "O tamanho original, o novo tamanho e quanto foi economizado aparecem aqui.";
  }

  async function run() {
    if (busy) return;
    if (!file) {
      $("#pdf-drop input").click();
      return;
    }
    busy = true;
    compressButton.disabled = true;
    downloadButton.disabled = true;
    progress.hidden = false;
    bar.style.width = "0%";
    status.textContent = "Carregando o PDF…";
    const level = $$("input[name=pdf-level]").find((radio) => radio.checked).value;

    try {
      const compressed = await compress(file, level, (done, total) => {
        bar.style.width = `${Math.round((done / total) * 100)}%`;
        status.textContent = `Página ${done} de ${total}…`;
      });
      const saved = Math.round((1 - compressed.blob.size / file.size) * 100);
      const name = escapeHtml(file.name);
      if (compressed.blob.size >= file.size) {
        output = null;
        status.textContent = "Pronto.";
        result.innerHTML = `<b>${name}</b> já está bem otimizado: a versão comprimida ficou com ${formatBytes(compressed.blob.size)}, maior que o original (${formatBytes(file.size)}). Mantenha o arquivo original ou tente o nível Forte.`;
      } else {
        output = compressed.blob;
        downloadButton.disabled = false;
        status.textContent = "Pronto. Clique em Baixar.";
        logActivity({ text: `Comprimiu ${file.name} (${saved}% menor)` });
        result.innerHTML = `${formatBytes(file.size)} → <b>${formatBytes(output.size)}</b> · <b>${saved}% menor</b> · ${compressed.pages} ${compressed.pages === 1 ? "página" : "páginas"}`;
      }
    } catch (error) {
      console.error(error);
      status.textContent =
        error?.name === "PasswordException"
          ? "Este PDF tem senha. Remova a proteção e tente de novo."
          : "Não foi possível ler este PDF.";
    } finally {
      busy = false;
      compressButton.disabled = false;
      progress.hidden = true;
    }
  }

  initDropzone($("#pdf-drop"), (files) => setFile(files[0]));
  compressButton.addEventListener("click", run);
  downloadButton.addEventListener("click", () => {
    if (output) downloadBlob(output, `${baseName(file.name)}-comprimido.pdf`);
  });
}
