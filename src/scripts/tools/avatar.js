/**
 * Avatares: mostram a foto de perfil quando existe e as iniciais quando não.
 * Todo elemento com [data-avatar] (ou [data-member="initials"]) segue a mesma regra.
 */

/** Aplica foto ou iniciais num elemento de avatar. */
export function paintAvatar(element, { photoURL, initials }) {
  if (initials !== undefined) element.dataset.initials = initials;
  const text = element.dataset.initials ?? "";
  if (photoURL) {
    element.style.backgroundImage = `url("${photoURL.replace(/"/g, "%22")}")`;
    element.classList.add("has-photo");
    element.textContent = "";
  } else {
    element.style.backgroundImage = "";
    element.classList.remove("has-photo");
    element.textContent = text;
  }
}

/** Atualiza todos os avatares do usuário logado na página. */
export function paintMemberAvatars(photoURL, initials) {
  document
    .querySelectorAll('[data-member="initials"]')
    .forEach((element) => paintAvatar(element, { photoURL, initials }));
}

/** Avisa a página inteira que a foto do usuário mudou (perfil → topbar, sidebar, menu). */
export function announcePhoto(photoURL) {
  document.dispatchEvent(new CustomEvent("wings:photo", { detail: { photoURL } }));
}
