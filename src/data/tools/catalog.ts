/**
 * Catálogo da área de ferramentas (/ferramentas). Mesma lista e mesmos ícones do grifo-tools.
 * As ferramentas aqui são só front-end por enquanto; o Orçamento é o único que funciona
 * (abre o gerador de propostas já em produção).
 */
import type { ToolIconName } from "../../components/tools/icons";

export interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: ToolIconName;
}

export const tools: Tool[] = [
  {
    slug: "conversor-de-imagem",
    title: "Conversor de imagem",
    description: "Converta imagens para WebP, PNG, JPG ou AVIF e ajuste o tamanho.",
    icon: "photo",
  },
  {
    slug: "compressor-de-pdf",
    title: "Compressor de PDF",
    description: "Reduza o tamanho de PDFs para enviar por e-mail ou WhatsApp.",
    icon: "documentArrowDown",
  },
  {
    slug: "qr-code",
    title: "QR Code",
    description: "Gere e personalize QR Codes para qualquer link ou texto.",
    icon: "qrCode",
  },
  {
    slug: "link-de-whatsapp",
    title: "Link de WhatsApp",
    description: "Crie links que abrem o WhatsApp com a mensagem já escrita.",
    icon: "chat",
  },
  {
    slug: "gerador-de-utm",
    title: "Gerador de UTM",
    description: "Monte links rastreáveis para saber de qual campanha veio cada lead.",
    icon: "link",
  },
  {
    slug: "gerador-de-senha",
    title: "Gerador de senha",
    description: "Crie senhas fortes com a criptografia do próprio navegador. Nada sai da sua máquina.",
    icon: "key",
  },
];

/** Gerador de propostas (app em public/ferramentas/orcamento/app/, aberto dentro da casca). */
export const budget = {
  title: "Orçamento",
  description: "Monte a proposta comercial do cliente: logo, módulos e valores.",
  href: "/ferramentas/orcamento/",
  icon: "documentText" as ToolIconName,
};

export const toolsBase = "/ferramentas";
export const toolHref = (slug: string) => `${toolsBase}/${slug}/`;
