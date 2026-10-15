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

Automático: todo push na `main` publica o site.

```
push na main → GitHub Actions (.github/workflows/deploy.yml) gera o build
             → grava o dist/ no branch "deploy"
             → webhook avisa a Hostinger, que puxa o branch "deploy" para o public_html
```

Configuração (uma vez só):

1. No hPanel, ative o SSL do domínio (**Segurança → SSL**); o `.htaccess` redireciona tudo para HTTPS.
2. Faça um push na `main` e espere a action **Deploy** terminar (aba **Actions** do GitHub). Ela cria o branch `deploy`.
3. No hPanel, **Avançado → Git**: repositório `https://github.com/thalesvpacheco-sys/wings.git`, branch `deploy`, diretório vazio (= `public_html`). O `public_html` precisa estar vazio antes. Se o repositório for privado, copie a chave SSH que o hPanel mostra para **GitHub → Settings → Deploy keys** e use o endereço SSH do repositório.
4. Ainda em **Git**, ative a **implantação automática** e copie a URL do webhook. No GitHub: **Settings → Webhooks → Add webhook**, cole a URL, tipo `application/json`, evento **Just the push event**.

O `.htaccess` (em `public/`) cuida de HTTPS, domínio sem `www`, página 404, compressão, cache longo dos arquivos com hash, cabeçalhos de segurança e bloqueia o acesso à pasta `.git` que o deploy por Git deixa no servidor.

## Histórico

- **v1:** primeira versão em HTML, CSS e JS sem build (preservada no primeiro commit do repositório).
- **v1.1:** migração da v1 para Astro, com a mesma aparência.
- **v2:** novo layout a partir do protótipo aprovado no canvas de design (WingsBr LP Lab, "LP completa · v4"), com o texto da v1 na seção "Por que WingsBr?".
