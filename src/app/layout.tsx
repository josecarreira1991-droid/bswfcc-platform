import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BSWFCC | Brazilian Southwest Florida Chamber of Commerce",
  description:
    "Plataforma oficial da BSWFCC — Câmara de Comércio Brasileira do Sudoeste da Flórida. Membros, eventos, inteligência de mercado e networking empresarial.",
  keywords: "BSWFCC, câmara brasileira, Florida, Fort Myers, Cape Coral, comércio bilateral",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-[#F5F5F7] text-corp-text min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
