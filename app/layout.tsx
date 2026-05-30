import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "@/lib/fetch-debug"; // Debug fetch antes de qualquer coisa
import { BetaFeedbackFab } from "@/components/beta-feedback/beta-feedback-fab";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ideorai.com"),
  title: "Ideor.AI",
  description: "Valide sua ideia de startup com inteligência artificial.",
  openGraph: {
    title: "Ideor.AI — Valide sua startup com IA",
    description: "Crie projetos, preencha etapas e deixe a IA gerar análise de mercado, proposta de valor, modelo de negócio e MVP.",
    url: "https://www.ideorai.com",
    siteName: "Ideor.AI",
    images: [
      {
        url: "/assets/logo_branco.png",
        width: 1200,
        height: 630,
        alt: "Ideor.AI — Plataforma de validação de startups",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ideor.AI — Valide sua startup com IA",
    description: "Crie projetos, preencha etapas e deixe a IA gerar análise de mercado, proposta de valor, modelo de negócio e MVP.",
    images: ["/assets/logo_branco.png"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
       <meta name="theme-color" content="#1e2733" />
        <meta
          name="description"
          content="The fastest way to create your startup"
        />
        <meta
          name="keywords"
          content="startup, ideation, business, entrepreneurship"
        />
        <meta name="author" content="Ideor.AI Team" />
      </head>

      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <BetaFeedbackFab />
        </ThemeProvider>
      </body>
    </html>
  );
}
