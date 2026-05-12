import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokédex",
  description: "Modern, white, rounded, polished Pokédex.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://raw.githubusercontent.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
