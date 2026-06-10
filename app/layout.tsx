import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "21 Setlist",
  description: "Repertórios inteligentes para músicos e bandas"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
