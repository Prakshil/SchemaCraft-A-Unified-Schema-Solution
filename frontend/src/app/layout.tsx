import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SchemaCraft - AI Database Schema Generator",
  description: "Describe your app in plain English. Get a production-ready database schema in seconds. Export to PostgreSQL, MySQL, Prisma, or Drizzle.",
  keywords: ["database", "schema", "AI", "PostgreSQL", "MySQL", "Prisma", "Drizzle", "ERD", "generator"],
  openGraph: {
    title: "SchemaCraft",
    description: "AI-powered database schema generator",
    type: "website",
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
