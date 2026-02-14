import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebP 변환기",
  description: "이미지를 WebP 포맷으로 변환합니다",
  alternates: { canonical: "/tools/webp-converter/" },
  openGraph: {
    title: "WebP 변환기",
    description: "이미지를 WebP 포맷으로 변환합니다",
    url: "/tools/webp-converter/",
  },
  twitter: {
    title: "WebP 변환기 | AlphaK Tools",
    description: "이미지를 WebP 포맷으로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
