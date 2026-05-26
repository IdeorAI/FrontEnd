import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "@/lib/fetch-debug"; // Debug fetch antes de qualquer coisa
import { BetaFeedbackFab } from "@/components/beta-feedback/beta-feedback-fab";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Ideor.AI",
  description: "The fastest way to ",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <meta property="og:title" content="Ideor.AI" />
        <meta
          property="og:description"
          content="The fastest way to create your startup"
        />
        <meta property="og:image" content="/og-image.png" />
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
