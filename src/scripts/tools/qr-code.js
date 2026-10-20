/** QR Code: matriz gerada pela biblioteca `qrcode`, desenhada aqui em SVG (quadrado ou arredondado). */
import QRCode from "qrcode";
import { $, $$, copyText, downloadBlob } from "./utils.js";
import { logActivity } from "./activity.js";

/** Os três "olhos" (7×7) nos cantos: no estilo arredondado viram quadrados de canto arredondado. */
function finderOrigins(count) {
  return [
    [0, 0],
    [0, count - 7],
    [count - 7, 0],
  ];
}

function roundedEye(x, y, fg, bg) {
  return (
    `<rect x="${x}" y="${y}" width="7" height="7" rx="2" fill="${fg}"/>` +
    `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1.4" fill="${bg}"/>` +
    `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.9" fill="${fg}"/>`
  );
}

/** SVG do QR em unidades de módulo; o tamanho final vem do width/height. */
function toSvg(text, { level, margin, fg, bg, round, size }) {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: level });
  const count = modules.size;
  const total = count + margin * 2;
  const eyes = finderOrigins(count);
  const inEye = (row, col) => eyes.some(([r, c]) => row >= r && row < r + 7 && col >= c && col < c + 7);
  let dots = "";
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!modules.get(row, col) || (round && inEye(row, col))) continue;
      const x = col + margin;
      const y = row + margin;
      dots += round
        ? `<rect x="${x + 0.06}" y="${y + 0.06}" width="0.88" height="0.88" rx="0.44"/>`
        : `M${x} ${y}h1v1h-1z`;
    }
  }
  const body = round
    ? `<g fill="${fg}">${dots}</g>${eyes.map(([r, c]) => roundedEye(c + margin, r + margin, fg, bg)).join("")}`
    : `<path fill="${fg}" d="${dots}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}" shape-rendering="${round ? "auto" : "crispEdges"}"><rect width="${total}" height="${total}" fill="${bg}"/>${body}</svg>`;
}

function svgToPng(svg, size) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, size, size);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("png"))), "image/png");
    };
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export function initQrCode() {
  const text = $("#qr-text");
  const size = $("#qr-size");
  const margin = $("#qr-margin");
  const level = $("#qr-level");
  const format = $("#qr-format");
  const fg = $("#qr-fg");
  const bg = $("#qr-bg");
  const styles = $$("input[name=qr-style]");
  const preview = $("#qr-preview");
  const status = $("#qr-status");
  let current = null;

  const clamp = (value, min, max, fallback) => {
    const number = Math.round(Number(value));
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };

  function options() {
    return {
      level: level.value,
      margin: clamp(margin.value, 0, 16, 4),
      fg: fg.value,
      bg: bg.value,
      round: styles.find((radio) => radio.checked)?.value === "round",
      size: clamp(size.value, 64, 4096, 320),
    };
  }

  function generate() {
    const value = text.value.trim();
    if (!value) {
      status.textContent = "Cole um link ou texto para gerar.";
      current = null;
      return null;
    }
    try {
      const opts = options();
      const svg = toSvg(value, opts);
      preview.innerHTML = svg;
      preview.classList.add("has-qr");
      current = { svg, size: opts.size };
      status.textContent = `QR gerado · ${opts.size} × ${opts.size} px.`;
      return current;
    } catch {
      status.textContent = "Texto longo demais para um QR Code. Encurte o link ou baixe a qualidade.";
      current = null;
      return null;
    }
  }

  async function download() {
    const qr = current ?? generate();
    if (!qr) return;
    if (format.value === "svg") {
      downloadBlob(new Blob([qr.svg], { type: "image/svg+xml" }), "qrcode.svg");
    } else {
      downloadBlob(await svgToPng(qr.svg, qr.size), "qrcode.png");
    }
    status.textContent = "Download iniciado.";
  }

  function share(button) {
    const params = new URLSearchParams();
    $$("[data-qr]").forEach((field) => params.set(field.dataset.qr, field.value));
    params.set("e", options().round ? "round" : "square");
    const link = `${location.origin}${location.pathname}?${params}`;
    copyText(link, button);
    status.textContent = "Link com as configurações copiado.";
  }

  // Estado vindo de um link compartilhado.
  const query = new URLSearchParams(location.search);
  $$("[data-qr]").forEach((field) => {
    const value = query.get(field.dataset.qr);
    if (value !== null) field.value = value;
  });
  if (query.get("e")) styles.forEach((radio) => (radio.checked = radio.value === query.get("e")));

  // Depois do primeiro QR, a pré-visualização acompanha cada ajuste.
  [text, size, margin, level, fg, bg, ...styles].forEach((field) =>
    field.addEventListener("input", () => current && generate()),
  );
  $("#qr-generate").addEventListener("click", () => {
    if (!generate()) return;
    const value = text.value.trim();
    logActivity({ text: `Gerou QR Code para ${value.length > 48 ? `${value.slice(0, 48)}…` : value}` });
  });
  $("#qr-download").addEventListener("click", download);
  $("#qr-share").addEventListener("click", (event) => share(event.currentTarget));

  generate();
}
