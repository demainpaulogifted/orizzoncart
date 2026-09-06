import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrizzonCart – Premium Online Store Platform",
  description: "Launch your professional online store in minutes. Built for Nigerian businesses by OrizzonS Inc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}