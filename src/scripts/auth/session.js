/**
 * Sessão do Wings.
 *
 * Dois modos, escolhidos pelas variáveis de ambiente:
 * - firebase: com PUBLIC_FIREBASE_API_KEY (e as demais) no .env, o login usa o Firebase Auth
 *   (e-mail e senha). As contas são criadas no console do Firebase.
 * - teste: sem o .env, entra quem está em data/team.ts com a senha provisória (data/test-accounts.ts,
 *   conferida no navegador). Trava provisória para o time usar enquanto o Firebase não entra;
 *   NÃO é segurança de verdade.
 *
 * Nos dois modos só entra quem está em data/team.ts: o perfil (nome, empresa, papel) vem de lá.
 */
import { findMember } from "../../data/team";
import { logActivity } from "../tools/activity.js";
import { loadAuth as loadFirebase, mode } from "./firebase.js";
import { testPasswordHashes } from "../../data/test-accounts";

export { mode };
export const LOGIN_PATH = "/entrar/";
export const HOME_PATH = "/ferramentas/";

const STORAGE_KEY = "wings.session";

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}
function store(email) {
  try {
    if (email) localStorage.setItem(STORAGE_KEY, JSON.stringify({ email }));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* navegação privada: a sessão vale só enquanto a página estiver aberta */
  }
}

/** Perfil guardado no aparelho: permite desenhar a casca na hora, antes do Firebase responder. */
export const cachedMember = () => findMember(readStored()?.email) ?? null;

/** Usuário logado (perfil de data/team.ts) ou null. */
export async function currentMember() {
  if (mode === "teste") return cachedMember();
  const { auth, onAuthStateChanged } = await loadFirebase();
  const user = await new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (value) => {
      stop();
      resolve(value);
    });
  });
  const member = findMember(user?.email);
  store(member?.email ?? null);
  return member ?? null;
}

const MESSAGES = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/too-many-requests": "Muitas tentativas. Espere alguns minutos e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Confira a internet e tente de novo.",
  "auth/user-disabled": "Esta conta foi desativada.",
};

/**
 * Modo de teste: confere a senha provisória pelo SHA-256 de "email:senha" (data/test-accounts.ts).
 * Trava provisória para o time usar enquanto o Firebase não entra; não é segurança de verdade.
 */
async function checkTestPassword(email, password) {
  const expected = testPasswordHashes[email.toLowerCase()];
  if (!expected || !password) return false;
  const bytes = new TextEncoder().encode(`${email.toLowerCase()}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === expected;
}

/**
 * Entra e devolve o perfil. Erros já vêm com a mensagem para mostrar na tela.
 * remember = false: no Firebase, a sessão acaba quando o navegador fecha.
 */
export async function signIn(email, password, remember = true) {
  const member = findMember(email);
  if (!member) throw new Error("Este e-mail não tem acesso ao Wings.");

  if (mode === "teste") {
    if (!(await checkTestPassword(member.email, password))) throw new Error(MESSAGES["auth/invalid-credential"]);
    store(member.email);
    logActivity({ kind: "login", text: "Entrou no Wings", tool: null });
    return member;
  }

  const { auth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } =
    await loadFirebase();
  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (error) {
    throw new Error(MESSAGES[error.code] ?? "Não foi possível entrar. Tente de novo.");
  }
  store(member.email);
  logActivity({ kind: "login", text: "Entrou no Wings", tool: null });
  return member;
}

export async function signOut() {
  store(null);
  if (mode === "firebase") {
    const { auth, signOut: firebaseSignOut } = await loadFirebase();
    await firebaseSignOut(auth);
  }
  location.assign(LOGIN_PATH);
}

export async function resetPassword(email) {
  if (!findMember(email)) throw new Error("Este e-mail não tem acesso ao Wings.");
  if (mode === "teste") return;
  const { auth, sendPasswordResetEmail } = await loadFirebase();
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw new Error(MESSAGES[error.code] ?? "Não foi possível enviar o e-mail. Tente de novo.");
  }
}

/** Destino depois do login: só caminhos internos (evita redirecionar para fora do site). */
export function nextPath() {
  const next = new URLSearchParams(location.search).get("next") ?? "";
  return next.startsWith("/") && !next.startsWith("//") ? next : HOME_PATH;
}

/** Protege a página: sem sessão, manda para o login e volta para cá depois. */
export async function requireMember() {
  const member = await currentMember();
  if (!member) {
    location.replace(`${LOGIN_PATH}?next=${encodeURIComponent(location.pathname + location.search)}`);
    return null;
  }
  return member;
}
