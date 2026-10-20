/**
 * Cria no Firebase Auth as contas da equipe listada em src/data/team.ts.
 *
 * Uso (na raiz do projeto):
 *   npm run firebase:contas -- caminho/da/chave-de-servico.json
 *
 * A chave de serviço vem do console do Firebase: Configurações do projeto > Contas de serviço >
 * "Gerar nova chave privada". É uma credencial de administrador: guarde fora do repositório
 * (o .gitignore já ignora *-firebase-adminsdk-*.json) e nunca envie para o servidor do site.
 *
 * Para cada pessoa: se a conta já existe, só confere; se não existe, cria com uma senha
 * provisória aleatória e mostra a senha UMA vez no terminal, para você repassar à pessoa,
 * que troca depois em "Meu perfil > Trocar senha" ou em "Esqueci minha senha" no login.
 */
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { team } from "../../src/data/team.ts";

const keyPath = process.argv[2] ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error("Informe o caminho da chave de serviço:\n  npm run firebase:contas -- caminho/da/chave.json");
  process.exit(1);
}

// As regras do banco e dos arquivos precisam ter os mesmos e-mails da equipe.
for (const file of ["firestore.rules"]) {
  const rules = readFileSync(file, "utf8");
  const missing = team.filter((member) => !rules.includes(`'${member.email}'`));
  if (missing.length) {
    console.warn(
      `Atenção: ${file} não tem ${missing.map((m) => m.email).join(", ")}. Atualize a lista e publique as regras.`,
    );
  }
}

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) });
const auth = getAuth();

/** Senha provisória legível: 4 blocos de 4 caracteres, sem caracteres ambíguos. */
function temporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(16);
  const chars = [...bytes].map((byte) => alphabet[byte % alphabet.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

const created = [];
for (const member of team) {
  try {
    const user = await auth.getUserByEmail(member.email);
    if (user.displayName !== member.name) await auth.updateUser(user.uid, { displayName: member.name });
    console.log(`✓ já existe   ${member.email}`);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    const password = temporaryPassword();
    await auth.createUser({ email: member.email, password, displayName: member.name, emailVerified: true });
    created.push({ name: member.name, email: member.email, password });
    console.log(`+ criada      ${member.email}`);
  }
}

if (created.length) {
  console.log("\nSenhas provisórias (aparecem só agora; repasse a cada pessoa por um canal privado):\n");
  for (const account of created)
    console.log(`  ${account.name.padEnd(18)} ${account.email.padEnd(30)} ${account.password}`);
  console.log("\nPeça para cada um trocar a senha no primeiro acesso (Meu perfil > Trocar senha).");
} else {
  console.log("\nNenhuma conta nova: todas já existiam.");
}
