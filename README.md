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

## Páginas

| Rota      | Versão | O que é                                                                 |
| --------- | ------ | ----------------------------------------------------------------------- |
| `/`       | v1     | Página principal: o layout original (fundo navy), migrado para Astro    |
| `/home/2` | v2     | Layout alternativo, do protótipo "LP completa · v4" do canvas de design |
| `/404`    | v2     | Página de erro                                                          |

As duas versões são independentes: cada uma tem os próprios componentes, estilos e scripts, e cada página carrega só o CSS dela.

```
.
├── brand/                     Kit da marca (Mini Brand Book v1.0): referência, não vai para o deploy
├── docs/architecture.md       Decisões de arquitetura e convenções
├── public/                    Copiado como está: .htaccess, favicons, imagem de compartilhamento, fontes
└── src/
    ├── components/
    │   ├── brand/             Sprite da logo, Logo e faixas gráficas (compartilhados)
    │   ├── v1/                layout, sections, ui da página principal
    │   └── v2/                layout, sections da /home/2
    ├── data/
    │   ├── site.ts            Metadados e contato (compartilhados)
    │   ├── v1/                Navegação, jornada, segmentos, demonstração
    │   └── v2/                Textos das seções interativas
    ├── layouts/BaseLayout.astro   Documento base (head, SEO, dados estruturados)
    ├── pages/                 index.astro (v1), home/2.astro (v2), 404.astro
    ├── scripts/               utils/ compartilhado; v1/ e v2/
    └── styles/                fonts.css compartilhado; v1/ e v2/ (cada main.css define a ordem da cascata)
```

## Onde editar

| Quero mudar…                                  | Arquivo                                                    |
| --------------------------------------------- | ---------------------------------------------------------- |
| Título, descrição, contato e compartilhamento | `src/data/site.ts`                                         |
| Texto de uma seção                            | `src/components/v1/sections/<Seção>.astro` (ou `v2/`)      |
| Menu da página principal                      | `src/data/v1/navigation.ts`                                |
| Etapas, segmentos, MICCA, benefícios (v1)     | `src/data/v1/journey.ts`, `src/data/v1/content.ts`         |
| Demonstração interativa (v1)                  | `src/data/v1/showcase-demo.js`                             |
| Textos interativos da v2                      | `src/data/v2/interactive.js`                               |
| Ajustes de celular                            | `src/styles/v1/responsive.css`, `src/styles/v2/mobile.css` |

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
- **v2:** layout alternativo em `/home/2` a partir do protótipo aprovado no canvas de design (WingsBr LP Lab, "LP completa · v4"), com o texto da v1 na seção "Por que WingsBr?".
- **v2.1:** a v1 volta a ser a página principal (`/`); v2 vai para `/home/2`. Ajustes de celular nas duas.
