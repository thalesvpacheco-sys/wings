/** Gerador de senha: Web Crypto com rejection sampling, sem Math.random(). */
import { $, $$, copyText, escapeHtml } from "./utils.js";
import { logActivity } from "./activity.js";

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%&*()-_=+[]{};:,.?/",
};

const LEVELS = [
  { max: 40, label: "Fraca", width: 25 },
  { max: 60, label: "Razoável", width: 50 },
  { max: 80, label: "Forte", width: 75 },
  { max: Infinity, label: "Muito forte", width: 100 },
];

/** Inteiro uniforme em [0, max), descartando o viés do módulo. */
function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do crypto.getRandomValues(buffer);
  while (buffer[0] >= limit);
  return buffer[0] % max;
}

function generate(length, keys) {
  const sets = keys.map((key) => SETS[key]);
  // Um caractere de cada tipo escolhido, o resto do conjunto inteiro; depois embaralha.
  const chars = sets.map((set) => set[randomInt(set.length)]);
  const pool = sets.join("");
  while (chars.length < length) chars.push(pool[randomInt(pool.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function initPassword() {
  const range = $("#pw-length");
  const lengthValue = $("#pw-length-value");
  const output = $("#pw-output");
  const meter = $("#pw-meter");
  const strength = $("#pw-strength");
  const historyCard = $("#pw-history-card");
  const history = $("#pw-history");
  const boxes = $$("input[name=pw-set]");
  const recent = [];

  const selected = () => boxes.filter((box) => box.checked).map((box) => box.value);

  function render() {
    const keys = selected();
    const length = Number(range.value);
    lengthValue.textContent = length;
    const password = generate(length, keys);
    output.value = password;

    const pool = keys.reduce((sum, key) => sum + SETS[key].length, 0);
    const bits = length * Math.log2(pool);
    const index = LEVELS.findIndex((level) => bits < level.max);
    meter.style.width = `${LEVELS[index].width}%`;
    meter.dataset.level = index;
    strength.dataset.level = index;
    strength.textContent = LEVELS[index].label;
    return password;
  }

  function remember(password) {
    recent.unshift(password);
    recent.splice(8);
    historyCard.hidden = false;
    history.innerHTML = recent
      .map(
        (item, i) => `<div class="tk-example">
          <div class="tk-example-text"><code class="tk-mono-line">${escapeHtml(item)}</code></div>
          <button class="tk-btn-sm" type="button" data-copy="${i}">Copiar</button>
        </div>`,
      )
      .join("");
  }

  // Pelo menos um tipo precisa ficar marcado.
  boxes.forEach((box) =>
    box.addEventListener("change", () => {
      if (!selected().length) box.checked = true;
      render();
    }),
  );
  range.addEventListener("input", render);
  $("#pw-generate").addEventListener("click", () => {
    remember(render());
    // Só o tamanho: a senha em si nunca vai para o histórico.
    logActivity({ text: `Gerou uma senha de ${range.value} caracteres` });
  });
  $("#pw-copy").addEventListener("click", (event) => copyText(output.value, event.currentTarget));
  history.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");
    if (button) copyText(recent[Number(button.dataset.copy)], button);
  });

  render();
}
