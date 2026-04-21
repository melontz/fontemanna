import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fontemanna — Le Stagioni di Bostiano",
  description: "Gestisci il caseificio Fontemanna a Colle San Paolo, Umbria. Un gioco di simulazione nel browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
