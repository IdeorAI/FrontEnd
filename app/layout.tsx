import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

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
        <link rel="icon" href="/favicon.ico" />
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
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
