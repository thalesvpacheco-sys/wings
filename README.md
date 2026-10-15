# WingsBr — site

Landing page institucional da WingsBr ([wingsbr.app](https://wingsbr.app)), plataforma de inteligência e gestão para o mercado imobiliário.

Construída com [Astro](https://astro.build): saída 100% estática, cada seção da página é um componente e o JavaScript enviado ao navegador se limita ao que é interativo (header, hero, jornada e demonstração).

## Começando

Requisitos: Node.js 22.12+ (ver `.nvmrc`).

```bash
npm install
npm run dev       # servidor local em http://localhost:4321
```

| Comando           | O que faz                                   |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento com recarga     |
| `npm run build`   | Gera o site estático em `dist/`             |
| `npm run preview` | Serve o `dist/` localmente para conferência |
| `npm run check`   | Verificação de tipos dos arquivos `.astro`  |
| `npm run format`  | Formata o código com Prettier               |

## Estrutura

```
.
├── brand/                     Kit da marca (Mini Brand Book v1.0): fonte, não vai para o deploy
│   ├── app-icon/
│   ├── icon/
│   └── logo/
├── docs/
│   └── architecture.md        Decisões de arquitetura e convenções
├── public/                    Servido como está: favicons, imagem de compartilhamento, fontes
│   ├── fonts/
│   └── images/
└── src/
    ├── components/
    │   ├── brand/             Sprite da logo, assinatura e faixas gráficas
    │   ├── layout/            Header e footer
    │   ├── sections/          Uma seção da página por arquivo, na ordem em que aparecem
    │   └── ui/                Peças reutilizáveis: ícones, cabeçalho de seção
    ├── data/                  Conteúdo e dados: textos em lista, navegação, demonstração
    ├── layouts/               Documento base (head, SEO, dados estruturados)
    ├── pages/                 Rotas (index.astro = página inicial)
    ├── scripts/               Comportamento no navegador, um módulo por responsabilidade
    └── styles/                Tokens, base, layout, componentes e seções (main.css define a ordem)
```

Detalhes e convenções em [docs/architecture.md](docs/architecture.md).

## Onde editar

| Quero mudar…                               | Arquivo                                                     |
| ------------------------------------------ | ----------------------------------------------------------- |
| Título, descrição, e-mail de contato, menu | `src/data/site.ts`                                          |
| Etapas da jornada (seção Plataforma)       | `src/data/journey.ts`                                       |
| Segmentos, pilares MICCA, benefícios       | `src/data/content.ts`                                       |
| Telas e registros da demonstração          | `src/data/showcase-screens.ts`, `src/data/showcase-demo.js` |
| Texto de uma seção                         | `src/components/sections/<Seção>.astro`                     |
| Cores, fontes, espaçamentos                | `src/styles/tokens.css`                                     |

> Cores, tipografia e o desenho da logo seguem o Mini Brand Book v1.0 aprovado. Não altere sem validação da marca.

## Deploy

Qualquer host estático. Configuração para Cloudflare Pages, Netlify ou Vercel:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node:** 22 ou superior

## Histórico

- **v1:** primeira versão em HTML, CSS e JS sem build, extraída de `grifo-tools/public/wings/` em 15/10/2026 (preservada no primeiro commit do repositório).
- **v1.1:** migração para Astro com a mesma aparência e o mesmo comportamento; conferida elemento a elemento contra a v1 em cinco larguras de tela.
