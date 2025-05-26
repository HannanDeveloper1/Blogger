import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const bauhaus = localFont({
  src: "../../public/fonts/BauhausRegular.ttf",
  variable: "--font-bauhaus",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Blogger | Share your thoughts, ideas, and experiences with the world",
  keywords: [
    "blogging",
    "write",
    "share",
    "thoughts",
    "ideas",
    "experiences",
    "community",
    "content creation",
    "personal blog",
    "creative expression",
    "online journal",
    "storytelling",
    "blog platform",
    "blogging community",
    "blog posts",
    "blogging platform",
    "blogging tools",
    "blogging tips",
    "blogging resources",
    "blogging for beginners",
    "blogging success",
    "blogging journey",
    "blogging inspiration",
    "blogging lifestyle",
    "blogging passion",
    "blogging creativity",
    "blogging motivation",
    "blogging engagement",
    "blogging audience",
    "blogging growth",
    "blogging strategy",
    "blogging trends",
    "blogging techniques",
    "blogging community building",
    "blogging networking",
  ],
  description:
    "Blogger is a platform where you can share your thoughts, ideas, and experiences with the world. Join our community of bloggers and start writing today!",
  authors: [
    {
      name: "Blogger",
      url: "blogger.vercel.app",
    },
  ],
  creator: "HannanDeveloper1",
  openGraph: {
    title:
      "Blogger | Share your thoughts, ideas, and experiences with the world",
    description:
      "Blogger is a platform where you can share your thoughts, ideas, and experiences with the world. Join our community of bloggers and start writing today!",
    url: "https://blogger.vercel.app",
    siteName: "Blogger",
    images: [
      {
        url: "https://blogger.vercel.app/seo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blogger Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Blogger | Share your thoughts, ideas, and experiences with the world",
    description:
      "Blogger is a platform where you can share your thoughts, ideas, and experiences with the world. Join our community of bloggers and start writing today!",
    images: ["https://blogger.vercel.app/seo/og-image.png"],
  },
  icons: {
    icon: "/seo/favicon.ico",
    apple: "/seo/apple-touch-icon.png",
    shortcut: "/seo/favicon-32x32.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "google-site-verification-code",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Blogger",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bauhaus.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
