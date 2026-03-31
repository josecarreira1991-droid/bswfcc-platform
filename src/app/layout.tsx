import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BSWFCC | Brazilian Southwest Florida Chamber of Commerce",
  description:
    "Plataforma oficial da BSWFCC — Câmara de Comércio Brasileira do Sudoeste da Flórida.",
  keywords: "BSWFCC, câmara brasileira, Florida, Fort Myers, Cape Coral",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-corp-bg text-corp-text min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
