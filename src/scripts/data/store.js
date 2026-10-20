/**
 * Dados do Wings: perfil, foto e histórico de atividade.
 *
 * Modo firebase: só o Firestore (plano gratuito).
 *   profiles/{email}                 campos do perfil + photoURL (a foto, como data: URL JPEG de 320px)
 *   profiles/{email}/activity/{id}   eventos do histórico ({ at, kind, tool, text, file })
 *   As regras ficam em firestore.rules, na raiz do projeto.
 * Modo teste: o mesmo formato, guardado no navegador (localStorage).
 *
 * O e-mail (em minúsculas) é a chave de tudo, o mesmo de data/team.ts.
 */
import { loadFirestore, mode } from "../auth/firebase.js";

const MAX_ACTIVITY = 500;
const id = (email) => email.trim().toLowerCase();

/* ── Navegador (modo teste e cache) ─────────────────────────────── */

const local = {
  read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};
const profileKey = (email) => `wings.profile.${id(email)}`;
const activityKey = (email) => `wings.activity.${id(email)}`;
const photoCacheKey = (email) => `wings.photo.${id(email)}`;

/* ── Perfil ─────────────────────────────────────────────────────── */

/** Campos salvos do perfil (sem os padrões de team.ts) e photoURL. */
export async function getProfile(email) {
  if (mode === "teste") return local.read(profileKey(email), {});
  const { db, doc, getDoc } = await loadFirestore();
  const snapshot = await getDoc(doc(db, "profiles", id(email)));
  const data = snapshot.exists() ? snapshot.data() : {};
  cachePhoto(email, data.photoURL ?? null);
  return data;
}

export async function saveProfile(email, values) {
  if (mode === "teste") {
    local.write(profileKey(email), { ...local.read(profileKey(email), {}), ...values });
    return;
  }
  const { db, doc, setDoc } = await loadFirestore();
  await setDoc(doc(db, "profiles", id(email)), { ...values, updatedAt: Date.now() }, { merge: true });
}

/* ── Foto ───────────────────────────────────────────────────────── */

/** Última foto conhecida neste aparelho: desenha o avatar na hora, antes do banco responder. */
export function cachedPhoto(email) {
  if (!email) return null;
  return local.read(photoCacheKey(email), null);
}
function cachePhoto(email, url) {
  if (url) local.write(photoCacheKey(email), url);
  else {
    try {
      localStorage.removeItem(photoCacheKey(email));
    } catch {
      /* sem armazenamento */
    }
  }
}

/**
 * Recorta a imagem no centro, em quadrado de 320px, e guarda como JPEG dentro do próprio perfil
 * (data: URL de uns 20 a 40 KB). Fica no banco, sem serviço de arquivos à parte e sem plano pago.
 */
export async function uploadPhoto(email, file) {
  const blob = await squareJpeg(file, 320);
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  if (mode === "teste") {
    if (!local.write(profileKey(email), { ...local.read(profileKey(email), {}), photoURL: dataUrl })) {
      throw new Error("Não foi possível salvar a foto neste navegador.");
    }
  } else {
    await saveProfile(email, { photoURL: dataUrl });
  }
  cachePhoto(email, dataUrl);
  return dataUrl;
}

export async function removePhoto(email) {
  if (mode === "teste") {
    const profile = local.read(profileKey(email), {});
    delete profile.photoURL;
    local.write(profileKey(email), profile);
  } else {
    await saveProfile(email, { photoURL: null });
  }
  cachePhoto(email, null);
}

async function squareJpeg(file, size) {
  if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem (JPG, PNG ou WebP).");
  if (file.size > 15 * 1024 * 1024) throw new Error("A imagem passa de 15 MB. Escolha uma menor.");
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Não foi possível ler esta imagem. Tente JPG ou PNG.");
  }
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(size, side);
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  bitmap.close?.();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
}

/* ── Histórico ──────────────────────────────────────────────────── */

export async function addActivity(email, entry) {
  if (mode === "teste") {
    const list = local.read(activityKey(email), []);
    list.unshift(entry);
    local.write(activityKey(email), list.slice(0, MAX_ACTIVITY));
    return;
  }
  const { db, collection, addDoc } = await loadFirestore();
  await addDoc(collection(db, "profiles", id(email), "activity"), entry);
}

export async function getActivity(email) {
  if (mode === "teste") {
    const list = local.read(activityKey(email), []);
    return Array.isArray(list) ? list : [];
  }
  const { db, collection, getDocs, query, orderBy, limit } = await loadFirestore();
  const snapshot = await getDocs(
    query(collection(db, "profiles", id(email), "activity"), orderBy("at", "desc"), limit(MAX_ACTIVITY)),
  );
  return snapshot.docs.map((item) => item.data());
}
