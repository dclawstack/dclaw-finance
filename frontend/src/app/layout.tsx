import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DClaw Finance",
  description: "DClaw vertical SaaS application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
