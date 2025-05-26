import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://next-lanyard.phatlor.me"),
  title: {
    template: "%s - Next.js Lanyard Integration",
    default: "Next.js Lanyard Integration"
  },
  description: "An example of integrating Discord's presence using Lanyard and Next.js",
  keywords: ["nextjs", "lanyard", "discord", "presence", "real-time", "websocket", "api"],
  authors: [{ name: "Phat Lorthammakun" }],
  openGraph: {
    title: {
      template: "%s - Next.js Lanyard Integration",
      default: "Next.js Lanyard Integration"
    },
    description: "An example of integrating Discord's presence using Lanyard and Next.js",
    type: "website",
    siteName: "Next.js Lanyard Integration",
    images: [{
      url: "/favicon.ico",
      width: 1200,
      height: 630,
      alt: "Next.js Lanyard Integration"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: "%s - Next.js Lanyard Integration",
      default: "Next.js Lanyard Integration"
    },
    description: "An example of integrating Discord's presence using Lanyard and Next.js",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-zinc-950`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
