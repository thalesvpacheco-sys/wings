/** Metadados do site (SEO e compartilhamento). */

export const site = {
  name: "WingsBr",
  url: "https://wingsbr.app",
  title: "WingsBr | Inteligência e Gestão Imobiliária",
  description:
    "Do planejamento ao pós-venda. A WingsBr conecta estratégia, projetos, marketing, CRM e vendas em uma plataforma para o mercado imobiliário.",
  tagline: "Real Estate Intelligence",
  locale: "pt_BR",
  themeColor: "#051F44",
  ogImage: { path: "/images/og-wingsbr.png", width: 1200, height: 630 },
  contact: {
    email: "contato@wingsbr.app",
    whatsapp: "5562981665914",
    whatsappMessage: "Vim do site Wings e quero saber mais",
  },
};

export const demoWhatsapp = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`;

/** Dados estruturados (schema.org) da página inicial. */
export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Do planejamento ao pós-venda, tudo conectado em uma única plataforma. Inteligência, gestão e performance para incorporadoras, construtoras, loteadoras e imobiliárias.",
  url: `${site.url}/`,
  publisher: { "@type": "Organization", name: site.name },
};
