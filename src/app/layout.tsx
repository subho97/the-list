import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FeedbackButton from "@/components/FeedbackButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "The List — Discover what your people love.",
  description: "A community-driven lifestyle platform. Real people sharing the movies that moved them, the books that stayed with them, and the food spots worth the trip.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://covers.openlibrary.org" />
        <link rel="preconnect" href="https://books.google.com" />
        <link rel="dns-prefetch" href="https://covers.openlibrary.org" />
        <link rel="dns-prefetch" href="https://books.google.com" />
        <link rel="preconnect" href="https://books.google.com" />
        <link rel="preconnect" href="https://covers.openlibrary.org" />
        <link rel="preconnect" href="https://image.tmdb.org" />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-stone-800">
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Nav />
        <FeedbackButton />
        <Footer />
      </body>
    </html>
  );
}
