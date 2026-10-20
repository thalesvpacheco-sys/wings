/**
 * Histórico de atividade do usuário (alimenta o perfil: gráfico, linha do tempo e arquivos baixados).
 * Grava pelo store: Firestore com o Firebase configurado, navegador no modo de teste.
 *
 * Entrada: { at, kind: "login" | "action" | "download", tool, text, file?: { name, size } }
 * Nunca registre conteúdo sensível (senhas geradas, texto de mensagens): só o que aconteceu.
 */
import { budget, tools } from "../../data/tools/catalog";
import { addActivity, getActivity } from "../data/store.js";

const SESSION_KEY = "wings.session";

function sessionEmail() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null")?.email ?? null;
  } catch {
    return null;
  }
}

/** Ferramenta da página atual (slug), pelo caminho /ferramentas/<slug>/. */
export function currentTool() {
  return /^\/ferramentas\/([^/]+)\/?/.exec(location.pathname)?.[1] ?? null;
}

const titles = Object.fromEntries([...tools.map((tool) => [tool.slug, tool.title]), ["orcamento", budget.title]]);
const icons = Object.fromEntries([...tools.map((tool) => [tool.slug, tool.icon]), ["orcamento", budget.icon]]);
export const toolTitle = (slug) => titles[slug] ?? "Wings";
export const toolIcon = (slug) => icons[slug] ?? "home";

/** Histórico do usuário, do mais novo para o mais antigo. Em caso de erro, lista vazia. */
export async function readActivity(email) {
  if (!email) return [];
  try {
    return await getActivity(email);
  } catch (error) {
    console.warn("[wings] não foi possível ler o histórico:", error);
    return [];
  }
}

/** Registra um evento para o usuário logado. Sem sessão, não faz nada; erros não atrapalham a ferramenta. */
export function logActivity({ kind = "action", text, tool = currentTool(), file } = {}) {
  const email = sessionEmail();
  if (!email || !text) return;
  const entry = { at: Date.now(), kind, tool: tool ?? null, text };
  if (file) entry.file = { name: file.name, size: file.size };
  addActivity(email, entry).catch((error) => console.warn("[wings] não foi possível salvar no histórico:", error));
}
