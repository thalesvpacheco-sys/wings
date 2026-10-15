/** Utilitários de DOM compartilhados pelos scripts do site. */

export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hasFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}
