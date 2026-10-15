# WingsBr — site

Landing page institucional da WingsBr ([wingsbr.app](https://wingsbr.app)), plataforma de inteligência e gestão para o mercado imobiliário.

Construída com [Astro](https://astro.build): saída 100% estática, uma seção da página por componente e JavaScript sem dependências só onde há interação (menu, abas, seletores).

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
├── brand/                  Kit da marca (Mini Brand Book v1.0): referência, não vai para o deploy
├── docs/architecture.md    Decisões de arquitetura e convenções
├── public/                 Copiado como está: .htaccess, favicons, imagem de compartilhamento, fontes
└── src/
    ├── components/
    │   ├── brand/          Sprite e componente da logo
    │   ├── layout/         Header (mega-menu, menu mobile) e footer
    │   └── sections/       Uma seção por arquivo, na ordem da página
    ├── data/               Metadados do site e conteúdo das seções interativas
    ├── layouts/            Documento base (head, SEO, dados estruturados)
    ├── pages/              index.astro (página) e 404.astro
    ├── scripts/            header, switcher, demo, spotlight
    └── styles/             tokens, base, componentes, layout, seções e movimento (main.css define a ordem)
```

## Onde editar

| Quero mudar…                                          | Arquivo                                  |
| ----------------------------------------------------- | ---------------------------------------- |
| Título, descrição e imagem de compartilhamento        | `src/data/site.ts`                       |
| Textos de "Um dia na operação", "Para quem é" e MICCA | `src/data/interactive.js`                |
| Texto de qualquer outra seção                         | `src/components/sections/<Seção>.astro`  |
| Itens do menu e mega-menu                             | `src/components/layout/SiteHeader.astro` |
| Cores, fontes e espaçamentos                          | `src/styles/tokens.css`                  |

> Cores, tipografia e o desenho da logo seguem o Mini Brand Book v1.0 aprovado. Não altere sem validação da marca.

## Deploy na Hostinger

Automático: a Hostinger está ligada a este repositório (hPanel → **Web app Node.js**, conectado ao GitHub). Todo push na `main` gera o build e publica o site.

Configuração do app no hPanel:

| Campo            | Valor           |
| ---------------- | --------------- |
| Branch           | `main`          |
| Versão do Node   | 22 ou superior  |
| Comando de build | `npm run build` |
| Pasta de saída   | `dist`          |

## Histórico

- **v1:** primeira versão em HTML, CSS e JS sem build (preservada no primeiro commit do repositório).
- **v1.1:** migração da v1 para Astro, com a mesma aparência.
- **v2:** novo layout a partir do protótipo aprovado no canvas de design (WingsBr LP Lab, "LP completa · v4"), com o texto da v1 na seção "Por que WingsBr?".
