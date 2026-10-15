# Arquitetura

## Visão geral

Landing page de uma rota, gerada estaticamente pelo Astro. Não há servidor, banco de dados ou framework de UI no navegador: o HTML sai pronto do build, com todas as variações de conteúdo já renderizadas, e quatro módulos pequenos de JavaScript só alternam o que aparece.

```
pages/index.astro
└── layouts/BaseLayout.astro         <head>, SEO, sprite da marca, main.css
    ├── layout/SiteHeader.astro      → scripts/header.js
    ├── sections/HeroSection
    ├── sections/ProblemSection      (copy da v1)
    ├── sections/DaySection          → scripts/switcher.js   ← data/interactive.js (hours)
    ├── sections/PlatformSection     → scripts/spotlight.js
    ├── sections/DemoSection         → scripts/demo.js
    ├── sections/AudienceSection     → scripts/switcher.js   ← data/interactive.js (segments)
    ├── sections/MethodSection       → scripts/switcher.js   ← data/interactive.js (pillars)
    ├── sections/AboutSection
    ├── sections/BenefitsSection     → scripts/spotlight.js
    ├── sections/CtaSection
    └── layout/SiteFooter.astro
```

## Origem do layout

O layout vem do protótipo "LP completa · v4" do canvas de design WingsBr LP Lab. CSS e markup foram extraídos do arquivo do protótipo; a lógica do canvas foi trocada por atributos `data-*` e pelos módulos em `src/scripts/`. Mudanças visuais devem ser feitas aqui, no código, a partir de agora.

## Âncoras

`#por-que`, `#plataforma`, `#demo`, `#publico`, `#micca`, `#sobre`, `#beneficios`, `#cta`. São usadas pelo menu, pelo rodapé e pelos botões de demonstração; mantenha-as estáveis.

## Interação

- **header.js:** fundo do header ao rolar; mega-menu abre no hover (com 140 ms de tolerância para o ponteiro atravessar), no clique e no foco por teclado, fecha com Esc ou ao clicar num link; menu mobile com hambúrguer.
- **switcher.js:** padrão genérico `[data-switch]` → botões `[data-switch-tab]` e painéis `[data-switch-panel]`. Todos os painéis estão no HTML (bom para SEO e para quem está sem JS); o script só troca `hidden` e a classe `.on`.
- **demo.js:** as abas e a barra lateral da janela controlam as mesmas telas; atalhos `[data-shortcut]` abrem uma tela sem ficarem marcados.
- **spotlight.js:** brilho que segue o cursor nos cards `[data-spot]`, só em dispositivos com mouse.

## Movimento

- Animações ligadas à rolagem usam CSS (`animation-timeline: view()` e `scroll()`), sem JavaScript. Funcionam no Chrome e no Edge; nos outros navegadores o conteúdo aparece completo, sem a animação.
- Seções escuras usam `overflow: clip`, não `hidden`: `hidden` transforma a seção num container de rolagem e trava as animações de dentro dela.
- `prefers-reduced-motion` desliga as animações.

## Estilos

- CSS global, importado em `styles/main.css` numa ordem fixa: `tokens → fonts → base → componentes → layout → seções → motion`.
- Valores de marca ficam em `tokens.css`.

## Convenções

- Componentes em `PascalCase.astro`; scripts, estilos e dados em `kebab-case`.
- Código em inglês; conteúdo e comentários em português.
- Formatação com Prettier (`npm run format`); `.editorconfig` define LF e 2 espaços.
