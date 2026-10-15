# Arquitetura

## Visão geral

O site é uma landing page de uma rota só, gerada estaticamente pelo Astro. Não há servidor, banco de dados ou framework de UI no navegador: o HTML sai pronto do build e alguns módulos JavaScript pequenos adicionam a interação.

```
pages/index.astro
└── layouts/BaseLayout.astro        <head>, SEO, sprite da marca, main.css
    ├── layout/SiteHeader.astro     → scripts/header.js
    ├── sections/HeroSection        → scripts/hero.js
    ├── sections/ProblemSection     → scripts/reveal.js (fragmentos)
    ├── sections/PlatformSection    → scripts/journey.js     ← data/journey.ts
    ├── sections/ShowcaseSection    → scripts/showcase.js    ← data/showcase-screens.ts, data/showcase-demo.js
    ├── sections/AudienceSection                             ← data/content.ts
    ├── sections/MethodSection                               ← data/content.ts
    ├── sections/AboutSection
    ├── sections/BenefitsSection                             ← data/content.ts
    ├── sections/CtaSection                                  ← data/site.ts
    └── layout/SiteFooter.astro
```

## Seções

A ordem da página segue a narrativa de venda. Os nomes batem com as linhas do canvas de design (WingsBr LP Lab).

| #   | Componente        | Âncora          | Canvas        |
| --- | ----------------- | --------------- | ------------- |
| 01  | `HeroSection`     | `#inicio`       | Hero          |
| 02  | `ProblemSection`  | `#por-que`      | O problema    |
| 03  | `PlatformSection` | `#plataforma`   | A plataforma  |
| 04  | `ShowcaseSection` | `#produto`      | O produto     |
| 05  | `AudienceSection` | `#solucoes`     | Para quem é   |
| 06  | `MethodSection`   | `#micca`        | Método MICCA  |
| 07  | `AboutSection`    | `#sobre`        | Quem somos    |
| 08  | `BenefitsSection` | `#alem`         | Benefícios    |
| 09  | `CtaSection`      | `#demonstracao` | Chamada final |

As âncoras fazem parte da interface pública (links do menu, do rodapé e de campanhas). Mantenha-as estáveis.

## Conteúdo e dados

- O conteúdo que se repete em lista mora em `src/data/` e é renderizado por `.map()` nos componentes. Texto corrido e único fica no próprio componente da seção.
- `showcase-screens.ts` é a fonte única das telas da demonstração: o mesmo dado gera as abas laterais, o menu da aplicação simulada e o nome da tela nos links da jornada.
- `showcase-demo.js` contém os registros fictícios da demonstração. Tudo ali é exemplo; nenhum dado real.

## Estilos

- CSS global, sem escopo por componente. Motivo: a demonstração monta o HTML das telas no navegador, e o CSS com escopo do Astro não alcançaria esse HTML.
- `styles/main.css` importa tudo numa ordem explícita, que é a ordem da cascata:
  `tokens → fonts → base → layout → components → sections → motion`.
- Cada arquivo de seção traz os próprios breakpoints (`1180px`, `1024px`, `900px`, `600px`) logo abaixo das regras-base dele.
- `motion.css` fica por último, porque as revelações de rolagem precisam vencer os estados das seções.
- Os valores de marca vêm de `tokens.css`. Cor nova entra como token, não como hexadecimal solto.

## JavaScript

- Um módulo por responsabilidade em `src/scripts/`, cada um exportando uma função `init*`. O componente dono do markup chama essa função num `<script>`, que o Astro empacota e carrega como módulo.
- Sem dependências de runtime. Utilitários compartilhados ficam em `scripts/utils/dom.js`.
- Melhoria progressiva: sem JS, todo o conteúdo aparece; a classe `.js` no `<html>` é o que habilita os estados iniciais das animações.
- `prefers-reduced-motion` é respeitado em todos os módulos e no CSS.

## Marca

- O desenho da logo vem de um sprite SVG único (`components/brand/BrandSprite.astro`), usado via `<use href="#lk-h">` e `<use href="#sym">`. As cores mudam por fundo com `.on-dark` e `.on-light`.
- `brand/` guarda o kit original (PNG e SVG) para referência e uso em outras peças. Não é publicado.

## Convenções

- Componentes em `PascalCase.astro`; scripts, estilos e dados em `kebab-case`.
- Código (nomes de arquivos, variáveis) em inglês; conteúdo e comentários em português.
- Formatação com Prettier (`npm run format`); `.editorconfig` define LF e 2 espaços.
