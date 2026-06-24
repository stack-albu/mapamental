import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MapaMental | Editor de mapas mentais",
  description: "Crie, organize e gerencie mapas mentais com CRUD e persistência preparada para Supabase.",
  openGraph: {
    title: "MapaMental",
    description: "Editor visual de mapas mentais com banco de dados e experiência premium.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
