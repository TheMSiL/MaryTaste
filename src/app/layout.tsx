import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MaryTaste", template: "%s · MaryTaste" },
  description: "MaryTaste — домашня колекція улюблених рецептів",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
