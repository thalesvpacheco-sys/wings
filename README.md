# WingsBr — site

Site institucional estático da WingsBr (`wingsbr.app`). HTML + CSS + JS puros, sem build e sem dependências.

## Estrutura

```
index.html            página única
assets/css/main.css   todo o estilo
assets/js/main.js     header, menu mobile, revelações, jornada
assets/js/showcase*.js demonstração interativa da plataforma
assets/fonts/         Montserrat e Geist (OFL, auto-hospedadas)
assets/images, svg/   marca (desenho do Mini Brand Book v1.0 — não editar)
```

## Rodar local

Abrir `index.html` no navegador funciona. Para testar como em produção:

```bash
npx serve .
```

## Deploy

Qualquer host estático (Cloudflare Pages, Netlify, Vercel). No Cloudflare Pages: build command vazio, output directory `/`.

## Histórico

Extraído de `grifo-tools/public/wings/` em 15/10/2026. Na extração, corrigido o header: o `backdrop-filter` do estado rolado transformava o header no containing block do menu mobile (`position:fixed`), e o menu aberto depois de rolar ficava cortado em 66px. O fundo/blur foi para `.site-header::before`.
