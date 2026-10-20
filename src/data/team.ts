/**
 * Perfis com acesso ao Wings. Por enquanto só administradores.
 * O e-mail é a chave: é ele que liga a conta do login (Firebase) a este perfil.
 * Padrão de e-mail: nome.sobrenome@wingsbr.app (só o nome quando o sobrenome não é conhecido).
 *
 * Aqui ficam só nome, e-mail e papel. Empresa, cargo, descrição, telefone e links cada pessoa
 * preenche em "Editar perfil" (salvos no banco, não neste arquivo).
 */

export type Role = "admin";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** Campos que a própria pessoa preenche em "Editar perfil", na ordem do formulário. */
export const editableFields = ["company", "title", "bio", "phone", "site", "instagram", "linkedin"] as const;
export type EditableField = (typeof editableFields)[number];

export const team: Member[] = [
  { id: "thales", name: "Thales Pacheco", email: "thales.pacheco@wingsbr.app", role: "admin" },
  { id: "bruno", name: "Bruno Dourado", email: "bruno.dourado@wingsbr.app", role: "admin" },
  { id: "nalbert", name: "Nalbert Guiliani", email: "nalbert.guiliani@wingsbr.app", role: "admin" },
  { id: "anderson", name: "Anderson F.", email: "anderson@wingsbr.app", role: "admin" },
  { id: "faustino", name: "Faustino", email: "faustino@wingsbr.app", role: "admin" },
  { id: "pedro", name: "Pedro Faustino", email: "pedro.faustino@wingsbr.app", role: "admin" },
];

export const roleLabel: Record<Role, string> = { admin: "Administrador" };

export function initials(name: string) {
  const parts = name.replace(/\./g, "").trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? ""))
  ).toUpperCase();
}

export const findMember = (email: string | null | undefined) =>
  team.find((member) => member.email.toLowerCase() === (email ?? "").trim().toLowerCase());
