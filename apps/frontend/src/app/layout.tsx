import type { Metadata } from "next";
import { Inter, Montserrat, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/shared/lib/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitFlow — Your Code, Documented Instantly",
  description:
    "GitFlow analyzes your repositories and generates beautifully structured documentation, automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${montserrat.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}