import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마크다운 → HTML",
  description: "마크다운 텍스트를 HTML 코드로 변환합니다",
  alternates: { canonical: "/tools/markdown-to-html/" },
  openGraph: {
    title: "마크다운 → HTML",
    description: "마크다운 텍스트를 HTML 코드로 변환합니다",
    url: "/tools/markdown-to-html/",
  },
  twitter: {
    title: "마크다운 → HTML | AlphaK Tools",
    description: "마크다운 텍스트를 HTML 코드로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
