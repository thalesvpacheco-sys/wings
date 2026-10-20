/** Formulário de login: entra, mostra erros em português e volta para a página pedida. */
import { currentMember, mode, nextPath, resetPassword, signIn } from "./session.js";

export async function initLogin() {
  const form = document.querySelector("[data-login-form]");
  const email = form.querySelector("[data-email]");
  const password = form.querySelector("[data-password]");
  const remember = form.querySelector("[data-remember]");
  const message = form.querySelector("[data-message]");
  const submit = form.querySelector("[data-submit]");

  const show = (text, tone = "error") => {
    message.hidden = !text;
    message.textContent = text;
    message.dataset.tone = tone;
  };

  document.querySelector("[data-test-notice]").hidden = mode !== "teste";

  // Já logado: segue direto.
  if (await currentMember()) {
    location.replace(nextPath());
    return;
  }

  form.querySelector("[data-toggle-password]").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const visible = password.type === "password";
    password.type = visible ? "text" : "password";
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? "Esconder senha" : "Mostrar senha");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    show("");
    if (!email.value.trim()) {
      show("Digite seu e-mail.");
      email.focus();
      return;
    }
    if (!password.value) {
      show("Digite sua senha.");
      password.focus();
      return;
    }
    submit.disabled = true;
    form.classList.add("is-busy");
    try {
      await signIn(email.value, password.value, remember.checked);
      form.classList.add("is-done");
      location.assign(nextPath());
    } catch (error) {
      show(error.message);
      submit.disabled = false;
      form.classList.remove("is-busy");
    }
  });

  form.querySelector("[data-forgot]").addEventListener("click", async () => {
    if (!email.value.trim()) {
      show("Digite seu e-mail acima e clique de novo em “Esqueci minha senha”.", "info");
      email.focus();
      return;
    }
    if (mode === "teste") {
      show("Por enquanto a senha é provisória: peça uma nova a um administrador.", "info");
      return;
    }
    try {
      await resetPassword(email.value);
      show(`Enviamos um link para ${email.value.trim()}. Confira a caixa de entrada.`, "success");
    } catch (error) {
      show(error.message);
    }
  });

  email.focus();
}
