/**
 * Conexão com o Firebase, compartilhada por login, perfil e histórico.
 *
 * Com as variáveis PUBLIC_FIREBASE_* no .env, mode = "firebase": Auth e Firestore do projeto (plano gratuito).
 * Sem elas, mode = "teste": nada é carregado e cada módulo usa o armazenamento do navegador.
 * As bibliotecas só são baixadas quando alguém precisa delas.
 */
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY,
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.PUBLIC_FIREBASE_APP_ID,
};

export const mode = firebaseConfig.apiKey ? "firebase" : "teste";

let appPromise;
function loadApp() {
  appPromise ??= import("firebase/app").then(({ initializeApp }) => initializeApp(firebaseConfig));
  return appPromise;
}

let authPromise;
export function loadAuth() {
  authPromise ??= Promise.all([loadApp(), import("firebase/auth")]).then(([app, authModule]) => {
    const auth = authModule.getAuth(app);
    auth.languageCode = "pt-BR";
    return { auth, ...authModule };
  });
  return authPromise;
}

let dbPromise;
export function loadFirestore() {
  dbPromise ??= Promise.all([loadApp(), import("firebase/firestore")]).then(([app, firestore]) => ({
    db: firestore.getFirestore(app),
    ...firestore,
  }));
  return dbPromise;
}
