/**
 * Ícones de traço do site (24×24, traço quadrado). Cada entrada é o conteúdo interno do <svg>.
 * Losangos preenchidos repetem o detalhe gráfico da marca.
 */
export const icons = {
  chart: '<path d="M4 20h16"/><path d="M7 16v-3"/><path d="M11 16V9"/><path d="M15 16v-5"/><path d="M19 16V5"/>',
  process:
    '<path d="M10 6h10M10 12h10M10 18h7"/><path d="M5.5 4.5L7 6 5.5 7.5 4 6zM5.5 10.5L7 12l-1.5 1.5L4 12zM5.5 16.5L7 18l-1.5 1.5L4 18z" fill="currentColor" stroke="none"/>',
  planner:
    '<rect x="4" y="5" width="16" height="15"/><path d="M4 10h16M8 3v4M16 3v4"/><path d="M12 13l2 2-2 2-2-2z" fill="currentColor" stroke="none"/>',
  megaphone: '<path d="M4 10v4h3l9 5V5L7 10H4z"/><path d="M19 9l2-2M19 15l2 2M20 12h2"/>',
  strategy:
    '<path d="M12 3l9 9-9 9-9-9z"/><path d="M12 9.5l2.5 2.5-2.5 2.5L9.5 12z" fill="currentColor" stroke="none"/>',
  schedule: '<path d="M4 4v16h16"/><path d="M8 8h7M11 12h8M8 16h5"/>',
  media:
    '<rect x="3" y="4" width="18" height="12"/><path d="M9 20h6M12 16v4"/><path d="M12 7.5l2.5 2.5-2.5 2.5L9.5 10z" fill="currentColor" stroke="none"/>',
  centralize:
    '<path d="M4 4h5v5H4zM15 4h5v5h-5zM4 15h5v5H4zM15 15h5v5h-5z"/><path d="M12 10l2 2-2 2-2-2z" fill="currentColor" stroke="none"/>',
  productivity: '<path d="M5 6l6 6-6 6M12 6l6 6-6 6"/>',
  integration: '<path d="M7 8l4 4-4 4-4-4zM17 8l4 4-4 4-4-4z"/><path d="M11 12h2"/>',
  performance: '<path d="M3 18l6-6 4 4 7-7"/><path d="M15 9h5v5"/>',
  control:
    '<path d="M3 21h18"/><path d="M6 21V10l6-6 6 6v11"/><path d="M10 21v-5h4v5"/><path d="M12 8.5l1.5 1.5-1.5 1.5-1.5-1.5z" fill="currentColor" stroke="none"/>',
} as const;

export type IconName = keyof typeof icons;
