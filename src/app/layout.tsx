import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/ThemeProvider";
import "./globals.css";
import { UnidadeProvider } from "../context/UnidadeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foncare Sistema - Gestão de Clínicas",
  description: "Sistema completo de gestão de clínicas com Next.js, Supabase e Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-50 via-cyan-50 to-amber-50 dark:from-zinc-900 dark:via-slate-900 dark:to-cyan-950 min-h-screen`}
      >
        <ThemeProvider>
          <UnidadeProvider>
            {children}
          </UnidadeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
