import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WebSiteJsonLd } from "@/components/JsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://tools.alphak.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AlphaK 무료 온라인 도구 모음",
    template: "%s | AlphaK Tools",
  },
  description:
    "빠르고 무료인 오픈소스 도구 모음. PDF 편집, 이미지 변환, 계산기, 개발 도구 등 70개 이상의 온라인 도구를 브라우저에서 바로 사용하세요. 모든 데이터는 브라우저에서만 처리됩니다.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "AlphaK Tools",
    title: "AlphaK 무료 온라인 도구 모음",
    description:
      "PDF 편집, 이미지 변환, 계산기, 개발 도구 등 70개 이상의 무료 온라인 도구",
    url: SITE_URL,
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "AlphaK Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlphaK 무료 온라인 도구 모음",
    description:
      "PDF 편집, 이미지 변환, 계산기, 개발 도구 등 70개 이상의 무료 온라인 도구",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <WebSiteJsonLd />
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
            주요 콘텐츠로 이동
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
